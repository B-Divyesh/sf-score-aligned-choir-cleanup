# Independent verification 3 — FAIL

Candidate `72b8710fa59a254a4c1ca3d2c96b84d4914140cb` **FAILS release acceptance** as independently verified on 2026-08-28 UTC at <https://score-aligned-choir-cleanup.sociobot.in/>.

The live deployment matches the candidate’s 34 deployable static files byte-for-byte, and claims, build, typecheck, normal demo/export, privacy, offline, mobile, headers, release checksum, and rate-limit checks pass. However, the populated **dark** `/demo/` has an axe **serious** `color-contrast` violation: “St Anne Community Choir rehearsal, with three score suggestions.” uses `#d5e1df` on `#f3efe3` (1.16:1; 4.5:1 required). This is release-blocking. Full evidence is in `.factory/verification-3.md`.

Required repair: make `.demo-banner > span` use a theme-aware contrast-safe token and add/regress a populated-demo axe check in both themes before resubmission.

# Repair handoff — v0.1.2

## Outcome

All release-blocking findings in independent verification commit `b491ebcf1f358ec3b692d85f0184d6baf5d7de9a` for candidate `f329bae4e6d7037f4ea78a8ff98fdf411f8ffd39` are repaired. The product remains a Tauri 2 desktop app with a static download and demo site.

## Repairs

1. Recording replacement now commits only after a successful decode, clears every old passage, respaces current score marks to the new duration, clears undo state, and resets rights confirmation.
2. Score replacement removes old score-derived passages, creates suggestions from the new map, preserves valid manual passages, and resets rights confirmation.
3. Preview and export now reject any non-finite, reversed, negative, or out-of-recording passage as a final safety boundary.
4. The TypeScript `HTMLElement | SVGElement` failure is fixed. The release workflow now blocks native builds on typecheck, copy audit, tests, and production build.
5. Dark demo controls use fixed light-paper and navy colors. Axe scans now cover populated demo light and dark modes.
6. `/?license=<token>` now stores the token, removes it from the URL, verifies it through Sociobot, caches the verdict, and shows copy/open instructions for the desktop app.
7. Claims now cover replacement safety, exported filter behavior, checkout return handling, release checksums, and installer checksum rejection.
8. App, landing, manifest, and legal/footer links now provide at least 44×44 CSS-pixel targets.
9. Version and service-worker cache identity are advanced to `0.1.2` / `choir-cleanup-site-v1.2.0`.

The researched brief and blueprint visual thesis were preserved.

## Regression coverage

- `@claim:source-change-safety` replaces the 18-second demo with a one-second recording, verifies three respaced non-silent WAVs, replaces the map, and checks renewed rights gating after both changes.
- `@claim:cleanup-filters` measures exported WAV frequency response and dynamics for rumble, presence, compression, 50/60 Hz hum, and hiss controls.
- `@claim:purchase-return` checks storage, URL stripping, Sociobot verification, and the desktop handoff dialog.
- `@claim:release-integrity` generates fixture release metadata, verifies every checksum, runs the Unix installer against valid and invalid artifacts, and checks the PowerShell mismatch guard.
- Mobile tests measure affected links, and axe runs after export plus in empty/populated light and dark states.

`.factory/claims.json` contains 14 claims. Every exact claim command passed independently.

## Local verification evidence

Run on 2026-08-28 UTC from a clean `npm ci` installation:

- `npm ci`: 75 packages, 0 vulnerabilities.
- `npm run check`: pass, no TypeScript diagnostics.
- `npm run verify:copy -- --write`: pass, 84 sentences, no banned words or sentence over 22 words.
- `npm test`: pass, 4 Vitest unit/integration tests and 20 Chromium Playwright tests.
- `npm run build`: pass; produced `dist/app` and `dist/site`.
- Production payloads: app JS 24.65 kB raw / 9.73 kB gzip; app CSS 13.82 kB raw / 3.88 kB gzip; site JS 4.29 kB raw / 1.94 kB gzip; site CSS 10.34 kB raw / 2.91 kB gzip; no font payload.
- `bash -n public-site/install.sh`: pass.
- `cargo check --locked --manifest-path src-tauri/Cargo.toml`: pass.
- `npm run tauri -- build --debug --no-bundle`: pass; binary at `src-tauri/target/debug/score-aligned-choir-cleanup`.
- Xvfb native smoke: binary stayed running for 10 seconds; only expected headless DRI3 warnings appeared.
- Local mobile Lighthouse: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 0.9 s, LCP 1.3 s, TBT 0 ms, CLS 0.
- Service-worker update/offline exercise: stale cache removed, `choir-cleanup-site-v1.2.0` activated, `/demo/` reloaded offline with three passages and zero console errors.
- `git diff --check`: pass.

## Re-run

```sh
npm ci
npm run check
npm run verify:copy -- --write
npm test
npm run build
bash -n public-site/install.sh
cargo check --locked --manifest-path src-tauri/Cargo.toml
npm run tauri -- build --debug --no-bundle
```

## Deployment and release

- Repair commit: `99ac4fb5a99694e3f70270fc339689902aee02ea`, pushed to `main`.
- Release: [`v0.1.2`](https://github.com/B-Divyesh/sf-score-aligned-choir-cleanup/releases/tag/v0.1.2), published by successful GitHub Actions run `33173954945`.
- Release quality gate, Linux AppImage/deb, Windows MSI/NSIS, and both macOS DMG jobs passed. The release contains six native packages, `SHA256SUMS`, and `latest.json`.
- Every released package was downloaded independently. `sha256sum -c SHA256SUMS` passed for all six, and every `latest.json` platform entry matched the downloaded file's computed digest and `v0.1.2` URL.
- The live Unix installer downloaded and verified the 79,006,200-byte AppImage into a disposable home. Its installed digest was `885d452cd7ad4aa067b0900cb72cfb56880e0693980e011b7820c88ad8400979`; an extracted AppImage smoke remained running for 12 seconds under Xvfb.
- Static deployment ID: `7800d6f9-819d-4984-a5a1-31905f1d5816` in the work order's existing Azure Static Web App.
- Production URL: [`https://score-aligned-choir-cleanup.sociobot.in`](https://score-aligned-choir-cleanup.sociobot.in).
- Built/live identity: all 34 deployed files matched `dist/site` by SHA-256.
- `verify-url.sh` passed `/`, `/demo/`, `/privacy/`, `/terms/`, and `/404/` for title, language, one heading, main landmark, image alternatives, control names, and console errors. An unknown route returned HTTP 404.
- Live Chromium checks at desktop and 390 px passed with no console errors. Dark demo axe reported no serious or critical findings; all measured mobile targets were at least 44 px; offline demo reload retained its three sample passages.
- The live purchase return stored and stripped the token, made one verification request, and showed the invalid-license fallback without locking core tools. The checkout endpoint returned its expected 303 hosted-checkout redirect.
- Response-policy probe: 40 concurrent invalid verification calls produced 30 HTTP 200 responses and 10 HTTP 429 responses with `Retry-After: 4`.
- Production headers include HSTS, `nosniff`, strict-origin referrer policy, and the declared CSP. HTML uses a 30-second revalidation window, hashed assets use one-year immutable caching, and `sw.js` uses `no-cache`.
- Live mobile Lighthouse: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 0.9 s, LCP 1.1 s, TBT 70 ms, CLS 0.
- At 390 px, the detected-platform action resolved to the real `v0.1.2` Linux AppImage, measured 240.8×44 px, and emitted no console error.

## Known gaps and operator action

- macOS and Windows packages are unsigned. Signing needs the owner's `APPLE_CERTIFICATE` and `WINDOWS_CERT_PFX` secrets; this is unchanged and disclosed on the site.
- PowerShell is unavailable in this Linux worker. The Windows script's checksum-failure branch is enforced by source-level regression coverage; the release workflow builds the Windows installer on `windows-latest`.
