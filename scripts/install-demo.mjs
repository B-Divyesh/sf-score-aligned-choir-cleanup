import { cp, mkdir } from "node:fs/promises";
import sharp from "sharp";

await mkdir("dist/site/demo", { recursive: true });
await cp("dist/app", "dist/site/demo", { recursive: true, force: true });
await sharp("src-tauri/icons/icon.png").resize(180, 180).png().toFile("dist/site/apple-touch-icon.png");
await sharp("assets/src/archival-workbench.png").resize(1200, 630, { fit: "cover" }).webp({ quality: 82 }).toFile("dist/site/social-card.webp");
