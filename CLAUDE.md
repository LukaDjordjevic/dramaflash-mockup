@AGENTS.md

# DramaFlash mock-up — project context

Clickable React Native mock-up of a short-drama video app (home feed, vertical
player with an episode lock after the cliffhanger, coin unlock flow). Built
for a hiring task from a Figma SVG hand-off. Scope is fixed: it is a mock-up,
not the product. No backend, no auth, no real payments.

Read [docs/architecture.md](docs/architecture.md) before touching the player
or the store. Everything else is discoverable from the tree below.

## Commands

```bash
npx expo start --port 8082     # dev server (8081 is used by another project on this machine)
npx tsc --noEmit               # typecheck — must be clean before a commit
npx expo lint                  # eslint with the React Compiler rules — must be clean
npx expo-doctor                # dependency / config sanity
```

Simulator test recipe, including deep links to every screen:
[docs/testing.md](docs/testing.md).

## Tree

```
src/
  app/                 Expo Router routes only — no components in here
    _layout.tsx        fonts, gesture root, Stack (tabs, series, watch, unlock modal, shop modal)
    (tabs)/            index = home feed · library · three stub tabs
    series/[id].tsx    detail: synopsis, cast, episode list with lock state
    watch/[id].tsx     vertical paged player; ?ep=N starts on an episode
    unlock.tsx         "Continue the romance" sheet (transparent modal)
    shop.tsx           coin packs + VIP (modal); mocked purchase
  components/          Text (typed variants), PosterCard, Rail, GenreChips,
                       HeroSpotlight, EpisodeCard (player card), LockCard
  data/
    types.ts           Series, Episode, Rail, CoinPack, UNLOCK_PRICES
    catalogue.ts       fixtures: series, rails, coin packs, library rows, bundled clips
  services/
    catalogue.ts       read model over the fixtures — the CMS seam
    playback.ts        Episode → expo-video source — the player seam
  store/useAppStore.ts Zustand: coins, premium, unlocked sets, progress — the billing seam
  theme.ts             colours, fonts, radii, spacing lifted from the SVG
assets/
  posters/ cast/ thumbs/   art extracted from the design hand-off (theirs; do not replace)
  clips/                   four Pexels clips, 1080×1920 H.264 (see CREDITS.md)
docs/                  architecture, design reconciliation, testing, decisions
```

## Conventions

- **Text goes through `components/Text`** with a `variant`; never style a raw
  `RNText` with a font family. Fonts: Playfair Display for display/heading/title,
  Inter for everything else.
- **Colours and spacing come from `theme.ts`.** No new hex values in screens.
- **Screens read data through `services/` and `store/`,** never from
  `data/catalogue.ts` directly (the one exception is `genreChips` / `coinPacks`,
  which are static UI lists).
- **Episode lock rule lives in one place:** `catalogue.isLocked(series, n)` +
  `store.isEpisodeUnlocked(id, seriesId)`. Do not re-derive it in a screen.
- **Player:** one `useVideoPlayer` per mounted card; only the `active` card
  plays; the FlatList window is kept at ~3 cards. If you change that, re-check
  memory on Android.
- **Dependencies:** `npx expo install <pkg>`, never `npm install <pkg>`.
  `react-dom` is pinned to the SDK's React version on purpose (npm ERESOLVE otherwise).
- **No new native modules** that are not in Expo Go — the demo runs in Expo Go
  on a phone.

## Known SDK 58 / RN 0.88 gotchas (already hit)

- `useEvent` / `useEventListener` are exported from `expo`, not `expo-video`.
- `StyleSheet.absoluteFillObject` is gone; spread `StyleSheet.absoluteFill`.
- `ViewToken` is not exported from `react-native`; type the callback structurally.
- The React Compiler lint rejects mutating hook return values in effects
  (wrap in a helper), `setState` inside effects (derive during render), and
  `useRef(...).current` read during render (use `useCallback`).
- Anything drawn under a `VideoView` shows for a frame when the screen is
  popped (the stack snapshot does not include the video layer). Keep the layer
  under a playing video empty.
- A Fast Refresh after editing a route file once threw "Cannot find native
  module 'ExpoAsset'" in Expo Go. Cold-restart the app; it is not a code bug.

## Out of scope — do not build

Backend, login, real payments, rewarded ads, Discover/Romance/Profile tabs,
i18n. If a change needs one of these, stop and say so.
