import { parse } from 'https://deno.land/std@0.109.0/flags/mod.ts';
import { stringify } from 'https://deno.land/std@0.109.0/encoding/yaml.ts';
import { exists } from 'https://deno.land/std@0.109.0/fs/mod.ts';

// const yargs = require('yargs');
// const yaml = require('js-yaml');
// const fs = require('fs');
// const exec = require('child_process').execSync;

// function getRoot() {
//     const out = exec('git rev-parse --show-toplevel', {
//         encoding: 'utf8'
//     });
//     return out.trim();
// }

// function mergePlugins(root, config, args) {
//     if (args.plugin) {
//         let pluginSpecs;
//         if (typeof args.plugin === 'string') {
//             pluginSpecs = [args.plugin];
//         } else {
//             pluginSpecs = args.plugin;
//         }

//         const plugins = pluginSpecs.map((pluginSpec) => {
//             const parts = pluginSpec.split(':');
//             if (parts.length === 1) {
//                 return {
//                     pluginName: parts[0],
//                     repoSuffix: parts[0]
//                 };
//             }
//             return {
//                 pluginName: parts[0],
//                 repoSuffix: parts[1]
//             };
//         });

//         plugins.forEach(({ pluginName, repoSuffix }) => {
//             const pluginRoot = `${root}/../kbase-ui-plugin-${repoSuffix}`;
//             let pluginDir = `${pluginRoot}/dist/plugin`;

//             if (!fs.existsSync(pluginDir)) {
//                 pluginDir = `${pluginRoot}/src/plugin`;
//                 if (!fs.existsSync(pluginDir)) {
//                     pluginDir = `${pluginRoot}/plugin`;
//                     if (!fs.existsSync(pluginDir)) {
//                         throw new Error(`Plugin directory not found: ${pluginDir}`);
//                     }
//                 }
//             }

//             config.services['kbase-ui'].volumes.push({
//                 type: 'bind',
//                 source: pluginDir,
//                 target: `/kb/deployment/services/kbase-ui/dist/modules/plugins/${pluginName}`
//             });
//         });
//     }
// }

// function mountStatic(root, config, args) {
//     if (args.mount_static) {
//         config.services['kbase-ui'].volumes.push({
//             type: 'bind',
//             source: `${root}/static`,
//             target: `/kb/deployment/services/kbase-ui/dist`
//         });
//     }
// }

// function mergeLibs(root, config, args) {
//     if (args.lib) {
//         let libs;
//         if (typeof args.lib === 'string') {
//             libs = [args.lib];
//         } else {
//             libs = args.lib;
//         }
//         libs.forEach((lib) => {
//             const [libName, path, moduleName] = lib.split(':');
//             config.services['kbase-ui'].volumes.push({
//                 type: 'bind',
//                 source: `${root}/../kbase-${libName}/${path}`,
//                 target: `/kb/deployment/services/kbase-ui/dist/modules/${moduleName}`
//             });
//         });
//     }
// }

async function mergeConfigDir(configDir: string, config: DockerComposeConfig) {
    //   const gitlabConfigDir = `${root}/dev/gitlab-config`;
    if (!(await exists(configDir))) {
        console.log(`Provided config dir ${configDir} does not exist`);
        Deno.exit(1);
    }

    console.log(`using config dir ${configDir}`);
    config.services['kbase-ui'].volumes.push({
        type: 'bind',
        source: configDir,
        target: '/kb/deployment/config',
    });
    return config;

    //   } else {
    //     console.log("using local configs");
    //     config.services["kbase-ui"].volumes.push({
    //       type: "bind",
    //       source: `${root}/deployment/config`,
    //       target: "/kb/deployment/config",
    //     });
    //   }
}

// function mergeDynamicServices(root, config, args) {
//     if (args.dynamic_services) {
//         let services;
//         if (typeof args.dynamic_services === 'string') {
//             services = [args.dynamic_services];
//         } else {
//             services = args.dynamic_services;
//         }
//         const proxy_env = `dynamic_service_proxies=${services.join(' ')}`;
//         config.services['kbase-ui'].environment.push(proxy_env);
//         config.services['kbase-ui-proxy'].environment.push(proxy_env);
//     }
// }

// function mergeServices(root, config, args) {
//     if (args.services) {
//         let services;
//         if (typeof args.services === 'string') {
//             services = [args.services];
//         } else {
//             services = args.services;
//         }
//         const proxy_env = `service_proxies=${services.join(' ')}`;
//         config.services['kbase-ui'].environment.push(proxy_env);
//         config.services['kbase-ui-proxy'].environment.push(proxy_env);
//     }
// }

// function mergeLocalNarrative(root, config, args) {
//     if (args.local_narrative) {
//         config.services['kbase-ui-proxy'].environment.push('local_narrative=true');
//     }
// }

// function mergeLocalNavigator(root, config, args) {
//     if (args.local_navigator) {
//         config.services['kbase-ui-proxy'].environment.push('local_navigator=true');
//     }
// }

// function mergeLocalTests(root, config) {
//     config.services['kbase-ui'].volumes.push({
//         type: 'volume',
//         source: 'integration-tests',
//         target: '/kb/deployment/services/kbase-ui/test'
//     });
//     const integrationTestsHostDirectory = [root, 'dev', 'test'].join('/');
//     config.volumes['integration-tests'] = {
//         driver: 'local',
//         driver_opts: {
//             type: 'none',
//             o: 'bind',
//             device: integrationTestsHostDirectory
//         }
//     };
// }

interface DockerComposeVolume {
    type: string;
    source: string;
    target: string;
}

interface DockerComposeConfig {
    version: string;
    services: {
        'kbase-ui': {
            volumes: Array<DockerComposeVolume>;
            environment: Array<string>;
        };
        'kbase-ui-proxy': {
            environment: Array<string>;
        };
    };
    volumes: { [volumeName: string]: DockerComposeVolume };
}

async function main() {
    const args = parse(Deno.args);

    if (args._.length !== 1) {
        console.log('Usage: docker-compose-override.ts <outputDir> <options>');
        Deno.exit(1);
    }

    const [outputDir] = args._;

    // TODO: very strange that deno complains that outputDir is number.
    // if (!(await exists(outputDir))) {
    //     console.log(`Output directory ${outputDir} does not exist`);
    //     Deno.exit(1);
    // }

    // console.log('root: ', typeof root, root, root.length);
    let config: DockerComposeConfig = {
        version: '3.6',
        services: {
            'kbase-ui': {
                volumes: [],
                environment: [],
            },
            'kbase-ui-proxy': {
                environment: [],
            },
        },
        volumes: {},
    };

    // mergePlugins(root, config, args);

    // mergeDynamicServices(root, config, args);

    // mergeServices(root, config, args);

    // mergeLocalNarrative(root, config, args);

    // mergeLocalNavigator(root, config, args);

    if ('config-dir' in args) {
        config = await mergeConfigDir(args['config-dir'], config);
    }

    const outputPath = [outputDir, 'docker-compose.override.yml'].join('/');

    const outputContents = new TextEncoder().encode(
        stringify(config as unknown as Record<string, unknown>)
    );
    Deno.writeFile(outputPath, outputContents);
}

// main(yargs.parse(process.argv.slice(2)));

if (import.meta.main) {
    main();
}
