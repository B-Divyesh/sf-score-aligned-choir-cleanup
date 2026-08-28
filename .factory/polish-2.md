# Polish 2 — cumulative finding closure

Repair release commit: pending. Static deployment: pending. Live evidence is produced by `npm run verify:live` in `test-results/polish-2/` after the v0.1.10 release publishes.

| Finding | Change made | Evidence |
|---|---|---|
| F-1-1 | Reset reconstructs every sample field, cleanup setting, theme, rights state, transient error, selection, and demo license without touching real keys. | `@claim:demo-isolation`; live reset in `verify:live` |
| F-1-2 | Removed app-side legacy cache creation; the service worker owns one versioned cache. | `@claim:offline-workflow`; `public-site/sw.js` |
| F-1-3 | Removed the unsupported unlimited-project promise. | `npm run verify:copy` |
| F-1-4 | Removed MXL wording and made MusicXML/PDF score-reference import observable. | `@claim:score-reference-import` |
| F-1-5 | Limited public audio import copy to uncompressed WAV. | `@claim:pcm-wav-import` |
| F-1-6 | Supports pointer, Arrow-key, and exact-time passage marking. | `@claim:passage-marking-inputs` |
| F-1-7 | Provides distinct source and cleaned-excerpt previews. | `@claim:source-revision-audition` |
| F-1-8 | Removed cross-device license portability wording. | `npm run verify:copy` |
| F-1-9 | Removed automatic-refund-revocation wording. | `npm run verify:copy` |
| F-1-10 | Recast release behavior as maintainer instructions and added a reliable artifact-collection release workflow. | `@claim:release-integrity`; `.github/workflows/release.yml` |
| F-1-11 | Removed automatic OS-detection claim; all platform links are listed and tested. | `@claim:platform-downloads` |
| F-1-12 | Removed the unsupported exhaustive local-storage inventory promise. | `npm run verify:copy` |
| F-1-13 | Forces verification and asserts the request carries only the token query. | `@claim:license-request-minimization` |
| F-1-14 | Keeps the unsigned warning and tests the non-signing release configuration. | `@claim:release-signing-status` |
| F-1-15 | States unsupported controls plainly and proves no generative/isolation dependency or control ships. | `@claim:no-generative-restoration` |
| F-1-16 | Added canonical, social, favicon, touch-icon, theme, and route-specific metadata to every route. | public-route metadata test; `verify:live` |
| F-1-17 | Uses the same four-link primary navigation on home, demo, legal, and 404 routes. | public-route navigation test; `verify:live` |
| F-1-18 | Route loads and browser Back focus and announce the route h1. | route-focus test; `verify:live` |
| F-1-19 | Copy audit now inventories page, app, dynamic, alternative, ARIA, and README strings and fails on plain-language rules. | `npm run verify:copy`; copy-audit regression test |
| F-1-20 | Version labels come from the release version and are asserted against `package.json`. | public build-label test |
| F-1-21 | Replaced nested complementary landmarks with labelled content sections. | full axe suite |
| F-1-22 | Replaced the abstract workflow heading with a rehearsal-pack task heading. | `npm run verify:copy` |
| F-1-23 | Replaced comparative marketing language with the tested edit-receipt fact. | `@claim:documented-pack` |
| F-1-24 | Renamed the source action to “Add the recording and score.” | `npm run verify:copy` |
| F-1-25 | Renamed the passage action to “Mark rehearsal passages.” | `npm run verify:copy` |
| F-1-26 | Renamed the export action to “Export the rehearsal pack.” | `npm run verify:copy` |
| F-1-27 | Named the scope section “What Choir Cleanup does not do.” | `npm run verify:copy` |
| F-1-28 | Removed black-box jargon. | `npm run verify:copy` |
| F-1-29 | Replaced the unmeasured “honest” claim with concrete scope copy. | `npm run verify:copy` |
| F-1-30 | Rewrote the download heading for the archive computer task. | `npm run verify:copy` |
| F-1-31 | Replaced subscription metaphor with one-time-price copy. | `@claim:steward-license` |
| F-1-32 | Explains the JSON output as a file listing settings. | `@claim:documented-pack` |
| F-1-33 | Terminal controls say “Copy install command.” | `npm run verify:copy` |
| F-1-34 | Dialog control says “Close license window.” | `npm run verify:copy` |
| F-1-35 | Split overlong README release copy. | `npm run verify:copy` |
| F-1-36 | Removed broad WebView audio-format copy. | `@claim:pcm-wav-import` |
| F-1-37 | Uses “score reference” and separately tests MusicXML/PDF behavior. | `@claim:score-reference-import` |
| F-1-38 | Uses the visible preview names and tests both paths. | `@claim:source-revision-audition` |
| F-1-39 | Names the exported collection and its WAV excerpts plainly. | `@claim:documented-pack` |
| F-1-40 | Removed the unexplained NSIS label from public copy. | `npm run verify:copy` |
| F-1-41 | Explains checksum checking in installer copy and tests it. | `@claim:release-integrity` |
| F-1-42 | Standardized “sample project.” | `npm run verify:copy` |
| F-1-43 | Standardized score reference and score mark terminology. | terminology table in `.factory/copy-audit.md` |
| F-1-44 | Names choir archivists and the rehearsal-pack task in the process heading. | `npm run verify:copy` |
| F-2-1 | Replaced per-route navigation variants with the shared `Demo · Method · License · Privacy` header. | public-route navigation test; `verify:live` |
| F-2-2 | Added explicit jargon, vague-heading, generic-action, marketing, and terminology rules plus a failing fixture. | `npm run verify:copy`; `tests/unit/copy-audit.test.ts` |
| F-2-3 | Successful release lookup replaces the loading message with version, unsigned status, and checksum availability. | `@claim:platform-downloads`; `verify:live` |
| F-2-4 | Added duration, MusicXML-title, every release-format, and merchant-checkout claims with isolated tests. | `@claim:sample-duration`, `@claim:musicxml-title`, `@claim:desktop-release-formats`, `@claim:merchant-checkout` |
| F-2-5 | Rewrote task copy as “uncompressed WAV.” | `@claim:pcm-wav-import`; `npm run verify:copy` |
| F-2-6 | Uses “rehearsal pack” for the collection and “WAV excerpt” for each audio file. | terminology audit; `@claim:documented-pack` |
| F-2-7 | Renamed the README heading to “Included cleanup and export features.” | `npm run verify:copy` |
| F-2-8 | Replaced vague download buttons with “Download the desktop app.” | `npm run verify:copy` |
| F-2-9 | Replaced “complete” with the specific free import, marking, cleanup, and export scope. | `@claim:steward-license`; `npm run verify:copy` |

All 25 declared claim commands passed separately from `/tmp/choir-clean-clone-ZlHcWl` after `npm ci`; the complete run ended with `@claim:tracker-free-site` passing. The complete local suite passed: `npm run verify:copy`, `npm run check`, `npm test` (9 unit, 34 browser), `npm run build`, and `cargo test --manifest-path src-tauri/Cargo.toml`.
