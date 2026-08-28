import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright-core";
import AxeBuilder from "@axe-core/playwright";

const base = (process.argv[2] || "https://score-aligned-choir-cleanup.sociobot.in").replace(/\/$/, "");
const expectedVersion = process.env.EXPECTED_VERSION || "0.1.6";
const evidence = process.env.EVIDENCE_DIR || "test-results/polish-2";
await mkdir(evidence, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, acceptDownloads: true });
await context.addInitScript(() => {
  localStorage.setItem("choir-cleanup:project", "REAL-PROJECT-SENTINEL");
  localStorage.setItem("choir-cleanup:theme", "dark");
  localStorage.setItem("sb_license:score-aligned-choir-cleanup", "REAL-LICENSE-SENTINEL");
});
const page = await context.newPage();
const errors = [];
page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
page.on("pageerror", (error) => errors.push(error.message));

const routes = [
  ["/", "Choir Cleanup — Make rehearsal packs"],
  ["/demo/", "Demo — Choir Cleanup"],
  ["/privacy/", "Privacy — Choir Cleanup"],
  ["/terms/", "Terms — Choir Cleanup"],
  ["/404/", "Page not found — Choir Cleanup"],
];

for (const [path, title] of routes) {
  const response = await page.goto(`${base}${path}`, { waitUntil: "networkidle" });
  assert(response?.ok(), `${path} did not return 2xx`);
  assert.equal(await page.title(), title, `${path} title`);
  assert.equal(await page.locator("main").count(), 1, `${path} main`);
  assert.equal(await page.locator("main h1").count(), 1, `${path} h1`);
  assert.deepEqual(await page.locator('nav[aria-label="Primary"] a').allTextContents(), ["Demo", "Method", "License", "Privacy"], `${path} nav`);
  assert.equal(await page.locator('meta[name="description"]').count(), 1, `${path} description`);
  assert.equal(await page.locator('link[rel="canonical"]').count(), 1, `${path} canonical`);
  assert.equal(await page.locator('meta[property="og:image"]').count(), 1, `${path} social image`);
  assert.equal(await page.locator('link[rel="apple-touch-icon"]').count(), 1, `${path} app icon`);
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), `${path} overflows at 390px`);
  assert.equal((await new AxeBuilder({ page }).analyze()).violations.length, 0, `${path} has axe violations`);
  assert.equal(await page.evaluate(() => document.activeElement === document.querySelector("main h1")), true, `${path} heading focus`);
}

await page.goto(`${base}/`, { waitUntil: "networkidle" });
assert.equal(await page.locator("h1").textContent(), "Make rehearsal packs from choir archive recordings");
assert.equal(await page.locator(".hero-facts li").count(), 3);
await page.locator("#download-note").waitFor({ state: "visible" });
assert.match(await page.locator("#download-note").innerText(), new RegExp(`^v${expectedVersion} · unsigned build · SHA-256 published$`));
await page.screenshot({ path: `${evidence}/live-first-screen-390.png` });

await page.getByRole("link", { name: "Try it with sample data" }).click();
await page.waitForURL(/\/demo\/\?demo=1$/);
assert.equal(await page.locator("#demo-banner").isVisible(), true);
assert.equal(await page.locator("#passage-list li").count(), 3);
await page.locator('input[value="clarity"]').check();
await page.locator("#hum").check();
await page.locator("#theme").click();
await page.locator("#rights").check();
await page.locator("#project-name").fill("Temporary live edit");
await page.locator("#reset-demo").click();
assert.equal(await page.evaluate(() => document.activeElement?.id), "app-title");
const sourceTop = await page.locator("#sources").evaluate((node) => node.getBoundingClientRect().top);
assert(sourceTop >= -2 && sourceTop < 260, `Reset scroll is not at Sources: ${sourceTop}`);
assert.equal(await page.locator("#project-name").inputValue(), "St Anne autumn concert");
assert.equal(await page.locator('input[value="archive"]').isChecked(), true);
assert.equal(await page.locator("#hum").isChecked(), false);
assert.equal(await page.locator("#rights").isChecked(), false);
assert.equal(await page.locator("html").getAttribute("data-theme"), "light");
assert.equal(await page.locator("#passage-list li").count(), 3);
assert.deepEqual(await page.evaluate(() => ({
  project: localStorage.getItem("choir-cleanup:project"),
  theme: localStorage.getItem("choir-cleanup:theme"),
  license: localStorage.getItem("sb_license:score-aligned-choir-cleanup"),
})), { project: "REAL-PROJECT-SENTINEL", theme: "dark", license: "REAL-LICENSE-SENTINEL" });
await page.locator("#sources").evaluate((node) => node.scrollIntoView({ block: "start" }));
await page.screenshot({ path: `${evidence}/live-demo-390.png` });

await page.locator("#rights").check();
await context.setOffline(true);
const download = await Promise.all([page.waitForEvent("download"), page.locator("#export-button").click()]).then(([item]) => item);
assert.equal(download.suggestedFilename(), "St-Anne-autumn-concert.zip");
await context.setOffline(false);

await page.goBack();
assert.equal(await page.evaluate(() => document.activeElement === document.querySelector("main h1")), true, "Back did not restore heading focus");
const missing = await context.request.get(`${base}/not-a-real-route-${Date.now()}`);
assert.equal(missing.status(), 404, "unknown route status");
assert.match(await missing.text(), /This score mark has no page/);
assert.deepEqual(errors, [], "console errors");
await browser.close();
console.log(`Live verification passed for ${base} at 390px; evidence: ${evidence}`);
