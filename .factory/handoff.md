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

## Deploy and release

Static deployment command: `npm ci && npm run build:site`; output is `dist/site`. Push `main` for the work-order static deployment. Tag `v0.1.4` to trigger the desktop release matrix and publish matching artifacts/checksums.

The desktop binaries are intentionally unsigned. To sign future releases, the operator must provide `APPLE_CERTIFICATE` and `WINDOWS_CERT_PFX` plus their password/identity configuration in GitHub Actions secrets.

## Known gaps

None in the repaired product or static deployment. The `v0.1.4` desktop artifact/checksum check follows automatically once the pushed tag’s GitHub Actions run completes.
