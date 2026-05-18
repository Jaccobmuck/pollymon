import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const packageJson = JSON.parse(await readFile("package.json", "utf8"));
const outDir = resolve("dist");

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });
await cp("src", outDir, { recursive: true });

const buildInfo = {
  name: packageJson.name,
  version: packageJson.version,
  builtAt: new Date().toISOString(),
  source: "src"
};

await writeFile(resolve(outDir, "build-info.json"), `${JSON.stringify(buildInfo, null, 2)}\n`);
console.log(`Built Pollymon ${packageJson.version} into dist/`);
