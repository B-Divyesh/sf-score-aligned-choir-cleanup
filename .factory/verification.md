# Independent verification — FAIL

**Candidate:** `792204da2a76de99955a5be1a99af98dd1bf7ec6`  
**Live URL:** <https://score-aligned-choir-cleanup.sociobot.in/>  
**Verified:** 2026-08-28 UTC  
**Scope:** independent clean-clone verification; product code was not modified.

## Release decision

**FAIL.** This result is not a deployment-only failure. The live static site is an exact build match for the candidate, and the repaired GitHub Releases lookup works. The candidate still fails mandatory acceptance gates: it has no claims manifest/tests, no isolated one-click sample demo, and the live first screen sends a cold visitor to a download rather than a sample workflow. The shipped native release also predates the candidate.

## Required first checks

### Claims and demo — blocking

- **FAIL:** `.factory/claims.json` is absent from the clean checkout. Consequently there were no declared claim commands to execute. This is release-blocking by the claims contract.
- **FAIL:** `.factory/demo.md` is absent. There is no `Try it with sample data` text/action anywhere in the live page, repository, or app. `https://score-aligned-choir-cleanup.sociobot.in/demo` returns **404**.
- **FAIL first-read test:** Cold live page says it turns a difficult archival choir recording and score into labeled rehearsal excerpts, which gives a partial description of the job. The headline, “Preserve the performance. Clarify the rehearsal.”, is not a plain-language job headline; it does not name community choir archivists; and the offered first action is **“Download Linux · AppImage”**, not a one-click sample. There is no persistent demo banner, reset/start-for-real control, sample project, or demo storage namespace.
- The landing page/README/app contain substantial testable claims with no claims-manifest entries, including “100% on-device audio,” “0 recordings uploaded,” “Reversible by construction,” “No account is required,” “works offline after installation,” and “Audio never leaves this device.”

## Local quality checks

| Check | Result | Evidence |
|---|---|---|
| `npm ci` | PASS | Clean install completed; `npm audit` reported 0 vulnerabilities. |
| `npm run check` | PASS | TypeScript completed without diagnostics. |
| `npm test` | PASS | 3 Vitest unit tests and 4 Chromium Playwright tests passed. |
| `npm run build` | PASS | Created `dist/app` and `dist/site`. App JS: 17.81 kB + 2.44 kB (7.32 + 0.98 kB gzip); app CSS: 12.49 kB; site JS: 3.06 kB (1.46 kB gzip); site CSS: 8.00 kB (2.44 kB gzip). |
| `cargo check --locked --manifest-path src-tauri/Cargo.toml` | PASS | Passed after installing the documented Linux Tauri system prerequisites. |
| `npm run tauri -- build --debug --no-bundle` | PASS | Native debug executable produced at `src-tauri/target/debug/score-aligned-choir-cleanup` (258,719,176 bytes). |
| `bash -n public-site/install.sh` / `git diff --check` | PASS | No syntax or whitespace errors. |

## Product exercise

At 390 px, a clean local workbench accepted a 2-second PCM WAV and MusicXML with two rehearsal marks, created two explicitly-evenly-spaced suggestions, rejected a text file with “Convert it to PCM WAV and try again,” rejected invalid `1:99` / `0:01.0` timecodes with the valid range, recovered with a valid passage, required rights confirmation, and exported a ZIP.

The exported ZIP contained `01-A.wav`, `02-B.wav`, `03-Rehearsal-passage-1.wav`, `EDIT-RECEIPT.txt`, and `pack-manifest.json`. The receipt stated `Original source modified: No`, named the input files and passages, documented the cleanup, and recorded rights confirmation. The representative local flow made only same-origin development requests and logged no console/page errors.

## Accessibility, responsiveness, and performance

- 390 px initial layout had no horizontal overflow. Keyboard Tab reached the skip links, app controls, and site links with a visible designed 3 px rust focus outline. Reduced-motion context changed smooth scrolling to `auto` and removed practical transition duration.
- Axe serious/critical scan was clean on the empty app, dark empty app, and live landing page. **After a successful export it fails:** the disabled `#export-button` has computed contrast **1.13:1** (`#fcf9ef` over composited `#e6ece5`), below the required 4.5:1. This is a serious `color-contrast` violation.
- A separate functional/accessibility defect is reproducible before import: `#view-score` has a `hidden` attribute but is visible and tabbable because the generic `button { display: inline-flex }` rule overrides the UA `[hidden]` display. Activating it opens an empty score dialog. The control should not exist until a PDF is loaded.
- Live Lighthouse mobile: **Performance 93**, **Accessibility 100**, FCP **1.1 s**, LCP **1.1 s**, CLS **0**, TBT **310 ms**. The static bundle budgets pass.
- The requested `verify-url.sh` is not present in the repository; equivalent title/lang/main/alt/console checks were performed with Playwright plus axe.

## Privacy, requests, policies, and rate limiting

- Cold live load produced no console/page errors. It requested only the site's HTML, JS, CSS, self-hosted hero asset, and `https://api.github.com/repos/B-Divyesh/sf-score-aligned-choir-cleanup/releases/latest` to resolve downloads. No analytics, third-party fonts, or CDN scripts were observed. The live CSP permits only self scripts/styles/images and the documented GitHub release endpoints for connections; `X-Content-Type-Options`, HSTS, and strict-origin referrer policy are present.
- Hashed JS has `Cache-Control: public, max-age=31536000, immutable`; `sw.js` is `no-cache`; HTML is `public, must-revalidate, max-age=30`.
- The product's license verify endpoint was burst-tested with 40 concurrent invalid-token requests. It returned **30 × 200** and **10 × 429**; the first observed 429 was request 3 in completion order and every 429 supplied `Retry-After: 4`. Rate limiting therefore passes this check.
- `/privacy` and `/terms` return 200. `/robots.txt` and `/sitemap.xml` both return 404, and neither source file exists.

## Deployment and release identity

- The live `index.html`, `assets/home-TBXTEDEs.js`, and `assets/home-DLFJers-.css` are byte-identical to this candidate's `dist/site` build (SHA-256 `1370a4…249d`, `adb5d1…b444`, and `a960bc…3759` respectively). The fixed real download path selects `Choir.Cleanup_0.1.0_amd64.AppImage` and produces no console errors.
- On a forced GitHub API failure, the landing page keeps a calm release-page fallback, but the artificial aborted request is surfaced by Chromium as `net::ERR_FAILED`; no uncaught page exception occurred.
- The only published release is tag `v0.1.0`, whose GitHub `target_commitish` is **`ebf6011fe1b23e9a0395bf8154f1f30f76975fd3`**, not candidate `792204d`. Thus the downloadable desktop app is not a candidate artifact.
- The Linux AppImage was downloaded and SHA-256 verified: `feeb53eab710860c6b9ed6d703afeba86452e5f475813ba3c5ebc0349a5da965`, matching both `SHA256SUMS` and `latest.json`.

## Defects

### Critical

1. Missing `.factory/claims.json` and all required sandbox claim tests; visible privacy/offline/export claims are unlisted and unproved.
2. No one-click sample demo, isolated demo storage, demo reset/start-for-real banner, or demo documentation. `/demo` is 404.
3. First screen fails the explicit plain-words/sample-first acceptance gate; the first available action is a download.

### High

1. No release artifact is built from candidate `792204d`; the downloadable desktop binary is from `ebf6011`.
2. Serious axe color-contrast violation appears after export on the disabled export button (1.13:1).

### Medium

1. Hidden PDF viewer button is exposed and opens an empty modal before a PDF has been selected.
2. Required `robots.txt`, `sitemap.xml`, `.factory/copy-audit.md`, and the requested `verify-url.sh` are missing.

## Required next steps

1. Implement a shipped desktop sample project and one-click sandbox/demo path; document it in `.factory/demo.md`.
2. Inventory every user-facing claim, add `.factory/claims.json`, and add one tagged clean-demo observable test per claim.
3. Rewrite the first screen around the actual task, named audience, and sample action; add the required three plain facts.
4. Repair disabled-state contrast and enforce `[hidden] { display: none !important; }` (or avoid overriding it); retest axe after export and dialog keyboard behavior.
5. Add robots/sitemap/copy audit, tag/build/publish this candidate, then re-run release checksum and independent verification.
