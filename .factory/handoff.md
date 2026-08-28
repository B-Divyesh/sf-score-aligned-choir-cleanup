# Polish 1 handoff

Repair commit: `052cfc6d7010761dadda904b17ac80cb044d531f`.

Every finding in `.factory/review-1.md` and prior verification records is repaired. The product remains a Tauri 2 desktop application with its archival blueprint identity. Version `0.1.4` is consistent in package, Tauri, landing, demo, legal, and 404 labels.

## Exact verification

- `npm ci`: passed, 0 vulnerabilities.
- Claim manifest: 21 claims, with exactly one matching `@claim:<id>` test each.
- `npm run test:e2e -- --grep '@claim:'`: 18 Chromium claim tests passed.
- `npm run test:unit -- --testNamePattern '@claim:'`: 3 unit claim tests passed.
- `npm test`: 7 Vitest and 28 Chromium Playwright tests passed.
- `npm run check`, `npm run verify:copy -- --write`, `npm run build`, `bash -n public-site/install.sh`, and `git diff --check`: passed.
- `cargo check --locked --manifest-path src-tauri/Cargo.toml`: passed after installing the release workflow’s Linux prerequisites.
- `npm run verify:url -- <route>`: passed for `/`, `/demo/`, `/privacy/`, `/terms/`, and `/404/`; title, language, one main/h1, alt text, and console are clean.
- Playwright axe checks are clean for empty/working app, post-export app, landing, legal, and populated light/dark demo at 390 and 1440.
- Lighthouse local mobile-equivalent run: Performance 100, Accessibility 100, Best Practices 100, SEO 100. JSON: `/tmp/choir-lighthouse.json`.
- Screenshot evidence: `test-results/polish-1/landing-1440.png`; `test-results/polish-1/demo-390.png`.
- Cold live recheck after deployment: all five route smoke checks passed; `?demo=1` redirected to `/demo/?demo=1`; changing preset, hum, theme, rights, project name, then Reset restored archive/light/unchecked/St Anne/three passages. Live screenshot: `test-results/polish-1/live-demo-390.png`.

## Deploy and release

Static deployment command: `npm ci && npm run build:site`; output is `dist/site`. It was deployed through `/opt/fleet/lib/deploy-static.sh score-aligned-choir-cleanup dist/site`; cold live checks passed at `https://score-aligned-choir-cleanup.sociobot.in/`.

Release workflow `33189080475` completed successfully for repair SHA `052cfc6d7010761dadda904b17ac80cb044d531f`. Release `v0.1.4` has macOS ARM/Intel DMGs, Windows EXE/MSI, Linux AppImage/DEB, `SHA256SUMS`, and `latest.json`. The Linux AppImage SHA-256 independently matched: `4701bc64a1d0278b11d9f8ad8fabf7eb7f1629695ec8f55ac811b181fe928eef`.

The desktop binaries are intentionally unsigned. To sign future releases, the operator must provide `APPLE_CERTIFICATE` and `WINDOWS_CERT_PFX` plus their password/identity configuration in GitHub Actions secrets.

## Known gaps

None.
