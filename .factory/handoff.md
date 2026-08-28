# Review 2 handoff

This reviewer made no product-code changes. Commit contains only `.factory/review-2.md` and this handoff.

## Result

**FAIL.** The live app is clear on first read, has a working isolated sample demo, passes all 21 declared clean-clone claim commands, and passed `npm test`, `npm run check`, `npm run build`, and accessibility/link smoke checks. The review found:

- F-2-1 / F-1-17: header navigation is still inconsistent between home and deep routes.
- F-2-2 / F-1-19: the copy-audit command falsely reports no flags because it does not test all required plain-language categories.
- F-2-3: a successful release lookup leaves “Checking the latest release…” visible indefinitely.
- F-2-4 through F-2-9: unlisted public claims and specific plain-language copy defects.

## Verification performed

- Fresh live browser contexts at 390×844 and 1440×900.
- One-click `/demo/` workflow, reset, real-storage isolation, offline export, request interception, and console smoke check.
- Every `claims.json` command independently after `npm ci` in `/tmp/choir-review-JWBzyg/repo` — all passed.
- Current tree: `npm run verify:copy`, `npm test`, `npm run check`, and `npm run build` — all passed.
- Live route metadata/focus checks, link crawl, 404/robots/sitemap checks, and axe serious/critical scans.

## Next step

Repair every finding in `.factory/review-2.md`, deploy the changed static site, then run the full adversarial review again from a fresh browser and clean clone.
