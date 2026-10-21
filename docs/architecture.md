# Architecture

Three layers, three seams. Screens never touch fixtures or expo-video directly.

```
screens (src/app)  →  services/catalogue   →  data/catalogue (fixtures)   [CMS seam]
                   →  services/playback    →  expo-video                  [player seam]
                   →  store/useAppStore    →  in-memory Zustand           [billing seam]
```

## Catalogue

`services/catalogue.ts` is the read model: `series(id)`, `spotlight()`,
`rails()`, `railSeries(rail)`, `episodes(seriesId)`, `isLocked(series, n)`,
`librarySaved()`.

Only one series ("The Billionaire's Secret") has hand-written episodes. Every
other series gets up to six generated episodes from `episodes()`, each wired to
one of the four bundled clips, so any poster on the home feed opens a working
player. `firstLockedIndex` (0-based) is 3 everywhere: episodes 1–3 free, 4+
locked — matching the design's episode list and feed frames.

Swap for the real thing: replace the fixture import with CMS calls and keep the
function names. `Series.poster` / `keyArt` / `Episode.art` are `Artwork`
(`number | ImageSource`), so remote URLs drop in.

## Playback

`services/playback.ts` turns an `Episode` into an expo-video `VideoSource`
(`{ assetId, metadata }` for a bundled clip, `null` if the episode has no
media). The real app returns `{ uri, drm?, headers? }` for an HLS stream here
and nothing else changes.

`components/EpisodeCard.tsx` owns the player lifecycle for one card:

- `useVideoPlayer(source, setup)` — one player per mounted card, released on
  unmount by the hook.
- `active` prop decides play/pause. Inactive cards are paused and rewound
  (`rewind()` helper — a plain function because the compiler lint forbids
  mutating hook values inside effects).
- `playToEnd` sets `ended`; if the next episode is locked the card renders the
  `LockCard` with `emphasis` (slide-in). If the next episode is free, the
  parent scrolls to it. If it becomes free later (unlock from the sheet), an
  effect calls `onEnded` again and the list advances.
- `ended` resets when the card goes inactive, via the derive-during-render
  pattern (`wasActive` state), so swiping back replays from the start.

`app/watch/[id].tsx` is the paged `FlatList`: `pagingEnabled`,
`getItemLayout` with the window height, `onViewableItemsChanged` at 60 %
visibility to set `activeIndex`, `windowSize={3}` so roughly three cards (and
three players) exist at once. `extraData` lists the store's entitlement
sets so lock state re-renders after an unlock.

## Wallet and entitlements

`store/useAppStore.ts` (Zustand):

| field | meaning |
|---|---|
| `coins` | balance, starts at 15 (the design's "Your Balance") |
| `premium` | unlocks everything |
| `unlockedEpisodes` | `Set<episodeId>` |
| `unlockedSeasons` | `Set<seriesId>` |
| `progress` | seriesId → highest episode number reached |

`unlockEpisode` / `unlockSeason` return `'ok' | 'insufficient'`; the sheet
routes to the shop on `'insufficient'` with `need` in the params. The shop's
`buy()` credits the pack and, if it was opened for an episode, performs the
unlock and pops. Sets are replaced, never mutated, so selectors re-run.

Prices: `UNLOCK_PRICES` in `data/types.ts` (10 / 150 coins, $9.99/mo), coin
packs in `data/catalogue.ts`.

## Navigation

Expo Router, typed routes on. `unlock` is a `transparentModal` over the
player; `shop` is a `modal`. `watch/[id]?ep=N` opens on episode N (used by
series detail, library and the test deep links).

## Theme

`theme.ts` tokens come from counting fills in the SVG export: cyan `#64EDF7`
primary, purple `#CB64F7` secondary, card `#18172B`, feed background
`#061532`, black elsewhere. Display face Playfair Display, body Inter,
both loaded in the root layout before the splash hides.
