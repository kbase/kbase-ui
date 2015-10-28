/*global define */
/*jslint white: true, browser: true */
define(
    [
        "text"
    ],
    function (text) {
        'use strict';
        
        return {
            load: function (name, req, load, config) {
                if (!config.isBuild) {
                    req(["text!" + name], function (val) {
                        load(parseCsv(val));
                    });
                } else {
                    load("");
                }
            },
            loadFromFileSystem: function (plugin, name) {
                var fs = nodeRequire("fs"),
                    file = require.toUrl(name),
                    val = fs.readFileSync(file).toString();
                return 'define("' + plugin + '!' + name + '", function () {\nreturn ' + val + ';\n});\n';
            },
            write: function (pluginName, moduleName, write) {
                write(this.loadFromFileSystem(pluginName, moduleName));
            }
        };
    }
);