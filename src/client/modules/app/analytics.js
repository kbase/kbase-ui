/*global define*/
/*jslint white:true,browser:true */
define([
    'bluebird'
], function (Promise) {
    'use strict';
    
    function factory(config) {
        var gaLoaded = false;

        function init(config) {
            // This is what the analytics plugin will look for when it loads.
            window.GoogleAnalyticsObject = 'ga';
            // The ga object is simply a queue, until the analytics script loads.
            window.ga = function () {
                if (!window.ga.q) {
                    window.ga.q = [];
                }
                window.ga.q.push(arguments);
            }

            // Queue up the initialization 'create'
            window.ga('create', config.code, config.host || 'auto');

            // Asynchrously load the ga app -- it picks up the queue left in window.ga
            return new Promise(function (resolve, reject) {
                return require([
                    '//www.google-analytics.com/analytics.js'
                ], function () {                
                    resolve();
                }, function (err) {
                    console.error('Error loading GA');
                    console.error(err);
                    reject(err);
                });

            })
        }

        function send(what) {
            if (window.ga) {
                window.ga('send', what || 'pageview');
            }
        }

        return {
            init: init,
            send: send
        };
    }
    
    return {
        make: function (config) {
            return factory(config);
        }
    };

});