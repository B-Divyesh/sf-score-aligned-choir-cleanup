# Review handoff — adversarial first-read review 1

## Outcome

**FAIL.** Wrote `.factory/review-1.md` for candidate `dd2d32c8c82e6b29eea19b094d2d6896eda39aea`. Product code was not modified.

The cold 390 px and desktop landing screens clearly explain the job, audience, and first action. The one-click sample loads realistic data, preserves preseeded real-storage keys, exports offline, and makes no cross-origin demo requests. All 14 declared claim commands pass from a temporary clean clone.

The blocking findings are:

- Reset demo leaves cleanup preset, hum, and theme edits active.
- The previously reported `choir-cleanup-site-v1.2.0` cache remains alongside the active `v1.2.1` cache.
- “Unlimited local projects” is not implemented: editable projects cannot be saved and reopened.
- Public PDF/MXL, audio-format, input-method, audition, license portability/refund, release automation/detection, privacy, signing, and negative-restoration claims are absent from `.factory/claims.json`.

The report also records incomplete route metadata, inconsistent route headers/footers, missing route-change focus, stale `v0.1.2` labels, moderate axe landmark errors, and all copy-audit findings with proposed rewrites.

## Verification performed

- Fresh browser contexts at 390×844 and 1440×900 on the live landing and demo.
- Live demo Reset/isolation/offline/export/network/cache exercise.
- Every exact `.factory/claims.json` command separately: 14/14 passed.
- `npm run check`: PASS.
- `npm test`: PASS (4 unit, 21 Playwright).
- `npm run build`: PASS; `dist/app` and `dist/site` produced in the clean clone.
- `npm run verify:copy`: PASS as implemented, but review finding F-1-19 explains its missing coverage.
- `npm run verify:url -- <url>`: PASS for `/`, `/demo/`, `/privacy/`, `/terms/`, and `/404/`.
- Live link crawl: no dead navigation links; checkout was not activated because that creates external transaction state.
- Playwright axe scans on landing/demo/legal/404, both viewports, plus light/dark demo. No serious/critical violations; moderate nested-complementary-landmark failures remain.

## Evidence and reproduction

See `.factory/review-1.md`. Key Reset reproduction: open `/demo/`, choose Section clarity, enable the hum filter, switch theme, press Reset demo, then inspect the same controls. Key cache reproduction: in a fresh service-worker-enabled profile, await offline readiness and run `await caches.keys()`; both `choir-cleanup-site-v1.2.0` and `choir-cleanup-site-v1.2.1` are returned.

## What remains

Resolve every `F-1-*` finding, expand the claim inventory/tests, and repeat the full review from scratch. Do not treat the passing existing suite as acceptance: it does not cover complete Reset semantics, project persistence, all public claims, full metadata, route focus, or moderate axe failures.
