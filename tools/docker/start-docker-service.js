'use strict';

const yargs = require('yargs');
const yaml = require('js-yaml');
const fs = require('fs');
const exec = require('child_process').execSync;

function getRoot() {
    const out = exec('git rev-parse --show-toplevel', {
        encoding: 'utf8'
    });
    return out.trim();
}

function mergePlugins(root, config, args) {
    if (args.plugin) {
        let plugins;
        if (typeof args.plugin === 'string') {
            plugins = [args.plugin];
        } else {
            plugins = args.plugin;
        }
        plugins.forEach((pluginName) => {
            config.services['kbase-ui'].volumes.push({
                type: 'bind',
                source: root + '/../kbase-ui-plugin-' + pluginName + '/src/plugin',
                target: '/kb/deployment/services/kbase-ui/dist/modules/plugins/' + pluginName
            })
        });
    }
}

function mergeInternalPlugins(root, config, args) {
    if (args.internal) {
        let plugins;
        if (typeof args.internal === 'string') {
            plugins = [args.internal];
        } else {
            plugins = args.internal;
        }
        plugins.forEach((pluginName) => {
            config.services['kbase-ui'].volumes.push({
                type: 'bind',
                source: root + '/src/plugins/' + pluginName,
                target: '/kb/deployment/services/kbase-ui/dist/modules/plugins/' + pluginName
            })
        });
    }
}

function mergePaths(root, config, args) {
    if (args.path) {
        let paths;
        if (typeof args.path === 'string') {
            paths = [args.path];
        } else {
            paths = args.path;
        }
        paths.forEach((path) => {
            config.services['kbase-ui'].volumes.push({
                type: 'bind',
                source: [root, 'src/client/modules', path].join('/'),
                target: '/kb/deployment/services/kbase-ui/dist/modules/' + path
            })
        });
    }
}

function mergeLibs(root, config, args) {
    if (args.lib) {
        let libs;
        if (typeof args.lib === 'string') {
            libs = [args.lib];
        } else {
            libs = args.lib;
        }
        libs.forEach((lib) => {
            const [libName, path, moduleName] = lib.split(':');
            config.services['kbase-ui'].volumes.push({
                type: 'bind',
                source: root + '/../kbase-' + libName + '/' + path,
                target: '/kb/deployment/services/kbase-ui/dist/modules/' + moduleName
            })
        });
    }
}

function main(args) {
    const root = getRoot();

    console.log('root: ', typeof root, root, root.length);
    const config = {
        version: '3.6',
        services: {
            'kbase-ui': {
                volumes: []
            }
        }
    };

    mergePlugins(root, config, args);

    mergeInternalPlugins(root, config, args);

    mergeLibs(root, config, args);

    mergePaths(root, config, args);

    const outputPath = [root, 'dev', 'docker-compose.override.yml'].join('/');
    fs.writeFileSync(outputPath, yaml.safeDump(config));
}

main(yargs.parse(process.argv.slice(2)));