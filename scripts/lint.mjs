import { readFile } from "node:fs/promises";
import { readdir } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { extname } from "node:path";

const skipDirs = new Set([".git", "dist", "node_modules"]);
const textExtensions = new Set([".css", ".html", ".js", ".json", ".md", ".mjs", ".svg"]);
const textNames = new Set([
  ".editorconfig",
  ".gitattributes",
  ".gitignore",
  ".npmrc",
  "LICENSE"
]);
const jsExtensions = new Set([".js", ".mjs"]);

async function collectFiles(dir = ".") {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const path = dir === "." ? entry.name : `${dir}/${entry.name}`;
    if (entry.isDirectory()) {
      if (!skipDirs.has(entry.name)) files.push(...(await collectFiles(path)));
      continue;
    }
    if (entry.isFile()) files.push(path);
  }

  return files.sort();
}

const forbiddenAssetNames = [
  "bulbasaur",
  "charmander",
  "squirtle",
  "pikachu",
  "pokeball",
  "pokemon"
];

const failures = [];
const allFiles = await collectFiles();
const textFiles = allFiles.filter(
  (file) => textExtensions.has(extname(file)) || textNames.has(file.split("/").at(-1))
);

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

for (const file of allFiles.filter((candidate) => jsExtensions.has(extname(candidate)))) {
  const result = spawnSync(process.execPath, ["--check", file], { stdio: "pipe", encoding: "utf8" });
  if (result.status !== 0) failures.push(`${file}: ${result.stderr || result.stdout}`);
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Lint passed.");
