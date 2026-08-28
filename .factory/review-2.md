# Adversarial first-read review 2

**Product:** Score-Aligned Choir Cleanup  
**Live URL:** <https://score-aligned-choir-cleanup.sociobot.in/>  
**Reviewed:** 2026-08-28 UTC  
**Verdict:** **FAIL**

The cold first screen and actual sample workflow are clear and functional. This is not a pass because two earlier structural/copy-audit repairs are only partial, the successful download lookup leaves a permanent loading message, and several public claims remain outside the claim inventory.

## Findings

### Blocking

#### F-2-1 (recurs F-1-17) — Header navigation is still inconsistent by route

- **Quote/location:** live `/` header: **“Demo · Method · License · Download”**. Live `/demo/`, `/privacy/`, `/terms/`, and `/404/` headers: **“Demo · Privacy · Terms”**.
- **Evidence:** A fresh 390 px browser check confirmed these different navigation sets. The landing header omits the required Privacy link; the other routes omit the product's Method/License/Download navigation. The footers are present, but do not make the headers consistent.
- **Why this fails:** A visitor arriving through Privacy, Terms, the demo, or a broken URL cannot use the same route choices as a visitor arriving at home. This is the same incomplete repair documented as fixed in `.factory/polish-1.md` for F-1-17, so it is blocking under the history rule.
- **Concrete fix:** Use one shared header on every route: wordmark → home, **Demo**, **Method**, **License**, and **Privacy** (or a deliberately smaller shared set), with the same labels and current-page state. Keep Download as a clear landing action if it is not included in that shared set. Add a route test asserting the exact nav link set for all five routes.

#### F-2-2 (recurs F-1-19) — The copy audit still reports a false clean result

- **Quote/location:** `.factory/copy-audit.md`, **“Flags: None.”**; `scripts/copy-audit.mjs` only flags sentences over 22 words or a short banned-word regex.
- **Evidence:** The required audit in this review identifies the jargon, vague heading, generic button, marketing adjective, and terminology findings below. `npm run verify:copy` nonetheless passes with **“no banned terms or sentences over 22 words.”**
- **Why this fails:** The earlier finding required the audit to cover README and rendered copy *and* fail on all copy flags. Coverage is now broader, but the audit still certifies copy that fails the stated plain-words checks. This is a half-fix of F-1-19.
- **Concrete fix:** Make the audit maintain an explicit reviewable flag list for jargon, marketing adjectives, context-free headings, generic button labels, and terms that name one concept differently. Fail the command when that list is non-empty; resolve the flags below and add regression fixtures.

### High

#### F-2-3 — Successful release lookup leaves a permanent loading message

- **Quote/location:** landing first screen, **“Checking the latest release…”** beneath the resolved **“Download Linux · AppImage”** button.
- **Evidence:** In a fresh 390 px context, `GET https://api.github.com/repos/B-Divyesh/sf-score-aligned-choir-cleanup/releases/latest` returned HTTP 200 and the primary link changed to the v0.1.4 AppImage. After three more seconds, `#download-note` still read the quoted loading text. `site/main.ts` updates the button in the success branch but never updates or clears `#download-note`.
- **Why this fails:** The first screen states that it is still checking after it has finished. This makes the primary download appear unreliable in the visitor's first 30 seconds.
- **Concrete fix:** On success, replace the note with a completed, useful fact such as **“v0.1.4 · unsigned build · SHA-256 published”**, or hide it. Extend `@claim:platform-downloads` to assert that the loading text is absent after a successful response.

#### F-2-4 — Four public claims have no matching claim entry/test

- **Quotes/locations:**
  - README: **“It loads an 18-second St Anne Community Choir rehearsal with three editable score marks.”**
  - README: **“MusicXML files provide titles and score marks.”**
  - README: **“Windows `.exe` and `.msi` installers; Linux `.AppImage` and `.deb`.”**
  - landing pricing: **“Sociobot/Dodo is merchant of record. Refund questions go to the merchant.”**
- **Evidence:** `score-suggestions` asserts three named suggestions, not the advertised 18-second duration. `score-reference-import` asserts a mark and a PDF control, not a MusicXML title. `platform-downloads` resolves two DMGs, one EXE, and one AppImage, not MSI or DEB. No `claims.json` entry names merchant/refund handling. All 21 declared commands pass, but that does not cover these statements.
- **Why this fails:** These are specific facts a reader can rely on. The claim contract requires a matching entry and an observable sandbox test, including quantitative claims.
- **Concrete fix:** Add entries/tests for sample duration, MusicXML title extraction, all advertised release formats, and the checkout merchant/return path; otherwise remove or narrow the sentences to what existing tests prove.

### Copy findings

#### F-2-5 — Unexplained file-format jargon is used as task copy

- **Quote/location:** landing method, **“Open a PCM WAV recording…”**; README, **“The desktop app combines a PCM WAV recording…”** and **“Imports PCM WAV recordings.”**
- **Why this fails:** “PCM” is an implementation encoding term; the first-time choir archivist needs to know what file to choose, not its internal sample representation.
- **Concrete fix:** Use **“Open an uncompressed WAV recording…”** and **“Imports uncompressed WAV recordings.”** Keep PCM in a technical compatibility note if necessary.

#### F-2-6 — Export terminology changes without teaching the distinction

- **Quote/location:** landing headline, **“Make rehearsal copies…”**; lede, **“clearer practice excerpts”**; workflow, **“rehearsal pack”**; README, **“A download folder…”**.
- **Why this fails:** These all describe the output but alternate between copies, excerpts, pack, and folder. A cold reader cannot tell whether these are different artifacts.
- **Concrete fix:** Define and use **“rehearsal pack”** for the ZIP/download and **“excerpt”** for each WAV everywhere. For example: **“Make rehearsal packs from choir archive recordings.”**

#### F-2-7 — A README heading has no useful standalone meaning

- **Quote/location:** README heading, **“What v1 includes”**.
- **Why this fails:** A screen-reader heading list does not say what “v1” is or what is included.
- **Concrete fix:** **“Features in Choir Cleanup 1.0”** or **“Included cleanup and export features.”**

#### F-2-8 — Two buttons name a vague navigation action rather than the result

- **Quote/location:** landing, **“View downloads”**; purchase-return dialog, **“Get the desktop app.”**
- **Why this fails:** Neither label says that it will take the visitor to a desktop download section; “Get” and “View” do not name the result as plainly as the other actions.
- **Concrete fix:** Change both to **“Download the desktop app.”**

#### F-2-9 — “Complete” is a vague marketing adjective

- **Quote/location:** README, **“Free complete workflow…”**; landing, **“complete WAV pack export…”**
- **Why this fails:** “Complete” does not say what work is free and cannot be verified as an absolute.
- **Concrete fix:** **“Free import, passage marking, cleanup, and WAV-pack export.”**

## Cold first-read result

**390 × 844, before scrolling — PASS.** In my words: it makes clearer rehearsal excerpts from archive choir recordings; it is for community choir archivists; I should click **“Try it with sample data”**. The exact visible text that supplies this is **“Make rehearsal copies from choir archive recordings”**, **“For community choir archivists who need clearer practice excerpts while keeping every source intact.”**, and **“Try it with sample data”** followed by **“Opens a ready sample project in your browser.”** The three plain facts are also visible. The unresolved release-loading text is recorded in F-2-3.

**1440 × 900, before scrolling — PASS.** The same answers and action are visible. The blueprint-paper, cyan construction-rule, rust-pencil visual system and archival workbench image are recognisably product-specific rather than a generic SaaS template.

## Demo and sandbox result

**PASS.** One click enters `/demo/` with an 18-second fictional St Anne Community Choir rehearsal, three named passages, a visible waveform, and source/score metadata already present. The persistent banner reads **“Demo — sample data, nothing is saved.”** and includes **Reset demo** and **Start for real**.

In a new browser context seeded with real project, theme, and license keys, I changed the preset, hum setting, theme, rights confirmation, and pack name, then selected Reset. It restored Archive gentle, hum off, light theme, unchecked rights, the St Anne pack name, and three passages. The seeded real keys were byte-for-byte unchanged. After the demo had loaded, I set the context offline and exported `St-Anne-autumn-concert.zip`; no cross-origin request occurred and no console/page error was recorded.

## Claim execution

I cloned the candidate into `/tmp/choir-review-JWBzyg/repo`, ran `npm ci`, then ran every command named in `.factory/claims.json` separately. All passed.

| Claims | Result |
|---|---|
| `demo-isolation`, `on-device-audio`, `offline-workflow`, `documented-pack`, `source-change-safety`, `score-suggestions`, `score-reference-import`, `pcm-wav-import`, `passage-marking-inputs`, `source-revision-audition`, `cleanup-filters`, `no-account-core`, `steward-license`, `purchase-return`, `platform-downloads`, `license-verification-cache`, `license-request-minimization`, `tracker-free-site` | PASS — one Chromium test each |
| `release-integrity`, `release-signing-status`, `no-generative-restoration` | PASS — one Vitest test each |

Additional current-tree checks: `npm run verify:copy`, `npm test` (7 unit + 28 browser tests), `npm run check`, and `npm run build` all passed. The required unlisted claims are recorded in F-2-4.

## Structure, route, and link checks

- `/`, `/demo/`, `/privacy/`, `/terms/`, and `/404/` each had one `h1`, one `main`, `lang="en"`, description, canonical, OG/Twitter data, favicon, apple touch icon, and a route-appropriate final title. The 404 route is designed and returns HTTP 404 for an unknown path.
- Deep-linked demo, legal, and 404 routes loaded directly. Landing → demo → Back focused the respective route heading and populated the polite announcement. No console errors occurred.
- All crawled product links, release assets, manifest, source repo, and checkout destination resolved (200/206 after expected redirects). `robots.txt` and `sitemap.xml` are present and list the routes.
- Axe found zero serious/critical issues for landing, demo in light/dark mode, Privacy, Terms, and 404 at 390 px. The visible footer targets measured at least 44 px high.
- Header inconsistency remains blocking in F-2-1. No AI feature is present; that is appropriate here because the brief requires cautious local filters rather than speculative generation. The expected import, score reference, passage marking, cleanup, and export are present.

## Earlier-finding verification

I read `.factory/review-1.md`, `.factory/polish-1.md`, `.factory/handoff.md`, and the four earlier verification records. “Verified” below means checked in the current live build and current source, not accepted from the closure map.

| Earlier ID | Current result | Current evidence |
|---|---|---|
| F-1-1 | Fixed | Reset restores preset, hum, theme, rights, name, and passages; real keys unchanged. |
| F-1-2 | Fixed | No legacy cache creation remains in `app/main.ts`; current service worker owns the cache. |
| F-1-3 | Fixed | The unlimited-project promise is absent. |
| F-1-4 | Fixed | MXL is absent; MusicXML/PDF import has `score-reference-import`. |
| F-1-5 | Fixed | Public support is narrowed to PCM WAV with `pcm-wav-import`. |
| F-1-6 | Fixed | `passage-marking-inputs` covers pointer, arrows, and exact fields. |
| F-1-7 | Fixed | `source-revision-audition` covers both preview controls. |
| F-1-8 | Fixed | Cross-device portability wording is absent. |
| F-1-9 | Fixed | Automatic refund-revocation wording is absent. |
| F-1-10 | Fixed | README describes release maintenance rather than asserting automatic workflow outcome. |
| F-1-11 | Fixed | The unsupported auto-detection wording is absent. |
| F-1-12 | Fixed | The exhaustive local-storage statement is absent. |
| F-1-13 | Fixed | `license-request-minimization` asserts the verification query. |
| F-1-14 | Fixed | `release-signing-status` covers the unsigned warning. |
| F-1-15 | Fixed | `no-generative-restoration` covers the stated local-filter boundary. |
| F-1-16 | Fixed | Current routes provide complete metadata. |
| F-1-17 | **Unfixed** | See blocking F-2-1. |
| F-1-18 | Fixed | Direct load and Back moved focus to the route h1. |
| F-1-19 | **Unfixed** | See blocking F-2-2. |
| F-1-20 | Fixed | Current source and live labels use v0.1.4. |
| F-1-21 | Fixed | Current axe scans have no serious/critical landmark issue. |
| F-1-22 | Fixed | The three-step heading now names the rehearsal pack task. |
| F-1-23 | Fixed | The generic-enhancer comparison is absent. |
| F-1-24 | Fixed | The source step says “Add the recording and score.” |
| F-1-25 | Fixed | The passage step says “Mark rehearsal passages.” |
| F-1-26 | Fixed | The export step says “Export the rehearsal pack.” |
| F-1-27 | Fixed | The scope heading says what Choir Cleanup does not do. |
| F-1-28 | Fixed | “Black-box” wording is absent. |
| F-1-29 | Fixed | “Honest rehearsal aid” wording is absent. |
| F-1-30 | Fixed | The download heading names the archive computer action. |
| F-1-31 | Fixed | The pricing eyebrow states the one-time purpose. |
| F-1-32 | Fixed | JSON is explained as a file listing settings. |
| F-1-33 | Fixed | Terminal buttons say “Copy install command.” |
| F-1-34 | Fixed | The dialog close button names the license window. |
| F-1-35 | Fixed | No README sentence exceeds 22 words. |
| F-1-36 | Fixed | The former broad WebView audio-format promise is absent. |
| F-1-37 | Fixed | MusicXML/PDF wording is split and covered by import claims. |
| F-1-38 | Fixed | Preview copy matches named UI choices. |
| F-1-39 | Fixed | Pack contents use plain WAV/file-list wording. |
| F-1-40 | Fixed | README no longer names NSIS. |
| F-1-41 | Fixed | README explains the checksum check. |
| F-1-42 | Fixed | “sample project” is used for the try-out. |
| F-1-43 | Fixed | The previous score-map/section-map/rehearsal-mark collision is removed; remaining output-term drift is F-2-6. |
| F-1-44 | Fixed | The workflow heading names choir archivists and the pack task. |

## Copy-audit inventory

The complete requested sentence/word-count inventory is recorded in the committed [`.factory/copy-audit.md`](copy-audit.md), which this review checked with `npm run verify:copy`. It includes every landing and README text node, label, image alternative, and command/comment; the relevant source rows are `site/index.html` and `README.md`. No entry exceeds 22 words and none uses the skill's banned-word list. The additional required plain-language flags are F-2-5 through F-2-9; the fact that the inventory's automated “Flags: None” line misses them is F-2-2.

## What would make this perfect

Use a genuinely shared header, make the completed release state replace the loading state, turn every listed public fact into a tested claim or remove it, and make the copy audit enforce the full plain-language rubric. Then a fresh round should find no remaining findings.
