define([
    'text'
], function (text) {
    'use strict';

    function parseCsv(s) {
        // stoopid first pass.
        var lines = s.split(/\n/);
        var rows = lines.map(function (line) {
            return line.split(/,/).map(function (d) {
                var e = d.trim();
                if (e.charAt(0) === '"') {
                    return e.replace(/"/g, '');
                } else {
                    var n;
                    if (e.match(/\./)) {
                        n = parseFloat(e);
                    } else {
                        n = parseInt(e);
                    }
                    if (!isNaN(n)) {
                        return n;
                    }
                    return e;
                }
            });
        });
        return rows;
    }

    return {
        load: function (name, req, load, config) {
            if (!config.isBuild) {
                req(['text!' + name], function (val) {
                    load(parseCsv(val));
                });
            } else {
                load('');
            }
        },
        write: function (pluginName, moduleName, write) {
            write(this.loadFromFileSystem(pluginName, moduleName));
        }
    };
});