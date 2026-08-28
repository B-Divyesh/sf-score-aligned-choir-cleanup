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

Pending at this commit stage. The repair worker will push `main`, tag `v0.1.2`, wait for the cross-platform release, deploy `dist/site` through the work order's static deployment configuration, and append live identity evidence below.

## Known gaps and operator action

- macOS and Windows packages are unsigned. Signing needs the owner's `APPLE_CERTIFICATE` and `WINDOWS_CERT_PFX` secrets; this is unchanged and disclosed on the site.
- PowerShell is unavailable in this Linux worker. The Windows script's checksum-failure branch is enforced by source-level regression coverage; the release workflow builds the Windows installer on `windows-latest`.
