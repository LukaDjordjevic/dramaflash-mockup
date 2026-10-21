Expo / React Native app. The three rules from Expo's own agent guidance that
apply here (the rest of that template — Bun, EAS, skills — does not):

1. **Expo changes every SDK; do not trust memory.** Read the `expo` major in
   `package.json` (58) and check `https://docs.expo.dev/versions/v58.0.0/`
   before using an Expo, EAS or React Native API. `https://docs.expo.dev/llms.txt`
   indexes the rest.
2. **`npx expo install <pkg>`**, never `npm install <pkg>` — it resolves the
   SDK-compatible version.
3. **No `ios/` or `android/` directories.** Native config lives in `app.json`
   and config plugins. The app runs in Expo Go; a library with native code that
   Expo Go does not bundle needs a dev build and is out of scope here.

Project context continues in `CLAUDE.md`.
