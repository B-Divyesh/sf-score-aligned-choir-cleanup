import "./styles.css";

const RELEASE = "https://github.com/B-Divyesh/sf-score-aligned-choir-cleanup/releases/latest";
const RELEASE_API = "https://api.github.com/repos/B-Divyesh/sf-score-aligned-choir-cleanup/releases/latest";
const LICENSE_KEY = "sb_license:score-aligned-choir-cleanup";
type Asset = { label: string; url: string; sha256: string };
type Manifest = { version: string; platforms: Record<string, Asset | undefined> };

if (new URL(location.href).searchParams.get("demo") === "1") location.replace("/demo/?demo=1");

async function releaseManifest(): Promise<Manifest> {
  const response = await fetch(RELEASE_API, { cache: "no-store", headers: { Accept: "application/vnd.github+json" } });
  if (!response.ok) throw new Error("No published release");
  const release = await response.json() as { tag_name: string; assets: { name: string; browser_download_url: string; digest?: string }[] };
  const find = (...patterns: RegExp[]) => release.assets.find((asset) => patterns.every((pattern) => pattern.test(asset.name)));
  const platforms: Record<string, Asset | undefined> = {};
  const add = (key: string, label: string, asset?: { name: string; browser_download_url: string; digest?: string }) => { if (asset) platforms[key] = { label, url: asset.browser_download_url, sha256: asset.digest?.replace(/^sha256:/, "") || "See SHA256SUMS" }; };
  add("mac-arm64", "macOS · Apple silicon", find(/\.dmg$/i, /(aarch64|arm64)/i));
  add("mac-intel", "macOS · Intel", find(/\.dmg$/i, /(x64|x86_64)/i));
  add("windows", "Windows · x64", find(/\.exe$/i));
  add("linux-appimage", "Linux · AppImage", find(/\.AppImage$/i));
  return { version: release.tag_name.replace(/^v/, ""), platforms };
}

async function platformKey() {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("windows")) return "windows";
  if (ua.includes("mac")) {
    try {
      const data = navigator.userAgentData && await navigator.userAgentData.getHighEntropyValues(["architecture"]);
      return data?.architecture === "x86" ? "mac-intel" : "mac-arm64";
    } catch { return "mac-arm64"; }
  }
  return "linux-appimage";
}

async function loadDownloads() {
  const primary = document.querySelector<HTMLAnchorElement>("#primary-download")!;
  const repeat = document.querySelector<HTMLAnchorElement>("#download-again")!;
  const note = document.querySelector("#download-note")!;
  try {
    const manifest = await releaseManifest();
    const mapping: Record<string, string> = { "mac-arm64": "mac-arm", "mac-intel": "mac-intel", windows: "windows", "linux-appimage": "linux" };
    for (const [key, id] of Object.entries(mapping)) { const asset = manifest.platforms[key]; if (asset) document.querySelector<HTMLAnchorElement>(`#${id}`)!.href = asset.url; }
    const key = await platformKey(); const asset = manifest.platforms[key];
    if (asset) { primary.href = asset.url; primary.textContent = `Download ${asset.label}`; repeat.href = asset.url; repeat.textContent = `Latest desktop download · unsigned build · SHA256 published`; }
    else note.textContent = "Choose a platform below.";
  } catch { primary.href = RELEASE; repeat.href = RELEASE; note.textContent = navigator.onLine ? "Release downloads are being prepared. View the release page." : "You’re offline. Reconnect to download; the installed app itself works offline."; }
}

document.querySelectorAll<HTMLButtonElement>(".copy").forEach((button) => button.addEventListener("click", async () => {
  await navigator.clipboard.writeText(button.dataset.copy || ""); const original = button.textContent; button.textContent = "Copied"; setTimeout(() => button.textContent = original, 1400);
}));

async function handleLicenseReturn() {
  const url = new URL(location.href); const token = url.searchParams.get("license")?.trim();
  if (!token) return;
  localStorage.setItem(LICENSE_KEY, token);
  url.searchParams.delete("license");
  history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  const dialog = document.querySelector<HTMLDialogElement>("#license-return")!;
  const status = document.querySelector<HTMLElement>("#license-return-status")!;
  const copy = document.querySelector<HTMLButtonElement>("#copy-return-license")!;
  copy.addEventListener("click", async () => { await navigator.clipboard.writeText(token); copy.textContent = "License copied"; });
  document.querySelector<HTMLButtonElement>("#close-license-return")!.addEventListener("click", () => dialog.close());
  dialog.showModal();
  try {
    const response = await fetch(`https://api.sociobot.in/api/v1/products/score-aligned-choir-cleanup/verify?license=${encodeURIComponent(token)}`);
    if (!response.ok) throw new Error("License service unavailable");
    const result = await response.json() as { valid: boolean; reason?: string };
    localStorage.setItem(`${LICENSE_KEY}:verdict`, JSON.stringify({ valid: result.valid, checked: Date.now() }));
    status.textContent = result.valid ? "Purchase confirmed. Your Steward license is ready." : `This license is not active (${result.reason || "invalid"}). Core tools remain free.`;
    copy.hidden = !result.valid;
  } catch {
    status.textContent = "The license service could not be reached. Your license is saved; try verifying it in the desktop app.";
  }
}

handleLicenseReturn();
loadDownloads();
if ("serviceWorker" in navigator) addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => undefined));

declare global { interface Navigator { userAgentData?: { getHighEntropyValues(keys: string[]): Promise<{ architecture?: string }> } } }
