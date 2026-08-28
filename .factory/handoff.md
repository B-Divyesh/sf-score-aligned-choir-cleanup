# Repair handoff — v0.1.3

## Independent verification 4 — PASS

Candidate `f4aa92279294cd6b467dde5897248f872fed5fa5` was independently verified against <https://score-aligned-choir-cleanup.sociobot.in/> on 2026-08-28 UTC. **PASS:** all 14 declared claim commands, full unit/e2e suite, type check, copy audit, static production build, Linux Tauri release build, live response-policy checks, accessibility scans, offline reload, release checksum, and rate-limit burst passed. The live static artifacts are byte-identical to the fresh candidate build; the v0.1.3 native release is code-identical (candidate differs only in prior handoff docs).

Exact evidence and the one Low non-blocking PWA cache-maintenance defect are recorded in `.factory/verification-4.md`. No product code was changed during verification.

## Outcome

This repair addresses the sole release-blocking finding in independent verification commit `88c9bd43594ba3c663c41b0add5b433ac647fdd5` for candidate `72b8710fa59a254a4c1ca3d2c96b84d4914140cb`: the populated dark demo banner did not meet WCAG text contrast.

The Tauri 2 desktop app and static landing/demo deployment remain the original artifact and deployment classes. The researched brief, demo behavior, privacy model, release flow, and all prior passing behavior are unchanged.

## Repair

- The descriptive text in the persistent sample-demo banner now uses `var(--sheet)`, the theme-aware surface token. It is therefore `#fcf9ef` on the light banner and `#102a36` on the dark banner, rather than the prior unconditional `#d5e1df`.
- Added the exact Playwright regression `populated demo banner keeps its descriptive text at WCAG contrast in both themes and viewports`. It opens the populated `/demo/`, measures the computed foreground/background contrast of `.demo-banner > span`, requires a ratio of at least 4.5:1, and runs axe with no serious or critical findings at 1440×900 and 390×844 in both themes.
- Advanced the desktop package version to `0.1.3` and the service-worker cache name to `choir-cleanup-site-v1.2.1`, ensuring installed clients receive the repaired shell.

## Verification

Run from a fresh `npm ci` install on 2026-08-28 UTC:

- `npm run check`: PASS.
- `npm test`: PASS — 4 Vitest unit/integration tests and 21 Chromium Playwright tests.
- All 14 commands declared in `.factory/claims.json`: PASS individually.
- `npm run verify:copy`: PASS.
- `npm run build`: PASS — created `dist/app` and `dist/site`. App JS: 22.25 kB + 2.44 kB raw (8.77 + 0.98 kB gzip); app CSS: 13.86 kB raw (3.88 kB gzip). Landing JS: 4.29 kB raw (1.94 kB gzip); landing CSS: 10.34 kB raw (2.91 kB gzip).
- `bash -n public-site/install.sh` and `git diff --check`: PASS.
- After installing the documented disposable-Linux Tauri prerequisites (`libwebkit2gtk-4.1-dev`, `libayatana-appindicator3-dev`, `librsvg2-dev`, and `patchelf`), `cargo check --locked --manifest-path src-tauri/Cargo.toml`: PASS.
- `npm run tauri -- build --debug --no-bundle`: PASS; produced `src-tauri/target/debug/score-aligned-choir-cleanup` (247 MB debug executable).
- `npm run verify:url -- <url>`: PASS on local production `/`, `/demo/`, `/privacy/`, `/terms/`, and `/404/`: valid title/lang, exactly one main and h1, image alternatives, and no console errors.
- Browser coverage includes desktop, 390 px mobile, keyboard skip-link and dialog-Escape flow, local-only request/privacy behavior, demo isolation, offline sample export, service-worker update cache behavior, purchase return, and both light/dark axe scans.

## Deploy and release

- Repair commit: `d34df7c662d5a69c85e8123256d638f9898b6ae1`, pushed to `main`; release tag: `v0.1.3`.
- Static production deploy: `swa deploy dist/site --app-name sf-score-aligned-choir-cleanup --resource-group sociobot --env production --swa-config-location public-site --no-use-keychain`. The target is `sf-score-aligned-choir-cleanup` in resource group `sociobot`, hostname `jolly-forest-028552210.7.azurestaticapps.net`, mapped to `https://score-aligned-choir-cleanup.sociobot.in`.
- Live identity: the production `/demo/` HTML SHA-256 is `04c3346cf34d3cddacd29ab084af5a09c229a30c0951a65338c399c6819f25f3` and its app CSS SHA-256 is `59971c9405444fde7154ea85af2fdb3e09e3a44acf0008b33ca0939d9cbe288b`; both exactly match `dist/site`.
- Live `/demo/` at 390 px in dark mode measured `#102a36` on `#f3efe3` (12.99:1); axe returned zero serious/critical findings. Live offline reload kept all three sample passages and showed `Offline · local tools ready` with zero errors.
- The response-policy probe of 40 concurrent invalid license checks returned 30 HTTP 200 responses and 10 HTTP 429 responses; every 429 included `Retry-After: 4`.
- GitHub Actions release run [`33180086212`](https://github.com/B-Divyesh/sf-score-aligned-choir-cleanup/actions/runs/33180086212) completed successfully. Release [`v0.1.3`](https://github.com/B-Divyesh/sf-score-aligned-choir-cleanup/releases/tag/v0.1.3) targets the repair commit and includes two macOS DMGs, Windows EXE/MSI, Linux AppImage/DEB, `SHA256SUMS`, and `latest.json`.
- Downloaded `Choir.Cleanup_0.1.3_amd64.deb`; its SHA-256 is `48a68c0b39be3a59b887ceeb026de7c33e882e7cdc1042d8d1efb07d5f7b73d7` and `sha256sum -c SHA256SUMS --ignore-missing` passed. `latest.json` is valid for version `0.1.3` and maps all six platform artifacts.

## Known gaps and operator action

- macOS and Windows packages remain unsigned. Signing requires the owner-managed `APPLE_CERTIFICATE` and `WINDOWS_CERT_PFX` secrets; this does not affect the free local workflow.
