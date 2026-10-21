@AGENTS.md

# DramaFlash mock-up — project context

Clickable React Native mock-up of a short-drama video app: home feed, vertical
player with an episode lock after the cliffhanger, coin unlock flow. Built for
a hiring task from a Figma SVG hand-off. Scope is fixed: it is a mock-up, not
the product. No backend, no auth, no real payments.

Read [docs/architecture.md](docs/architecture.md) before touching the player
or the store. Everything else is discoverable from the tree below.

## Commands

```bash
npx expo start          # dev server; add --port N if 8081 is busy and change the deep links in docs/testing.md to match
npx tsc --noEmit        # typecheck — clean before a commit
npx expo lint           # eslint, React Compiler rules on — clean before a commit
npx jest                # unit tests: store, catalogue service, format helpers
npx expo-doctor         # dependency / config sanity
```

CI (`.github/workflows/ci.yml`) runs the middle three on every push.
Node 20+ (`.nvmrc` says 24). Expo Go 58 on the phone or simulator.

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
  components/          Text (the only place a font family is named), PosterCard, Rail,
                       GenreChips, HeroSpotlight, EpisodeCard (player card), LockCard
  data/
    types.ts           Series, Episode, Rail, CoinPack, UNLOCK_PRICES, UnlockIntent
    catalogue.ts       fixtures: series, rails, coin packs, library rows, bundled clips
  services/
    catalogue.ts       read model + the lock rule — the CMS seam
    playback.ts        Episode → expo-video source — the player seam
  store/useAppStore.ts Zustand: coins, premium, unlocked sets, progress — the billing seam
  utils/format.ts      compact(), mmss()
  theme.ts             colours, gradients, scrim(), fonts, radii, spacing lifted from the SVG
  **/__tests__/        jest-expo unit tests next to what they test
assets/
  posters/ cast/ thumbs/   art extracted from the design hand-off (TargetVideo's; do not replace)
  clips/                   four Pexels clips, 1080×1920 H.264 (see CREDITS.md)
docs/                  architecture, design reconciliation, testing, decisions
```

The source hand-off, `FLASH.svg`, is **not committed** (it is TargetVideo's).
`assets/` is the extracted subset; ask the author for the file if you need it.

`.expo/types/router.d.ts` (typed routes) is generated on the first
`npx expo start`. A fresh clone typechecks against untyped routes until then.

## Conventions

- **Text goes through `components/Text`** with a `variant`. The variants are
  the type scale: `display / title / heading` (Playfair), `body / bodyMedium /
  label / caption / button / overline / badge` (Inter). No `fontFamily`
  anywhere else (the tab bar label style in `(tabs)/_layout.tsx` is the one
  exception, because `Tabs` takes a style object, not a component).
- **Colours come from `theme.ts`.** Named surfaces are tokens; black/white
  overlays use `scrim(alpha)`. Two brand-tinted rgba overlays (purple spotlight
  pill, cyan price pill) are the only literals left in screens.
- **Screens read data through `services/` and `store/`,** never from
  `data/catalogue.ts` directly. Exceptions: `genreChips` and `coinPacks`
  (static UI lists) and `UNLOCK_PRICES` / `UnlockIntent` from `data/types.ts`.
- **The lock decision is `catalogue.isEpisodeLocked(series, episode, entitlements)`.**
  Get `entitlements` from `useEntitlements()`. The player derives one
  `lockedIds` set per render and passes booleans down; do not re-derive the
  rule in a screen or subscribe to store slices you do not read.
- **Player:** one `useVideoPlayer` per mounted card; only the `active` card
  plays; `windowSize={3}` keeps about three cards mounted. The single place
  that advances the feed is the effect in `EpisodeCard` that calls
  `onAdvance(index)`. If you change the window, re-check memory on Android.
- **Dependencies:** `npx expo install <pkg>`, never `npm install <pkg>`.
  `react-dom` is pinned to the SDK's React version on purpose (npm ERESOLVE otherwise).
- **No new native modules** that are not in Expo Go — the demo runs in Expo Go
  on a phone.

## Inert affordances (from the design; intentionally not wired)

"See all" on rails, "Sort" and "Show more episodes" on series detail, "Add to
list" / "Save" / "Share" buttons, the home search and bell, the Library
settings rows and the "Manage" shortcut's VIP card. They are real `Pressable`s
with labels so screen readers announce them; they do nothing. Do not wire them
and do not remove them — they are the design.

## Known SDK 58 / RN 0.88 gotchas (already hit)

- `useEvent` / `useEventListener` are exported from `expo`, not `expo-video`.
- `StyleSheet.absoluteFillObject` is gone; spread `StyleSheet.absoluteFill`.
- The viewability token type is `ListViewToken` from `react-native` (not
  `ViewToken`, and it is not generic).
- `useLocalSearchParams<T>` with typed routes rejects optional fields. Pass
  `Record<keyof Params, string>` and assign to the optional type, as `unlock.tsx`
  and `shop.tsx` do.
- The React Compiler lint rejects mutating hook return values in effects
  (wrap in a helper), `setState` inside effects (derive during render),
  `useRef(...).current` read during render (use `useCallback`), and a
  variable reassigned inside a `useMemo` callback.
- Anything drawn under a `VideoView` shows for a frame when the screen is
  popped (the stack snapshot does not include the video layer). Keep the layer
  under a playing video empty once it has a frame.
- A Fast Refresh after editing a route file once threw "Cannot find native
  module 'ExpoAsset'" in Expo Go. Cold-restart the app; it is not a code bug.

## Out of scope — do not build

Backend, login, real payments, rewarded ads, Discover/Romance/Profile tabs,
i18n (the German strings on the home hero are as drawn), persistence of the
wallet. If a change needs one of these, stop and say so.
