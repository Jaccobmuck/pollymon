import { readFile, writeFile } from "node:fs/promises";

const checkOnly = process.argv.includes("--check");
const files = [
  "README.md",
  "CHANGELOG.md",
  "CREDITS.md",
  "ATTRIBUTION.md",
  "LICENSE",
  "package.json",
  "index.html",
  "src/index.html",
  "src/styles.css",
  "src/game.js",
  "scripts/dev-server.mjs",
  "scripts/build.mjs",
  "scripts/format.mjs",
  "scripts/lint.mjs",
  "scripts/version.mjs",
  "tests/smoke.test.mjs"
];

const changed = [];

for (const file of files) {
  const original = await readFile(file, "utf8");
  const formatted = `${original.replace(/\r\n/g, "\n").replace(/[ \t]+$/gm, "").trimEnd()}\n`;
  if (formatted !== original) {
    changed.push(file);
    if (!checkOnly) await writeFile(file, formatted);
  }
}

if (changed.length && checkOnly) {
  console.error(`Formatting needed:\n${changed.map((file) => `- ${file}`).join("\n")}`);
  process.exit(1);
}

console.log(changed.length ? `Formatted ${changed.length} file(s).` : "Formatting check passed.");
