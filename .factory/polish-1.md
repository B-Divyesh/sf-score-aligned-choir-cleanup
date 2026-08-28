# Polish 1 — finding closure map

Repair commit: `052cfc6d7010761dadda904b17ac80cb044d531f`. Visual evidence: `test-results/polish-1/landing-1440.png`, `test-results/polish-1/demo-390.png`. Route smoke evidence: `npm run verify:url -- http://127.0.0.1:4173/<route>`.

| Finding | Change made | Evidence |
|---|---|---|
| F-1-1 | Reset now recreates all sample state, including theme and cleanup. | `@claim:demo-isolation` |
| F-1-2 | Removed duplicate app-side cache population. | `@claim:offline-workflow` |
| F-1-3 | Removed unimplemented unlimited-project promise. | Copy audit |
| F-1-4 | Removed MXL promise; tested PDF/MusicXML imports. | `@claim:score-reference-import` |
| F-1-5 | Restricted support to PCM WAV and tested it. | `@claim:pcm-wav-import` |
| F-1-6 | Tested pointer, key, and exact-time marking. | `@claim:passage-marking-inputs` |
| F-1-7 | Tested source and cleaned previews. | `@claim:source-revision-audition` |
| F-1-8 | Removed untested portability promise. | Copy audit |
| F-1-9 | Removed automatic-revocation promise. | Copy audit |
| F-1-10 | Recast release automation as maintainer instructions. | Copy audit |
| F-1-11 | Removed untested auto-detection promise. | `@claim:platform-downloads` |
| F-1-12 | Removed unsupported exhaustive-storage promise. | Copy audit |
| F-1-13 | Tested forced verification request parameters. | `@claim:license-request-minimization` |
| F-1-14 | Tested unsigned warning against workflow configuration. | `@claim:release-signing-status` |
| F-1-15 | Replaced scope copy and statically proved local-filter-only paths. | `@claim:no-generative-restoration` |
| F-1-16 | Added complete route metadata. | Route smoke checks |
| F-1-17 | Added consistent nav/footer skeleton. | Route smoke checks |
| F-1-18 | Focuses/announces route h1 including Back. | route-focus test |
| F-1-19 | Copy audit now covers routes, app, alternatives, README. | `npm run verify:copy` |
| F-1-20 | Unified all static labels on v0.1.4. | version unit test |
| F-1-21 | Replaced nested complementary landmarks with sections. | Axe suite |
| F-1-22 | Rewrote three-step heading. | Copy audit |
| F-1-23 | Replaced comparative marketing copy. | `@claim:documented-pack` |
| F-1-24 | Rewrote source step. | Copy audit |
| F-1-25 | Rewrote passage step. | Copy audit |
| F-1-26 | Rewrote export step. | Copy audit |
| F-1-27 | Rewrote scope heading. | Copy audit |
| F-1-28 | Removed black-box jargon. | Copy audit |
| F-1-29 | Replaced “honest” marketing copy. | Copy audit |
| F-1-30 | Rewrote download heading. | Copy audit |
| F-1-31 | Rewrote pricing eyebrow. | Copy audit |
| F-1-32 | Explained JSON file plainly. | `@claim:documented-pack` |
| F-1-33 | Renamed terminal buttons. | Copy audit |
| F-1-34 | Renamed dialog close button. | Copy audit |
| F-1-35 | Rephrased README release copy. | Copy audit |
| F-1-36 | Removed WebView format jargon. | `@claim:pcm-wav-import` |
| F-1-37 | Split score reference wording. | `@claim:score-reference-import` |
| F-1-38 | Rewrote preview wording with UI names. | `@claim:source-revision-audition` |
| F-1-39 | Rewrote archive content wording. | `@claim:documented-pack` |
| F-1-40 | Removed unexplained NSIS label. | Copy audit |
| F-1-41 | Explained checksum purpose. | `@claim:release-integrity` |
| F-1-42 | Standardized “sample project.” | Copy audit |
| F-1-43 | Standardized score-reference terminology. | Copy terminology table |
| F-1-44 | Rewrote choir-archivist process heading. | Copy audit |

All earlier defects—source replacement/right reset, purchase return, hidden PDF control, dark contrast, touch targets, service-worker cleanup, offline, and installer checksums—remain covered by the full suite. Cold live recheck passed for every route and the full reset/query-demo flow. Release workflow `33189080475` published v0.1.4 and its AppImage checksum was independently verified. No finding is deferred.
