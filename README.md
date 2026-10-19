# DramaFlash — beta app mock-up

A clickable React Native mock-up of the DramaFlash beta, built from the
`FLASH.svg` hand-off for the TargetVideo round-2 task (Option A).

Covers the three flows asked for:

1. **Home feed** — spotlight hero, genre chips, three rails, five-tab bar.
2. **Player** — full-screen vertical feed, one episode per card, swipe to the
   next. Episode 3 ends on the cliffhanger and the lock for episode 4 slides in.
3. **Unlock flow** — the "Continue the romance" sheet (episode / season /
   premium). Coins come off a mocked balance; if the balance is short, the
   coin shop opens, a mocked purchase credits it, and the episode unlocks and
   plays.

Also built, because the data was already there: series detail (synopsis, cast,
episode list with lock state) and the Library tab (saved series with progress).

## Run it

```bash
npm install
npx expo start
```

Scan the QR with Expo Go (iOS or Android), or press `i` for the iOS simulator.
No dev build needed: every native module used ships in Expo Go.

## Decisions

**Expo over bare React Native.** Expo Router, EAS builds, OTA updates and the
upgrade path come for free. Nothing in the beta scope needs a module Expo
cannot host; if their player SDK does, a config plugin or a dev build covers it.

**expo-video now; the playback layer is swappable.** `expo-video` wraps
AVPlayer and ExoPlayer, plays HLS on both platforms, preloads the next episode
and has a hook API that fits a feed. The whole mock-up touches it through one
file, `src/services/playback.ts`. Two things would move the real app off it:

- Widevine / FairPlay DRM or client-side ad insertion (Google IMA) →
  `react-native-video`, which has both.
- TargetVideo's own player SDK, if it exposes a mobile build → a thin native
  module around it, so the app rides the same analytics and ad stack as the
  web player.

The prototype in the first weeks is exactly that comparison, on their streams.

**Service interfaces instead of a backend.** `src/services/catalogue.ts`,
`playback.ts` and `src/store/useAppStore.ts` (wallet, entitlements, progress)
are the three seams. The CMS, the player platform and StoreKit / Play Billing
receipts plug in behind them without touching a screen.

**Feed mechanics.** `FlatList` with paging; only the visible card plays, the
next one is created early so it is buffered when you swipe; the render window
is kept to about three cards, so about three players exist at any time.
`playToEnd` on the free episode freezes the last frame and shows the lock. An
unlock while on that frame auto-advances.

## Design reconciliation

The hand-off is a mood board: two home variants, two detail variants, two tab
bars, two brand names ("LoveFlix" on login), EUR and USD, German and English
mixed. Choices made:

- Home = the dark frame with the gothic hero (not the landscape "App Header").
- Player = the TikTok-style vertical cards; the five-tab bar from the home frame.
- Unlock = the "Continue the romance" sheet; coin shop as drawn. Rewarded ads
  are not in the design, so they are not in the mock.
- Episodes 1–3 free, locked from 4 — as the episode list and feed frames show.
- Login screen left out; the app opens signed in as "Sarah Connor".
- Palette, type (Playfair Display + Inter) and poster art come from the SVG.

## What is mocked

Catalogue fixtures in `src/data/catalogue.ts`. Four short Pexels clips bundled
as "episodes" (see `CREDITS.md`). Wallet state is in memory and resets on
reload. Discover, Romance and Profile tabs are stubs.

## How it was built

Expo SDK 58, TypeScript strict, Expo Router, expo-video, expo-image, Zustand,
Reanimated. Planned, written, typechecked and run on the simulator with
Claude Code across the whole cycle, from reading the SVG hand-off to the
screenshots. Design assets were extracted from the SVG with a script; the
clips were trimmed with ffmpeg.

Hours: about 7 wall-clock, including tooling setup.

## Next

- Rewarded-ad unlock path once the ad SDK is chosen.
- Real HLS sources from the player platform; measure start-up time per episode.
- Persist wallet and progress; StoreKit / Play Billing with server receipts.
- Android pass on a real device (the simulator run was iOS).
