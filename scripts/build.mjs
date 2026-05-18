import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const packageJson = JSON.parse(await readFile("package.json", "utf8"));
const outDir = resolve("dist");

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });
await cp("src", outDir, { recursive: true });
if (existsSync("assets")) await cp("assets", resolve(outDir, "assets"), { recursive: true });

const buildInfo = {
  name: packageJson.name,
  version: packageJson.version,
  builtAt: new Date().toISOString(),
  source: "src",
  assets: existsSync("assets") ? "assets" : null
};

await writeFile(resolve(outDir, "build-info.json"), `${JSON.stringify(buildInfo, null, 2)}\n`);
console.log(`Built Pollymon ${packageJson.version} into dist/`);
