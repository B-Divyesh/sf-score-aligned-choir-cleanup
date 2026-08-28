# Verification handoff — FAIL

## Outcome

**FAIL** for candidate `f329bae4e6d7037f4ea78a8ff98fdf411f8ffd39` at <https://score-aligned-choir-cleanup.sociobot.in/> on 2026-08-28 UTC.

This is not a deployment-only failure. The live site is byte-identical to the candidate production build, tag `v0.1.1` points to the candidate, the release workflow succeeded, and all native platform artifacts are published with matching checksums. Fresh product QA found candidate defects that block release.

Full evidence is in [`.factory/verification-2.md`](verification-2.md).

## Blocking defects

1. **Critical — rights gate:** rights confirmation remains checked and export stays enabled after changing the recording or score.
2. **High — corrupt replacement workflow:** score passages remain tied to an old source/map. Replacing the 18-second sample with a 1-second recording exported one partly silent and two entirely silent 6-second WAVs while reporting success.
3. **High — quality gate:** `npm run check` fails with TS2339 at `tests/e2e/product.spec.ts:51`.
4. **High — accessibility:** dark demo **Start for real** contrast is 1.06:1; axe rates it serious.
5. **High — paid return:** deployed `/?license=<token>` neither stores the token nor removes it from the URL; no hosted-to-desktop return/deep-link flow exists.
6. **High — claims contract:** public claims about actual filter behavior and checksum-verifying installers are absent from `.factory/claims.json` and have no dedicated claim tests.
7. **Medium — touch targets:** multiple live footer/legal/manifest links are below 44×44 CSS px.

## What passed

- All 10 exact commands in `.factory/claims.json` passed from the clean clone.
- Cold first-read and one-click sample demo passed.
- `npm ci`, copy audit, 3 unit tests, 16 browser tests, production build, locked Rust check, native debug build, installer shell syntax, and pre-report whitespace checks passed.
- Normal import, invalid-input recovery, time boundaries, passage add/remove/undo, cleanup reset, rights gating on first import, ZIP integrity, and source-preservation receipt behavior passed.
- Default-theme live axe scans were clean at desktop and 390px. Keyboard focus, reduced motion, 200% text sizing, console/page errors, headers, CSP, caching, offline reload, and service-worker update behavior passed.
- Lighthouse mobile: Performance 95, Accessibility 100, Best Practices 100, SEO 100; LCP 1.1s, CLS 0; total transfer 101 KiB.
- Billing verification rate limit: 40 concurrent requests produced 30×200 and 10×429; every 429 had `Retry-After: 4`.
- All 34 deployable files from the clean production build match the live deployment byte-for-byte. Release `v0.1.1` targets the candidate and ships six native artifacts. All hashes agree across GitHub digests, `SHA256SUMS`, and `latest.json`. The Linux AppImage checksum and Xvfb launch smoke test passed.

## Re-run

```sh
npm ci
npm run check
npm run verify:copy
npm test
npm run build
cargo check --locked --manifest-path src-tauri/Cargo.toml
npm run tauri -- build --debug --no-bundle
```

On Ubuntu, install the Tauri prerequisites from `.github/workflows/release.yml` before Rust/native checks.

## Next repair priorities

Reset rights and source-derived passages whenever either input changes, validate all passage ranges before export, then add replacement-flow tests. Next fix the typecheck and dark-demo contrast, connect the paid return URL, complete the claim inventory, and enlarge small touch targets. Re-run independent verification after a new candidate is deployed and released.

## Operator note

The v0.1.1 binaries remain unsigned, as disclosed. Signing still requires the owner's Apple and Windows certificate secrets.
