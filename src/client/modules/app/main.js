define([
    'bluebird',
    'uuid',
    './hub',
    'kb_common/props',
    'yaml!config/plugin.yml',
    'json!config/config.json',
    'json!deploy/config.json',
    'bootstrap',
    'css!font_awesome',
    'css!app/styles/kb-bootstrap',
    'css!app/styles/kb-icons',
    'css!app/styles/kb-ui',
    'css!app/styles/kb-datatables'
], function (
    Promise,
    Uuid,
    Hub,
    Props,
    pluginConfig,
    appConfigBase,
    deployConfig
) {
    'use strict';

    // Set up global configuration of bluebird promises library.
    // This is the first invocation of bluebird.
    Promise.config({
        warnings: true,
        longStackTraces: true,
        cancellation: true
    });

    function isSimpleObject(obj) {
        if (typeof obj !== 'object' || obj === null) {
            return false;
        }
        return Object.getPrototypeOf(obj) === Object.getPrototypeOf({});
    }

    function mergeObjects(listOfObjects) {
        function merge(obj1, obj2, keyStack) {
            Object.keys(obj2).forEach(function (key) {
                var obj1Value = obj1[key];
                var obj2Value = obj2[key];
                var obj1Type = typeof obj1Value;
                var obj2Type = typeof obj2Value;
                if (obj1Type === 'undefined' || obj1Value === null) {
                    // undefined or null properties are always overwritable
                    obj1[key] = obj2[key];
                } else if (isSimpleObject(obj1Value) && isSimpleObject(obj2Value)) {
                    // thread through objects.
                    keyStack.push(key);
                    merge(obj1Value, obj2Value, keyStack);
                    keyStack.pop();
                } else if (obj1Type === obj2Type) {
                    // same typed values may be overwritten, but with a warning.
                    obj1[key] = obj2[key];
                } else {
                    console.error('Unmergable at ' + keyStack.join('.') + ':' + key, obj1Type, obj1Value, obj2Type, obj2Value);
                    throw new Error('Unmergable at ' + keyStack.join('.') + ':' + key);
                }
            });
        }
        var base = JSON.parse(JSON.stringify(listOfObjects[0]));
        for (var i = 1; i < listOfObjects.length; i += 1) {
            merge(base, listOfObjects[i], []);
        }
        return base;
    }

    function fixConfig(config) {
        function get(obj, props) {
            if (typeof props === 'string') {
                props = props.split('.');
            } else if (!(props instanceof Array)) {
                throw new TypeError('Invalid type for key: ' + (typeof props));
            }
            var i;
            for (i = 0; i < props.length; i += 1) {
                if ((obj === undefined) ||
                    (typeof obj !== 'object') ||
                    (obj === null)) {
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
            var parsing = false;
            var parsed = [];
            var pos = 0;
            do {
                var tagStart = str.indexOf('{{', pos);
                if (tagStart < 0) {
                    parsing = false;
                    break;
                }
                parsed.push(str.substr(pos, tagStart));
                tagStart += 2;
                var tagEnd = str.indexOf('}}', tagStart);
                if (tagEnd < 0) {
                    throw new Error('Tag not terminated in ' + str + ' at ' + tagStart);
                }
                pos = tagEnd + 2;
                var tag = str.substr(tagStart, (tagEnd - tagStart)).trim(' ');
                if (tag.length === 0) {
                    continue;
                }
                parsed.push(get(config, tag));
            } while (parsing);
            parsed.push(str.substr(pos));
            return parsed.join('');
        }

        function fixit(branch) {
            Object.keys(branch).forEach(function (key) {
                var value = branch[key];
                if (typeof value === 'string') {
                    branch[key] = fix(value);
                } else if (isSimpleObject(value)) {
                    fixit(value);
                }
            });
        }
        fixit(config);
        return config;
    }

    // establish a global root namespace upon which we can
    // hang sine-qua-non structures, which at this time is
    // just the app.
    var globalRef = new Uuid(4).format();
    var global = window[globalRef] = Props.make();

    return {
        start: function () {
            // merge the deploy and app config.
            var merged = mergeObjects([appConfigBase, deployConfig]);
            var appConfig = fixConfig(merged);
            var app = Hub.make({
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
            return app.start();
        }
    };
});
