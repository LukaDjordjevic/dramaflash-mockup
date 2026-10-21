# Testing

## Automated

```bash
npx tsc --noEmit && npx expo lint && npx jest
```

Unit tests (jest-expo) sit in `__tests__/` next to what they test:

- `store/__tests__/useAppStore.test.ts` — unlock ok / insufficient, season
  covers episodes, premium covers all, sets replaced not mutated, progress is
  monotonic.
- `services/__tests__/catalogue.test.ts` — fixtures resolve, lock rule from
  episode 4, generated episodes are memoised and carry clips.
- `utils/__tests__/format.test.ts` — `compact`, `mmss`.

CI runs the same three commands on push (`.github/workflows/ci.yml`).

There are no component or player tests: the player's behaviour is native and
is checked by hand below.

## iOS simulator

```bash
xcrun simctl boot "iPhone 16"            # any iOS 17+ device
npx expo start                           # then press i, or:
xcrun simctl openurl booted "exp://<lan-ip>:8081"
```

Expo Go installs itself on first open. After editing a route file, if Expo Go
shows "Cannot find native module 'ExpoAsset'", cold-restart the app:

```bash
xcrun simctl terminate booted host.exp.Exponent
xcrun simctl openurl booted "exp://<lan-ip>:8081"
```

## Deep links to every screen

Replace `<lan-ip>` with the address Metro prints, and the port if you changed it.

| Screen | URL |
|---|---|
| Home | `exp://<lan-ip>:8081` |
| Library tab | `exp://<lan-ip>:8081/--/library` |
| Series detail | `exp://<lan-ip>:8081/--/series/ceos-secret-life` |
| Player, episode 1 | `exp://<lan-ip>:8081/--/watch/billionaires-secret` |
| Player, episode 3 (cliffhanger after ~8 s) | `exp://<lan-ip>:8081/--/watch/billionaires-secret?ep=3` |
| Unlock sheet | `exp://<lan-ip>:8081/--/unlock?seriesId=billionaires-secret&episodeId=bs-4&episodeNumber=4` |
| Coin shop for that episode | `exp://<lan-ip>:8081/--/shop?seriesId=billionaires-secret&episodeId=bs-4&episodeNumber=4&intent=episode` |

Screenshot: `xcrun simctl io booted screenshot out.png`.

## Manual walk-through

1. Home: scroll the rails, tap a genre chip, tap "Jetzt ansehen".
2. Player: episode plays; tap to pause; swipe up to episode 2, then 3.
3. Let episode 3 end: last frame freezes, "Unlock Episode 4" slides in.
4. Tap it: the sheet. "Unlock Full Season" is pre-checked, as in the design,
   and the button says what it will do. Pick "Unlock Episode" and tap
   "Unlock Episode for 10 Coins" — balance 15 → 5, episode 4 plays and 5 stays
   locked.
5. Swipe to episode 5 (locked), tap the lock, pick "Unlock Full Season" —
   balance short, shop opens with "Full season • Locked"; Buy 800 Coins;
   back in the player, episode 5 plays and 6 is open.
6. Back, Library tab: Saved shows progress; Purchases lists the series you
   just unlocked; Manage opens the shop without an episode.
7. Series detail from a poster: episode list shows lock state from the store.

## Known limits

- Wallet state is in memory; a reload resets coins to 15 and locks everything.
- Android: run on a phone via Expo Go. If a video view renders out of bounds
  during the page transition, set `surfaceType="textureView"` on `VideoView`.
