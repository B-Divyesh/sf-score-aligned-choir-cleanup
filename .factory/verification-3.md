# Independent verification 3 — FAIL

**Candidate:** `72b8710fa59a254a4c1ca3d2c96b84d4914140cb`  
**Live URL:** <https://score-aligned-choir-cleanup.sociobot.in/>  
**Verified:** 2026-08-28 UTC

## Release decision

**FAIL.** The product is substantively functional and the live static deployment matches the candidate, but the populated sample demo has a **serious WCAG colour-contrast violation in dark theme**. A serious/critical axe finding is an explicit acceptance blocker.

## Mandatory first checks

### Claims

`.factory/claims.json` exists and declares 14 claims. From a clean checkout after `npm ci`, I executed every declared command separately against the shipped demo entry point, then confirmed them as a group. All passed:

`demo-isolation`, `on-device-audio`, `offline-workflow`, `documented-pack`, `source-change-safety`, `score-suggestions`, `cleanup-filters`, `no-account-core`, `steward-license`, `purchase-return`, `platform-downloads`, `license-verification-cache`, `tracker-free-site`, and `release-integrity`.

The grouped browser confirmation ran 13 Chromium claim tests; the unit confirmation ran the SHA-256 release-integrity claim. No claim test failed.

### Cold first-read

**PASS.** A new 1440×900 browser context at the production URL stated:

- What: “Make rehearsal copies from choir archive recordings.”
- For whom: “For community choir archivists who need clearer practice excerpts while keeping every source intact.”
- First action: **Try it with sample data**, followed immediately by “Opens a ready sample project in your browser.”

The same screen plainly states on-device audio, offline installed use, and free core import/export. One click opened `/demo/` with the St Anne sample, three named score suggestions, and the persistent demo/reset/start-for-real controls.

## Local quality gates

- `npm ci`: PASS — 75 packages installed; 0 audit vulnerabilities.
- `npm test`: PASS — 4 Vitest tests and 20 Chromium Playwright tests.
- `npm run check`: PASS — no TypeScript diagnostics.
- `npm run build`: PASS — created `dist/app` and `dist/site`.
- `npm run verify:copy`: PASS — 84 sentences; no banned terms or sentence over 22 words.
- `bash -n public-site/install.sh`: PASS.
- Production application payload: JS 22.25 kB + 2.44 kB raw (8.77 kB + 0.98 kB gzip); app CSS 13.82 kB raw (3.88 kB gzip); landing JS 4.29 kB raw (1.94 kB gzip); landing CSS 10.34 kB raw (2.91 kB gzip); no font payload.

The native Linux check was retried after installing the standard GLib/WebKit/AppIndicator/RSVG prerequisites in the disposable verifier image; its result is recorded below when the running build completes.

## End-to-end, privacy, and recovery checks

**PASS** in a fresh live demo:

- Invalid timecodes (`1:99` and a reversed range) produced: “Use valid times within 0:00.0 and 0:18.0; end must follow start.” A valid `0:01`–`0:02` passage then added successfully.
- After rights confirmation, the live export downloaded `St-Anne-autumn-concert.zip` containing all three labeled WAVs, `EDIT-RECEIPT.txt`, and `pack-manifest.json`.
- The demo action/export emitted no console or page errors and made no cross-origin requests.
- At 390×844 there was no horizontal overflow; Reset demo, Start for real, and Export measured at least 44 px high.
- Reduced-motion mode changed computed scroll behavior to `auto`.
- The service worker was active with no waiting worker. After the first demo load, an offline reload retained the three sample passages and showed “Offline · local tools ready” without errors.
- The hosted verification endpoint rate-limited a burst of 40 invalid requests at **30 HTTP 200 / 10 HTTP 429**; every 429 had `Retry-After: 4`.

No sign-in is required. The only normal landing cross-origin request is the GitHub release API; no remote fonts, analytics, advertising, executable third-party resources, Azure endpoints, or embedded secrets were observed. CSP, HSTS, `X-Content-Type-Options: nosniff`, and `Referrer-Policy: strict-origin-when-cross-origin` are present. HTML has a 30-second revalidation policy, hashed assets one-year immutable caching, and `sw.js` `no-cache`.

`verify-url.sh` passed live `/`, `/demo/`, `/privacy/`, `/terms/`, and `/404/` (HTTP success, titles, `lang=en`, exactly one `main` and `h1`, image alternatives, and zero console errors).

## Blocking defect

### High — serious dark-demo contrast failure

On the live `/demo/`, open the Theme control and run axe. It reports a serious `color-contrast` violation for:

```html
<span>St Anne Community Choir rehearsal, with three score suggestions.</span>
```

Measured foreground is `#d5e1df` on background `#f3efe3`, a **1.16:1** ratio at 12.8 px, where 4.5:1 is required. The cause is the unconditional `.demo-banner > span { color: #d5e1df }`: in dark theme the banner background becomes the light `--ink` token. This fails the required dark-theme accessibility baseline and the acceptance criterion of no axe serious/critical findings.

The same live scan found no serious/critical violations in light theme, desktop default, or 390px mobile. This defect must be fixed and a regression scan must cover the populated demo in both themes.

## Deployment and release identity

- A fresh candidate build matched **all 34 deployable static files** at the live URL byte-for-byte by SHA-256 (the deployment-only `staticwebapp.config.json` excluded).
- `v0.1.2` points to `99ac4fb5a99694e3f70270fc339689902aee02ea`, the parent of this candidate. Candidate `72b8710…` changes only `.factory/handoff.md`, so all shipping code is unchanged from the tagged release.
- GitHub release `v0.1.2` includes macOS arm64/x64 DMGs, Windows EXE/MSI, Linux AppImage/DEB, `SHA256SUMS`, and `latest.json`. The independently downloaded `Choir.Cleanup_0.1.2_amd64.deb` matched `SHA256SUMS`: `865f9197d98e823f0c5115c06842ab44f1a16a68e1d5877e81bc1280bf1bf5ff`.

## Required next step

Use a dark-aware token for the demo-banner descriptive span (not a fixed pale colour), then rerun axe in populated light and dark demo states at desktop and 390px. Do not release until serious/critical axe findings are zero.
