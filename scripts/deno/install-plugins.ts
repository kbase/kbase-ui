import { parse } from "https://deno.land/std@0.109.0/encoding/yaml.ts";
import {
  ensureDir,
  ensureDirSync,
  ensureFile,
} from "https://deno.land/std@0.109.0/fs/mod.ts";
import * as fflate from "https://cdn.skypack.dev/fflate?min";
import { Buffer } from "https://deno.land/std@0.109.0/io/buffer.ts";
import { Untar } from "https://deno.land/std@0.109.0/archive/tar.ts";
import { copy } from "https://deno.land/std@0.109.0/io/util.ts";

interface PluginConfig {
  name: string;
  globalName: string;
  version: string;
  source: {
    github: {
      account: string;
    };
  };
}

interface PluginsConfig {
  plugins: Array<PluginConfig>;
}

function gitClone(url: string, dest: string, branch = "master") {
  const cmd = [
    "git",
    "clone",
    "--quiet",
    "--depth",
    "1",
    "--branch",
    branch,
    url,
    dest,
  ];
  return Deno.run({ cmd });
}

function fetchRepo(account: string, name: string, dest: string) {
  const p = gitClone(
    `https://github.com/${account}/kbase-ui-plugin-${name}`,
    `${dest}/${name}`,
  );
  return p.status();
}

async function fetchPlugins(config: string, dest: string) {
  const pluginsRaw = await Deno.readTextFile(config);
  const pluginsConfig = parse(pluginsRaw) as unknown as PluginsConfig;
  for (const pluginConfig of pluginsConfig.plugins) {
    console.log(
      `Fetching ${pluginConfig.source.github.account}/${pluginConfig.name}...`,
    );
    await fetchRepo(
      pluginConfig.source.github.account,
      pluginConfig.name,
      dest,
    );
    console.log("...done");
  }
}

async function deleteDownloads(downloadDir: string) {
  await Deno.remove(downloadDir, { recursive: true });
}

async function unpackPlugins(source: string, dest: string) {
  const pluginPrefix = "dist/plugin";
  for await (const dirEntry of Deno.readDir(source)) {
    const installationPackage = `${source}/${dirEntry.name}/dist.tgz`;
    const archive = await Deno.readFile(installationPackage);
    const uncompressed = fflate.gunzipSync(archive);
    const reader = new Buffer(uncompressed);
    const untar = new Untar(reader);
    console.log(installationPackage, archive.byteLength);
    console.log("   untarring...");
    for await (const entry of untar) {
      // Handle directory entry
      if (!entry.fileName.startsWith(pluginPrefix)) {
        continue;
      }
      const adjustedName = entry.fileName.substring(pluginPrefix.length);
      const destFileOrDir = `${dest}/${dirEntry.name}/${adjustedName}`;
      if (entry.type === "directory") {
        await ensureDir(destFileOrDir);
        continue;
      }
      // Handle file entry.
      await ensureFile(destFileOrDir);
      const outputFile = await Deno.open(destFileOrDir, { write: true });
      await copy(entry, outputFile);
    }
    console.log("    done!");
  }
}

async function main() {
  if (Deno.args.length !== 2) {
    console.log("Usage: install-plugins.ts <config> <dest>");
    Deno.exit(1);
  }
  const config = Deno.args[0];
  const destinationDir = Deno.args[1];
  const downloadDest = `${destinationDir}/download`;
  const installDest = `${destinationDir}/plugins`;

  ensureDirSync(downloadDest);
  ensureDirSync(installDest);

  await fetchPlugins(config, downloadDest);
  await unpackPlugins(downloadDest, installDest);
  await deleteDownloads(downloadDest);
}

if (import.meta.main) {
  main();
}
