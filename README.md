# DramaFlash — beta app mock-up

A clickable React Native mock-up of a short-drama video app, built from a
Figma hand-off. Three flows:

1. **Home feed** — spotlight hero, genre chips, three rails, five-tab bar.
2. **Player** — full-screen vertical feed, one episode per card, swipe to the
   next. Episode 3 ends on the cliffhanger and the lock for episode 4 slides in.
3. **Unlock flow** — the "Continue the romance" sheet (episode / season /
   premium). Coins come off a mocked balance; if the balance is short, the
   coin shop opens, a mocked purchase credits it, and the episode plays.

Also built, because the data was already there: series detail (synopsis,
cast, episode list with lock state) and the Library tab (saved series with
progress; purchases reflect the session's unlocks).

## Run it

```bash
npm install
npx expo start
```

Scan the QR with Expo Go (iOS or Android), or press `i` for the iOS simulator.
No dev build needed: every native module used ships in Expo Go.

```bash
npx tsc --noEmit && npx expo lint && npx jest   # what CI runs
```

## Where things are

- [`CLAUDE.md`](CLAUDE.md) — project context for the next engineer or agent:
  tree, commands, conventions, inert affordances, SDK gotchas, out of scope.
- [`docs/architecture.md`](docs/architecture.md) — the three seams (catalogue,
  playback, wallet), the player lifecycle card by card, route contracts.
- [`docs/decisions.md`](docs/decisions.md) — why Expo, why expo-video behind a
  seam, why no backend, and what would reverse each.
- [`docs/design-reconciliation.md`](docs/design-reconciliation.md) — the
  nine frames of the hand-off, what each became, every conflict and the call.
- [`docs/testing.md`](docs/testing.md) — unit tests, simulator recipe, deep
  links to every screen, manual walk-through.
- [`CREDITS.md`](CREDITS.md) — stock clips and the design art.

## What is mocked

Catalogue fixtures in `src/data/catalogue.ts`. Four short Pexels clips bundled
as "episodes". Wallet and progress are in memory and reset on reload.
Discover, Romance and Profile tabs are stubs.

## How it was built

Expo SDK 58, TypeScript strict, Expo Router, expo-video, expo-image, Zustand,
Reanimated, jest-expo. Planned, written, typechecked, tested and run on the
simulator with Claude Code across the whole cycle, from reading the SVG
hand-off to the screenshots, with the author directing and reviewing. Design
assets were extracted from the SVG with a script; clips were trimmed with
ffmpeg.

Time: roughly three hours of build and review across two sittings. Commits
are batched per sitting, so the git log is coarser than the work.

## Licence

Code is MIT (see `LICENSE`). The design art under `assets/posters`, `assets/cast`
and `assets/thumbs` belongs to TargetVideo and is excluded; the clips are
Pexels-licensed. Details in `CREDITS.md`.

## Next

- Rewarded-ad unlock path once the ad SDK is chosen.
- Real HLS sources from the player platform; measure start-up time per episode.
- Persist wallet and progress; StoreKit / Play Billing with server receipts.
- Android pass on a real device (the simulator run was iOS).
