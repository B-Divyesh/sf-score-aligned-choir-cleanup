# Handoff — Choir Cleanup v0.1.1 repair

## Outcome

All release-blocking findings from independent verification commit `d45c723e9993b9148dc19440cfaee94bf1bf13ba` are repaired. The researched desktop-app scope and the existing import, cleanup, rights, export, licensing, and release behaviors remain intact.

## Repairs

- Added a one-click `/demo/` and in-app **Load sample project**. The fictional St Anne project contains an 18-second locally generated rehearsal fixture and three editable score marks.
- Demo state is memory-only. It never reads or writes real `choir-cleanup:*` or `sb_license:*` storage. The persistent banner provides **Reset demo** and **Start for real**.
- Rewrote the first screen to name the job and community choir archivist, make the sample the primary action, and show three plain facts.
- Added `.factory/claims.json` with ten claims and exactly one `@claim:<id>` browser test for each claim.
- Added `.factory/demo.md`, `.factory/copy-audit.md`, `robots.txt`, `sitemap.xml`, metadata/social art, an authored favicon, and a styled `/404/` route.
- Added three real app screenshots to the landing walkthrough. Their provenance is recorded in `.factory/design.md`.
- Fixed the exposed empty PDF control with a global `[hidden]` rule and regression coverage.
- Fixed export-button contrast across disabled and hovered states. Axe is clean after export and in both app themes.
- Added browser service-worker control and asset precaching for offline sample use.
- Advanced the app, Rust package, and Tauri bundle to `0.1.1` so release artifacts identify this repair.

## Verification evidence

Run from a clean npm install on 2026-08-28 UTC:

```sh
npm ci
npm run check
npm run verify:copy
npm test
npm run build
cargo check --locked --manifest-path src-tauri/Cargo.toml
npm run tauri -- build --debug --no-bundle
```

- `npm ci`: 75 packages installed; 0 vulnerabilities.
- TypeScript: no diagnostics.
- Copy audit: 76 landing sentences; no sentence over 22 words and no banned terms.
- Vitest: 3/3 passed.
- Playwright 1.58.2 Chromium: 16/16 passed. This covers desktop, 390×844 mobile, keyboard skip/dialog behavior, light/dark axe scans, post-export axe, demo isolation/reset, same-origin privacy, offline export, ZIP contents, rights gating, score suggestions, anonymous use, license caching, pricing, platform resolution, legal routes, robots, sitemap, and 404.
- Production build: `dist/app` and `dist/site` created. App JavaScript is 21.16 KB + 2.44 KB raw (8.41 KB + 0.98 KB gzip); app CSS is 13.53 KB raw (3.83 KB gzip). Site JavaScript is 3.06 KB raw (1.46 KB gzip); site CSS is 9.54 KB raw (2.76 KB gzip). No font payload exists.
- Route smoke checks on `/`, `/demo/`, `/privacy/`, `/terms/`, and `/404/`: HTTP success locally, one `<h1>`, one `<main>`, `lang=en`, title present, all images have alt text, and zero console/page errors.
- Lighthouse mobile production build: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 1.0 s, LCP 1.4 s, TBT 0 ms, CLS 0.
- Rust locked check passed after installing the documented Ubuntu Tauri prerequisites.
- Native debug build passed at `src-tauri/target/debug/score-aligned-choir-cleanup` (247 MB, unbundled debug executable).
- Release-manifest consumer fixture produced six platform entries; every generated `SHA256SUMS` line verified.
- `bash -n` passed for `public-site/install.sh`. PowerShell is unavailable in this Linux worker; Windows execution remains covered by the release workflow.
- Live billing identity: invalid verification returns HTTP 200 with `{valid:false, reason:"invalid"}`. A 40-request burst returned 30×200 and 10×429; every 429 had `Retry-After: 3`. Checkout returns HTTP 303 to the hosted Dodo session.

## Release and deployment

- Release tag: `v0.1.1` on the final repair commit.
- Workflow: `.github/workflows/release.yml`; four native build targets publish macOS arm64/x64 DMGs, Windows EXE/MSI, Linux AppImage/DEB, `SHA256SUMS`, and `latest.json`.
- Release page: <https://github.com/B-Divyesh/sf-score-aligned-choir-cleanup/releases/tag/v0.1.1>
- Static build command: `npm ci && npm run build:site`
- Static deploy root: `dist/site`
- Production URL: <https://score-aligned-choir-cleanup.sociobot.in/>
- Demo URL: <https://score-aligned-choir-cleanup.sociobot.in/demo/>

## Known, intentional limits

- MusicXML supplies named structural hints, not audio-to-score synchronization. Suggestions are evenly spaced until the archivist corrects them.
- PDF is a local visual reference. Compressed MXL remains a named manual reference in v1.
- Input codecs follow the operating-system WebView. PCM WAV is the dependable fallback and all exported excerpts are PCM WAV.
- Filters are conservative Web Audio primitives. There is no source separation, voice cloning, generative replacement, or forensic restoration.
- Large packs render in memory before save. Multi-hour sources should be divided into shorter sessions.

## Needs operator action

- v0.1.1 binaries are unsigned. Signing later requires the owner's Apple and Windows certificates and corresponding GitHub Actions secrets (`APPLE_CERTIFICATE`, `WINDOWS_CERT_PFX`, plus their passwords and identities).
- No other release-blocking gap is known.
