# Choir Cleanup

Choir Cleanup is a local-first desktop workbench for community choir archivists. It combines a source recording with MusicXML rehearsal marks or a PDF score reference, lets an editor mark and audition passages, applies conservative audio filters, and exports a ZIP of labeled WAV excerpts with a complete edit receipt.

It is intentionally not an AI voice separator, a forensic restoration tool, or a replacement for an engineer. Originals are never overwritten and recordings never leave the device.

Live site: <https://score-aligned-choir-cleanup.sociobot.in>

## What v1 includes

- Local audio decode and waveform drawing for formats supported by the operating system WebView.
- MusicXML title/rehearsal-mark extraction; PDF and compressed MXL files remain attached as manual references.
- Pointer, keyboard, and exact-timecode passage marking.
- Source/revision audition with archive-gentle, section-clarity, hiss-restraint, and optional 50/60 Hz hum filters.
- Rights confirmation before export.
- A ZIP containing 16-bit PCM WAV excerpts, `EDIT-RECEIPT.txt`, and `pack-manifest.json`.
- Free complete workflow; optional $39 one-time Steward license for reusable archive notes and named receipt sign-off.
- Local license caching with at-most-daily verification through Sociobot billing.

## Develop and test

Requires Node.js 22+, npm, stable Rust, and the [Tauri 2 prerequisites](https://v2.tauri.app/start/prerequisites/) for your OS.

```sh
npm ci
npm run dev          # web version of the workbench on :1420
npm run dev:site     # landing site on :5173
npm run check        # strict TypeScript
npm test             # Vitest + Playwright + axe checks
npm run build        # app frontend -> dist/app; site -> dist/site
npm run tauri dev    # native desktop window
```

The factory deployment command is exactly:

```sh
npm ci && npm run build:site
```

It produces `dist/site/index.html` plus direct `/privacy/` and `/terms/` pages.

## Desktop releases

Push a `v*` tag or run **Release desktop apps** manually in GitHub Actions. The matrix builds:

- macOS `.dmg` for Apple silicon and Intel;
- Windows `.exe` (NSIS) and `.msi`;
- Linux `.AppImage` and `.deb`.

The workflow drafts one GitHub Release, attaches every bundle, creates `SHA256SUMS` and `latest.json`, validates that all required platforms are represented, and then publishes it. Builds are unsigned until the repository owner provides platform signing credentials.

The landing page detects the visitor’s operating system and resolves its main button through the release `latest.json`. Terminal installers independently verify SHA256 before installation:

```sh
curl -fsSL https://score-aligned-choir-cleanup.sociobot.in/install.sh | sh
```

```powershell
irm https://score-aligned-choir-cleanup.sociobot.in/install.ps1 | iex
```

## Privacy and data

Audio processing uses browser/WebView audio APIs entirely on the current device. Local storage holds only UI preferences, pack metadata fields, and an optional license token/verdict. License verification sends only the token to `api.sociobot.in`. There are no analytics, remote fonts, advertising, or runtime CDNs. See [`site/privacy/index.html`](site/privacy/index.html).

## Project structure

- `app/` — desktop workbench frontend
- `src/core.ts` — timecode, MusicXML, receipt, WAV, and ZIP primitives
- `src-tauri/` — Tauri shell and native save dialog
- `site/` — static download/marketing and legal pages
- `public-site/` — installers, generated image derivatives, service worker, hosting headers
- `.factory/design.md` — visual thesis and asset provenance
- `.github/workflows/release.yml` — cross-platform release matrix

## License

MIT. See [LICENSE](LICENSE).
