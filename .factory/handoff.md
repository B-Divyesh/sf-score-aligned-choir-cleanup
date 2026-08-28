# Handoff — Choir Cleanup v0.1.0

## What was built

- A Tauri 2 desktop workbench with a small Vite/TypeScript interface and Rust save dialog.
- Fully local audio decode, waveform view, source/revision audition, editable passage marks, exact timecodes, and MusicXML rehearsal-mark suggestions.
- In-app PDF score reference viewer; compressed MXL and other score files can be retained as manual map references.
- Reversible local filters: rumble high-pass, gentle presence/dynamics, hiss low-pass, and optional narrow 50/60 Hz notches.
- Rights-gated export of real 16-bit PCM WAV excerpts in a ZIP with `EDIT-RECEIPT.txt` and `pack-manifest.json`. Source files are never modified.
- Keyboard-accessible empty, error, offline, progress, cancellation, and undo states; responsive path verified at 390px.
- Free complete workflow plus a $39 one-time Sociobot Steward unlock for saved archive notes and named receipt sign-off. Cached verification never blocks free use.
- Blueprint drafting-sheet visual system, light/dark app treatments, authored mark/icons, and an original generated archival hero with prompt and provenance in `.factory/design.md`.
- Static OS-detecting download site, `/privacy/`, `/terms/`, service worker, security/cache configuration, SHA-verifying shell/PowerShell installers, and a four-target GitHub Actions release matrix.

## Run and verify

```sh
npm ci
npm run check
npm test
npm run build
cargo check --locked --manifest-path src-tauri/Cargo.toml
npm run tauri -- build --debug --no-bundle
```

Factory deploy command: `npm ci && npm run build:site`

Static deploy root: `dist/site` (contains `index.html`, legal pages, installers, service worker, and image derivatives).

## Verification completed 2026-08-28

- `npm run check`: passed.
- `npm test`: 3 Vitest unit tests and 4 Chromium/Playwright end-to-end tests passed.
- End-to-end coverage includes local WAV decode, MusicXML suggestions, rights confirmation, ZIP download, PDF viewer dialog, 390px overflow, direct legal routes, and axe serious/critical checks.
- `npm run build`: passed. Initial app JS 17.81 KB uncompressed (plus a 2.44 KB save-only native bridge chunk); app CSS 12.49 KB; site JS 3.06 KB; site CSS 8.00 KB. No font payload.
- `npm audit`: 0 vulnerabilities.
- `cargo check --locked`: passed after installing the Linux Tauri prerequisites.
- Native `tauri build --debug --no-bundle`: passed; executable produced locally at `src-tauri/target/debug/score-aligned-choir-cleanup` (ignored from git).
- Production Lighthouse mobile emulation: Performance **100**, Accessibility **100**, Best Practices **96**, SEO **92**; FCP 0.9s, LCP 1.4s, TBT 0ms, CLS 0.
- Generated hero derivatives: 640px AVIF 19 KB / WebP 29 KB; 1024px AVIF 41 KB / WebP 69 KB; 1536px AVIF 82 KB / WebP 150 KB. All stay under the 300 KB hero budget.
- Visual review completed at 1440px and 390px. No browser console errors appeared in Playwright runs.

## Release

- Workflow: `.github/workflows/release.yml`.
- Tag `v0.1.0` was pushed and run `33156711411` completed successfully across all jobs.
- It builds macOS Apple-silicon and Intel DMGs, Windows MSI/EXE, and Linux AppImage/DEB, then publishes `SHA256SUMS` and `latest.json` only after all platform jobs pass.
- Release URL: `https://github.com/B-Divyesh/sf-score-aligned-choir-cleanup/releases/tag/v0.1.0`.
- Published assets were verified through the public GitHub API: both macOS DMGs, Windows EXE/MSI, Linux AppImage/DEB, `SHA256SUMS`, and `latest.json` are present. The 2.2 MB Windows EXE was downloaded independently; its computed SHA256 `a7b808676c1e6e70bd7e9c25de51e91c8392794c6d2450f48ed8869c29250467` exactly matched both `latest.json` and `SHA256SUMS`.
- GitHub release-asset responses do not grant browser CORS reads. The landing page therefore uses GitHub’s CORS-enabled public Releases API for identical filenames/digests and links the published `latest.json`; terminal installers read `latest.json` directly.

## Known, intentional limits

- MusicXML provides named structural hints, not automatic audio-to-score synchronization. Imported marks are evenly spaced and explicitly labeled as suggestions until the archivist corrects timing.
- PDF is displayed as a local visual reference; compressed MXL is attached as a named manual reference but not decompressed in v1.
- Available input codecs follow the operating-system WebView. PCM WAV is the dependable fallback and all outputs are PCM WAV.
- Filters are conservative Web Audio primitives. There is no source separation, voice cloning, generative replacement, or forensic claim.
- Large/long packs are rendered in memory before save; multi-hour sources should be divided into shorter sessions in v1.

## Needs operator action

1. Deploy `dist/site` through the factory; no DNS or infrastructure changes were made here.
2. Register the paid product slug `score-aligned-choir-cleanup` with the Sociobot billing factory and set the production return URL. The app contains no product ID and already uses the required slug checkout/verify endpoints.
3. The v0.1.0 release is unsigned. For later signed builds, provision the expected certificate secrets `APPLE_CERTIFICATE` and `WINDOWS_CERT_PFX` (plus their passwords/identities required by the signing step) and extend the workflow’s import/sign configuration. Until then, keep the documented macOS right-click → Open and Windows publisher-warning guidance.
4. Submit Windows manifests to winget only if the product later adopts that distribution channel. The required v1 Tauri installer assets and one-line installers are already present.
