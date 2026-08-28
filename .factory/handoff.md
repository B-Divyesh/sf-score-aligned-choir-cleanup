# Polish 2 handoff

## Completed

All findings in `.factory/review-1.md` and `.factory/review-2.md` are closed in `.factory/polish-2.md`. The repair strengthened the isolated `?demo=1` path, deterministic reset, public-claim inventory and individual claim tests, common route structure, metadata/focus/404 handling, mobile checks, copy audit, and release publishing.

The final repair commit is `ffcceda` (`fix: align release manifest asset names`). The production static site was deployed through the factory static work order and is live at <https://score-aligned-choir-cleanup.sociobot.in/>. Release workflow run [33201123744](https://github.com/B-Divyesh/sf-score-aligned-choir-cleanup/actions/runs/33201123744) passed all quality, Linux, Windows, Intel macOS, Apple-silicon macOS, and publish jobs. Release [v0.1.11](https://github.com/B-Divyesh/sf-score-aligned-choir-cleanup/releases/tag/v0.1.11) contains exactly two DMGs, EXE, MSI, AppImage, DEB, `latest.json`, and `SHA256SUMS`.

## Verification

- Clean clone: `git clone --depth 1 file:///work/repo /tmp/choir-clean-clone-ZlHcWl && npm ci`; all 25 individual commands from `.factory/claims.json` passed. The final clean-clone result was `@claim:tracker-free-site` passing with no failed Playwright run.
- Current tree: `npm run verify:copy`, `npm run check`, `npm test` (9 unit tests and 34 Playwright/axe tests), `npm run build`, and `cargo test --manifest-path src-tauri/Cargo.toml` passed.
- Accessibility and structure: `npm run verify:url -- https://score-aligned-choir-cleanup.sociobot.in/{,demo/,privacy/,terms/,404/}` passed with one title/lang/main/h1, alt text, and zero console errors. The Playwright axe integration had zero violations on every public route at 390 px.
- Cold production verification: `EXPECTED_VERSION=0.1.11 npm run verify:live -- https://score-aligned-choir-cleanup.sociobot.in` passed. It exercised first-screen copy/download completion, demo isolation/reset, offline pack export, h1 focus/Back navigation, navigation set, metadata, no overflow, axe, console, and 404. Screenshots are `test-results/polish-2/live-first-screen-390.png` and `test-results/polish-2/live-demo-390.png`.
- Release verification: the v0.1.11 manifest lists all six platform bundles. A direct download of `Choir.Cleanup_0.1.11_amd64.AppImage` matched its manifest SHA-256 `3700ed509048435379c746c2e040a38020c5f7905a81ee0788927a339ac7f2fc`.

## Known gaps / operator action

None. Builds are intentionally unsigned, and that status is stated and tested. Signing would require owner-provided `APPLE_CERTIFICATE` and `WINDOWS_CERT_PFX` before any signing configuration is added.
