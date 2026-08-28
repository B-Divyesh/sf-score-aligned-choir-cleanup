import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFile } from "node:fs/promises";

function wav(seconds = 1) {
  const rate = 8000, frames = rate * seconds; const out = Buffer.alloc(44 + frames * 2);
  out.write("RIFF", 0); out.writeUInt32LE(out.length - 8, 4); out.write("WAVEfmt ", 8); out.writeUInt32LE(16, 16); out.writeUInt16LE(1, 20); out.writeUInt16LE(1, 22); out.writeUInt32LE(rate, 24); out.writeUInt32LE(rate * 2, 28); out.writeUInt16LE(2, 32); out.writeUInt16LE(16, 34); out.write("data", 36); out.writeUInt32LE(frames * 2, 40);
  for (let i = 0; i < frames; i++) out.writeInt16LE(Math.sin(i / rate * Math.PI * 2 * 220) * 3000, 44 + i * 2);
  return out;
}

function multitoneWav(seconds = 2) {
  const rate = 48_000, frames = rate * seconds; const out = Buffer.alloc(44 + frames * 2);
  out.write("RIFF", 0); out.writeUInt32LE(out.length - 8, 4); out.write("WAVEfmt ", 8); out.writeUInt32LE(16, 16); out.writeUInt16LE(1, 20); out.writeUInt16LE(1, 22); out.writeUInt32LE(rate, 24); out.writeUInt32LE(rate * 2, 28); out.writeUInt16LE(2, 32); out.writeUInt16LE(16, 34); out.write("data", 36); out.writeUInt32LE(frames * 2, 40);
  const tones = [30, 50, 60, 1000, 2600, 12_000];
  for (let i = 0; i < frames; i++) {
    const level = i < frames / 2 ? .012 : .07;
    const sample = tones.reduce((sum, hz) => sum + Math.sin(i / rate * Math.PI * 2 * hz) * level, 0);
    out.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(sample * 32767))), 44 + i * 2);
  }
  return out;
}

function zipEntries(zip: Buffer) {
  const entries = new Map<string, Buffer>(); let offset = 0;
  while (offset + 30 <= zip.length && zip.readUInt32LE(offset) === 0x04034b50) {
    const size = zip.readUInt32LE(offset + 18); const nameLength = zip.readUInt16LE(offset + 26); const extraLength = zip.readUInt16LE(offset + 28);
    const nameStart = offset + 30; const dataStart = nameStart + nameLength + extraLength;
    entries.set(zip.toString("utf8", nameStart, nameStart + nameLength), zip.subarray(dataStart, dataStart + size)); offset = dataStart + size;
  }
  return entries;
}

function wavData(data: Buffer) {
  const samples = new Int16Array((data.length - 44) / 2);
  for (let i = 0; i < samples.length; i++) samples[i] = data.readInt16LE(44 + i * 2);
  return { samples, rate: data.readUInt32LE(24) };
}

function magnitude(audio: { samples: Int16Array; rate: number }, hz: number, fromSecond = .1, toSecond = 1.9) {
  const { samples, rate } = audio; const from = Math.floor(fromSecond * rate), to = Math.min(samples.length, Math.floor(toSecond * rate)); let real = 0, imaginary = 0;
  for (let i = from; i < to; i++) { const phase = 2 * Math.PI * hz * i / rate; real += samples[i] * Math.cos(phase); imaginary -= samples[i] * Math.sin(phase); }
  return Math.hypot(real, imaginary) / (to - from);
}

function rms(audio: { samples: Int16Array; rate: number }, fromSecond: number, toSecond: number) {
  const { samples, rate } = audio; const from = Math.floor(fromSecond * rate), to = Math.min(samples.length, Math.floor(toSecond * rate)); let sum = 0;
  for (let i = from; i < to; i++) sum += samples[i] ** 2;
  return Math.sqrt(sum / (to - from));
}

async function exportWavs(page: import("@playwright/test").Page) {
  const downloadEvent = page.waitForEvent("download"); await page.locator("#export-button").click(); const download = await downloadEvent; const path = await download.path();
  expect(path).not.toBeNull(); const entries = zipEntries(await readFile(path!)); return [...entries].filter(([name]) => name.endsWith(".wav")).map(([, data]) => wavData(data));
}

async function exportFirstWav(page: import("@playwright/test").Page) {
  const wavs = await exportWavs(page); expect(wavs.length).toBeGreaterThan(0); return wavs[0];
}

function rgbChannels(color: string): [number, number, number] {
  const channels = color.match(/\d+(?:\.\d+)?/g)?.slice(0, 3).map(Number);
  expect(channels, `expected an rgb color, received ${color}`).toHaveLength(3);
  return channels as [number, number, number];
}

function relativeLuminance(color: [number, number, number]) {
  const linear = color.map((channel) => {
    const normalized = channel / 255;
    return normalized <= .04045 ? normalized / 12.92 : ((normalized + .055) / 1.055) ** 2.4;
  });
  return .2126 * linear[0] + .7152 * linear[1] + .0722 * linear[2];
}

function contrastRatio(foreground: string, background: string) {
  const [lighter, darker] = [relativeLuminance(rgbChannels(foreground)), relativeLuminance(rgbChannels(background))].sort((a, b) => b - a);
  return (lighter + .05) / (darker + .05);
}

async function expectNoSeriousAxeFindings(page: import("@playwright/test").Page) {
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((item) => ["serious", "critical"].includes(item.impact || ""))).toEqual([]);
}

test("desktop workbench completes a local rehearsal pack", async ({ page }) => {
  await page.goto("http://127.0.0.1:1420");
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("#view-score")).toBeHidden();
  await page.locator("#audio-file").setInputFiles({ name: "archive.wav", mimeType: "audio/wav", buffer: wav(2) });
  await expect(page.locator("#audio-meta")).toContainText("archive.wav");
  await page.locator("#score-file").setInputFiles({ name: "score.musicxml", mimeType: "application/xml", buffer: Buffer.from('<score-partwise><work><work-title>Test anthem</work-title></work><direction><direction-type><rehearsal>Verse 1</rehearsal></direction-type></direction><direction><direction-type><rehearsal>Coda</rehearsal></direction-type></direction></score-partwise>') });
  await expect(page.locator("#passage-list li")).toHaveCount(2);
  await page.locator("#rights").check();
  await expect(page.locator("#export-button")).toBeEnabled();
  const downloadEvent = page.waitForEvent("download"); await page.locator("#export-button").click(); const download = await downloadEvent;
  expect(download.suggestedFilename()).toBe("Choir-rehearsal-pack.zip");
  await expect(page.locator("#export-status")).toContainText("original was not changed", { ignoreCase: true });
  const exportedAxe = await new AxeBuilder({ page }).analyze();
  expect(exportedAxe.violations.filter((item) => ["serious", "critical"].includes(item.impact || ""))).toEqual([]);
  await page.locator("#score-file").setInputFiles({ name: "reference.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.4\n%%EOF") });
  await expect(page.locator("#view-score")).toBeVisible(); await page.locator("#view-score").click(); await expect(page.locator("#score-dialog")).toHaveAttribute("open", ""); await page.locator("#close-score").click();
});

test("app empty state and mobile layout meet accessibility baseline", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 }); await page.goto("http://127.0.0.1:1420");
  await expect(page.getByText("No recording on the desk")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((item) => ["serious", "critical"].includes(item.impact || ""))).toEqual([]);
  await page.locator("#theme").click();
  const darkResults = await new AxeBuilder({ page }).analyze();
  expect(darkResults.violations.filter((item) => ["serious", "critical"].includes(item.impact || ""))).toEqual([]);
});

test("landing and populated demo remain usable at 390px", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("http://127.0.0.1:4173/");
  await expect(page.getByRole("link", { name: "Try it with sample data" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await page.goto("http://127.0.0.1:4173/demo/");
  await expect(page.locator("#demo-banner")).toBeVisible();
  await expect(page.locator("#passage-list li")).toHaveCount(3);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  expect(await page.locator("button").evaluateAll((buttons) => buttons.filter((button) => !(button.textContent || "").trim() && !button.getAttribute("aria-label")).length)).toBe(0);
  for (const id of ["#reset-demo", "#leave-demo", "#export-button"]) {
    const box = await page.locator(id).boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((item) => ["serious", "critical"].includes(item.impact || ""))).toEqual([]);
  await page.locator("#theme").click();
  const darkResults = await new AxeBuilder({ page }).analyze();
  expect(darkResults.violations.filter((item) => ["serious", "critical"].includes(item.impact || ""))).toEqual([]);
});

test("populated demo banner keeps its descriptive text at WCAG contrast in both themes and viewports", async ({ page }) => {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    await page.goto("http://127.0.0.1:4173/demo/");
    await expect(page.locator("#demo-banner")).toBeVisible();
    for (const theme of ["light", "dark"] as const) {
      if (theme === "dark") await page.locator("#theme").click();
      const colors = await page.locator(".demo-banner > span").evaluate((span) => ({
        foreground: getComputedStyle(span).color,
        background: getComputedStyle(span.parentElement!).backgroundColor,
      }));
      expect(contrastRatio(colors.foreground, colors.background), `${theme} demo banner at ${viewport.width}px`).toBeGreaterThanOrEqual(4.5);
      await expectNoSeriousAxeFindings(page);
    }
  }
});

test("@claim:source-change-safety source replacement respaces score passages and requires renewed rights confirmation", async ({ page }) => {
  await page.goto("http://127.0.0.1:4173/demo/");
  await page.locator("#rights").check();
  await page.locator("#audio-file").setInputFiles({ name: "different-owner.wav", mimeType: "audio/wav", buffer: wav(1) });
  await expect(page.locator("#rights")).not.toBeChecked();
  await expect(page.locator("#export-button")).toBeDisabled();
  await expect(page.locator("#source-error")).toContainText("3 score marks were respaced");
  await expect(page.locator("#passage-list li")).toHaveCount(3);
  const passageEnds = await page.locator("#passage-list li small").allTextContents();
  expect(passageEnds.every((label) => !label.includes("0:06.0") && !label.includes("0:12.0") && !label.includes("0:18.0"))).toBe(true);
  await page.locator("#rights").check();
  const replacementWavs = await exportWavs(page);
  expect(replacementWavs).toHaveLength(3);
  for (const audio of replacementWavs) {
    expect(audio.samples.length / audio.rate).toBeLessThanOrEqual(.34);
    expect(audio.samples.some((sample) => sample !== 0)).toBe(true);
  }

  await page.locator("#rights").check();
  await page.locator("#score-file").setInputFiles({ name: "replacement.musicxml", mimeType: "application/xml", buffer: Buffer.from("<score-partwise><direction><direction-type><rehearsal>C</rehearsal></direction-type></direction></score-partwise>") });
  await expect(page.locator("#rights")).not.toBeChecked();
  await expect(page.locator("#passage-list li")).toHaveCount(1);
  await expect(page.locator("#passage-list")).toContainText("C");
  await expect(page.locator("#passage-list")).not.toContainText("Opening hymn");
});

test("@claim:purchase-return hosted purchase return stores, strips, verifies, and hands the license to the desktop app", async ({ page }) => {
  let verificationRequests = 0;
  await page.route("https://api.github.com/repos/**", (route) => route.fulfill({ status: 503, body: "unavailable" }));
  await page.route("https://api.sociobot.in/api/v1/products/score-aligned-choir-cleanup/verify?license=qa-return-token", (route) => { verificationRequests++; return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ valid: true, reason: "ok" }) }); });
  await page.goto("http://127.0.0.1:4173/?license=qa-return-token");
  await expect(page).toHaveURL("http://127.0.0.1:4173/");
  expect(await page.evaluate(() => localStorage.getItem("sb_license:score-aligned-choir-cleanup"))).toBe("qa-return-token");
  await expect(page.locator("#license-return")).toHaveAttribute("open", "");
  await expect(page.locator("#license-return-status")).toHaveText("Purchase confirmed. Your Steward license is ready.");
  await expect(page.locator("#copy-return-license")).toBeVisible();
  expect(verificationRequests).toBe(1);
});

test("mobile text links meet the 44px touch-target baseline", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of ["/", "/privacy/", "/terms/", "/demo/"]) {
    await page.goto(`http://127.0.0.1:4173${path}`);
    const undersized = await page.locator("footer a, .platforms p a, .license-panel small a").evaluateAll((links) => links.filter((link) => {
      const box = link.getBoundingClientRect(); return box.width > 0 && box.height > 0 && (box.width < 44 || box.height < 44);
    }).map((link) => ({ text: link.textContent?.trim(), width: link.getBoundingClientRect().width, height: link.getBoundingClientRect().height })));
    expect(undersized, `${path} has undersized links`).toEqual([]);
  }
});

test("hidden score control and modal stay correct for keyboard users", async ({ page }) => {
  await page.goto("http://127.0.0.1:1420");
  await page.keyboard.press("Tab");
  await expect(page.locator(".skip")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main")).toBeFocused();
  await expect(page.locator("#view-score")).toBeHidden();
  await page.locator("#score-file").setInputFiles({ name: "reference.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.4\n%%EOF") });
  await page.locator("#view-score").click();
  await expect(page.locator("#close-score")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.locator("#score-dialog")).not.toHaveAttribute("open", "");
});

test("landing page detects platform manifest and has no serious accessibility issues", async ({ page }) => {
  await page.addInitScript(() => {
    const nativeFetch = window.fetch;
    window.fetch = (input, init) => String(input).includes("api.github.com/repos/")
      ? Promise.resolve(new Response(JSON.stringify({ tag_name: "v0.1.0", assets: [{ name: "Choir.Cleanup_0.1.0_amd64.AppImage", browser_download_url: "https://example.test/app.AppImage", digest: "sha256:abc" }, { name: "Choir.Cleanup_0.1.0_x64-setup.exe", browser_download_url: "https://example.test/app.exe", digest: "sha256:def" }] }), { status: 200, headers: { "Content-Type": "application/json" } }))
      : nativeFetch(input, init);
  });
  await page.goto("http://127.0.0.1:4173");
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("#primary-download")).toContainText(/Windows|Linux/);
  await expect(page.locator("#download-note")).toHaveText("v0.1.0 · unsigned build · SHA-256 published");
  await expect(page.locator("#download-note")).not.toContainText("Checking");
  await expect(page.locator(".hero-art img")).toHaveAttribute("alt", /archival workbench/i);
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((item) => ["serious", "critical"].includes(item.impact || ""))).toEqual([]);
});

test("legal pages are directly addressable", async ({ page }) => {
  for (const path of ["privacy", "terms"]) { await page.goto(`http://127.0.0.1:4173/${path}/`); await expect(page.locator("main h1")).toHaveCount(1); }
  for (const path of ["robots.txt", "sitemap.xml"]) { const response = await page.request.get(`http://127.0.0.1:4173/${path}`); expect(response.status()).toBe(200); }
  await page.goto("http://127.0.0.1:4173/404/");
  await expect(page.locator("main h1")).toHaveText("This score mark has no page");
});

test("every public route uses the same navigation and complete metadata", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const routes = [
    ["/", "Choir Cleanup — Make rehearsal packs"],
    ["/demo/", "Demo — Choir Cleanup"],
    ["/privacy/", "Privacy — Choir Cleanup"],
    ["/terms/", "Terms — Choir Cleanup"],
    ["/404/", "Page not found — Choir Cleanup"],
  ] as const;
  for (const [path, title] of routes) {
    await page.goto(`http://127.0.0.1:4173${path}`);
    await expect(page).toHaveTitle(title);
    await expect(page.locator("main")).toHaveCount(1);
    await expect(page.locator("main h1")).toHaveCount(1);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /\S/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /^https:\/\//);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /social-card\.webp$/);
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image");
    await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveCount(1);
    await expect(page.locator('nav[aria-label="Primary"] a')).toHaveText(["Demo", "Method", "License", "Privacy"]);
    await expect(page.locator('nav[aria-label="Primary"] a')).toHaveCount(4);
    for (const link of await page.locator('nav[aria-label="Primary"] a').all()) await expect(link).toBeVisible();
    await expect(page.locator("footer")).toContainText("Built by Param Factory · v0.1.6");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    const axe = await new AxeBuilder({ page }).analyze();
    expect(axe.violations, `${path} has axe violations`).toEqual([]);
  }
});

test("route loads move focus to the route heading", async ({ page }) => {
  await page.goto("http://127.0.0.1:4173/");
  await expect(page.locator("main h1")).toBeFocused();
  await page.getByRole("link", { name: "Try it with sample data" }).click();
  await expect(page.locator("#app-title")).toBeFocused();
  await page.goBack();
  await expect(page.locator("main h1")).toBeFocused();
});

test("public routes and the sample flow have no console errors or broken internal links", async ({ page, request }) => {
  const errors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));
  const paths = ["/", "/demo/", "/privacy/", "/terms/", "/404/"];
  const internal = new Set<string>();
  for (const path of paths) {
    await page.goto(`http://127.0.0.1:4173${path}`);
    for (const href of await page.locator("a[href]").evaluateAll((links) => links.map((link) => (link as HTMLAnchorElement).href))) {
      const url = new URL(href);
      if (url.origin === "http://127.0.0.1:4173") internal.add(`${url.pathname}${url.search}`);
    }
  }
  for (const path of internal) expect((await request.get(`http://127.0.0.1:4173${path}`)).status(), path).toBeLessThan(400);
  expect(errors).toEqual([]);
});

test("@claim:demo-isolation sample data never reads or writes real project state", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("choir-cleanup:project", JSON.stringify({ project: "REAL ARCHIVE", preparedBy: "Real person", notes: "private" }));
    localStorage.setItem("choir-cleanup:theme", "dark");
    localStorage.setItem("sb_license:score-aligned-choir-cleanup", "real-license");
  });
  await page.goto("http://127.0.0.1:4173/demo/");
  await expect(page.locator("#demo-banner")).toBeVisible();
  await expect(page.locator("#project-name")).toHaveValue("St Anne autumn concert");
  await expect(page.locator("html")).not.toHaveAttribute("data-theme", "dark");
  await page.locator("#project-name").fill("Temporary demo edit");
  await page.locator('input[value="clarity"]').check();
  await page.locator("#hum").check();
  await page.locator("#theme").click();
  await page.locator("#rights").check();
  await page.locator("#passage-list li").first().click();
  await page.locator("#passage-name").fill("Temporary passage");
  await page.locator("#passage-start").fill("99:00");
  await page.locator("#passage-form button").click();
  await expect(page.locator("#passage-error")).not.toBeEmpty();
  await page.locator(".license-panel summary").click();
  await page.locator("#license-input").fill("temporary-license");
  await page.locator("#reset-demo").click();
  await expect(page.locator("#app-title")).toBeFocused();
  const sourceTop = await page.locator("#sources").evaluate((node) => node.getBoundingClientRect().top);
  expect(sourceTop).toBeGreaterThanOrEqual(-2);
  expect(sourceTop).toBeLessThan(260);
  await expect(page.locator("#project-name")).toHaveValue("St Anne autumn concert");
  await expect(page.locator('input[value="archive"]')).toBeChecked();
  await expect(page.locator("#hum")).not.toBeChecked();
  await expect(page.locator("#rights")).not.toBeChecked();
  await expect(page.locator("html")).not.toHaveAttribute("data-theme", "dark");
  await expect(page.locator("#passage-list li")).toHaveCount(3);
  await expect(page.locator("#passage-start")).toHaveValue("0:00.0");
  await expect(page.locator("#passage-end")).toHaveValue("0:06.0");
  await expect(page.locator("#passage-error")).toBeEmpty();
  await expect(page.locator("#license-input")).toHaveValue("");
  await expect(page.locator("#license-state")).toHaveText("Free edition");
  const stored = await page.evaluate(() => ({
    project: localStorage.getItem("choir-cleanup:project"),
    theme: localStorage.getItem("choir-cleanup:theme"),
    license: localStorage.getItem("sb_license:score-aligned-choir-cleanup"),
  }));
  expect(stored).toEqual({ project: JSON.stringify({ project: "REAL ARCHIVE", preparedBy: "Real person", notes: "private" }), theme: "dark", license: "real-license" });
});

test("demo query opens the isolated sample route in one click", async ({ page }) => {
  await page.goto("http://127.0.0.1:4173/");
  await expect(page.getByRole("link", { name: "Try it with sample data" })).toHaveAttribute("href", "/?demo=1");
  await page.getByRole("link", { name: "Try it with sample data" }).click();
  await expect(page).toHaveURL(/\/demo\/\?demo=1/);
  await expect(page.locator("#demo-banner")).toBeVisible();
});

test("@claim:pcm-wav-import imports a PCM WAV recording", async ({ page }) => {
  await page.goto("http://127.0.0.1:1420/");
  await page.locator("#audio-file").setInputFiles({ name: "archive.wav", mimeType: "audio/wav", buffer: wav(2) });
  await expect(page.locator("#audio-meta")).toContainText("archive.wav");
  await expect(page.locator("#audio-meta")).toContainText(/Hz · 1 ch/);
});

test("@claim:score-reference-import imports MusicXML marks and a PDF score reference", async ({ page }) => {
  await page.goto("http://127.0.0.1:1420/");
  await page.locator("#audio-file").setInputFiles({ name: "archive.wav", mimeType: "audio/wav", buffer: wav(2) });
  await page.locator("#score-file").setInputFiles({ name: "score.musicxml", mimeType: "application/xml", buffer: Buffer.from("<score-partwise><direction><direction-type><rehearsal>Verse</rehearsal></direction-type></direction></score-partwise>") });
  await expect(page.locator("#passage-list")).toContainText("Verse");
  await page.locator("#score-file").setInputFiles({ name: "reference.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.4\n%%EOF") });
  await expect(page.locator("#view-score")).toBeVisible();
});

test("@claim:sample-duration sample contains an 18-second rehearsal and three editable score marks", async ({ page }) => {
  await page.goto("http://127.0.0.1:4173/demo/");
  await expect(page.locator("#audio-meta")).toContainText("0:18.0");
  await expect(page.locator("#passage-list li")).toHaveCount(3);
  await expect(page.locator("#passage-start")).toBeEditable();
  await expect(page.locator("#passage-end")).toBeEditable();
});

test("@claim:musicxml-title imports a MusicXML title and score marks", async ({ page }) => {
  await page.goto("http://127.0.0.1:1420/");
  await page.locator("#audio-file").setInputFiles({ name: "archive.wav", mimeType: "audio/wav", buffer: wav(2) });
  await page.locator("#score-file").setInputFiles({
    name: "score.musicxml",
    mimeType: "application/xml",
    buffer: Buffer.from('<score-partwise><work><work-title>Winter Concert</work-title></work><direction><direction-type><rehearsal>Verse</rehearsal><rehearsal>Coda</rehearsal></direction-type></direction></score-partwise>'),
  });
  await expect(page.locator("#score-meta")).toContainText("Winter Concert");
  await expect(page.locator("#passage-list")).toContainText("Verse");
  await expect(page.locator("#passage-list")).toContainText("Coda");
});

test("@claim:passage-marking-inputs supports pointer, keyboard, and exact times", async ({ page }) => {
  await page.goto("http://127.0.0.1:4173/demo/");
  const wave = page.locator("#waveform");
  const box = await wave.boundingBox(); expect(box).not.toBeNull();
  await page.mouse.move(box!.x + 10, box!.y + 30); await page.mouse.down(); await page.mouse.move(box!.x + box!.width / 2, box!.y + 30); await page.mouse.up();
  const before = await page.locator("#passage-end").inputValue();
  await wave.focus(); await page.keyboard.press("ArrowRight");
  expect(await page.locator("#passage-end").inputValue()).not.toBe(before);
  await page.locator("#passage-name").fill("Exact entrance"); await page.locator("#passage-start").fill("0:01.0"); await page.locator("#passage-end").fill("0:02.0"); await page.locator("#passage-form button").click();
  await expect(page.locator("#passage-list")).toContainText("Exact entrance");
});

test("@claim:source-revision-audition previews the source and cleaned copy", async ({ page }) => {
  await page.goto("http://127.0.0.1:4173/demo/");
  await page.locator("#play-original").click();
  await expect(page.locator("#play-time")).not.toHaveText("0:00.0 / 0:00.0");
  await page.locator("#stop").click();
  await page.locator("#play-clean").click();
  await expect(page.locator("#play-time")).not.toHaveText("0:00.0 / 0:00.0");
});

test("@claim:license-request-minimization sends only a license query parameter", async ({ page }) => {
  let received = "";
  await page.route("https://api.sociobot.in/api/v1/products/score-aligned-choir-cleanup/verify**", async (route) => {
    received = route.request().url();
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ valid: false, reason: "invalid" }) });
  });
  await page.goto("http://127.0.0.1:1420/");
  await page.locator(".license-panel summary").click();
  await page.locator("#license-input").fill("token-only"); await page.locator("#license-restore").click();
  await expect(page.locator("#license-message")).toContainText("License no longer active");
  const url = new URL(received); expect([...url.searchParams]).toEqual([["license", "token-only"]]);
});

test("@claim:on-device-audio sample cleanup makes no cross-origin request", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  await page.goto("http://127.0.0.1:4173/demo/");
  await page.locator('input[value="clarity"]').check();
  await page.locator("#hum").check();
  await page.locator("#rights").check();
  const downloadEvent = page.waitForEvent("download");
  await page.locator("#export-button").click();
  await downloadEvent;
  expect(requests.filter((url) => new URL(url).origin !== "http://127.0.0.1:4173")).toEqual([]);
});

test("@claim:offline-workflow installed sample completes export offline", async ({ page, context }) => {
  await page.goto("http://127.0.0.1:4173/demo/");
  await expect(page.locator("html")).toHaveAttribute("data-offline-ready", "true", { timeout: 10_000 });
  await context.setOffline(true);
  await expect(page.locator("#network")).toContainText("Offline");
  await page.locator("#rights").check();
  const downloadEvent = page.waitForEvent("download");
  await page.locator("#export-button").click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toBe("St-Anne-autumn-concert.zip");
  await context.setOffline(false);
});

test("@claim:documented-pack sample export contains labeled WAVs and records source integrity", async ({ page }) => {
  await page.goto("http://127.0.0.1:4173/demo/");
  await expect(page.locator("#export-button")).toBeDisabled();
  await page.locator("#rights").check();
  const downloadEvent = page.waitForEvent("download");
  await page.locator("#export-button").click();
  const download = await downloadEvent;
  const path = await download.path();
  expect(path).not.toBeNull();
  const archive = (await readFile(path!)).toString("latin1");
  for (const file of ["01-Opening-hymn.wav", "02-Verse-2-entries.wav", "03-Final-cadence.wav", "EDIT-RECEIPT.txt", "pack-manifest.json"]) expect(archive).toContain(file);
  expect(archive).toContain("Original source modified: No");
  expect(archive).toContain('"originalModified": false');
});

test("@claim:score-suggestions sample exposes three editable score marks", async ({ page }) => {
  await page.goto("http://127.0.0.1:4173/demo/");
  await expect(page.locator("#passage-list li")).toHaveCount(3);
  await expect(page.locator("#passage-list")).toContainText("Opening hymn");
  await expect(page.locator("#passage-list")).toContainText("Verse 2 entries");
  await expect(page.locator("#passage-list")).toContainText("Final cadence");
  await page.locator("#passage-start").fill("0:01.0");
  await page.locator("#passage-end").fill("0:02.0");
  await page.locator("#passage-name").fill("Corrected entrance");
  await page.locator("#passage-form button").click();
  await expect(page.locator("#passage-list")).toContainText("Corrected entrance");
});

test("@claim:cleanup-filters exported presets change rumble, presence, dynamics, hum, and hiss", async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto("http://127.0.0.1:1420/");
  await page.locator("#audio-file").setInputFiles({ name: "filter-fixture.wav", mimeType: "audio/wav", buffer: multitoneWav() });
  await expect(page.locator("#audio-meta")).toContainText("filter-fixture.wav");
  await page.locator("#passage-start").fill("0"); await page.locator("#passage-end").fill("1.8"); await page.locator("#passage-name").fill("Filter fixture"); await page.locator("#passage-form button").click();
  await expect(page.locator("#passage-list li")).toHaveCount(1);
  await page.locator("#rights").check();

  const archive = await exportFirstWav(page);
  await page.locator("#hum").check(); const hum = await exportFirstWav(page); await page.locator("#hum").uncheck();
  await page.locator('input[value="clarity"]').check(); const clarity = await exportFirstWav(page);
  await page.locator('input[value="hiss"]').check(); const hiss = await exportFirstWav(page);

  expect(magnitude(archive, 30) / magnitude(archive, 1000)).toBeLessThan(.3);
  expect(magnitude(hum, 50) / magnitude(archive, 50)).toBeLessThan(.45);
  expect(magnitude(hum, 60) / magnitude(archive, 60)).toBeLessThan(.45);
  expect(magnitude(clarity, 2600) / magnitude(clarity, 1000)).toBeGreaterThan(magnitude(archive, 2600) / magnitude(archive, 1000) * 1.12);
  expect(rms(clarity, 1.15, 1.7) / rms(clarity, .15, .85)).toBeLessThan(rms(archive, 1.15, 1.7) / rms(archive, .15, .85) * .9);
  expect(magnitude(hiss, 12_000) / magnitude(hiss, 1000)).toBeLessThan(magnitude(archive, 12_000) / magnitude(archive, 1000) * .92);
});

test("@claim:no-account-core anonymous sample enables the complete core export", async ({ page }) => {
  await page.goto("http://127.0.0.1:4173/demo/");
  await expect(page.locator("#license-state")).toHaveText("Free edition");
  await expect(page.locator("#audio-meta")).toContainText("st-anne-community-choir-rehearsal.wav");
  await page.locator("#rights").check();
  await expect(page.locator("#export-button")).toBeEnabled();
});

test("@claim:steward-license shows the exact optional license boundary", async ({ page }) => {
  await page.goto("http://127.0.0.1:4173/");
  await expect(page.locator("#pricing")).toContainText("$39 once");
  await expect(page.locator("#pricing")).toContainText("reusable archive notes");
  await expect(page.locator("#pricing")).toContainText("named receipt sign-off");
  await expect(page.locator('#pricing a[href*="api.sociobot.in/api/v1/products/score-aligned-choir-cleanup/checkout"]')).toHaveCount(1);
  await page.goto("http://127.0.0.1:4173/demo/");
  await expect(page.locator("#steward-tools")).toBeHidden();
  await expect(page.locator("#export-button")).toBeVisible();
});

test("@claim:platform-downloads resolves macOS, Windows, and Linux assets", async ({ page }) => {
  await page.addInitScript(() => {
    const nativeFetch = window.fetch;
    window.fetch = (input, init) => String(input).includes("api.github.com/repos/")
      ? Promise.resolve(new Response(JSON.stringify({ tag_name: "v0.1.2", assets: [
        { name: "Choir.Cleanup_0.1.1_aarch64.dmg", browser_download_url: "https://example.test/mac-arm.dmg" },
        { name: "Choir.Cleanup_0.1.1_x64.dmg", browser_download_url: "https://example.test/mac-intel.dmg" },
        { name: "Choir.Cleanup_0.1.1_x64-setup.exe", browser_download_url: "https://example.test/app.exe" },
        { name: "Choir.Cleanup_0.1.1_amd64.AppImage", browser_download_url: "https://example.test/app.AppImage" },
      ] }), { status: 200, headers: { "Content-Type": "application/json" } }))
      : nativeFetch(input, init);
  });
  await page.goto("http://127.0.0.1:4173/");
  await expect(page.locator("#mac-arm")).toHaveAttribute("href", "https://example.test/mac-arm.dmg");
  await expect(page.locator("#mac-intel")).toHaveAttribute("href", "https://example.test/mac-intel.dmg");
  await expect(page.locator("#windows")).toHaveAttribute("href", "https://example.test/app.exe");
  await expect(page.locator("#linux")).toHaveAttribute("href", "https://example.test/app.AppImage");
  await expect(page.locator("#download-note")).toHaveText("v0.1.2 · unsigned build · SHA-256 published");
});

test("@claim:desktop-release-formats resolves every advertised desktop bundle", async ({ page }) => {
  const [workflow, manifestScript] = await Promise.all([
    readFile(".github/workflows/release.yml", "utf8"),
    readFile("scripts/create-release-manifest.mjs", "utf8"),
  ]);
  expect(workflow).toContain("--bundles appimage,deb");
  expect(workflow).toContain("--bundles msi,nsis");
  expect(workflow.match(/--bundles dmg/g)).toHaveLength(2);
  for (const key of ["windows-msi", "linux-deb", "linux-appimage", "mac-arm64", "mac-intel"]) expect(manifestScript).toContain(`\"${key}\"`);
  await page.addInitScript(() => {
    const nativeFetch = window.fetch;
    window.fetch = (input, init) => String(input).includes("api.github.com/repos/")
      ? Promise.resolve(new Response(JSON.stringify({ tag_name: "v0.1.5", assets: [
        { name: "Choir.Cleanup_0.1.5_aarch64.dmg", browser_download_url: "https://example.test/mac-arm.dmg" },
        { name: "Choir.Cleanup_0.1.5_x64.dmg", browser_download_url: "https://example.test/mac-intel.dmg" },
        { name: "Choir.Cleanup_0.1.5_x64-setup.exe", browser_download_url: "https://example.test/app.exe" },
        { name: "Choir.Cleanup_0.1.5_x64_en-US.msi", browser_download_url: "https://example.test/app.msi" },
        { name: "Choir.Cleanup_0.1.5_amd64.AppImage", browser_download_url: "https://example.test/app.AppImage" },
        { name: "Choir.Cleanup_0.1.5_amd64.deb", browser_download_url: "https://example.test/app.deb" },
      ] }), { status: 200, headers: { "Content-Type": "application/json" } }))
      : nativeFetch(input, init);
  });
  await page.goto("http://127.0.0.1:4173/");
  for (const [id, url] of [
    ["#mac-arm", "https://example.test/mac-arm.dmg"], ["#mac-intel", "https://example.test/mac-intel.dmg"],
    ["#windows", "https://example.test/app.exe"], ["#windows-msi", "https://example.test/app.msi"],
    ["#linux", "https://example.test/app.AppImage"], ["#linux-deb", "https://example.test/app.deb"],
  ]) await expect(page.locator(id)).toHaveAttribute("href", url);
});

test("@claim:merchant-checkout uses hosted checkout and directs refund questions to the merchant", async ({ page }) => {
  await page.route("https://api.github.com/repos/**", (route) => route.fulfill({ status: 503, body: "unavailable" }));
  await page.goto("http://127.0.0.1:4173/");
  const checkout = page.locator('#pricing a[href*="/checkout"]');
  await expect(checkout).toHaveAttribute("href", "https://api.sociobot.in/api/v1/products/score-aligned-choir-cleanup/checkout");
  await expect(page.locator("#pricing")).toContainText("Sociobot/Dodo is the merchant of record");
  await expect(page.locator("#pricing")).toContainText("Ask the merchant about refunds");
  await expect(page.locator('a[href*="dodo" i], a[href*="stripe" i]')).toHaveCount(0);
  await page.goto("http://127.0.0.1:4173/terms/");
  await expect(page.locator("main")).toContainText("Sociobot/Dodo handles checkout and refunds as merchant of record");
});

test("@claim:license-verification-cache reuses a fresh verdict without a request", async ({ page }) => {
  let verificationRequests = 0;
  await page.addInitScript(() => {
    localStorage.setItem("sb_license:score-aligned-choir-cleanup", "cached-license");
    localStorage.setItem("sb_license:score-aligned-choir-cleanup:verdict", JSON.stringify({ valid: true, checked: Date.now() }));
  });
  page.on("request", (request) => { if (request.url().includes("/verify?license=")) verificationRequests++; });
  await page.goto("http://127.0.0.1:1420/");
  await expect(page.locator("#license-state")).toHaveText("Steward unlocked");
  await expect(page.locator("#steward-tools")).toBeVisible();
  expect(verificationRequests).toBe(0);
});

test("@claim:tracker-free-site loads no third-party executable or font resources", async ({ page }) => {
  const requests: { url: string; type: string }[] = [];
  await page.route("https://api.github.com/repos/**", (route) => route.fulfill({ status: 503, body: "unavailable" }));
  page.on("request", (request) => requests.push({ url: request.url(), type: request.resourceType() }));
  await page.goto("http://127.0.0.1:4173/");
  const forbidden = requests.filter(({ url, type }) => new URL(url).origin !== "http://127.0.0.1:4173" && ["script", "stylesheet", "font", "image", "media", "websocket"].includes(type));
  expect(forbidden).toEqual([]);
  expect(await page.locator('script[src^="http"],link[rel="stylesheet"][href^="http"]').count()).toBe(0);
});
