# Design reconciliation

Source: `FLASH.svg`, a Figma export, 8364 × 2363, nine frames. It is a mood
board rather than a spec: two home variants, two detail variants, two tab
bars, two brand names (LoveFlix on the login frame), EUR and USD, German and
English mixed, and a leftover grey e-commerce wireframe. The table says what
each frame became.

| # | Frame | In the app | Notes |
|---|---|---|---|
| 1 | Grey wireframe (fruit, "Product name") | — | Template leftover, ignored |
| 2 | Home, dark, gothic hero | `(tabs)/index` | Built as drawn: hero, chips, rails, five-tab bar |
| 3 | Series detail, long | `series/[id]` | Synopsis, "Why you'll love it" dropped, cast, episode list, season bundle, "You might also like" |
| 4 | Unlock Episode / coin shop | `shop` | Packs, badges, VIP weekly, sticky buy button |
| 5 | My Library | `(tabs)/library` | Profile card, Saved / Purchases toggle, 2-up grid with progress, settings list |
| 6 | Detail variant B (landscape hero, "Play Now", Top Cast, rails again) | — | Lost to frame 3; its horizontal episode thumbs were not used |
| 7 | Login "LoveFlix" | — | Out of scope; the app opens signed in |
| 8 | "Continue the romance" sheet | `unlock` | Three radio options as drawn, Unlock Now, Maybe Later |
| 9 | Vertical feed (TikTok-style cards, "Unlock Episode 5") | `watch/[id]` | Cards became the player; the lock card is the centred lock from this frame |

## Conflicts and the call made

- **Tab bar:** home frame's Home / Discover / Romance / Library / Profile won
  over the feed frame's Home / Search / Rewards / Profile / VIP. One bar
  everywhere.
- **Player screen:** none in the hand-off. The feed card from frame 9 was made
  real: full-bleed video, like / comment / share rail, title and "Ep N · m:ss",
  a thin progress bar. The lock appears in two places: as the static centred
  card on a locked episode (frame 9) and as the slide-in card when a free
  episode ends on the cliffhanger (the task's ask).
- **Unlock route:** coins. Rewarded ads appear nowhere in the design.
- **Episode lock rule:** 1–3 free, 4+ locked, from frames 3 and 9.
- **Currency:** EUR in the shop (frame 4), USD on the premium line of the
  sheet (frame 8) — kept as drawn so the inconsistency is visible to the team.
- **Language:** German strings kept where the frame had them ("Jetzt
  ansehen", "72 Episoden"); the rest English. Flagged for i18n, not fixed.
- **Brand:** no logo in the app beyond the cyan heart tile from frame 2.

## Assets

The SVG embeds 53 images. They were extracted by id, matched to frames by eye
and renamed by series: `assets/posters/*`, `assets/cast/*`,
`assets/thumbs/*`. Resized to ≤ 600 px (posters), ≤ 1080 px (feed art),
JPEG q82. Images 0–7 are the wireframe's fruit and were not copied.

Palette from counting `fill=` values in the export; type faces identified by
eye (text is outlined in the SVG, so no font names survive).
