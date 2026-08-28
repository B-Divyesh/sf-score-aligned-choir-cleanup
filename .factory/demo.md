# Demo sandbox

## Entry points

- Hosted: `https://score-aligned-choir-cleanup.sociobot.in/demo/`
- Query entry: `https://score-aligned-choir-cleanup.sociobot.in/?demo=1` redirects directly into the same isolated sample.
- Local production build: `npm run build:site`, then `npm run preview:site`, then open `http://127.0.0.1:4173/demo/`
- Desktop app: choose **Load sample project** on the first screen.

The landing page opens `?demo=1` in one click through **Try it with sample data**.

## Shipped sample

The app code creates an 18-second mono rehearsal fixture for the fictional St Anne Community Choir. Four sung-tone components, restrained room hum, and three six-second phrases make the cleanup controls and waveform observable. A bundled section map supplies these editable score suggestions:

1. Opening hymn
2. Verse 2 entries
3. Final cadence

The project is named `St Anne autumn concert`. No network request creates or loads the sample.

## Isolation and reset

Demo state stays in memory. While the demo banner is present, the app does not read or write the real `choir-cleanup:*` project/theme keys or `sb_license:*` keys. **Reset demo** restores the sample sources, three passages, selected times, cleanup, hum, theme, rights, fields, messages, license state, scroll, and focus. **Start for real** discards the demo and returns hosted visitors to the desktop download section; inside the desktop app it returns to an empty project.

An export is a deliberate browser download. It does not persist project state inside the app.
