# Decisions

Short records, newest last. Each says what was chosen and what would reverse it.

## 1. Expo managed workflow, not bare React Native

Expo Router, EAS, OTA updates and the SDK upgrade path come free; nothing in
the beta scope needs a module Expo Go cannot host. Reversed by: a player SDK
that needs a custom native build — then a dev build or a config plugin, still
inside Expo.

## 2. expo-video behind a two-file seam

`expo-video` wraps AVPlayer / ExoPlayer, plays HLS on both platforms, and has
a hook API that fits a feed. The mock-up does no explicit preloading: the
neighbour card's player opens its clip on mount because the list window is
three cards wide. Reversed by: Widevine / FairPlay or Google IMA ads
(→ `react-native-video`), or a mobile SDK from TargetVideo's own player
platform (→ thin native module). Either swap touches `services/playback.ts`
and `components/EpisodeCard.tsx` only.

## 3. Fixtures and service interfaces, no backend

A mock backend would cost hours and prove nothing about integrating theirs.
Three seams (catalogue, playback, wallet) carry the real integration later.
Reversed by: nothing in the mock-up scope.

## 4. Bundled clips, not streamed

Four short Pexels clips (1–5 MB each) ship in the app so playback starts
instantly in a demo over any network. Reversed by: real HLS from the player
platform — change `playback.source()`.

## 5. Coins as the one unlock flow

The task asked for one of coins / subscription / rewarded ad. The design has
a coin shop and a sheet with coin prices and no ad surface, so coins. The
sheet still offers premium (mocked toggle) because it is drawn there.

## 6. Episodes 1–3 free, locked from 4

Both the episode list frame and the feed frame show three open episodes.
Stored per series as `firstLockedIndex` so a series can differ.

## 7. In-memory wallet

Zustand without persistence. Reload resets. Reversed by: `expo-secure-store`
or the account service once purchases are real.

## 8. Entitlements as one derived set, not store subscriptions

`isUnlocked()` is pure; `useEntitlements()` selects the three fields with
`useShallow`; the player derives one `lockedIds` set per render and uses it
for every card and as the list's `extraData`. No screen subscribes to a store
slice it does not read. Reversed by: nothing — this is the shape the real
entitlement service would feed.

## 9. Unit tests on the seams, CI on push

jest-expo tests cover the store, the catalogue service and the format helpers;
the GitHub Actions workflow runs typecheck, lint and tests. Reversed by:
nothing; component and player tests would be added, not swapped.

## 10. One `Text` component, tokens in `theme.ts`

The design uses one serif display face and one sans body face with a small
palette; a typed `variant` keeps screens from drifting. Reversed by: a design
system from the team.
