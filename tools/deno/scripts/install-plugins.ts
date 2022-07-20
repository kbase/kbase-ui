import { parse } from 'https://deno.land/std@0.125.0/encoding/yaml.ts';
import { ensureDir, ensureDirSync, ensureFile } from 'https://deno.land/std@0.125.0/fs/mod.ts';
import * as fflate from 'https://cdn.skypack.dev/fflate?min';
import { Buffer } from 'https://deno.land/std@0.125.0/io/buffer.ts';
import { Untar } from 'https://deno.land/std@0.125.0/archive/tar.ts';
import { copy } from 'https://deno.land/std@0.125.0/io/util.ts';
import { Git, log } from './common.ts';

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

// TODO: clone with depth 1
function fetchRepo(account: string, name: string, version: string, dest: string) {
    return new Git(`${dest}`).clone(
        `https://github.com/${account}/kbase-ui-plugin-${name}`,
        name,
        version
    );
}

async function fetchPlugins(config: string, dest: string) {
    const pluginsRaw = await Deno.readTextFile(config);
    const pluginsConfig = parse(pluginsRaw) as unknown as PluginsConfig;
    for (const pluginConfig of pluginsConfig.plugins) {
        log(
            `Fetching ${pluginConfig.source.github.account}/${pluginConfig.name}...`,
            'fetchPlugins'
        );
        const branch = `v${pluginConfig.version}`;
        try {
            const result = await fetchRepo(
                pluginConfig.source.github.account,
                pluginConfig.name,
                branch,
                dest
            );
            console.log(`fetch result: ${result}`);
        } catch (ex) {
            throw new Error(`Error fetching repo ${pluginConfig.name}: ${ex.message}`);
        }
        log('...done');
    }
}

async function deleteDownloads(downloadDir: string) {
    await Deno.remove(downloadDir, { recursive: true });
}

async function unpackPlugins(source: string, dest: string) {
    // This is where plugin was built into before archiving.
    const pluginPathPrefix = 'dist/plugin';
    for await (const dirEntry of Deno.readDir(source)) {
        const installationPackage = `${source}/${dirEntry.name}/dist.tgz`;
        log(`Unzipping installation package "${installationPackage}`);
        const archive = await Deno.readFile(installationPackage);
        const uncompressed = fflate.gunzipSync(archive);
        const reader = new Buffer(uncompressed);
        const untar = new Untar(reader);
        log(`tar package: ${installationPackage}, size: ${archive.byteLength}`, 'unpackPlugins');
        log('untarring...', 'unpackPlugins');
        for await (const entry of untar) {
            // Handle directory entry
            if (!entry.fileName.startsWith(pluginPathPrefix)) {
                continue;
            }
            const adjustedName = entry.fileName.substring(pluginPathPrefix.length);
            const destFileOrDir = `${dest}/${dirEntry.name}/${adjustedName}`;
            if (entry.type === 'directory') {
                await ensureDir(destFileOrDir);
                continue;
            }
            // Handle file entry.
            await ensureFile(destFileOrDir);
            const outputFile = await Deno.open(destFileOrDir, { write: true });
            await copy(entry, outputFile);
        }
        log('done!', 'unpackPlugins');
    }
}

async function getYAML(path: string) {
    const pluginsRaw = await Deno.readTextFile(path);
    return parse(pluginsRaw);
}

async function generatePluginsManifest(uiConfig: string, source: string, dest: string) {
    const manifestFileName = `${dest}/plugin-manifest.json`;

    const pluginsConfig = (await getYAML(uiConfig)) as unknown as PluginsConfig;

    // const pluginsRaw = await Deno.readTextFile(uiConfig);
    // const pluginsConfig = parse(pluginsRaw) as unknown as PluginsConfig;

    log(`writing to manifest file ${manifestFileName}...`, 'generatePluginsManifest');
    const manifest = [];
    for await (const uiPluginConfig of pluginsConfig.plugins) {
        // Config is in the dest (also the source)
        const pluginInstallDir = `${dest}/${uiPluginConfig.name}`;
        const pluginSourceDir = `${source}/${uiPluginConfig.name}`;
        const configFileName = `${pluginInstallDir}/config.yml`;
        const pluginConfigRaw = new TextDecoder().decode(Deno.readFileSync(configFileName));
        const pluginConfig = parse(pluginConfigRaw);

        // Need to get git info from the source.
        log(`Getting git info from ${pluginSourceDir}`, 'generatePluginsManifest');
        const gitInfo = await new Git(pluginSourceDir).getInfo();
        manifest.push({
            install: {
                directory: pluginSourceDir,
            },
            configs: {
                plugin: pluginConfig,
                ui: uiPluginConfig,
            },
            git: gitInfo,
        });
    }
    await Deno.writeFile(
        manifestFileName,
        new TextEncoder().encode(JSON.stringify(manifest, null, 4))
    );
    log('done!', 'generatePluginsManifest');
}

// async function savePluginManifest(path) {
//   const root = state.environment.path;
//   const configDest = root.concat(['build', 'client', 'modules', 'config']);
//   const manifestPath = configDest.concat(['plugins-manifest.json']);
//   await mutant.saveJson(manifestPath, state.pluginsManifest);
//   return state;
// }

async function main() {
    if (Deno.args.length !== 2) {
        log('Usage: install-plugins.ts <config> <dest>');
        Deno.exit(1);
    }
    const config = Deno.args[0];
    const destinationDir = Deno.args[1];
    // const here = new URL('', import.meta.url).pathname;
    const downloadDest = `${destinationDir}/download`;
    const installDest = `${destinationDir}/plugins`;

    log(`Downloading into ${downloadDest}`, 'main');
    log(`Installing into ${installDest}`, 'main');

    ensureDirSync(downloadDest);
    ensureDirSync(installDest);

    // await deleteDownloads(downloadDest);
    await fetchPlugins(config, downloadDest);
    await unpackPlugins(downloadDest, installDest);
    await generatePluginsManifest(config, downloadDest, installDest);
    await deleteDownloads(downloadDest);
}

if (import.meta.main) {
    main();
}
