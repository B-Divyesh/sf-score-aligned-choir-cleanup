# Adversarial first-read review 3

**Product:** Score-Aligned Choir Cleanup  
**Live URL:** <https://score-aligned-choir-cleanup.sociobot.in/>  
**Reviewed:** 2026-08-28 UTC  
**Verdict:** **PASS**

No blocking, high, medium, or minor finding remains. The cold phone visit is clear, the sample is isolated and useful immediately, every declared claim passed from a clean clone, and earlier findings are fixed in the live build and source.

## Cold first-read

At 390 × 844 and 1440 × 900, before scrolling, the site says what it does, for whom, and what to do: it makes labeled rehearsal packs from choir archive recordings; it is for community choir archivists; click **“Try it with sample data”**. Its adjacent copy says **“Opens a ready sample project in your browser.”**

The first screen has the required plain-language headline, 14-word audience sentence, named primary action, and three short facts. Its warm archival paper, cyan construction lines, restrained rust marks, score/tape still life, serif editorial headings, and mono drafting labels are product-specific rather than a generic SaaS template.

## Copy audit

The complete requested sentence-and-word-count inventory for every landing-page and README string is in [`.factory/copy-audit.md`](copy-audit.md). It includes headings, controls, alternative text, and README prose. `npm run verify:copy` regenerated it and passed: 388 strings with no sentence over 22 words and no jargon, marketing, vague-heading, generic-action, or terminology flags.

The audited terms are consistent: **sample project**, **score reference**, **score mark**, **passage**, **rehearsal pack**, **WAV excerpt**, **cleanup**, and **Steward license**. All buttons name their result; no rewrite is required.

## Demo, privacy, and claims

The first action enters `/demo/?demo=1` in one click. Its first screen is already a realistic St Anne Community Choir project: an 18-second rehearsal, recording and score details, waveform, and three editable score marks. The persistent banner reads **“Demo — sample data, nothing is saved.”** and includes **Reset demo** and **Start for real**.

In a fresh browser context seeded with real project, theme, and license storage, I edited cleanup, hum, theme, rights, name, passage, invalid time, and sample license field, then reset. Reset restored the sample and focus while real values remained byte-for-byte unchanged. After demo load, offline export produced `St-Anne-autumn-concert.zip`; no request occurred during export and no console error appeared.

All 25 commands listed in `.factory/claims.json` passed individually from a new clone after `npm ci`, including demo isolation, on-device processing, offline export, source-change safety, imports, cleanup effects, checkout/licensing, desktop formats, release integrity, no generative restoration, and tracker-free assets. No landing or README claim-like sentence lacks coverage.

## Structure and accessibility

- `/`, `/demo/`, `/privacy/`, `/terms/`, and `/404/` have the expected route-specific title, description, canonical, social metadata, favicon, apple-touch icon, one `main`, and one `h1`.
- Every route has the same **Demo · Method · License · Privacy** header and a footer with Privacy, Terms, Param Factory attribution, and version.
- Direct links, Back, heading focus, and polite route announcement work. The designed 404 returns HTTP 404 and points home/sample paths.
- Live mobile checks and axe passed with no violations; 390 px routes do not overflow. Internal-link crawling and console checks passed.
- The release state replaces its transient message with **“v0.1.11 · unsigned build · SHA-256 published.”**

No AI feature is missing. The brief calls for cautious, local, reversible filters, not generated restoration. The expected import, editable score suggestions, cleanup, documented export, and distribution are present.

## Earlier-finding verification

Each result was checked against current live behavior and source, not accepted from a closure note.

| Earlier finding | Current result and evidence |
|---|---|
| F-1-1 | Fixed — reset restores all demo state and preserves seeded real storage (`@claim:demo-isolation`; live reset). |
| F-1-2 | Fixed — only the current service worker controls the cache; no legacy app cache creation remains. |
| F-1-3 | Fixed — unsupported unlimited-project promise is absent. |
| F-1-4 | Fixed — MusicXML/PDF score reference behavior is tested by `@claim:score-reference-import`. |
| F-1-5 | Fixed — scope is uncompressed WAV; `@claim:pcm-wav-import` passes. |
| F-1-6 | Fixed — `@claim:passage-marking-inputs` covers pointer, Arrow keys, and exact times. |
| F-1-7 | Fixed — `@claim:source-revision-audition` covers source and cleaned previews. |
| F-1-8 | Fixed — cross-device license promise is absent. |
| F-1-9 | Fixed — automatic refund-revocation promise is absent. |
| F-1-10 | Fixed — release copy is maintainer instruction, not an untested outcome claim. |
| F-1-11 | Fixed — automatic OS-detection claim is absent; platform links are listed. |
| F-1-12 | Fixed — unsupported exhaustive-storage assertion is absent. |
| F-1-13 | Fixed — `@claim:license-request-minimization` asserts the license-only request. |
| F-1-14 | Fixed — unsigned-build wording is covered by `@claim:release-signing-status`. |
| F-1-15 | Fixed — local-filter-only scope is covered by `@claim:no-generative-restoration`. |
| F-1-16 | Fixed — all public routes have complete metadata. |
| F-1-17 | Fixed — shared four-link navigation is on all five public routes. |
| F-1-18 | Fixed — direct route loads and Back focus the route heading. |
| F-1-19 | Fixed — copy audit checks rendered, dynamic, alternative, and README text against the full plain-language rules. |
| F-1-20 | Fixed — public build labels consistently show v0.1.11. |
| F-1-21 | Fixed — axe reports no violations on public routes and demo. |
| F-1-22 | Fixed — workflow heading says “Make a rehearsal pack in three steps.” |
| F-1-23 | Fixed — generic-enhancer comparison is replaced with the tested edit-receipt fact. |
| F-1-24 | Fixed — source step says “Add the recording and score.” |
| F-1-25 | Fixed — passage step says “Mark rehearsal passages.” |
| F-1-26 | Fixed — export step says “Export the rehearsal pack.” |
| F-1-27 | Fixed — scope heading says “What Choir Cleanup does not do.” |
| F-1-28 | Fixed — black-box wording is absent. |
| F-1-29 | Fixed — unmeasured “honest” wording is absent. |
| F-1-30 | Fixed — download heading names the archive-computer task. |
| F-1-31 | Fixed — pricing names the one-time $39 Steward purpose. |
| F-1-32 | Fixed — JSON is explained as a file listing settings. |
| F-1-33 | Fixed — terminal controls say “Copy install command.” |
| F-1-34 | Fixed — dialog control says “Close license window.” |
| F-1-35 | Fixed — README has no sentence over 22 words. |
| F-1-36 | Fixed — broad WebView audio-format promise is absent. |
| F-1-37 | Fixed — MusicXML/PDF behavior is split into plain, tested statements. |
| F-1-38 | Fixed — preview names match visible UI and tests. |
| F-1-39 | Fixed — pack contents use plain WAV/file-list wording. |
| F-1-40 | Fixed — unexplained NSIS wording is absent. |
| F-1-41 | Fixed — installer wording explains the SHA-256 check. |
| F-1-42 | Fixed — try-out is consistently called a sample project. |
| F-1-43 | Fixed — score-reference/score-mark terminology is consistent. |
| F-1-44 | Fixed — workflow copy names choir archivists and the rehearsal-pack task. |
| F-2-1 | Fixed — live route navigation is identical across routes. |
| F-2-2 | Fixed — audit rules cover the previously missed copy classes and regression passes. |
| F-2-3 | Fixed — successful release lookup removes “Checking” and shows completed status. |
| F-2-4 | Fixed — duration, MusicXML title, desktop formats, and merchant handling have claim tests. |
| F-2-5 | Fixed — task copy says “uncompressed WAV,” not PCM. |
| F-2-6 | Fixed — output terms are rehearsal pack/WAV excerpt throughout. |
| F-2-7 | Fixed — README heading is “Included cleanup and export features.” |
| F-2-8 | Fixed — download controls say “Download the desktop app.” |
| F-2-9 | Fixed — free scope is enumerated rather than called “complete.” |

## Verification

- Clean clone: all 25 exact claim commands passed independently.
- Clean clone: `npm test` passed (9 unit and 34 Playwright/axe tests).
- Clean clone: `npm run build` passed and produced `dist/`.
- Live: `EXPECTED_VERSION=0.1.11 npm run verify:live -- https://score-aligned-choir-cleanup.sociobot.in` passed.
- Live: cold 390 px and 1440 px Playwright checks passed. Evidence remains outside the repository in `/tmp/choir-review-3-phone.png`, `/tmp/choir-review-3-desktop.png`, and `/tmp/choir-review-3-evidence/`.

`cargo test --manifest-path src-tauri/Cargo.toml` could not start because this container lacks the GTK/GLib development package (`glib-2.0.pc`). README already calls out Tauri OS prerequisites; this is an environment limit, not a web/product claim failure.

## What would make this perfect

Maintain this evidence on later releases: rerun every isolated claim from a fresh clone, retain the cautious local scope, and keep the copy inventory synchronized with new public sentences. No product change is indicated by this review.
