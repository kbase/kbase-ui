import { Runner } from "./common.ts";


async function main() {
    //   if (Deno.args.length !== 2) {
    //     log("Usage: git-info.ts <dir> <dest>");
    //     Deno.exit(1);
    //   }
    //   const targetDir = Deno.args[0];
    //   const destinationFile = Deno.args[1];

    //   log(`Getting git info from ${targetDir}`, "git-info.ts:main()");
    //   log(`Saving git info info to ${destinationFile}`, "git-info.ts:main()");

    //   const info = await getGitInfo(targetDir);
    //   log(JSON.stringify(info, null, 4), "git-info.ts:main()");

    //   await Deno.writeFile(
    //     destinationFile,
    //     new TextEncoder().encode(JSON.stringify(info, null, 4)),
    //   );
    const runner = new Runner('/app');
    const result = await runner.run('cat', ['Taskfile']);
    console.log('RESULT', result);
}

if (import.meta.main) {
    main();
}
