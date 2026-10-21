# Architecture

Three layers, three seams. Screens never touch fixtures or expo-video directly.

```
screens (src/app)  →  services/catalogue   →  data/catalogue (fixtures)   [CMS seam]
                   →  services/playback    →  expo-video                  [player seam]
                   →  store/useAppStore    →  in-memory Zustand           [billing seam]
```

## Catalogue

`services/catalogue.ts` is the read model: `allSeries()`, `series(id)`,
`spotlight()`, `rails()`, `railSeries(rail)`, `episodes(seriesId)`,
`librarySaved()`, and the lock rule: `isLocked(series, n)` (is episode n
behind the paywall at all), `isEpisodeLocked(series, episode, entitlements)`
(paywalled and not yet unlocked — the one screens use), `lockedEpisodeIds(series,
entitlements)` and `firstLockedEpisode(series)`.

Only one series ("The Billionaire's Secret") has hand-written episodes. Every
other series gets `GENERATED_EPISODE_CAP` (6) generated episodes, memoised per
series so the list identity is stable, each wired to one of the four bundled
clips, so any poster on the home feed opens a working player.
`firstLockedIndex` (0-based) is 3 everywhere: episodes 1–3 free, 4+ locked —
matching the design's episode list and feed frames.

Swap for the real thing: replace the fixture import with CMS calls and keep the
function names. `Series.poster` / `keyArt` / `Episode.art` are `Artwork`
(`number | ImageSource`), so remote URLs drop in.

## Playback

`services/playback.ts` turns an `Episode` into an expo-video `VideoSource`
(`{ assetId, metadata }` for a bundled clip). The real app returns
`{ uri, drm?, headers? }` for an HLS stream here. expo-video is touched in two
files: this one and `components/EpisodeCard.tsx`.

`EpisodeCard` owns the player lifecycle for one card:

- `useVideoPlayer(source, setup)` — one player per mounted card, released on
  unmount by the hook.
- `active` decides play/pause. Inactive cards are paused and rewound
  (`rewind()` is a plain function because the compiler lint forbids mutating
  hook values inside effects).
- `playToEnd` only sets `ended`. **One effect advances the feed:** when
  `active && ended && !nextLocked` it calls `onAdvance(index)`. That covers
  both "next episode is free" and "next episode was locked and has just been
  unlocked while sitting on the last frame". If the next episode is locked,
  the card renders `LockCard` with `emphasis` (slide-in) instead.
- Nothing is drawn under a playing card's `VideoView`; the card is black until
  the first frame. A poster placeholder was tried and removed twice over: it
  showed for a beat before the first frame on Android, and on iOS it is what
  the native stack's exit snapshot reveals (the snapshot does not capture the
  video layer). Locked cards still show the episode art, dimmed.
- `ended` resets when the card goes inactive, via the derive-during-render
  pattern (`wasActive` state), so swiping back replays from the start.
- Progress bar: `timeUpdateEventInterval = 0.25` re-renders the card four
  times a second. Fine for a mock; the real app would drive the bar from a
  Reanimated shared value and memoise the chrome.

`app/watch/[id].tsx` is the paged `FlatList`: `pagingEnabled`, `getItemLayout`
with the list's **measured** height (`onLayout` on the wrapper, not
`useWindowDimensions` — on Android the window includes system-bar area the
list does not cover, and window-sized cards drift by a bar height per swipe), `onViewableItemsChanged` at 60 % visibility sets
`activeIndex`, `windowSize={3}` so roughly three cards (and three players)
exist at once. The neighbour card's player opens its bundled clip on mount,
which is why a swipe starts instantly; there is no explicit preload API in
use. One `lockedIds` set is derived per render from the entitlements and is
both the source of each card's `locked` / `nextLocked` props and the list's
`extraData`.

## Wallet and entitlements

`store/useAppStore.ts` (Zustand):

| field | meaning |
|---|---|
| `coins` | balance, starts at 15 (the design's "Your Balance") |
| `premium` | unlocks everything; `subscribePremium()` is a mocked toggle |
| `unlockedEpisodes` | `Set<episodeId>` |
| `unlockedSeasons` | `Set<seriesId>` |
| `progress` | seriesId → highest episode number reached |

`isUnlocked(entitlements, episodeId, seriesId)` is a pure function;
`useEntitlements()` selects the three entitlement fields with `useShallow`.
`unlockEpisode` / `unlockSeason` return `'ok' | 'insufficient'`. Sets are
replaced, never mutated, so selectors re-run.

Prices: `UNLOCK_PRICES` in `data/types.ts` (10 / 150 coins, $9.99/mo), coin
packs in `data/catalogue.ts`.

## Navigation and route contracts

Expo Router, typed routes on. Dynamic segments are typed; search params are
strings or absent, so the modal screens read them as `Record<keyof Params,
string>` and treat every field as optional.

| route | params | behaviour |
|---|---|---|
| `/watch/[id]` | `ep?` (1-based) | opens on that episode, clamped to the list |
| `/series/[id]` | — | |
| `/unlock` (transparent modal) | `seriesId`, `episodeId`, `episodeNumber` | all required; missing → closes |
| `/shop` (modal) | `seriesId?`, `episodeId?`, `episodeNumber?`, `intent?: 'episode' \| 'season'` | with intent: a mocked buy credits coins, performs that unlock, pops. Without: plain recharge (Library "Manage") |

The sheet routes to the shop with `intent` on `'insufficient'`; the shop never
infers intent from a price.

## Theme

`theme.ts` tokens come from counting fills in the SVG export: cyan `#64EDF7`
primary, purple `#CB64F7` secondary, card `#18172B`, feed background
`#061532`, black elsewhere; named surfaces (`sheet`, `packSelected`,
`lockCard`, `footer`), two-stop `gradients`, and `scrim(alpha, white?)` for
overlays. Display face Playfair Display, body Inter, both loaded in the root
layout before the splash hides. `components/Text` is the type scale.
