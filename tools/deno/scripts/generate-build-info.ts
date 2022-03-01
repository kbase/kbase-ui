import { ensureDirSync } from "https://deno.land/std@0.125.0/fs/mod.ts";
import { Git } from "./common.ts";

async function generateBuildInfo(targetDir: string, installDirectory: string) {
  const info = await new Git(targetDir).getInfo();

  const outputPath = [installDirectory, "build.json"].join("/");

  const outputContents = new TextEncoder().encode(
    JSON.stringify(info as unknown as Record<string, unknown>, null, 4),
  );
  Deno.writeFile(outputPath, outputContents);
}

async function main() {
  if (Deno.args.length !== 2) {
    console.log("Usage: install-plugins.ts <config> <dest>");
    Deno.exit(1);
  }
  const targetDir = Deno.args[0];
  const destinationDir = Deno.args[1];
  // const here = new URL('', import.meta.url).pathname;

  console.log(`Installing build info into ${destinationDir}`);

  ensureDirSync(destinationDir);

  await generateBuildInfo(targetDir, destinationDir);
}

if (import.meta.main) {
  main();
}
