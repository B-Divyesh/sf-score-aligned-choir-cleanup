import sharp from "sharp";
import { mkdir } from "node:fs/promises";

await mkdir("public/assets", { recursive: true });
const source = "assets/src/archival-workbench.png";
for (const width of [640, 1024, 1536]) {
  await sharp(source).resize({ width, withoutEnlargement: true }).webp({ quality: 78 }).toFile(`public/assets/workbench-${width}.webp`);
  await sharp(source).resize({ width, withoutEnlargement: true }).avif({ quality: 52 }).toFile(`public/assets/workbench-${width}.avif`);
}
