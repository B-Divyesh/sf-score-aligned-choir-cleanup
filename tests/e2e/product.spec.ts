import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFile } from "node:fs/promises";

function wav(seconds = 1) {
  const rate = 8000, frames = rate * seconds; const out = Buffer.alloc(44 + frames * 2);
  out.write("RIFF", 0); out.writeUInt32LE(out.length - 8, 4); out.write("WAVEfmt ", 8); out.writeUInt32LE(16, 16); out.writeUInt16LE(1, 20); out.writeUInt16LE(1, 22); out.writeUInt32LE(rate, 24); out.writeUInt32LE(rate * 2, 28); out.writeUInt16LE(2, 32); out.writeUInt16LE(16, 34); out.write("data", 36); out.writeUInt32LE(frames * 2, 40);
  for (let i = 0; i < frames; i++) out.writeInt16LE(Math.sin(i / rate * Math.PI * 2 * 220) * 3000, 44 + i * 2);
  return out;
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
  for (const id of ["#reset-demo", "#leave-demo", "#export-button"]) {
    const box = await page.locator(id).boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((item) => ["serious", "critical"].includes(item.impact || ""))).toEqual([]);
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
  await page.locator("#reset-demo").click();
  await expect(page.locator("#project-name")).toHaveValue("St Anne autumn concert");
  const stored = await page.evaluate(() => ({
    project: localStorage.getItem("choir-cleanup:project"),
    theme: localStorage.getItem("choir-cleanup:theme"),
    license: localStorage.getItem("sb_license:score-aligned-choir-cleanup"),
  }));
  expect(stored).toEqual({ project: JSON.stringify({ project: "REAL ARCHIVE", preparedBy: "Real person", notes: "private" }), theme: "dark", license: "real-license" });
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
      ? Promise.resolve(new Response(JSON.stringify({ tag_name: "v0.1.1", assets: [
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
