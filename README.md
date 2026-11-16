# All the Ways

**A world of ways to communicate.** A mobile-first learning app for American Sign Language fingerspelling, uncontracted English Braille, and International Morse code.

**Planned URL:** https://alltheways.davidlwatsonjr.com  
**Repository:** `davidlwatsonjr/alltheways`  
**Stack:** React 19 + TypeScript + Vite 6, GitHub Pages, static PWA; no backend, accounts, cookies, analytics, API keys, or API costs.

## v0.1 features

- ASL fingerspelling A–Z, with motion instructions for J and Z.
- English Grade 1 Braille: A–Z and digits with the leading number sign.
- International Morse code: A–Z, 0–9, and five punctuation symbols.
- Flashcards with reverse mode, shuffle, next/previous, favorites, filtered decks, reveal & self-rating, and keyboard shortcuts.
- Spaced *practice* tracking: local `seen`, `correct`, `again`, and a two-success mastery indicator. (Not yet a time-based SRS algorithm.)
- Ten-question multiple-choice quiz for each system.
- Text-to-symbol practice: visual ASL fingerspelling, Braille cells, and Morse text with synthesized audio playback and copy.
- Local progress via `localStorage`, responsive layout, PWA manifest, offline app shell and cached ASL reference artwork.
- PWA icons for 48px favicon, Apple touch, 192px, 512px, and maskable 512px.

## Run locally

Node.js 22 recommended.

```bash
npm install
npm test
npm run dev
npm run build
npm run preview
```

The app lives entirely in `src`; Vite outputs a static `dist/`. The build also adds hashed JS/CSS assets to the service worker pre-cache for offline support.

## Deploy to GitHub Pages

1. Create a **public** GitHub repository named `alltheways` under `davidlwatsonjr`. Do not initialize it if pushing this folder as an initial commit.
2. Push this directory to the repository's `main` branch. The included `.github/workflows/deploy.yml` tests, builds, and deploys automatically on every push to `main`.
3. In **Settings → Pages**, set **Build and deployment → Source** to **GitHub Actions** (same as Arcade). Under **Custom domain**, enter `alltheways.davidlwatsonjr.com`.
4. In Squarespace DNS add:

   | Type | Host | Value |
   | ---- | ---- | ----- |
   | CNAME | `alltheways` | `davidlwatsonjr.github.io` |

5. `public/CNAME` is included in the build, so the deployed `dist/CNAME` matches the GitHub Pages custom domain. Once DNS and TLS propagate, turn on **Enforce HTTPS** under Pages.
6. Check the **Deploy All the Ways** Actions workflow for a green build and visit `https://alltheways.davidlwatsonjr.com`.

With the custom domain, Vite's `base: '/'`, PWA paths, and service-worker scope intentionally use the root of the origin. GitHub Pages will not host the app at `username.github.io/alltheways/` correctly without changing those paths.

## Adding more learning systems

Each course is defined in `src/data/courses.ts` with an ID, a description, and independent card data. `src/components/SymbolVisual.tsx` renders the symbols and can be extended for future course types. Modes in `src/main.tsx` read the same card definitions and progress records.

Recommended future modes: true typed-character recall and instant feedback; scheduled spaced repetition; timed decoding; interactive Morse keyer; ASL vocabulary/videos; contractions and tactile Braille practice guidance; progress export/import.

## Learning caveats and source attribution

**ASL** is a natural language, not a substitution cipher. This initial course covers only its fingerspelling alphabet. The 24 static reference handshape SVGs are **public-domain Wikimedia Commons art**, redistributed by the MIT-licensed open-source [Spellhand](https://github.com/luthfidi/spellhand) project. They are requested from its pinned GitHub commit during use; the service worker caches them for future offline viewing. **J and Z are dynamic** and must not be represented as static letter handshapes. If these requests are blocked, the app presents a friendly fallback (other courses remain offline).

**Braille** is a tactile reading and writing system. These are visual six-dot patterns in uncontracted English Braille, not a substitute for tactile instruction or a full grade-2 Braille translator. Numbers are rendered with a number sign before each numeral, for introductory study, rather than context-aware number-mode parsing. Capitalization and contractions are not implemented.

**Morse** uses International Morse. Tones are generated locally with the Web Audio API. Audio may require a user gesture on mobile devices.

Fonts are optionally loaded from Google Fonts online and fall back to system fonts offline. No personal data is uploaded by the app. All user progress is stored locally in the browser under `alltheways:state:v1`; clearing site data clears progress.

## Licensing

Original application code and artwork/branding supplied for All the Ways may be reused under the MIT License. Third-party ASL reference SVGs are credited above and originate from public-domain Wikimedia Commons files.
