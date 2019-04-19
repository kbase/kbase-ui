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
            });
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
            });
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
            });
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
            });
        });
    }
}

function mergeConfig(root, config, args) {
    const gitlabConfigDir = root + '/dev/gitlab-config';
    if (fs.existsSync(gitlabConfigDir)) {
        console.log('using gitlab configs');
        config.services['kbase-ui'].volumes.push({
            type: 'bind',
            source: gitlabConfigDir,
            target: '/kb/deployment/config'
        });
    } else {
        console.log('using local configs');
        config.services['kbase-ui'].volumes.push({
            type: 'bind',
            source: root + '/deployment/config',
            target: '/kb/deployment/config'
        });
    }
}

function mergeDynamicServices(root, config, args) {
    if (args.dynamic_services) {
        let services;
        if (typeof args.dynamic_services === 'string') {
            services = [args.dynamic_services];
        } else {
            services = args.dynamic_services;
        }
        const proxy_env = 'dynamic_service_proxies=' + services.join(' ');
        config.services['kbase-ui'].environment.push(proxy_env);
        config.services['kbase-ui-proxy'].environment.push(proxy_env);
    }
}

function mergeLocalNarrative(root, config, args) {
    if (args.local_narrative) {
        config.services['kbase-ui-proxy'].environment.push('local_narrative=true');
    }
}

function mergeLocalTests(root, config, args) {
    config.services['kbase-ui'].volumes.push({
        type: 'volume',
        source: 'integration-tests',
        target: '/kb/deployment/services/kbase-ui/test'
    });
    const integrationTestsHostDirectory = [root, 'dev', 'test'].join('/');
    config.volumes['integration-tests'] = {
        driver: 'local',
        driver_opts: {
            type: 'none',
            o: 'bind',
            device: integrationTestsHostDirectory
        }
    };
}

function main(args) {
    const root = getRoot();

    console.log('root: ', typeof root, root, root.length);
    const config = {
        version: '3.6',
        services: {
            'kbase-ui': {
                volumes: [],
                environment: []
            },
            'kbase-ui-proxy': {
                environment: []
            }
        },
        volumes: {}
    };

    mergePlugins(root, config, args);

    mergeInternalPlugins(root, config, args);

    mergeLibs(root, config, args);

    mergePaths(root, config, args);

    mergeDynamicServices(root, config, args);

    mergeLocalNarrative(root, config, args);

    mergeConfig(root, config, args);

    mergeLocalTests(root, config, args);

    const outputPath = [root, 'dev', 'docker-compose.override.yml'].join('/');
    fs.writeFileSync(outputPath, yaml.safeDump(config));
}

main(yargs.parse(process.argv.slice(2)));
