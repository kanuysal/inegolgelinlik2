#!/usr/bin/env node

/**
 * Rename source frames to sequential frame-001.webp format.
 *
 * Usage:
 *   1. Place all your source images in public/frames/source/
 *   2. Run: node scripts/rename-frames.js
 *   3. Renamed files appear in public/frames/
 */

const fs = require("fs");
const path = require("path");

const SOURCE_DIR = path.join(__dirname, "..", "public", "frames", "source");
const OUTPUT_DIR = path.join(__dirname, "..", "public", "frames");
const EXTENSIONS = [".webp", ".png", ".jpg", ".jpeg"];

if (!fs.existsSync(SOURCE_DIR)) {
  console.log(`\nCreate the source directory first:`);
  console.log(`  mkdir -p public/frames/source\n`);
  console.log(`Then place all your frame images there and run this script again.\n`);
  process.exit(1);
}

const files = fs
  .readdirSync(SOURCE_DIR)
  .filter((f) => EXTENSIONS.includes(path.extname(f).toLowerCase()))
  .sort();

if (files.length === 0) {
  console.log("No image files found in public/frames/source/");
  process.exit(1);
}

console.log(`Found ${files.length} frames. Renaming...`);

files.forEach((file, index) => {
  const num = String(index + 1).padStart(3, "0");
  const ext = path.extname(file).toLowerCase();
  const newName = `frame-${num}${ext === ".webp" ? ".webp" : ext}`;
  const src = path.join(SOURCE_DIR, file);
  const dest = path.join(OUTPUT_DIR, newName);

  fs.copyFileSync(src, dest);
  console.log(`  ${file} → ${newName}`);
});

console.log(`\nDone! ${files.length} frames renamed in public/frames/`);
console.log(
  `\nNote: If your images aren't .webp, convert them for best performance.`
);
