import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";

const textFiles = [
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

const forbiddenAssetNames = [
  "bulbasaur",
  "charmander",
  "squirtle",
  "pikachu",
  "pokeball",
  "pokemon"
];

const failures = [];

for (const file of textFiles) {
  const content = await readFile(file, "utf8");
  if (content.includes("\r\n")) failures.push(`${file}: use LF line endings`);
  if (!content.endsWith("\n")) failures.push(`${file}: missing final newline`);
  const trailingLine = content.split("\n").findIndex((line) => /[ \t]+$/.test(line));
  if (trailingLine >= 0) failures.push(`${file}:${trailingLine + 1}: trailing whitespace`);
}

const gameText = await readFile("src/game.js", "utf8");
for (const term of forbiddenAssetNames) {
  if (gameText.toLowerCase().includes(term)) {
    failures.push(`src/game.js: avoid protected franchise term "${term}" in game source`);
  }
}

for (const file of ["src/game.js", "scripts/dev-server.mjs", "scripts/build.mjs", "tests/smoke.test.mjs"]) {
  const result = spawnSync(process.execPath, ["--check", file], { stdio: "pipe", encoding: "utf8" });
  if (result.status !== 0) failures.push(`${file}: ${result.stderr || result.stdout}`);
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Lint passed.");
