# All the Ways

**A world of ways to communicate.** A static, mobile-first React + TypeScript learning app for ASL fingerspelling, visual uncontracted English Braille, and International Morse code.

## Practice modes

- **Study:** Flip cards, reverse front/back, save favorites, self-rate, track mastery.
- **Test:** Letters or words; symbol-to-text and text-to-symbol; 10 questions, 60-second sprint, or 3-minute session. Words read from symbols are typed; reverse questions offer four choices. Results include accuracy, mean response time, correct answers/minute, and correct characters/minute.
- **Type:** Convert text to handshape, Braille, or Morse displays. Morse code and Braille Unicode can also be decoded; Morse decode mode includes a dot/dash keypad. Optional Morse audio in all three modes uses browser Web Audio (no API).
- Saved progress, favorites, audio preference, and last 50 test sessions remain in localStorage, using the existing v1 storage key. No account or data collection.

## Notes

ASL here covers the *fingerspelling alphabet*, not ASL as a language; J and Z require motion and have guidance rather than a static image. Word tests avoid those moving letters until animated references are available. Braille is a **visual** representation only and does not teach touch, contractions, or encoding capitalization marks. The Morse examples use International Morse code.

## Local development

```bash
npm install
npm test
npm run build
npm run dev
```

## Deployment

GitHub Actions runs tests, builds a production Vite bundle, injects the app assets into the service-worker precache and publishes `dist/` to GitHub Pages.

Custom domain: `alltheways.davidlwatsonjr.com` (`public/CNAME`). Select GitHub Actions as Pages source; add the DNS CNAME pointing to `davidlwatsonjr.github.io`.

The PWA manifest and app icons are in `public/`; all assets required to study (including local ASL alphabet illustrations) are hosted in the repository and cached for offline use after first successful load.
