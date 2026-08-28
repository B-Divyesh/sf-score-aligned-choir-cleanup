# Choir Cleanup

Choir Cleanup makes documented rehearsal packs from choir archive recordings. It is for community choir archivists working from audio and a score.

Try the sample project: <https://score-aligned-choir-cleanup.sociobot.in/demo/>. It loads an 18-second St Anne Community Choir rehearsal with three editable score marks. Sample changes never enter real project storage.

The desktop app combines an uncompressed WAV recording with MusicXML score marks or a PDF score reference. It exports a rehearsal pack with labeled WAV excerpts, a file list, and an edit receipt. The app never overwrites the source. Audio processing stays on the device.

It is not a voice separator, forensic restoration tool, or replacement for an engineer.

Live site: <https://score-aligned-choir-cleanup.sociobot.in>

## Included cleanup and export features

- Imports uncompressed WAV recordings.
- MusicXML files provide titles and score marks. PDF files stay attached for reference.
- Mark passages with a pointer, arrow keys, or exact time fields.
- Preview the source audio or cleaned excerpt with Archive gentle, Section clarity, Hiss restraint, and optional hum filters.
- Rights confirmation before export.
- A rehearsal pack containing uncompressed WAV excerpts, an edit receipt, and a file list.
- Free import, passage marking, cleanup, and WAV-pack export.
- Optional $39 one-time Steward license for reusable archive notes and named receipt sign-off.
- Recent license checks are reused for one day.
- A one-click sample project with separate, memory-only demo state.

## Develop and test

Requires Node.js 22+, npm, stable Rust, and the [Tauri 2 prerequisites](https://v2.tauri.app/start/prerequisites/) for your OS.

```sh
npm ci
npm run dev          # web version of the workbench on :1420
npm run dev:site     # landing site on :5173
npm run check        # strict TypeScript
npm test             # Vitest + Playwright + axe checks
npm run verify:copy  # landing copy sentence and terminology audit
npm run build        # app frontend -> dist/app; site -> dist/site
npm run tauri dev    # native desktop window
```

The factory deployment command is exactly:

```sh
npm ci && npm run build:site
```

It produces `dist/site/index.html` plus `/demo/`, `/privacy/`, `/terms/`, and `/404/`.

## Desktop releases

Push a `v*` tag or run **Release desktop apps** manually in GitHub Actions. The matrix builds:

- macOS `.dmg` for Apple silicon and Intel;
- Windows `.exe` and `.msi` installers;
- Linux `.AppImage` and `.deb`.

Release maintainers use the workflow to build and publish the platform bundles. Builds are unsigned until the repository owner provides signing credentials.

The download section lists each supported platform. Terminal installers read `latest.json` directly and check the downloaded file against its published SHA-256 fingerprint before installation:

```sh
curl -fsSL https://score-aligned-choir-cleanup.sociobot.in/install.sh | sh
```

```powershell
irm https://score-aligned-choir-cleanup.sociobot.in/install.ps1 | iex
```

## Privacy and data

Audio processing uses local browser audio tools on the current device. There are no analytics, remote fonts, advertising, or runtime content networks. See [`site/privacy/index.html`](site/privacy/index.html).

Demo mode does not read or write those real-data keys. Reset rebuilds the bundled sample in memory. See [`.factory/demo.md`](.factory/demo.md) and the tested claim inventory in [`.factory/claims.json`](.factory/claims.json).

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
