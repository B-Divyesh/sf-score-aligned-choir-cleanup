import { createHash } from "node:crypto";
import { execFile as execFileCallback } from "node:child_process";
import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { promisify } from "node:util";
import { expect, test } from "vitest";

const execFile = promisify(execFileCallback);

test("@claim:release-integrity release manifests and terminal installers enforce SHA256", async () => {
  const root = await mkdtemp(join(tmpdir(), "choir-release-integrity-"));
  const assets = join(root, "assets"); await mkdir(assets);
  const files = {
    "Choir.Cleanup_0.1.2_aarch64.dmg": "mac arm",
    "Choir.Cleanup_0.1.2_x64.dmg": "mac intel",
    "Choir.Cleanup_0.1.2_x64-setup.exe": "windows",
    "Choir.Cleanup_0.1.2_x64_en-US.msi": "windows msi",
    "Choir.Cleanup_0.1.2_amd64.AppImage": "linux fixture",
    "Choir.Cleanup_0.1.2_amd64.deb": "linux deb",
  };
  for (const [name, contents] of Object.entries(files)) await writeFile(join(assets, name), contents);
  await execFile(process.execPath, [resolve("scripts/create-release-manifest.mjs"), "v0.1.2", "https://downloads.example.test/v0.1.2", assets]);

  const manifest = JSON.parse(await readFile(join(assets, "latest.json"), "utf8")) as { platforms: Record<string, { file: string; sha256: string }> };
  const sums = await readFile(join(assets, "SHA256SUMS"), "utf8");
  for (const platform of ["mac-arm64", "mac-intel", "windows", "windows-msi", "linux-appimage", "linux-deb"]) {
    const asset = manifest.platforms[platform]; const bytes = await readFile(join(assets, asset.file)); const expected = createHash("sha256").update(bytes).digest("hex");
    expect(asset.sha256).toBe(expected); expect(sums).toContain(`${expected}  ${asset.file}`);
  }

  const bin = join(root, "bin"); await mkdir(bin);
  await writeFile(join(bin, "curl"), `#!/bin/sh\nset -eu\nout=''\nurl=''\nwhile [ "$#" -gt 0 ]; do\n  case "$1" in\n    -o) out="$2"; shift 2 ;;\n    -*) shift ;;\n    *) url="$1"; shift ;;\n  esac\ndone\ncase "$url" in\n  *latest.json) cp "$FIXTURE_MANIFEST" "$out" ;;\n  *) cp "$FIXTURE_ASSET" "$out" ;;\nesac\n`);
  await execFile("chmod", ["+x", join(bin, "curl")]);
  const fixtureAsset = join(assets, manifest.platforms["linux-appimage"].file);
  const goodHome = join(root, "good-home"); await mkdir(goodHome);
  const env = { ...process.env, PATH: `${bin}:${process.env.PATH}`, HOME: goodHome, FIXTURE_MANIFEST: join(assets, "latest.json"), FIXTURE_ASSET: fixtureAsset };
  const good = await execFile("sh", [resolve("public-site/install.sh")], { env });
  expect(good.stdout).toContain("Verified SHA256 and installed Choir Cleanup");
  expect(await readFile(join(goodHome, ".local/bin/choir-cleanup"), "utf8")).toBe(files[manifest.platforms["linux-appimage"].file as keyof typeof files]);

  const badManifest = join(root, "bad-latest.json");
  manifest.platforms["linux-appimage"].sha256 = "0".repeat(64); await writeFile(badManifest, JSON.stringify(manifest));
  const badHome = join(root, "bad-home"); await mkdir(badHome);
  await expect(execFile("sh", [resolve("public-site/install.sh")], { env: { ...env, HOME: badHome, FIXTURE_MANIFEST: badManifest } })).rejects.toMatchObject({ stderr: expect.stringContaining("Checksum verification failed; nothing was installed.") });

  const powershell = await readFile(resolve("public-site/install.ps1"), "utf8");
  expect(powershell).toContain("Get-FileHash -Algorithm SHA256");
  expect(powershell).toMatch(/if \(\$actual -ne \$asset\.sha256\.ToLowerInvariant\(\)\).*Remove-Item.*throw "Checksum verification failed; nothing was installed\."/s);
});

test("@claim:release-signing-status describes unsigned builds without signing configuration", async () => {
  const [workflow, landing] = await Promise.all([
    readFile(resolve(".github/workflows/release.yml"), "utf8"),
    readFile(resolve("site/index.html"), "utf8"),
  ]);
  expect(landing).toContain("Builds are unsigned.");
  expect(workflow).not.toMatch(/APPLE_CERTIFICATE|WINDOWS_CERT_PFX|tauri\.conf\.json.*sign/i);
});

test("@claim:no-generative-restoration ships only local filter controls", async () => {
  const [app, pkg] = await Promise.all([readFile(resolve("app/main.ts"), "utf8"), readFile(resolve("package.json"), "utf8")]);
  expect(app).toContain('new OfflineAudioContext');
  expect(app).not.toMatch(/azure|openai|responses|voice.?clone|separat/i);
  expect(pkg).not.toMatch(/openai|azure|tensorflow|onnx/i);
});

test("public build labels use the package version", async () => {
  const [pkg, app, landing, privacy, terms, notFound] = await Promise.all([
    readFile(resolve("package.json"), "utf8"), readFile(resolve("app/index.html"), "utf8"), readFile(resolve("site/index.html"), "utf8"),
    readFile(resolve("site/privacy/index.html"), "utf8"), readFile(resolve("site/terms/index.html"), "utf8"), readFile(resolve("site/404/index.html"), "utf8"),
  ]);
  const version = JSON.parse(pkg).version;
  for (const source of [app, landing, privacy, terms, notFound]) expect(source).toContain(`v${version}`);
});
