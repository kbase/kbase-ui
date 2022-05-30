import { log } from "./common.ts";

async function getBuildInfo(
  dir: string,
) {
  return {
    builtAt: new Date().toISOString(),
  };
}

async function main() {
  if (Deno.args.length !== 1) {
    log("Usage: build-info.ts <dest>");
    Deno.exit(1);
  }
  const destinationFile = Deno.args[0];

  log(`Saving build info info to ${destinationFile}`, "build-info.ts:main()");

  const info = await getBuildInfo(destinationFile);
  log(JSON.stringify(info, null, 4), "build-info.ts:main()");

  await Deno.writeFile(
    destinationFile,
    new TextEncoder().encode(JSON.stringify(info, null, 4)),
  );
}

if (import.meta.main) {
  main();
}
