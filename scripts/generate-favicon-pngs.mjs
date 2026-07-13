import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const svg = readFileSync(join(root, "public/favicon.svg"));

const outputs = [
  { path: "public/favicon.png", size: 512 },
  { path: "public/apple-touch-icon.png", size: 180 },
  { path: "src/app/apple-icon.png", size: 180 },
];

for (const { path, size } of outputs) {
  const png = await sharp(svg).resize(size, size).png().toBuffer();
  writeFileSync(join(root, path), png);
  console.log(`Wrote ${path} (${size}x${size})`);
}
