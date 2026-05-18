import { readFile, writeFile } from "node:fs/promises";

const bump = process.argv[2] || "patch";
const packagePath = "package.json";
const changelogPath = "CHANGELOG.md";
const packageJson = JSON.parse(await readFile(packagePath, "utf8"));
const current = packageJson.version.split(".").map(Number);

if (current.length !== 3 || current.some((part) => !Number.isInteger(part) || part < 0)) {
  throw new Error(`Invalid current version: ${packageJson.version}`);
}

let next;
if (/^\d+\.\d+\.\d+$/.test(bump)) {
  next = bump;
} else if (bump === "major") {
  next = `${current[0] + 1}.0.0`;
} else if (bump === "minor") {
  next = `${current[0]}.${current[1] + 1}.0`;
} else if (bump === "patch") {
  next = `${current[0]}.${current[1]}.${current[2] + 1}`;
} else {
  throw new Error("Usage: npm run version:bump -- [patch|minor|major|x.y.z]");
}

packageJson.version = next;
await writeFile(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);

const today = new Date().toISOString().slice(0, 10);
const changelog = await readFile(changelogPath, "utf8");
const marker = "This project uses semantic versioning: `major.minor.patch`.\n";
const entry = `\n## ${next} - ${today}\n\n- Version bumped from ${current.join(".")} to ${next}.\n`;
await writeFile(changelogPath, changelog.replace(marker, `${marker}${entry}`));

console.log(`Version bumped to ${next}`);
