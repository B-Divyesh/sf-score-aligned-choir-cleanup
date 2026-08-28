import "./styles.css";

const RELEASE = "https://github.com/B-Divyesh/sf-score-aligned-choir-cleanup/releases/latest";
const MANIFEST = `${RELEASE}/download/latest.json`;
type Asset = { label: string; url: string; sha256: string };
type Manifest = { version: string; platforms: Record<string, Asset | undefined> };

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
    const response = await fetch(MANIFEST, { cache: "no-store" }); if (!response.ok) throw new Error("No published release");
    const manifest = await response.json() as Manifest;
    const mapping: Record<string, string> = { "mac-arm64": "mac-arm", "mac-intel": "mac-intel", windows: "windows", "linux-appimage": "linux" };
    for (const [key, id] of Object.entries(mapping)) { const asset = manifest.platforms[key]; if (asset) document.querySelector<HTMLAnchorElement>(`#${id}`)!.href = asset.url; }
    const key = await platformKey(); const asset = manifest.platforms[key];
    if (asset) { primary.href = asset.url; primary.textContent = `Download ${asset.label}`; repeat.href = asset.url; repeat.textContent = `Download ${asset.label}`; note.textContent = `Version ${manifest.version} · unsigned build · SHA256 published`; }
    else note.textContent = `Version ${manifest.version} · choose a platform below`;
  } catch { primary.href = RELEASE; repeat.href = RELEASE; note.textContent = navigator.onLine ? "Release downloads are being prepared. View the release page." : "You’re offline. Reconnect to download; the installed app itself works offline."; }
}

document.querySelectorAll<HTMLButtonElement>(".copy").forEach((button) => button.addEventListener("click", async () => {
  await navigator.clipboard.writeText(button.dataset.copy || ""); const original = button.textContent; button.textContent = "Copied"; setTimeout(() => button.textContent = original, 1400);
}));

loadDownloads();
if ("serviceWorker" in navigator) addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => undefined));

declare global { interface Navigator { userAgentData?: { getHighEntropyValues(keys: string[]): Promise<{ architecture?: string }> } } }
