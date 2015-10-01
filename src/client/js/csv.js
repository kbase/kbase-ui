/*global define */
/*jslint white: true */
define([
    'promise',
    'jquery'
], function (Promise, $) {
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
                return e;
            });
        });
        return rows;
    }
    function load(path) {
        return Promise.resolve($.get(path))
            .then(function (result) {
                return parseCsv(result);
            })
    }
    
    return {
        load: load
    };
});