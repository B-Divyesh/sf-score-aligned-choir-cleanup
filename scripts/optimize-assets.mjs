import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const source = "assets/src/archival-workbench.png";
for (const directory of ["public/assets", "public-site/assets"]) {
  await mkdir(directory, { recursive: true });
  for (const width of [640, 1024, 1536]) {
    await sharp(source).resize({ width, withoutEnlargement: true }).webp({ quality: 78 }).toFile(`${directory}/workbench-${width}.webp`);
    await sharp(source).resize({ width, withoutEnlargement: true }).avif({ quality: 52 }).toFile(`${directory}/workbench-${width}.avif`);
  }
}
