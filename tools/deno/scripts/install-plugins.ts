import * as fflate from 'https://cdn.skypack.dev/fflate?min';
import { Untar } from 'https://deno.land/std@0.192.0/archive/untar.ts';
import { parse } from 'https://esm.sh/yaml@2.3.1';

import { ensureDir, ensureDirSync, ensureFile } from 'https://deno.land/std@0.192.0/fs/mod.ts';
import { Buffer } from 'https://deno.land/std@0.192.0/io/buffer.ts';
import { copyN } from 'https://deno.land/std@0.192.0/io/copy_n.ts';
import { readerFromStreamReader } from 'https://deno.land/std@0.192.0/streams/mod.ts';
import { Git, log } from './common.ts';
import { PluginConfig, PluginInfoRelease, PluginInfoRepo, PluginInfoType, PluginUIConfig, PluginsInfo, UIPluginsConfig } from './info.ts';

const BUF_SIZE = 1000000; // 1MB buffer

interface PluginsConfig {
    plugins: Array<PluginUIConfig>;
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
        if (pluginConfig.source.github.release === true) {
            continue;
        }
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
            console.error('error fetching repo', ex.message, ex);
            throw new Error(`Error fetching repo ${pluginConfig.name}: ${ex.message}`);
        }
        log('...done');
    }
}

async function fetchPluginsReleaseDist(config: string, dest: string) {
    const pluginsRaw = await Deno.readTextFile(config);
    const pluginsConfig = parse(pluginsRaw) as unknown as PluginsConfig;
    for (const pluginConfig of pluginsConfig.plugins) {
        if (pluginConfig.source.github.release !== true) {
            continue;
        }
        log(
            `Fetching ${pluginConfig.source.github.account}/${pluginConfig.name} ...`,
            'fetchPluginsReleaseDist'
        );
        const tag = `v${pluginConfig.version}`;
        try {
            const result = await fetchReleaseDist(
                pluginConfig.source.github.account,
                pluginConfig.name,
                dest,
                tag
            );
        } catch (ex) {
            console.log('error', ex);
            throw new Error(`Error fetching plugin ${pluginConfig.name}: ${ex.message}`);
        }
        log('...done');
    }
}

async function fetchReleaseDist(gitAccount: string, pluginName: string, dest: string, tag: string) {
    const releaseURL = `https://api.github.com/repos/${gitAccount}/kbase-ui-plugin-${pluginName}/releases/tags/${tag}`
    // TODO: github token
    const headers = {
        Accept: 'application/vnd.github+json',
        Authorization: 'Bearer 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'
    }
    const response = await fetch(releaseURL, { headers });
    const release = (await response.json()) as { assets: Array<{ name: string, url: string }> }

    if (!release) {
        throw new Error(`[fetchReleaseDist] release returned is empty: ${response.status}, ${response.statusText}`)
    }

    if (!release.assets) {
        throw new Error(`[fetchReleaseDist] assets returned is empty: ${response.status}, ${response.statusText}`)
    }

    const { url } = release.assets.filter(({ name }) => {
        return name === 'dist.tgz';
    })[0];

    log(
        `fetch release dist url: ${url}`,
        'fetchReleaseDist'
    );

    const response2 = await fetch(url, {
        headers: {
            Accept: 'application/octet-stream'
        }
    });

    log(
        `fetch release dist response: ${response2.status}, ${response2.statusText}, ${Array.from(response2.headers.entries()).map(([k, v]) => { return `${k}:${v}` }).join(', ')}`,
        'fetchReleaseDist'
    );

    const rdr = response2.body?.getReader();
    if (rdr) {
        await Deno.mkdir(`${dest}/${pluginName}`, { recursive: true })
        const r = readerFromStreamReader(rdr);
        log('Opening...', 'fetchReleaseDist');
        const f = await Deno.open(`${dest}/${pluginName}/dist.tgz`, { create: true, write: true });
        log('Copying...', 'fetchReleaseDist');

        let nread = null;
        do {
            nread = await copyN(r, f, BUF_SIZE);
        } while (nread === BUF_SIZE)
        log('Done...', 'fetchReleaseDist');
        f.close();
    }
}

async function deleteDirectory(dir: string) {
    try {
        await Deno.remove(dir, { recursive: true });
    } catch (ex) {
        if (ex instanceof Deno.errors.NotFound) {
            return;
        }
        throw ex;
    }
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

            let nread = null;
            do {
                nread = await copyN(entry, outputFile, BUF_SIZE);
            } while (nread === BUF_SIZE)

        }
        log('done!', 'unpackPlugins');
    }
}

async function getYAML(path: string) {
    const pluginsRaw = await Deno.readTextFile(path);
    return parse(pluginsRaw);
}

export enum PluginType {
    GIT_REPO
}

async function generatePluginsManifest(uiConfig: string, source: string, dest: string) {
    const manifestFileName = `${dest}/plugin-manifest.json`;

    const pluginsConfig = (await getYAML(uiConfig)) as unknown as UIPluginsConfig;

    // const pluginsRaw = await Deno.readTextFile(uiConfig);
    // const pluginsConfig = parse(pluginsRaw) as unknown as PluginsConfig;

    log(`writing to manifest file ${manifestFileName}...`, 'generatePluginsManifest');
    const manifest: PluginsInfo = [];
    for await (const uiPluginConfig of pluginsConfig.plugins) {
        // Config is in the dest (also the source)
        const pluginInstallDir = `${dest}/${uiPluginConfig.name}`;
        const pluginSourceDir = `${source}/${uiPluginConfig.name}`;
        const configFileName = `${pluginInstallDir}/config.yml`;
        let pluginConfigRaw;
        try {
            console.log('about to read', configFileName);
            const raw = Deno.readFileSync(configFileName);
            console.log('got raw');
            pluginConfigRaw = new TextDecoder().decode(raw);
        } catch (ex) {
            console.error('ERROR reading config file', configFileName);
        }
        const pluginConfig = parse(pluginConfigRaw) as PluginConfig;

        if (uiPluginConfig.source.github.release === true) {
            manifest.push({
                type: PluginInfoType.GITHUB_RELEASE,
                install: {
                    directory: pluginSourceDir,
                },
                configs: {
                    plugin: pluginConfig,
                    ui: uiPluginConfig,
                },
            } as PluginInfoRelease);
        } else {
            // Need to get git info from the source.
            log(`Getting git info from ${pluginSourceDir}`, 'generatePluginsManifest');
            const gitInfo = await new Git(pluginSourceDir).getInfo();
            manifest.push({
                type: PluginInfoType.GIT_REPO,
                install: {
                    directory: pluginSourceDir,
                },
                configs: {
                    plugin: pluginConfig,
                    ui: uiPluginConfig,
                },
                git: gitInfo,
            } as PluginInfoRepo);
        }
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
    if (Deno.args.length < 2) {
        log('Usage: install-plugins.ts <config> <dest>');
        Deno.exit(1);
    }
    const config = Deno.args[0];
    const destinationDir = Deno.args[1];
    const pluginFilter = Deno.args[2];
    // const here = new URL('', import.meta.url).pathname;
    const downloadDest = `${destinationDir}/download`;
    const installDest = `${destinationDir}/plugins`;

    log(`Downloading into ${downloadDest}`, 'main');
    log(`Installing into ${installDest}`, 'main');

    await deleteDirectory(downloadDest);
    await deleteDirectory(installDest);

    ensureDirSync(downloadDest);
    ensureDirSync(installDest);


    await fetchPlugins(config, downloadDest);
    await fetchPluginsReleaseDist(config, downloadDest);
    await unpackPlugins(downloadDest, installDest);
    await generatePluginsManifest(config, downloadDest, installDest);
    await deleteDirectory(downloadDest);
}

if (import.meta.main) {
    main();
}
