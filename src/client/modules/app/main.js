define([
    'bluebird',
    'uuid',
    './hub',
    'kb_lib/props',
    'kb_knockout/load',
    '../lib/utils',

    'yaml!config/plugin.yml',
    'json!config/config.json',
    'json!deploy/config.json',

    // For effect
    'bootstrap',
    'css!font_awesome',
    'css!app/styles/kb-bootstrap',
    'css!app/styles/kb-icons',
    'css!app/styles/kb-ui',
    'css!app/styles/kb-datatables'
], function (Promise, Uuid, Hub, props, knockoutLoader, utils, pluginConfig, appConfigBase, deployConfig) {
    'use strict';

    // Set up global configuration of bluebird promises library.
    // This is the first invocation of bluebird.
    Promise.config({
        warnings: true,
        longStackTraces: true,
        cancellation: true
    });

    function fixConfig(config) {
        // TODO: use a library call for this.
        function get(obj, props) {
            if (typeof props === 'string') {
                props = props.split('.');
            } else if (!(props instanceof Array)) {
                throw new TypeError('Invalid type for key: ' + typeof props);
            }
            for (let i = 0; i < props.length; i += 1) {
                if (obj === undefined || typeof obj !== 'object' || obj === null) {
                    throw new Error('Invalid object path: ' + props.join('.') + ' at ' + i);
                }
                obj = obj[props[i]];
            }
            if (obj === undefined) {
                throw new Error('No value found on object path: ' + props.join('.'));
            } else {
                return obj;
            }
        }

        function fix(str) {
            let parsing = false;
            const parsed = [];
            let pos = 0;
            do {
                var tagStart = str.indexOf('{{', pos);
                if (tagStart < 0) {
                    parsing = false;
                    break;
                }
                parsed.push(str.substr(pos, tagStart));
                tagStart += 2;
                const tagEnd = str.indexOf('}}', tagStart);
                if (tagEnd < 0) {
                    throw new Error('Tag not terminated in ' + str + ' at ' + tagStart);
                }
                pos = tagEnd + 2;
                const tag = str.substr(tagStart, tagEnd - tagStart).trim(' ');
                if (tag.length === 0) {
                    continue;
                }
                parsed.push(get(config, tag));
            } while (parsing);
            parsed.push(str.substr(pos));
            return parsed.join('');
        }

        function fixit(branch) {
            Object.keys(branch).forEach((key) => {
                const value = branch[key];
                if (typeof value === 'string') {
                    branch[key] = fix(value);
                } else if (utils.isSimpleObject(value)) {
                    fixit(value);
                } else if (value instanceof Array) {
                    value.forEach((v) => {
                        if (utils.isSimpleObject(v)) {
                            fixit(v);
                        }
                    });
                }
            });
        }
        fixit(config);
        return config;
    }

    // establish a global root namespace upon which we can
    // hang sine-qua-non structures, which at this time is
    // just the app.
    const globalRef = new Uuid(4).format();
    const global = (window[globalRef] = new props.Props());

    function start() {
        // merge the deploy and app config.
        const merged = utils.mergeObjects([appConfigBase, deployConfig]);
        const appConfig = fixConfig(merged);
        const app = new Hub({
            appConfig: appConfig,
            nodes: {
                root: {
                    selector: '#root'
                }
            },
            plugins: pluginConfig.plugins,
            services: appConfig.ui.services
        });
        global.setItem('app', app);
        return knockoutLoader.load().then((ko) => {
            // Knockout Defaults
            ko.options.deferUpdates = true;

            return app.start();
        });
    }

    return { start };
});
