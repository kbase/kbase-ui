/*global define */
/*jslint white: true */
define([
    'md5'
], function (md5) {
    'use strict';
    function factory(config) {
        var gravatarDefaults = [{
                id: 'mm',
                label: 'Mystery Man - simple, cartoon-style silhouetted outline'
            }, {
                id: 'identicon',
                label: 'Identicon - a geometric pattern based on an email hash'
            }, {
                id: 'monsterid',
                label: 'MonsterID - generated "monster" with different colors, faces, etc'
            }, {
                id: 'wavatar',
                label: 'Wavatar - generated faces with differing features and backgrounds'
            }, {
                id: 'retro',
                label: 'Retro - 8-bit arcade-style pixelated faces'
            }, {
                id: 'blank',
                label: 'Blank - A Blank Space'
            }];
        function makeGravatarUrl(email, size, rating, gdefault) {
            var md5Hash = md5.hash(email),
                url = 'https://www.gravatar.com/avatar/' + md5Hash + '?s=' + size + '&amp;r=' + rating + '&d=' + gdefault;
            return url;
        }

        return {
            makeGravatarUrl: makeGravatarUrl
        };
    }
    return {
        make: function (config) {
            return factory(config);
        }
    };
});