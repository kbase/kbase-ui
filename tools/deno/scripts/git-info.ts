import { Git } from "./common.ts";

function log(message: string) {
  console.log(message);
}

async function getGitInfo(
  dir: string,
) {
  const gitInfo = await new Git(dir).getInfo();
  return gitInfo;
}

async function main() {
  if (Deno.args.length !== 2) {
    log("Usage: git-info.ts <dir> <dest>");
    Deno.exit(1);
  }
  const targetDir = Deno.args[0];
  const destinationFile = Deno.args[1];

  log(`Getting git info from ${targetDir}`);
  log(`Saving git info info to ${destinationFile}`);

  const info = await getGitInfo(targetDir);
  log(JSON.stringify(info, null, 4));

  await Deno.writeFile(
    destinationFile,
    new TextEncoder().encode(JSON.stringify(info, null, 4)),
  );
}

if (import.meta.main) {
  main();
}
