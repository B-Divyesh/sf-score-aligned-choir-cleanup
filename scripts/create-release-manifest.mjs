import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";

const [version, baseUrl, directory = "release-assets"] = process.argv.slice(2);
if (!version || !baseUrl) throw new Error("usage: node create-release-manifest.mjs <version> <download-base-url> [asset-dir]");
const names = (await readdir(directory)).filter((name) => !["latest.json", "SHA256SUMS"].includes(name));
const assets = [];
for (const name of names) {
  const data = await readFile(join(directory, name));
  assets.push({ name, sha256: createHash("sha256").update(data).digest("hex"), url: `${baseUrl}/${encodeURIComponent(name).replace(/%2F/g, "/")}` });
}
const find = (...patterns) => assets.find((asset) => patterns.every((pattern) => pattern.test(asset.name)));
const platforms = {};
const add = (key, label, asset) => { if (asset) platforms[key] = { label, url: asset.url, sha256: asset.sha256, file: basename(asset.name) }; };
add("mac-arm64", "macOS · Apple silicon", find(/\.dmg$/i, /(aarch64|arm64)/i));
add("mac-intel", "macOS · Intel", find(/\.dmg$/i, /(x64|x86_64)/i));
add("windows", "Windows · x64", find(/\.exe$/i));
add("windows-msi", "Windows · MSI", find(/\.msi$/i));
add("linux-appimage", "Linux · AppImage", find(/\.AppImage$/i));
add("linux-deb", "Linux · Debian", find(/\.deb$/i));
await writeFile(join(directory, "SHA256SUMS"), assets.map((asset) => `${asset.sha256}  ${asset.name}`).sort().join("\n") + "\n");
await writeFile(join(directory, "latest.json"), JSON.stringify({ version: version.replace(/^v/, ""), published_at: new Date().toISOString(), platforms }, null, 2) + "\n");
if (!platforms.windows || !platforms["linux-appimage"] || !platforms["mac-arm64"] || !platforms["mac-intel"]) throw new Error(`required platform assets missing; saw: ${names.join(", ")}`);
