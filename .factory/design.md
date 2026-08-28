# Visual thesis — the conservator's blueprint

## Direction and rationale

The interface is a **blueprint drafting sheet** for music preservation: quiet warm paper, cyan construction lines, navy ink, crop marks, measure ticks, and amber pencil annotations. This fits the work because choir archivists are not “enhancing content”; they are making documented, reversible editorial decisions against a score. The product should feel like a conservation bench shared by a music librarian and an audio engineer—not a magical AI studio.

The landing page uses a generated still life as the human entry point. The working app switches to drawn waveforms, ruled timelines, and margin notes, where decoration also explains the workflow.

## Palette

Light is the primary treatment because it recalls archival drafting stock. A full dark treatment follows the same ink-and-paper hierarchy for low-light editing.

| Token | Light | Dark | Use |
|---|---:|---:|---|
| paper/background | `#F3EFE3` | `#0A1B24` | field |
| sheet/surface | `#FCF9EF` | `#102A36` | working planes |
| ink/text | `#102F3D` | `#F3EFE3` | body copy |
| muted | `#526871` | `#AAB9BC` | annotations |
| blueprint | `#0B6780` | `#5DC3D7` | actions and rules |
| deep blueprint | `#084A5E` | `#8AD8E7` | interactive contrast |
| pencil/accent | `#B34A2B` | `#FF9A70` | selected passage |
| success | `#286B45` | `#6DCF9A` | confirmed state |
| warning | `#8A5513` | `#F2C46D` | caution |
| danger | `#9B3030` | `#FF9898` | errors |

All core text/accent combinations are targeted at WCAG AA (4.5:1 for body text, 3:1 for large text and controls). State is always paired with copy or an icon.

## Type

- **Headings:** Georgia, Cambria, serif — editorial, score-like, already available on every target OS.
- **Interface and annotations:** `ui-monospace`, SFMono-Regular, Consolas, monospace — drafting labels and reliable tabular timecodes.
- No downloaded fonts. This keeps the app private, offline, and well below the font budget.
- Scale: 12 / 14 / 16 / 20 / 30 / clamp(40–72) px, body line-height 1.55.

## Spacing and shape

- 4px base unit; primary rhythm 8, 12, 16, 24, 32, 48, 72px.
- Hairlines are functional construction rules. Cards are reserved for distinct source files, passages, or receipts.
- Corners are 2–8px rather than pill-shaped. Controls resemble labelled drafting instruments.
- Every pointer target is at least 44×44px; content measure is 72 characters.

## Interaction grammar

- The three-step rail—Sources, Passages, Export—keeps current state visible.
- Cyan indicates an action or editable guide; rust pencil marks indicate the chosen musical passage.
- Every processing choice is a toggleable, non-destructive “revision.” Reset and undo are adjacent to the affected state.
- Timeline selection works with pointer or explicit start/end fields. Keyboard shortcuts are shown in the app, not hidden.
- Status copy describes whether audio is decoding, ready, processing, exported, offline, or blocked by missing confirmation.

## Motion

- 160–220ms opacity/transform transitions for panels and progress; waveform cursor follows playback with no decorative loop.
- The landing diagram reveals once from its origin like a drafter laying down a sheet.
- Under `prefers-reduced-motion`, transforms and smooth scrolling are removed, transitions become near-instant, and no animated progress sweep is shown.

## Responsive intent

- Desktop: three-column workbench with persistent section rail and receipt.
- At tablet widths, the receipt moves below the timeline.
- At 390px, steps become a compact horizontal index, all fields stack, the waveform remains horizontally legible, and secondary prose is shortened/hidden. The complete import → mark → export path remains available.

## Asset plan and provenance

### Generated hero: `assets/src/archival-workbench.png`

- Use case: `stylized-concept`
- Subject/world: a top-down archival choir preservation desk with an open choral score, compact reel-to-reel tape, grease-pencil passage marks, waveform tracing paper, cotton gloves.
- Materials/light/lens: worn cream paper, cyan drafting ink, oxidized dark metal, soft northern-window light, orthographic/top-down editorial framing.
- Palette words: warm vellum, blueprint cyan, deep navy ink, restrained rust pencil.
- Negative list: no people, no faces, no readable text, no brand marks, no logos, no watermark, no futuristic holograms, no microphones, no exaggerated AI glow.
- Prompt: “Top-down editorial still life of a careful community choir archive workbench, open SATB score with abstract non-readable notation, compact vintage reel-to-reel tape deck, translucent blueprint tracing sheet carrying a simple waveform and measured section ticks, cotton conservation gloves and a rust grease pencil, warm vellum paper, precise cyan drafting lines, deep navy ink, restrained rust accents, soft northern-window light, tactile paper and oxidized metal, generous quiet negative space, historically plausible but not brand-specific, sophisticated museum conservation mood. No people, no readable words, no logos, no watermark, no symbols, no futuristic UI, no magical glow.”
- Generator: Azure OpenAI factory image deployment via `/opt/fleet/lib/gen-image.sh`.
- Date: 2026-08-28.
- License/provenance: original AI-generated asset commissioned for this product; no reference image or living artist style requested. Generated-image disclosure appears in the site footer.
- Delivery: source PNG retained with prompt sidecar; responsive AVIF/WebP derivatives, each with explicit dimensions; mobile hero ≤300 KB.

### Authored graphics

- Product mark, measure ticks, waveform, and process diagram are authored in HTML/CSS/SVG from simple geometry. They do not imitate third-party icon sets.
- `public-site/assets/walkthrough-*.webp` are direct screenshots of the bundled fictional St Anne sample project, captured from this app on 2026-08-28. They contain no third-party data or imagery and are used only to explain the real workflow.
