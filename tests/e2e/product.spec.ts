import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

function wav(seconds = 1) {
  const rate = 8000, frames = rate * seconds; const out = Buffer.alloc(44 + frames * 2);
  out.write("RIFF", 0); out.writeUInt32LE(out.length - 8, 4); out.write("WAVEfmt ", 8); out.writeUInt32LE(16, 16); out.writeUInt16LE(1, 20); out.writeUInt16LE(1, 22); out.writeUInt32LE(rate, 24); out.writeUInt32LE(rate * 2, 28); out.writeUInt16LE(2, 32); out.writeUInt16LE(16, 34); out.write("data", 36); out.writeUInt32LE(frames * 2, 40);
  for (let i = 0; i < frames; i++) out.writeInt16LE(Math.sin(i / rate * Math.PI * 2 * 220) * 3000, 44 + i * 2);
  return out;
}

test("desktop workbench completes a local rehearsal pack", async ({ page }) => {
  await page.goto("http://127.0.0.1:1420");
  await expect(page.locator("h1")).toHaveCount(1);
  await page.locator("#audio-file").setInputFiles({ name: "archive.wav", mimeType: "audio/wav", buffer: wav(2) });
  await expect(page.locator("#audio-meta")).toContainText("archive.wav");
  await page.locator("#score-file").setInputFiles({ name: "score.musicxml", mimeType: "application/xml", buffer: Buffer.from('<score-partwise><work><work-title>Test anthem</work-title></work><direction><direction-type><rehearsal>Verse 1</rehearsal></direction-type></direction><direction><direction-type><rehearsal>Coda</rehearsal></direction-type></direction></score-partwise>') });
  await expect(page.locator("#passage-list li")).toHaveCount(2);
  await page.locator("#rights").check();
  await expect(page.locator("#export-button")).toBeEnabled();
  const downloadEvent = page.waitForEvent("download"); await page.locator("#export-button").click(); const download = await downloadEvent;
  expect(download.suggestedFilename()).toBe("Choir-rehearsal-pack.zip");
  await expect(page.locator("#export-status")).toContainText("original was not changed", { ignoreCase: true });
});

test("app empty state and mobile layout meet accessibility baseline", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 }); await page.goto("http://127.0.0.1:1420");
  await expect(page.getByText("No recording on the desk")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((item) => ["serious", "critical"].includes(item.impact || ""))).toEqual([]);
});

test("landing page detects platform manifest and has no serious accessibility issues", async ({ page }) => {
  await page.addInitScript(() => {
    const nativeFetch = window.fetch;
    window.fetch = (input, init) => String(input).includes("latest.json")
      ? Promise.resolve(new Response(JSON.stringify({ version: "0.1.0", platforms: { "linux-appimage": { label: "Linux · AppImage", url: "https://example.test/app.AppImage", sha256: "abc" }, windows: { label: "Windows · x64", url: "https://example.test/app.exe", sha256: "def" } } }), { status: 200, headers: { "Content-Type": "application/json" } }))
      : nativeFetch(input, init);
  });
  await page.goto("http://127.0.0.1:4173");
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("#primary-download")).toContainText(/Windows|Linux/);
  await expect(page.locator("img")).toHaveAttribute("alt", /archival workbench/i);
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((item) => ["serious", "critical"].includes(item.impact || ""))).toEqual([]);
});

test("legal pages are directly addressable", async ({ page }) => {
  for (const path of ["privacy", "terms"]) { await page.goto(`http://127.0.0.1:4173/${path}/`); await expect(page.locator("main h1")).toHaveCount(1); }
});
