# Independent verification 2 — FAIL

**Candidate:** `f329bae4e6d7037f4ea78a8ff98fdf411f8ffd39`

**Live URL:** <https://score-aligned-choir-cleanup.sociobot.in/>

**Verified:** 2026-08-28 UTC

**Scope:** clean-checkout product, live deployment, and published v0.1.1 desktop release. Product code was not modified.

## Release decision

**FAIL.** The live static deployment and published desktop release are built from the requested candidate, so this is not a deployment-only failure. The candidate fails the available TypeScript gate, produces incorrect/silent excerpts after a source replacement, reuses rights confirmation across changed source material, and has a serious WCAG contrast defect in the dark demo. The paid return flow and claim inventory also do not meet their attached contracts.

## Mandatory first checks

### Claims

`.factory/claims.json` exists. From a clean candidate checkout after `npm ci`, every listed command was run separately and passed:

| Claim | Exact command | Result |
|---|---|---|
| `demo-isolation` | `npm run test:e2e -- --grep @claim:demo-isolation` | PASS, 1 test |
| `on-device-audio` | `npm run test:e2e -- --grep @claim:on-device-audio` | PASS, 1 test |
| `offline-workflow` | `npm run test:e2e -- --grep @claim:offline-workflow` | PASS, 1 test |
| `documented-pack` | `npm run test:e2e -- --grep @claim:documented-pack` | PASS, 1 test |
| `score-suggestions` | `npm run test:e2e -- --grep @claim:score-suggestions` | PASS, 1 test |
| `no-account-core` | `npm run test:e2e -- --grep @claim:no-account-core` | PASS, 1 test |
| `steward-license` | `npm run test:e2e -- --grep @claim:steward-license` | PASS, 1 test |
| `platform-downloads` | `npm run test:e2e -- --grep @claim:platform-downloads` | PASS, 1 test |
| `license-verification-cache` | `npm run test:e2e -- --grep @claim:license-verification-cache` | PASS, 1 test |
| `tracker-free-site` | `npm run test:e2e -- --grep @claim:tracker-free-site` | PASS, 1 test |

The inventory is nevertheless incomplete. Public copy claims the named filters perform rumble, presence, dynamics, hum, and hiss processing, but no claim entry/test checks the exported signal. The site and README also claim that release checksums ship and the terminal installers independently verify SHA256, without a corresponding claim entry. This is a release-blocking unlisted-claim finding under the claims contract.

### Cold first-read test

**PASS.** At 1440×900, a cold anonymous visit showed:

- What: “Make rehearsal copies from choir archive recordings.”
- For whom: “For community choir archivists who need clearer practice excerpts while keeping every source intact.”
- First action: “Try it with sample data,” with “Opens a ready sample project in your browser.”
- Plain facts in the same viewport: audio stays on-device, installed use works offline, and core import/export is free.

One click opened `/demo/`, populated the St Anne sample recording and three score suggestions, and showed the persistent “Demo — sample data, nothing is saved” banner with **Reset demo** and **Start for real**.

## Clean-checkout quality gates

| Check | Result | Evidence |
|---|---|---|
| Candidate identity | PASS | Clean checkout HEAD was exactly `f329bae4e6d7037f4ea78a8ff98fdf411f8ffd39`. |
| `npm ci` | PASS | 75 packages installed; audit reported 0 vulnerabilities. |
| `npm run check` | **FAIL** | TypeScript error TS2339 at `tests/e2e/product.spec.ts:51`: `innerText` does not exist on `HTMLElement | SVGElement`. Exit code was nonzero. |
| `npm run verify:copy` | PASS | 76 sentences; no banned terms or sentences over 22 words. |
| `npm test` | PASS | 3/3 Vitest tests and 16/16 Chromium Playwright tests passed. |
| `npm run build` | PASS | Exact production build created `dist/app` and `dist/site`. |
| Rust prerequisites | PASS after install | Installed the same Ubuntu WebKit/AppIndicator/RSVG/patchelf packages declared in the release workflow. |
| `cargo check --locked --manifest-path src-tauri/Cargo.toml` | PASS | Completed after prerequisites were present. |
| `npm run tauri -- build --debug --no-bundle` | PASS | Built `src-tauri/target/debug/score-aligned-choir-cleanup`. |
| `bash -n public-site/install.sh` | PASS | No shell syntax error. PowerShell was unavailable in this Linux worker. |
| `git diff --check` | PASS before report edits | No whitespace errors. |

No separate lint command exists in `package.json`.

Production sizes are comfortably within budget: app JS 21.16 + 2.44 kB raw (8.41 + 0.98 kB gzip), app CSS 13.53 kB raw (3.83 kB gzip), site JS 3.06 kB raw (1.46 kB gzip), and site CSS 9.54 kB raw (2.76 kB gzip). No font payload is shipped.

## End-to-end and recovery exercise

### Normal and input-boundary paths

PASS results from a fresh real-mode app state:

- A corrupt text file was rejected with “Convert it to PCM WAV and try again,” then a valid PCM WAV recovered successfully.
- MusicXML imported before the audio produced two named, evenly spaced editable suggestions after audio load.
- `1:99`, an end before the start, and an end beyond the 2.0-second source were rejected with a bounded, actionable error.
- Exact boundaries `0` to `2.0` were accepted.
- Passage removal and **Undo removal** restored the original order.
- Reset cleanup restored Archive gentle and disabled hum notches.
- Export remained disabled until rights confirmation.
- The resulting ZIP passed `unzip -t` and contained three valid labeled PCM WAVs, `EDIT-RECEIPT.txt`, and `pack-manifest.json`. The receipt and manifest recorded the sources, cleanup, passages, rights confirmation, and `originalModified: false`.
- The flow emitted no console/page errors and no cross-origin requests.

### Source replacement — blocking

**FAIL.** In a fresh deployed reproduction, rights were confirmed for the bundled 18-second sample and then the recording was replaced with a decoded 1-second `different-owner.wav`. The three original 6-second suggestions did not recompute, clamp, clear, or warn. Export stayed enabled and reported “Ready to render 3 labeled WAV excerpts.” Inspection of the ZIP showed:

- `01-Opening-hymn.wav`: a 6-second file with only the beginning populated (`45,443` non-zero samples).
- `02-Verse-2-entries.wav`: a 6-second file with `0` non-zero samples—entirely silent.
- `03-Final-cadence.wav`: a 6-second file with `0` non-zero samples—entirely silent.

Replacing the sample MusicXML with `replacement.musicxml` (mark C) likewise changed the displayed map metadata to “1 rehearsal marks” while the passage register incorrectly remained Opening hymn / Verse 2 entries / Final cadence. Stale alignment state can therefore be exported under different source names.

### Rights confirmation — blocking

**FAIL.** After checking rights for the sample source, replacing the audio with the fully decoded `different-owner.wav` left the rights checkbox checked, left export enabled, and displayed “Ready to render 3 labeled WAV excerpts.” Replacing the score also retained confirmation. Rights must be reconfirmed whenever either governed source changes.

### Paid license flow — blocking

- PASS: the $39 link returns HTTP 303 to hosted Dodo checkout; free import/export remains available; the desktop UI accepts pasted licenses; cached valid verdicts avoid another verification request.
- **FAIL:** opening the deployed return URL shape `/?license=qa-verifier-token` left the token in the address bar, stored no `sb_license:score-aligned-choir-cleanup` value, and initiated no verification. The landing runtime has no license-return handler. The Tauri app has no registered web/deep-link return route, so the handler inside `app/main.ts` is not reachable from hosted checkout return navigation. This violates the required store-strip-verify purchase return flow, although manual paste remains as a fallback.

## Accessibility, mobile, and browser behavior

- `npm run verify:url -- <url>` passed on live `/`, `/demo/`, `/privacy/`, `/terms/`, and `/404/`: HTTP success, title, `lang=en`, one `<main>`, one `<h1>`, alt text, and no console/page errors.
- At both 1440px and 390×844, live `/`, `/demo/`, `/privacy/`, and `/terms/` had no horizontal overflow and no axe serious/critical issues in the default theme.
- **FAIL:** switching the live demo to dark mode produces a serious axe `color-contrast` violation on **Start for real**: foreground `#102f3d`, background `#102a36`, ratio **1.06:1**, required 4.5:1. The existing suite scans dark only in non-demo mode, where this control is hidden.
- **FAIL:** several mobile targets are below the required 44×44 CSS px. Examples: **Release manifest** 111×14, app legal/footer links around 38–56×15, and legal-page footer links around 31–54×15. Labels make the small radio/checkbox visuals operable, but the text links have no larger wrapping target.
- Keyboard traversal reached interactive controls without a trap and showed a consistent 3px rust focus outline. The skip link moved focus to `<main>`. The native dialog closed with Escape. The demo’s canvas supports arrow-key adjustment.
- Reduced-motion mode computed `scroll-behavior: auto`; transitions/animations are reduced. Simulated 200% text sizing at an equivalent 390px layout produced no clipping or horizontal overflow.
- A dark-mode demo export otherwise completed; the serious contrast defect above remained the sole serious/critical axe result.

Fresh live Lighthouse mobile: **Performance 95, Accessibility 100, Best Practices 100, SEO 100**; FCP 1.0s, LCP 1.1s, TBT 260ms, CLS 0, total transfer 101 KiB. INP was not available from a single navigation audit.

## Privacy, network, headers, and offline behavior

- Cold live load made same-origin document/script/style/image requests plus one fetch to the public GitHub releases API. There were no analytics, ads, remote fonts, CDN scripts, or page/console errors.
- The demo cleanup/export flow made only same-origin requests. Demo edits did not change preseeded real project, theme, or license keys.
- No embedded Azure/Sociobot keys or secrets were found. The runtime AI gateway is not used, appropriately for this product.
- Live responses include CSP, HSTS, `X-Content-Type-Options: nosniff`, and `Referrer-Policy: strict-origin-when-cross-origin`. HTML uses `public, must-revalidate, max-age=30`; hashed assets use one-year immutable caching; `sw.js` uses `no-cache`.
- Service-worker install/update completed with an activated worker and no waiting worker. Activation removed a seeded stale cache. After setting the browser offline and reloading `/demo/`, the banner and all three passages returned with no console/page errors.
- `/robots.txt` and `/sitemap.xml` return 200. An unknown path returns the designed 404 body with HTTP 404.
- Link crawl found no dead live links. Product routes returned 200; release assets returned expected GitHub 302 download redirects.

### Rate limiting

A fresh burst of 40 concurrent invalid requests to the license verification API completed in 407ms: **30 returned 200 and 10 returned 429**. Every 429 included `Retry-After: 4`. The observed window capacity was 30 requests; completion/request numbering is nondeterministic under concurrency.

## Deployment and desktop release identity

- All 34 deployable files produced by the clean candidate build matched the live deployment byte-for-byte; only the deployment-only `staticwebapp.config.json` was excluded. This covered landing/demo/legal/404 HTML, installers, service worker, metadata, scripts, styles, and every image asset.
- Tag `v0.1.1` dereferences to candidate `f329bae4e6d7037f4ea78a8ff98fdf411f8ffd39`. GitHub Actions run `33165525653` completed successfully for that SHA.
- The release contains macOS arm64/x64 DMGs, Windows EXE/MSI, Linux AppImage/DEB, `SHA256SUMS`, and `latest.json`.
- Every platform hash agrees across `latest.json`, `SHA256SUMS`, and GitHub asset digests.
- The Linux AppImage downloaded as 79,002,104 bytes and independently matched SHA-256 `2b41ef22dbf1ecb1fc2937259a4f0ec9f398bc28874b2569c0ef42a814f62d66`. It extracted successfully and stayed running for a 10-second Xvfb smoke test; only expected headless DRI3 warnings appeared.

## Defects by severity

### Critical

1. Rights confirmation survives recording and score replacement, allowing export of newly selected material without a fresh confirmation.

### High

1. Source/map replacement preserves stale score passages. A shorter replacement source exported one partly silent and one completely silent WAV while reporting success.
2. `npm run check` fails with TS2339 in `tests/e2e/product.spec.ts:51`; the candidate does not pass all available quality gates.
3. Dark demo has a serious 1.06:1 contrast violation on **Start for real**.
4. Hosted checkout return parameters are neither stored nor removed; the automatic paid-unlock return flow is not connected to the desktop app.
5. The claim inventory omits testable public claims about actual filter behavior and release checksum/installer verification.

### Medium

1. Several mobile/footer/legal text links do not meet the required 44×44 CSS-pixel target size.

## Required next steps

1. On recording or map replacement, clear/recompute source-derived passages, validate every passage against the current source before preview/export, and warn rather than render silence.
2. Reset rights confirmation whenever either source changes; add a regression claim test covering replacement after confirmation.
3. Fix the TypeScript error and require `npm run check` in CI.
4. Correct dark demo button tokens and scan demo + real, light + dark, before and after export.
5. Implement the hosted purchase-return handler (store token, strip query, verify, then provide a clear path into the desktop app), or a registered Tauri deep link.
6. Add claim entries and observable signal/checksum tests for the public cleanup and installer claims.
7. Expand small text-link hit areas to at least 44×44 CSS px and repeat mobile keyboard/touch checks.
