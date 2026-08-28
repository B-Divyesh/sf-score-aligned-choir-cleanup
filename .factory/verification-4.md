# Independent verification 4 — PASS

**Candidate:** `f4aa92279294cd6b467dde5897248f872fed5fa5`  
**Live URL:** <https://score-aligned-choir-cleanup.sociobot.in/>  
**Verified:** 2026-08-28 UTC  
**Scope:** clean-checkout independent QA. Product source was not changed.

## Release decision

**PASS.** The former deployment concern is not reproducible. The live static application is byte-identical to a fresh production build of this candidate. The native `v0.1.3` release is built from its direct parent (`d34df7c`); the only change between that commit and the candidate is the prior handoff document, so the shipped product code is identical.

## Required first checks

### Cold first-read test — PASS

A new browser visit shows: **“Make rehearsal copies from choir archive recordings”**; it says this is **“For community choir archivists”**; and its first task action is **“Try it with sample data”**, described as opening a ready sample project in the browser. The link opens `/demo/` in one click. The demo presents the persistent sample-data banner with Reset demo and Start for real.

### Claims — PASS

`.factory/claims.json` exists and all 14 exact commands were run individually after `npm ci`; all passed:

`demo-isolation`, `on-device-audio`, `offline-workflow`, `documented-pack`, `source-change-safety`, `score-suggestions`, `cleanup-filters`, `no-account-core`, `steward-license`, `purchase-return`, `platform-downloads`, `release-integrity`, `license-verification-cache`, and `tracker-free-site`.

The command transcript is retained at `/tmp/score-choir-claim-tests.log` in the verification container.

## Local quality gates — PASS

| Check | Result |
|---|---|
| `npm ci` | PASS; 0 npm vulnerabilities reported |
| `npm run check` | PASS |
| `npm test` | PASS; 4 Vitest tests and 21 Chromium Playwright tests |
| `npm run verify:copy` | PASS; 84 sentences, no banned words or over-22-word sentences |
| `npm run build` | PASS; `dist/app` and `dist/site` produced |
| `cargo check --locked --manifest-path src-tauri/Cargo.toml` | PASS after installing the Linux dependencies declared in the release workflow |
| `npm run tauri -- build --no-bundle` | PASS; release executable produced (15,873,496 bytes) |
| `bash -n public-site/install.sh` | PASS (covered in release-integrity test as well) |

Initial compressed bundles are within the applicable budgets: app JS 8,779 B + 997 B gzip; app CSS 3,898 B gzip; landing JS 1,966 B gzip; landing CSS 2,916 B gzip. No external fonts are loaded.

## Product exercise — PASS

- A clean 390 px workbench rejected a text file with the actionable PCM-WAV recovery message.
- It rejected `1:99` / `0:01.0` as invalid timecodes with the valid range, then accepted `0:00.0`–`0:00.8` after correction.
- Rights confirmation kept export disabled until checked; the valid recovery flow exported `Choir-rehearsal-pack.zip` with no console/page errors or horizontal overflow.
- The shipped demo exposed three editable score suggestions, applied cleanup/export, and downloaded `St-Anne-autumn-concert.zip` locally.
- Claim tests independently inspected labeled WAV excerpts, `pack-manifest.json` (`originalModified: false`), the edit receipt, source replacement/right-confirmation reset, and measurable rumble/presence/dynamics/hum/hiss output changes.

## Accessibility, responsive behaviour, and PWA — PASS

- `npm run verify:url -- <live URL>` passed on `/`, `/demo/`, `/privacy/`, `/terms/`, and `/404/`: title, English language, exactly one main and h1, image alternatives, and no console errors.
- Fresh live axe scans had **zero serious or critical findings** on `/demo/` at 1440×900 and 390×844 in both light and dark themes.
- Both viewports had no horizontal overflow. Keyboard focus uses a visible `rgb(179, 74, 43)` 3 px outline; the existing keyboard test confirms skip-to-main and Escape dialog closure. Demo controls are at least 44 px tall.
- A reduced-motion context reports `scroll-behavior: auto` and a near-zero body transition duration.
- A fresh persistent browser profile registered `/sw.js`; `registration.update()` completed, and offline reload of `/demo/` returned 200 with all three passages and `Offline · local tools ready`, without errors.

## Privacy, policies, rate limiting, and deployment identity — PASS

- A live demo cleanup/export made only same-origin requests. Cold landing load used the site plus the documented GitHub Release API; there were no analytics, advertising, third-party scripts, or remote fonts.
- Live headers include CSP, HSTS, `X-Content-Type-Options: nosniff`, and `Referrer-Policy: strict-origin-when-cross-origin`. HTML is short-cacheable; hashed assets are `max-age=31536000, immutable`; `sw.js` is `no-cache`.
- A 40-request simultaneous invalid-license burst to the Sociobot verification endpoint yielded **30 × 200** then **10 × 429**. Every 429 included `Retry-After: 3`; rate limiting passes.
- SHA-256 matched for live/local `index.html`, demo HTML, privacy/terms HTML, `sw.js`, and the hashed landing JS/CSS. For example, both live and local `index.html` are `b14b33a7768d0c8f67bcc07dbd857fd5f5e1982b51ef22eef1d31c322d4e4182`.
- Release `v0.1.3` is public with macOS ARM/Intel DMGs, Windows EXE/MSI, Linux AppImage/DEB, `SHA256SUMS`, and valid `latest.json`. The downloaded Linux DEB passed `sha256sum -c`, reports package version 0.1.3, and contains the desktop executable and launcher.

## Defects

### Low

1. **Redundant legacy PWA cache.** `app/main.ts` opens and populates `choir-cleanup-site-v1.2.0` even though the active service worker cache is `choir-cleanup-site-v1.2.1`. In a new browser profile both cache names are present after activation. Offline reload and `registration.update()` work, so this is not release-blocking, but the obsolete hard-coded cache name should be removed or kept in sync to avoid duplicated storage and future maintenance confusion.

### No Critical, High, or Medium defects found

## Follow-up

The candidate is acceptable to release. A future maintenance change should remove the legacy cache creation and add an assertion that obsolete cache names are absent after a service-worker update.
