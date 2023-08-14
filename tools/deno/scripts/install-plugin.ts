import * as fflate from 'https://cdn.skypack.dev/fflate?min';
import { Untar } from 'https://deno.land/std@0.192.0/archive/untar.ts';
import { parse } from 'https://esm.sh/yaml@2.3.1';

import { ensureDir, ensureDirSync, ensureFile } from 'https://deno.land/std@0.192.0/fs/mod.ts';
import { Buffer } from 'https://deno.land/std@0.192.0/io/buffer.ts';
import { copyN } from 'https://deno.land/std@0.192.0/io/copy_n.ts';
import { readerFromStreamReader } from 'https://deno.land/std@0.192.0/streams/mod.ts';
import { Git, log } from './common.ts';
import { PluginConfig, PluginInfo, PluginInfoRepo, PluginInfoType, PluginUIConfig } from './info.ts';

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

async function getPluginUIConfig(config: string, pluginName: string) {
    const pluginsRaw = await Deno.readTextFile(config);
    const pluginsConfig = parse(pluginsRaw) as unknown as PluginsConfig;
    const [pluginConfig] = pluginsConfig.plugins.filter((config) => {
        return (config.name === pluginName);
    });

    if (!pluginConfig) {
        throw new Error(`Plugin ${pluginName} not available`);
    }

    return pluginConfig;
}


async function getPluginConfig(dest: string) {
    const pluginInstallDir = `${dest}`;
    // const pluginSourceDir = `${source}/${uiPluginConfig.name}`;
    const configFileName = `${pluginInstallDir}/config.yml`;
    let pluginConfigRaw;
    try {
        const raw = Deno.readFileSync(configFileName);
        pluginConfigRaw = new TextDecoder().decode(raw);
    } catch (ex) {
        console.error('ERROR reading config file', configFileName);
    }
    return parse(pluginConfigRaw) as PluginConfig;
}

async function fetchPluginReleaseDist(pluginConfig: PluginUIConfig, dest: string, ghToken: string) {
    if (pluginConfig.source.github.release !== true) {
        throw new Error('Not a "release" plugin');
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
            tag,
            ghToken
        );
        log('...done');
        return result;
    } catch (ex) {
        console.log('error', ex);
        throw new Error(`Error fetching plugin ${pluginConfig.name}: ${ex.message}`);
    }


}

async function fetchReleaseDist(gitAccount: string, pluginName: string, dest: string, tag: string, ghToken: string) {
    const releaseURL = `https://api.github.com/repos/${gitAccount}/kbase-ui-plugin-${pluginName}/releases/tags/${tag}`
    // TODO: github token
    const headers = {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${ghToken}`
    }
    console.log('AUTH', ghToken);
    const response = await fetch(releaseURL, { headers });

    if (response.status !== 200) {
        throw new Error(`[fetchReleaseDist] error response ${response.status}: ${response.statusText}`);
    }

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
        `fetch release dist response: ${response2.status}, ${response2.statusText}`,
        'fetchReleaseDist'
    );

    const rdr = response2.body?.getReader();
    if (rdr) {
        await Deno.mkdir(`${dest}`, { recursive: true })
        const r = readerFromStreamReader(rdr);
        const f = await Deno.open(`${dest}/dist.tgz`, { create: true, write: true });

        let nread = null;
        do {
            nread = await copyN(r, f, BUF_SIZE);
        } while (nread === BUF_SIZE)
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

async function unpackPlugin(source: string, dest: string) {
    // This is where plugin was built into before archiving.
    const pluginPathPrefix = 'dist/plugin';
    const installationPackage = `${source}/dist.tgz`;
    log(`Unzipping installation package "${installationPackage}`);
    const archive = await Deno.readFile(installationPackage);
    const uncompressed = fflate.gunzipSync(archive);
    const reader = new Buffer(uncompressed);
    const untar = new Untar(reader);
    log(`  tar package: ${installationPackage}, size: ${archive.byteLength}`, 'unpackPlugins');
    for await (const entry of untar) {
        // Handle directory entry
        if (!entry.fileName.startsWith(pluginPathPrefix)) {
            continue;
        }
        const adjustedName = entry.fileName.substring(pluginPathPrefix.length);
        const destFileOrDir = `${dest}/${adjustedName}`;
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
}

async function getYAML(path: string) {
    const pluginsRaw = await Deno.readTextFile(path);
    return parse(pluginsRaw);
}

async function getJSON(path: string) {
    const pluginsRaw = await Deno.readTextFile(path);
    return JSON.parse(pluginsRaw);
}

export enum PluginType {
    GIT_REPO
}


async function updatePluginManifest(
    pluginUIConfig: PluginUIConfig,
    pluginConfig: PluginConfig,
    source: string,
    installDest: string
) {
    // const dest = `${installDest}/${pluginUIConfig.name}`;
    const manifestFileName = `${installDest}/plugin-manifest.json`;

    // const pluginsConfig = (await getYAML(uiConfig)) as unknown as UIPluginsConfig;

    const manifest = (await getJSON(manifestFileName) as unknown as Array<PluginInfo>);

    // const pluginsRaw = await Deno.readTextFile(uiConfig);
    // const pluginsConfig = parse(pluginsRaw) as unknown as PluginsConfig;

    log(`writing to manifest file ${manifestFileName}...`, 'generatePluginsManifest');

    const pluginSourceDir = `${source}/${pluginUIConfig.name}`;

    if (pluginUIConfig.source.github.release === true) {
        manifest.push({
            type: PluginInfoType.GITHUB_RELEASE,
            install: {
                directory: pluginSourceDir,
            },
            configs: {
                plugin: pluginConfig,
                ui: pluginUIConfig,
            },
        });
    } else {
        // Need to get git info from the source.
        log(`Getting git info from ${pluginSourceDir}`, 'generatePluginsManifest');
        const gitInfo = await new Git(pluginSourceDir).getInfo();
        manifest
            .filter((entry) => {
                return (entry.configs.ui.name !== pluginUIConfig.name);
            })
            .push({
                type: PluginInfoType.GIT_REPO,
                install: {
                    directory: pluginSourceDir,
                },
                configs: {
                    plugin: pluginConfig,
                    ui: pluginUIConfig,
                },
                git: gitInfo,
            } as PluginInfoRepo);
    }
    // }
    await Deno.writeFile(
        manifestFileName,
        new TextEncoder().encode(JSON.stringify(manifest, null, 4))
    );
    log('done!', 'updatePluginManifest');
}

// async function savePluginManifest(path) {
//   const root = state.environment.path;
//   const configDest = root.concat(['build', 'client', 'modules', 'config']);
//   const manifestPath = configDest.concat(['plugins-manifest.json']);
//   await mutant.saveJson(manifestPath, state.pluginsManifest);
//   return state;
// }

async function main() {
    if (Deno.args.length < 4) {
        log(`Incorrect number of args ${Deno.args.length}`)
        log('Usage: install-plugins.ts <config> <dest> <ghtoken> <plugin>');
        Deno.exit(1);
    }
    const config = Deno.args[0];
    const destinationDir = Deno.args[1];
    const ghToken = Deno.args[2];
    const pluginName = Deno.args[3];

    log(`Parameters`, 'main');
    log(`config: ${config}`, 'main');
    log(`dest: ${destinationDir}`, 'main');
    log(`gh token: ${ghToken}`, 'main');
    log(`plugin: ${pluginName}`, 'main');


    const downloadDest = `${destinationDir}/download/${pluginName}`;
    const installDest = `${destinationDir}/plugins`;
    const pluginInstallDest = `${installDest}/${pluginName}`


    // const here = new URL('', import.meta.url).pathname;

    // TODO: CHeck that plugin is defined.
    const pluginUIConfig = await getPluginUIConfig(config, pluginName);

    console.log('GOT IT', pluginUIConfig);


    log(`Downloading into ${downloadDest}`, 'main');
    log(`Installing into ${installDest}`, 'main');

    // Ensure that any previously installed plugin is removed.
    await deleteDirectory(downloadDest);
    await deleteDirectory(pluginInstallDest);


    ensureDirSync(downloadDest);
    ensureDirSync(pluginInstallDest);


    // await fetchPlugins(config, downloadDest);
    await fetchPluginReleaseDist(pluginUIConfig, downloadDest, ghToken);
    await unpackPlugin(downloadDest, pluginInstallDest);

    const pluginConfig = await getPluginConfig(pluginInstallDest);

    await updatePluginManifest(pluginUIConfig, pluginConfig, downloadDest, installDest);
    await deleteDirectory(downloadDest);
}

if (import.meta.main) {
    main();
}
