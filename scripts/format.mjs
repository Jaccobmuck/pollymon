import { readFile, writeFile } from "node:fs/promises";
import { readdir } from "node:fs/promises";
import { extname } from "node:path";

const checkOnly = process.argv.includes("--check");
const skipDirs = new Set([".git", "dist", "node_modules"]);
const textExtensions = new Set([".css", ".html", ".js", ".json", ".md", ".mjs", ".svg"]);
const textNames = new Set([
  ".editorconfig",
  ".gitattributes",
  ".gitignore",
  ".npmrc",
  "LICENSE"
]);

async function collectFiles(dir = ".") {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const path = dir === "." ? entry.name : `${dir}/${entry.name}`;
    if (entry.isDirectory()) {
      if (!skipDirs.has(entry.name)) files.push(...(await collectFiles(path)));
      continue;
    }
    if (entry.isFile() && (textExtensions.has(extname(entry.name)) || textNames.has(entry.name))) {
      files.push(path);
    }
  }

  return files.sort();
}

const changed = [];

for (const file of await collectFiles()) {
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
