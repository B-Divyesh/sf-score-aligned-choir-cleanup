# Adversarial first-read review 1

**Product:** Score-Aligned Choir Cleanup

**Live URL:** <https://score-aligned-choir-cleanup.sociobot.in/>

**Candidate:** `dd2d32c8c82e6b29eea19b094d2d6896eda39aea`

**Reviewed:** 2026-08-28 UTC

**Verdict:** **FAIL**

The cold first screen is clear and the sample opens in one click, but the review cannot pass. Reset does not reset the whole demo, a previously reported cache defect is still present, several public claims are absent from the claim inventory, and route/copy requirements are incomplete.

## Findings

### Blocking

#### F-1-1 — Reset demo leaves demo edits active

- **Quote/location:** `/demo/` banner, **“Reset demo”**; `.factory/demo.md`, **“Reset demo discards all edits and recreates the sample.”**
- **Evidence:** On the live 390 px demo, select **Section clarity**, enable the 50 + 60 Hz hum filter, switch to dark theme, edit the pack name, and press Reset demo. The pack name and three passages reset, but the selected preset remains `clarity`, hum remains checked, and dark theme remains active.
- **Why this fails:** Reset cannot establish a known sample state. The passing `@claim:demo-isolation` test resets only the project-name field, so it does not verify the advertised behavior.
- **Concrete fix:** Make Reset restore sample sources, passages, selection, cleanup preset, hum, theme, rights, transient messages, license state, and scroll/focus. Extend `@claim:demo-isolation` to change and assert every mutable state.

#### F-1-2 — Earlier cache finding is unfixed

- **Prior finding:** `.factory/handoff.md` and `.factory/verification-4.md`, **“Redundant legacy PWA cache.”**
- **Code/live evidence:** `app/main.ts:327` still opens `choir-cleanup-site-v1.2.0`, while `public-site/sw.js:1` uses `choir-cleanup-site-v1.2.1`. A fresh live demo contains both cache names after service-worker activation.
- **Why this fails:** The requested history rule makes an unfixed earlier finding blocking. It also leaves duplicate stale storage after a clean visit.
- **Concrete fix:** Remove the app-side legacy cache population or share one version constant with the service worker. Add a clean-profile test that asserts obsolete cache names are absent.

#### F-1-3 — “Unlimited local projects” is unlisted and not implemented

- **Quote/location:** landing pricing, **“Every choir gets unlimited local projects, all cleanup presets, complete WAV pack export, and receipts.”**
- **Evidence:** No `claims.json` entry promises project persistence. In code, `choir-cleanup:project` stores only pack name, preparer, and notes; audio, score, passages, cleanup, and rights disappear on reload. There is no project list, save-project file, or reopen flow.
- **Why this fails:** “Projects” implies work can be saved and reopened. The current app provides sessions, not unlimited local projects.
- **Concrete fix:** Add a local **Save project** / **Open project** format that restores sources or explicit source references, passages, cleanup, and receipt fields; then add a clean restart claim test. Otherwise replace the sentence with the narrower behavior actually provided.

#### F-1-4 — PDF/MXL support is an unlisted claim

- **Quotes/locations:** landing, **“Open the recording and a MusicXML or PDF score map.”** README, **“MusicXML title/rehearsal-mark extraction; PDF and compressed MXL files remain attached as manual references.”**
- **Why this fails:** `score-suggestions` tests MusicXML suggestions only. No claim entry verifies PDF or compressed MXL acceptance, attachment, display, or export receipt behavior.
- **Concrete fix:** Add a `score-reference-import` claim and fixtures for PDF and MXL, or remove those formats from public copy.

#### F-1-5 — Broad audio-format support is an unlisted claim

- **Quote/location:** README, **“Local audio decode and waveform drawing for formats supported by the operating system WebView.”**
- **Why this fails:** Tests exercise generated WAV only. The statement delegates an undefined support promise to the operating system.
- **Concrete fix:** Name the formats actually supported per release and test fixtures for each platform, or say **“Imports PCM WAV; other formats depend on your operating system.”** with an explicit compatibility claim.

#### F-1-6 — Keyboard and exact-time marking are unlisted claims

- **Quote/location:** README, **“Pointer, keyboard, and exact-timecode passage marking.”**
- **Why this fails:** No inventory entry names this behavior. General UI tests do not satisfy the one-entry/one-tag claim contract.
- **Concrete fix:** Add `passage-marking-inputs` and test pointer drag, arrow-key adjustment, and exact boundary entry from a clean sample.

#### F-1-7 — Source/revision audition is an unlisted claim

- **Quotes/locations:** landing, **“Drag over the waveform, name sections in choir language, and compare source with restrained cleanup.”** README, **“Source/revision audition with archive-gentle, section-clarity, hiss-restraint, and optional 50/60 Hz hum filters.”**
- **Why this fails:** `cleanup-filters` measures exports; it does not test either preview path or source/revision switching.
- **Concrete fix:** Add `source-revision-audition` with observable playback-state and processed-buffer assertions, or remove “compare” and “audition.”

#### F-1-8 — Cross-device license use is an unlisted claim

- **Quote/location:** landing pricing, **“Move between devices with a license key.”**
- **Why this fails:** `steward-license` checks visible pricing and the checkout URL only. It does not verify the same entitlement in two clean device profiles.
- **Concrete fix:** Add a recorded verification fixture and a two-context `license-portability` test, or remove this benefit.

#### F-1-9 — Automatic refund revocation is an unlisted claim

- **Quote/location:** landing pricing, **“Refunds revoke the license automatically.”**
- **Why this fails:** No declared test changes a formerly valid verdict to a refunded/revoked verdict and confirms Steward features lock again.
- **Concrete fix:** Add `refund-revocation` with a recorded Sociobot response and expired-cache path, or remove “automatically.”

#### F-1-10 — Release automation is an unlisted claim

- **Quote/location:** README, **“The workflow drafts one GitHub Release, attaches every bundle, creates SHA256SUMS and latest.json, validates that all required platforms are represented, and then publishes it.”**
- **Why this fails:** `release-integrity` tests fixture metadata and installer checksums, not the workflow’s draft/attach/validate/publish sequence.
- **Concrete fix:** Add a `release-workflow` claim and a workflow-contract test, or rewrite this as maintainer instructions rather than an asserted outcome.

#### F-1-11 — Automatic operating-system detection is an unlisted claim

- **Quote/location:** README, **“The landing page detects the visitor’s operating system from GitHub’s public release metadata (mirrored in the release latest.json).”**
- **Why this fails:** `platform-downloads` verifies four resolved links in one browser profile; it does not exercise Windows, Intel Mac, Apple silicon, and Linux detection branches.
- **Concrete fix:** Add `platform-detection` with user-agent/architecture fixtures for every branch, or say only that all platform links are listed.

#### F-1-12 — Local-storage contents are an unlisted privacy claim

- **Quote/location:** README, **“Local storage holds only UI preferences, pack metadata fields, and an optional license token/verdict.”**
- **Why this fails:** Demo isolation checks three preseeded keys, but no claim inventories every key written in real mode.
- **Concrete fix:** Add `real-storage-inventory`; exercise import, editing, export, theme, and license flows, then assert the complete key/value schema.

#### F-1-13 — “Only the token” is an unlisted privacy claim

- **Quote/location:** README, **“License verification sends only the token to api.sociobot.in.”**
- **Why this fails:** The cache claim asserts that no request occurs for a fresh verdict; it does not inspect a real verification request’s URL, body, headers, or referrer.
- **Concrete fix:** Add `license-request-minimization` and intercept a forced verification request to prove no project/audio/score fields are sent.

#### F-1-14 — Unsigned-build status is not inventoried

- **Quotes/locations:** landing, **“Builds are unsigned.”** README, **“Builds are unsigned until the repository owner provides platform signing credentials.”**
- **Why this fails:** This is an important install-warning claim, but no entry verifies signing state for published artifacts.
- **Concrete fix:** Add `release-signing-status` that inspects each release artifact, and keep the warning driven by that result.

#### F-1-15 — The negative restoration/voice claim is not inventoried

- **Quote/location:** landing, **“It does not clone singers, reconstruct lost sound, or promise SATB isolation.”**
- **Why this fails:** This scope statement is central to the product’s honesty, but no claim entry verifies that the shipped paths use only the documented filters and contain no inference/isolation feature.
- **Concrete fix:** Add a `no-generative-restoration` claim with static endpoint/dependency checks plus a demo network assertion, or phrase the section strictly as unsupported features: **“There are no controls for voice cloning, missing-sound reconstruction, or SATB isolation.”**

### High

#### F-1-16 — Metadata is incomplete on four routes

- **Locations:** `/demo/` has no canonical, Open Graph, Twitter, favicon, or apple-touch metadata. `/privacy/`, `/terms/`, and `/404/` have no Open Graph, Twitter, apple-touch, or theme-color metadata.
- **Why this fails:** These are real routes and do not meet the required per-route metadata pattern.
- **Concrete fix:** Add route-specific canonical/title/description plus the existing product social card, Twitter card, favicon, apple-touch icon, and palette theme color to every route.

#### F-1-17 — Header/footer skeleton changes by route

- **Exact locations:** home header is **“Choir Cleanup · Demo · Method · License · Download”**; legal/404 headers contain only **“← Choir Cleanup”**; demo has no route navigation. The demo footer lacks “Built by Param Factory” and a build ID; the 404 footer lacks the product one-liner, Privacy, and Terms.
- **Why this fails:** Visitors lose the standard site navigation and provenance when they enter by a deep link.
- **Concrete fix:** Reuse one header/footer skeleton on `/`, `/demo/`, `/privacy/`, `/terms/`, and `/404/`, adapting only the current-page state.

#### F-1-18 — Route changes do not move focus to the new h1

- **Evidence:** After activating **Try it with sample data**, `document.activeElement` is `BODY`; the same is true after browser Back. No route announcement region exists.
- **Why this fails:** Keyboard and screen-reader users are not told that the page changed.
- **Concrete fix:** On load/navigation, focus the route h1 with `tabindex="-1"` and announce its title in a polite live region; add forward/back tests.

#### F-1-19 — The copy audit is incomplete and returns a false PASS

- **Quote/location:** `.factory/copy-audit.md`, **“Flags: None.”**
- **Evidence:** The generator audits only selected tags in `site/index.html`; it omits README prose, walkthrough captions, image alt text, action-adjacent copy, and several small/conditional strings. It also splits `v0.1.2`, `.dmg`, `.exe`, and the closing quote in “restoration.” into fake sentences. The independent audit below finds a 24-word README sentence and multiple jargon/heading/button flags.
- **Concrete fix:** Audit rendered text plus alt/ARIA/conditional copy and README, use sentence segmentation that understands versions/extensions, and fail on every flag listed below.

#### F-1-20 — Public version labels are stale and inconsistent

- **Exact locations:** landing eyebrow/footer/legal/404 say `v0.1.2`; the live download note and demo header say `v0.1.3`; `package.json` is `0.1.3`.
- **Why this fails:** A visitor cannot tell which release the page documents.
- **Concrete fix:** Generate every visible build ID from one release value and assert it matches `package.json` and the fetched release.

### Medium and minor copy/accessibility findings

| ID | Exact quote/location | Why it fails | Proposed rewrite/fix |
|---|---|---|---|
| F-1-21 | landing and demo, pricing/receipt `<aside>` | Axe reports `landmark-complementary-is-top-level` (moderate) for both nested asides at 390×844 and 1440×900. | Use a labelled `section`/`div`, or move a true complementary landmark outside `main`. Test all axe impacts, not serious/critical only. |
| F-1-22 | **“Useful restraint, measured in three passes”** | Abstract marketing heading; it does not name the task out of context. | **“Make a rehearsal pack in three steps”** |
| F-1-23 | **“Generic enhancers hide their choices.”** | Undefined comparison and untested marketing claim. | **“Each exported pack lists the filters you chose.”** |
| F-1-24 | **“Place the sources”** | Drafting metaphor hides the action. | **“Add the recording and score”** |
| F-1-25 | **“Rule the passages”** | “Rule” is jargon and the heading is unclear alone. | **“Mark rehearsal passages”** |
| F-1-26 | **“Seal the pack”** | Metaphor does not name the result. | **“Export the rehearsal pack”** |
| F-1-27 | **“A clear boundary”** | Context-free heading does not say what the section covers. | **“What Choir Cleanup does not do”** |
| F-1-28 | **“No black-box ‘restoration.’”** | “Black-box” is jargon. | **“No hidden or generative restoration.”** |
| F-1-29 | **“It makes an honest rehearsal aid from what is actually on the tape.”** | “Honest” is an unmeasured marketing adjective. | **“It makes rehearsal excerpts from the sound in the recording.”** |
| F-1-30 | **“Bring the workbench to the archive.”** | Metaphor obscures the download action. | **“Download Choir Cleanup for your archive computer.”** |
| F-1-31 | **“Durable, not subscription-shaped”** | Marketing metaphor instead of price information. | **“Pay once for optional archive notes”** |
| F-1-32 | **“machine-readable manifest”** | Technical jargon for the primary audience. | **“a JSON file listing the excerpts and settings”** |
| F-1-33 | two terminal buttons, **“Copy”** | The button does not name its result. | **“Copy install command”** |
| F-1-34 | purchase dialog, **“Close”** | The button does not name what closes. | **“Close license window”** |
| F-1-35 | README release paragraph, 24 words | Exceeds the 22-word hard cap. | **“The workflow creates one GitHub Release with every platform bundle, SHA256SUMS, and latest.json. It checks every required platform before publishing.”** |
| F-1-36 | README, **“operating system WebView”** | Unexplained implementation jargon. | **“Imports PCM WAV. Other audio formats depend on the decoder included with your operating system.”** |
| F-1-37 | README, **“MusicXML title/rehearsal-mark extraction; PDF and compressed MXL files remain attached as manual references.”** | Dense jargon and two ideas in one sentence. | **“MusicXML files provide titles and score marks. PDF and MXL files stay attached for reference.”** |
| F-1-38 | README, **“Source/revision audition with archive-gentle, section-clarity, hiss-restraint…”** | “Audition” is specialist jargon, and hyphenated preset names conflict with the UI names. | **“Preview the source or cleaned copy with Archive gentle, Section clarity, Hiss restraint, and optional hum filters.”** |
| F-1-39 | README, **“A ZIP containing 16-bit PCM WAV excerpts…”** | PCM and ZIP are unexplained for non-technical archivists. | **“A download folder containing uncompressed WAV excerpts, an edit receipt, and a file list.”** |
| F-1-40 | README, **“Windows `.exe` (NSIS) and `.msi`”** | NSIS is unexplained and does not help installation. | **“Windows `.exe` and `.msi` installers.”** |
| F-1-41 | README, **“independently verify SHA256”** | SHA256 is unexplained. | **“check the downloaded file against its published SHA-256 fingerprint before installing it.”** |
| F-1-42 | README, **“Try the isolated sample”** | The established term is “sample project.” | **“Try the isolated sample project.”** |
| F-1-43 | landing uses **“score map”**, README uses **“section map,” “MusicXML marks,”** and **“rehearsal-mark”** | The same structural input is named several ways. | Use **“score mark”** for cues and **“score reference”** for the imported file everywhere. |
| F-1-44 | **“A conservator’s workflow”** | The heading switches from the named audience, “community choir archivists,” to a different role and is vague out of context. | **“How choir archivists make a rehearsal pack”** |

## Cold first-read test

### 390×844, before scrolling

- **What it does:** makes rehearsal copies from choir archive recordings.
- **For whom:** community choir archivists who need clearer practice excerpts while preserving the source.
- **First click:** **Try it with sample data**; adjacent copy says it opens a ready sample project in the browser.
- **Result:** PASS. The exact first-screen copy answers all three questions. The three facts—on-device audio, offline after installation, and free core tools—are visible before scrolling.

### 1440×900, before scrolling

The same answers and primary action are visible beside the archival workbench image. Result: PASS. The identity is product-specific: warm drafting paper, cyan rules, rust marks, score/tape art, and editorial/monospace typography; it is not a generic SaaS hero.

## Demo and sandbox evidence

- One click opens `/demo/` with the St Anne autumn concert, an 18-second source, MusicXML reference, and three named passages already loaded.
- The persistent banner says **“Demo — sample data, nothing is saved.”** and provides Reset demo and Start for real.
- Preseeded `choir-cleanup:project`, `choir-cleanup:theme`, and `sb_license:score-aligned-choir-cleanup` values remained byte-for-byte unchanged through editing, Reset, and export.
- Cleanup/export produced `St-Anne-autumn-concert.zip` offline. The live flow made no cross-origin requests and logged no console/page errors.
- Reset is incomplete as recorded in F-1-1. The two cache namespaces are recorded in F-1-2.

## Claims execution

Every exact command was run separately after `npm ci` in a temporary clean clone at the candidate commit.

| Claim | Result | Observable scope |
|---|---|---|
| `demo-isolation` | PASS | Preseeded real keys survived project-name edit and Reset. Test misses cleanup/theme reset. |
| `on-device-audio` | PASS | Demo cleanup/export produced no cross-origin request. |
| `offline-workflow` | PASS | Sample pack exported after the context went offline. |
| `documented-pack` | PASS | ZIP names, receipt, manifest, and `originalModified: false` asserted. |
| `source-change-safety` | PASS | Audio/score replacement respaced passages and cleared rights. |
| `score-suggestions` | PASS | Three sample marks and editable time fields asserted. |
| `cleanup-filters` | PASS | Exported signal measurements changed for all named filters. |
| `no-account-core` | PASS | Anonymous sample reached enabled export. |
| `steward-license` | PASS | Price, two paid fields, free export, and checkout URL asserted. |
| `purchase-return` | PASS | Fixture return stored/stripped/verified token and exposed handoff controls. |
| `platform-downloads` | PASS | Four fixture asset links resolved. |
| `release-integrity` | PASS | Fixture checksums and Unix/PowerShell guards asserted. |
| `license-verification-cache` | PASS | Fresh cached verdict caused no verification request. |
| `tracker-free-site` | PASS | No third-party executable/font/media resource loaded. |

Result: **14/14 listed commands pass**, but claims coverage fails because F-1-3 through F-1-15 are not listed.

## Structure, links, and accessibility

- Titles pass the required pattern and 60-character limit on `/`, `/demo/`, `/privacy/`, `/terms/`, and the designed 404.
- Each tested route has `lang="en"`, one `<main>`, one `<h1>`, a meta description, no missing image alt, no horizontal overflow at 390 px, and no console errors on successful routes.
- `/not-a-real-route` returns the designed page with HTTP 404 and links home and to the sample.
- `robots.txt`, `sitemap.xml`, favicon, apple-touch icon, and 1200×630 social card return 200.
- All discovered internal links return their expected status. GitHub/release links return 200 or 302 to release assets. Checkout links were not activated because that would create external transaction state; their exact Sociobot URL is covered by the passing fixture test.
- Browser Back returns from demo to `/`. Focus remains on `BODY` rather than the route h1 (F-1-18).
- Playwright axe scans at 390×844 and 1440×900 find no serious/critical violations in light or dark, but they do find the moderate landmark defects in F-1-21.
- `npm run verify:url -- <route>` passes for `/`, `/demo/`, `/privacy/`, `/terms/`, and `/404/`.

## History verification

No earlier `.factory/review-*.md` or `.factory/polish-*.md` exists. The existing `.factory/handoff.md` was read completely. Its prior dark-demo contrast repair remains fixed: live light/dark axe scans show no contrast violation. Its one recorded low defect, the redundant legacy cache, is still present and is reopened as blocking F-1-2.

## Missed leverage

F-1-3 is the obvious missing feature: a desktop archive workbench that advertises “unlimited local projects” needs a local save/reopen path. A concrete implementation is a portable project file containing source references or explicitly embedded sources, passage timings, cleanup choices, pack metadata, and receipt state, with **Save project** and **Open project** actions. This should stay local and receive an import/export round-trip claim test.

No AI feature is warranted. Deterministic, inspectable filters fit this preservation job; model-assisted cleanup would weaken the product’s stated caution and offline/privacy model.

## Copy audit

Counts treat hyphenated compounds, versions, extensions, and URLs as one word. The landing inventory is the fully rendered default live page after release resolution; conditional/source-only strings follow it. IDs in the Flag column map to findings above.

### Landing page

| # | Words | Sentence or UI string | Flag |
|---:|---:|---|---|
| 1 | 3 | Skip to content | — |
| 2 | 0 | ⌁ | — |
| 3 | 2 | Choir Cleanup | — |
| 4 | 1 | Demo | — |
| 5 | 1 | Method | — |
| 6 | 1 | License | — |
| 7 | 1 | Download | — |
| 8 | 4 | Local preservation workbench / v0.1.2 | F-1-20 |
| 9 | 7 | Make rehearsal copies from choir archive recordings | — |
| 10 | 14 | For community choir archivists who need clearer practice excerpts while keeping every source intact. | — |
| 11 | 5 | Try it with sample data | — |
| 12 | 8 | Opens a ready sample project in your browser. | — |
| 13 | 5 | Audio stays on this device. | — |
| 14 | 4 | Works offline after installation. | — |
| 15 | 7 | Core import and export tools are free. | — |
| 16 | 3 | Download Linux · AppImage | — |
| 17 | 6 | Version 0.1.3 · unsigned build · SHA256 published | F-1-14, F-1-41 |
| 18 | 1 | A | — |
| 19 | 2 | Source preserved | — |
| 20 | 1 | B | — |
| 21 | 2 | Sections aligned | — |
| 22 | 1 | C | — |
| 23 | 2 | Copies documented | — |
| 24 | 2 | PCM WAV | F-1-39 |
| 25 | 2 | labeled excerpts | — |
| 26 | 2 | Score marks | — |
| 27 | 3 | editable timing suggestions | — |
| 28 | 2 | Edit receipt | — |
| 29 | 3 | inside every pack | — |
| 30 | 2 | Source intact | — |
| 31 | 2 | never overwritten | — |
| 32 | 4 | Inside the sample project | — |
| 33 | 8 | Follow one archive recording into a rehearsal pack | — |
| 34 | 7 | 01 Load the recording and score marks. | — |
| 35 | 7 | 02 Correct each passage against the waveform. | — |
| 36 | 8 | 03 Confirm rights and export the documented pack. | — |
| 37 | 3 | A conservator’s workflow | F-1-44 |
| 38 | 6 | Useful restraint, measured in three passes | F-1-22 |
| 39 | 5 | Generic enhancers hide their choices. | F-1-23 |
| 40 | 17 | Choir Cleanup ties each adjustment to a passage, preserves the source, and writes down exactly what changed. | — |
| 41 | 1 | 01 | — |
| 42 | 3 | Place the sources | F-1-24 |
| 43 | 10 | Open the recording and a MusicXML or PDF score map. | F-1-4, F-1-43 |
| 44 | 7 | MusicXML rehearsal marks become editable timing suggestions. | — |
| 45 | 0 | ≈ + ♩ | — |
| 46 | 1 | 02 | — |
| 47 | 3 | Rule the passages | F-1-25 |
| 48 | 15 | Drag over the waveform, name sections in choir language, and compare source with restrained cleanup. | F-1-7 |
| 49 | 0 | \|—\| | — |
| 50 | 1 | 03 | — |
| 51 | 3 | Seal the pack | F-1-26 |
| 52 | 14 | Confirm rights, then export labeled WAVs, a machine-readable manifest, and a plain-language edit receipt. | F-1-32 |
| 53 | 0 | ✓ | — |
| 54 | 3 | A clear boundary | F-1-27 |
| 55 | 3 | No invented voices. | F-1-15 |
| 56 | 3 | No black-box “restoration.” | F-1-15, F-1-28 |
| 57 | 7 | This app uses ordinary, inspectable audio filters. | — |
| 58 | 8 | They cover rumble, presence, dynamics, hum, and hiss. | — |
| 59 | 12 | It does not clone singers, reconstruct lost sound, or promise SATB isolation. | F-1-15 |
| 60 | 13 | It makes an honest rehearsal aid from what is actually on the tape. | F-1-29 |
| 61 | 5 | Desktop app / private by default | — |
| 62 | 6 | Bring the workbench to the archive. | F-1-30 |
| 63 | 7 | Use it on macOS, Windows, or Linux. | — |
| 64 | 9 | No account is required for import, cleanup, or export. | — |
| 65 | 3 | Download Linux · AppImage | — |
| 66 | 2 | All platforms | — |
| 67 | 1 | macOS | — |
| 68 | 3 | Apple silicon · .dmg | — |
| 69 | 1 | macOS | — |
| 70 | 2 | Intel · .dmg | — |
| 71 | 1 | Windows | — |
| 72 | 2 | x64 · .exe | — |
| 73 | 1 | Linux | — |
| 74 | 2 | x64 · AppImage | — |
| 75 | 3 | Builds are unsigned. | F-1-14 |
| 76 | 8 | On macOS, right-click the app and choose Open. | — |
| 77 | 6 | On Windows, confirm the publisher warning. | — |
| 78 | 8 | Release manifest and checksums ship with each release. | — |
| 79 | 2 | One-line install | — |
| 80 | 5 | Or install from a terminal | — |
| 81 | 2 | macOS / Linux | — |
| 82 | 1 | Copy | F-1-33 |
| 83 | 6 | curl -fsSL https://score-aligned-choir-cleanup.sociobot.in/install.sh \| sh | — |
| 84 | 2 | Windows PowerShell | — |
| 85 | 1 | Copy | F-1-33 |
| 86 | 5 | irm https://score-aligned-choir-cleanup.sociobot.in/install.ps1 \| iex | — |
| 87 | 3 | Durable, not subscription-shaped | F-1-31 |
| 88 | 3 | Core workbench: free. | — |
| 89 | 4 | Steward tools: $39 once. | — |
| 90 | 15 | Every choir gets unlimited local projects, all cleanup presets, complete WAV pack export, and receipts. | F-1-3 |
| 91 | 12 | The one-time Steward license adds reusable archive notes and named receipt sign-off. | — |
| 92 | 2 | Steward license | — |
| 93 | 3 | $39 one time | — |
| 94 | 3 | Reusable archive notes | — |
| 95 | 3 | Named receipt sign-off | — |
| 96 | 7 | Move between devices with a license key | F-1-8 |
| 97 | 3 | Buy Steward license | — |
| 98 | 6 | Sociobot/Dodo is merchant of record. | — |
| 99 | 5 | Refunds revoke the license automatically. | F-1-9 |
| 100 | 0 | ⌁ | — |
| 101 | 2 | Choir Cleanup | — |
| 102 | 8 | Make documented rehearsal copies from choir archive recordings. | — |
| 103 | 1 | Demo | — |
| 104 | 1 | Privacy | — |
| 105 | 1 | Terms | — |
| 106 | 1 | Source | — |
| 107 | 16 | Built by Param Factory · v0.1.2 · Hero image generated for this project with the factory image model. | F-1-20 |
| 108 | 4 | Download for your computer | — |
| 109 | 4 | Checking the latest release… | — |
| 110 | 2 | View downloads | — |
| 111 | 2 | Purchase return | — |
| 112 | 6 | Add Steward to the desktop app | — |
| 113 | 3 | Checking your license… | — |
| 114 | 7 | Your license is saved in this browser. | — |
| 115 | 11 | Copy it, then open the desktop app and choose Steward license. | — |
| 116 | 2 | Copy license | — |
| 117 | 4 | Get the desktop app | — |
| 118 | 1 | Close | F-1-34 |
| 119 | 20 | An archival workbench with an open choral score, reel-to-reel tape deck, gloves, pencil, and a waveform drawn on tracing paper | — |
| 120 | 13 | The sample source panel with the St Anne recording and score map loaded | F-1-43 |
| 121 | 8 | The sample waveform with three labeled rehearsal passages | — |
| 122 | 9 | The sample export panel beside its edit receipt preview | — |

No landing sentence exceeds 22 words. Findings are for jargon, marketing language, terminology, headings, buttons, and claims.

### README

| # | Words | Sentence or heading | Flag |
|---:|---:|---|---|
| 1 | 2 | Choir Cleanup | — |
| 2 | 10 | Choir Cleanup makes documented rehearsal copies from choir archive recordings. | — |
| 3 | 12 | It is for community choir archivists working from audio and a score. | — |
| 4 | 5 | Try the isolated sample: https://score-aligned-choir-cleanup.sociobot.in/demo/. | F-1-42 |
| 5 | 14 | It loads an 18-second St Anne Community Choir rehearsal with three editable score marks. | — |
| 6 | 7 | Sample changes never enter real project storage. | — |
| 7 | 13 | The desktop app combines a recording with MusicXML marks or a PDF reference. | F-1-4, F-1-43 |
| 8 | 16 | It applies conservative filters and exports labeled PCM WAV excerpts, a manifest, and an edit receipt. | F-1-39 |
| 9 | 6 | The app never overwrites the source. | — |
| 10 | 6 | Audio processing stays on the device. | — |
| 11 | 14 | It is not a voice separator, forensic restoration tool, or replacement for an engineer. | F-1-15 |
| 12 | 3 | Live site: https://score-aligned-choir-cleanup.sociobot.in | — |
| 13 | 3 | What v1 includes | — |
| 14 | 14 | Local audio decode and waveform drawing for formats supported by the operating system WebView. | F-1-5, F-1-36 |
| 15 | 13 | MusicXML title/rehearsal-mark extraction; PDF and compressed MXL files remain attached as manual references. | F-1-4, F-1-37, F-1-43 |
| 16 | 6 | Pointer, keyboard, and exact-timecode passage marking. | F-1-6 |
| 17 | 12 | Source/revision audition with archive-gentle, section-clarity, hiss-restraint, and optional 50/60 Hz hum filters. | F-1-7, F-1-38 |
| 18 | 4 | Rights confirmation before export. | — |
| 19 | 10 | A ZIP containing 16-bit PCM WAV excerpts, EDIT-RECEIPT.txt, and pack-manifest.json. | F-1-39 |
| 20 | 16 | Free complete workflow; optional $39 one-time Steward license for reusable archive notes and named receipt sign-off. | — |
| 21 | 9 | Local license caching with at-most-daily verification through Sociobot billing. | — |
| 22 | 9 | A one-click sample project with separate, memory-only demo state. | — |
| 23 | 3 | Develop and test | — |
| 24 | 14 | Requires Node.js 22+, npm, stable Rust, and the Tauri 2 prerequisites for your OS. | — |
| 25 | 6 | The factory deployment command is exactly: | — |
| 26 | 9 | It produces dist/site/index.html plus /demo/, /privacy/, /terms/, and /404/. | — |
| 27 | 2 | Desktop releases | — |
| 28 | 13 | Push a v* tag or run Release desktop apps manually in GitHub Actions. | — |
| 29 | 3 | The matrix builds: | — |
| 30 | 7 | macOS .dmg for Apple silicon and Intel; | — |
| 31 | 5 | Windows .exe (NSIS) and .msi; | F-1-40 |
| 32 | 3 | Linux .AppImage and .deb. | — |
| 33 | 24 | The workflow drafts one GitHub Release, attaches every bundle, creates SHA256SUMS and latest.json, validates that all required platforms are represented, and then publishes it. | F-1-10, F-1-35 |
| 34 | 11 | Builds are unsigned until the repository owner provides platform signing credentials. | F-1-14 |
| 35 | 18 | The landing page detects the visitor’s operating system from GitHub’s public release metadata (mirrored in the release latest.json). | F-1-11 |
| 36 | 11 | Terminal installers read latest.json directly and independently verify SHA256 before installation: | F-1-41 |
| 37 | 3 | Privacy and data | — |
| 38 | 11 | Audio processing uses browser/WebView audio APIs entirely on the current device. | F-1-36 |
| 39 | 14 | Local storage holds only UI preferences, pack metadata fields, and an optional license token/verdict. | F-1-12 |
| 40 | 8 | License verification sends only the token to api.sociobot.in. | F-1-13 |
| 41 | 10 | There are no analytics, remote fonts, advertising, or runtime CDNs. | — |
| 42 | 2 | See site/privacy/index.html. | — |
| 43 | 10 | Demo mode does not read or write those real-data keys. | — |
| 44 | 7 | Reset rebuilds the bundled sample in memory. | F-1-1 |
| 45 | 9 | See .factory/demo.md and the tested claim inventory in .factory/claims.json. | — |
| 46 | 2 | Project structure | — |
| 47 | 4 | app/ — desktop workbench frontend | — |
| 48 | 8 | src/core.ts — timecode, MusicXML, receipt, WAV, and ZIP primitives | — |
| 49 | 7 | src-tauri/ — Tauri shell and native save dialog | — |
| 50 | 6 | site/ — static download/marketing and legal pages | — |
| 51 | 9 | public-site/ — installers, generated image derivatives, service worker, hosting headers | — |
| 52 | 6 | .factory/design.md — visual thesis and asset provenance | — |
| 53 | 4 | .github/workflows/release.yml — cross-platform release matrix | — |
| 54 | 1 | License | — |
| 55 | 1 | MIT. | — |
| 56 | 2 | See LICENSE. | — |

Fenced shell/PowerShell commands are executable examples, not sentences, and are not word-counted.

## Quality-gate evidence

From the same clean clone:

- `npm run check`: PASS.
- `npm test`: PASS — 4 unit tests and 21 Playwright tests.
- `npm run build`: PASS — created `dist/app` and `dist/site`; landing JS 1.94 kB gzip, app JS 8.77 + 0.98 kB gzip.
- `npm run verify:copy`: returns PASS, but its coverage defect is F-1-19.
- Live `verify:url` checks: PASS on all five declared routes.

## What would make this perfect

Resolve every finding above; make Reset restore a fully deterministic sample; remove the obsolete cache; implement and test local save/reopen; inventory every public claim; simplify every flagged sentence/control; give every route complete metadata, common navigation, focus handling, and valid landmarks; generate one consistent version label; then rerun the full cold mobile/desktop review, all claims, offline interception, link crawl, axe at every impact, build, and copy audit with zero findings.
