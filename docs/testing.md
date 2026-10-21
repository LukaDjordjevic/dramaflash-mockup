# Testing

No automated tests in the mock-up. The checks are typecheck, lint and a
walk-through on the simulator or a phone.

```bash
npx tsc --noEmit && npx expo lint
```

## iOS simulator

```bash
xcrun simctl boot "iPhone 16"            # or any iOS 17+ device
npx expo start --port 8082               # then press i, or:
xcrun simctl openurl booted "exp://<lan-ip>:8082"
```

Expo Go installs itself on first open. After editing a route file, if Expo Go
shows "Cannot find native module 'ExpoAsset'", cold-restart the app:

```bash
xcrun simctl terminate booted host.exp.Exponent
xcrun simctl openurl booted "exp://<lan-ip>:8082"
```

## Deep links to every screen

Replace `<lan-ip>` with the address Metro prints.

| Screen | URL |
|---|---|
| Home | `exp://<lan-ip>:8082` |
| Library tab | `exp://<lan-ip>:8082/--/library` |
| Series detail | `exp://<lan-ip>:8082/--/series/ceos-secret-life` |
| Player, episode 1 | `exp://<lan-ip>:8082/--/watch/billionaires-secret` |
| Player, episode 3 (cliffhanger after ~9 s) | `exp://<lan-ip>:8082/--/watch/billionaires-secret?ep=3` |
| Unlock sheet | `exp://<lan-ip>:8082/--/unlock?seriesId=billionaires-secret&episodeId=bs-4&episodeNumber=4` |
| Coin shop for that episode | `exp://<lan-ip>:8082/--/shop?seriesId=billionaires-secret&episodeId=bs-4&episodeNumber=4&need=10` |

Screenshot: `xcrun simctl io booted screenshot out.png`.

## Walk-through (the Loom script)

1. Home: scroll the rails, tap a genre chip, tap "Jetzt ansehen".
2. Player: episode plays; tap to pause; swipe up to episode 2, then 3.
3. Let episode 3 end: last frame freezes, "Unlock Episode 4" slides in.
4. Tap it: the sheet. Pick "Unlock Episode", Unlock Now — balance 15 → 5,
   episode 4 plays.
5. Swipe to episode 5 (locked), tap the lock, pick "Unlock Full Season" —
   balance short, shop opens; Buy 800 Coins; back in the player, episode 5
   plays and 6 is open.
6. Back, Library tab: progress on the saved series; Manage opens the shop.
7. Series detail from a poster: episode list shows lock state from the store.

## Known limits

- Taps cannot be scripted from the CLI without granting the terminal
  accessibility access, so steps 4–7 must be walked through on a device. They
  have not been scripted.
- Wallet state is in memory; a reload resets coins to 15 and locks everything.
- Android: run on a phone via Expo Go. The feed uses `contentFit="cover"`
  video views that overlap during the page transition; if anything renders
  out of bounds on Android, set `surfaceType="textureView"` on `VideoView`.
