/*global define*/
/*jslint white:true,browser:true */
define([
    'bluebird',
    'uuid',
    'kb_common/ajax'
        // 'https://www.google-analytics.com/analytics.js'
], function (Promise, Uuid, Ajax) {
    'use strict';

    function factory(config) {
        var code = config.code,
            host = config.host,
            uuid = new Uuid(4).format();

        function init(config) {
            // This is what the analytics plugin will look for when it loads.
            //window.GoogleAnalyticsObject = 'ga';
            // The ga object is simply a queue, until the analytics script loads.
//            window.ga = function () {
//                if (!window.ga.q) {
//                    window.ga.q = [];
//                }
//                window.ga.q.push(arguments);

//            };

            // Queue up the initialization 'create'
//            console.log(GA);
//            if (window.ga) {
//                window.ga('create', config.code, config.host || 'auto');
//            }

            // Asynchrously load the ga app -- it picks up the queue left in window.ga
//            return new Promise(function (resolve, reject) {
//                return require([
//                    '//www.google-analytics.com/analytics.js'
//                ], function () {                
//                    resolve();
//                }, function (err) {
//                    console.error('Error loading GA');
//                    console.error(err);
//                    reject(err);
//                });
//
//            });
        }

        function create() {

        }

        function encodeQuery(params) {
            return Object.keys(params).map(function (key) {
                return [encodeURIComponent(key), encodeURIComponent(params[key])].join('=');
            }).join('&');
        }

        function send(path) {
            var data = encodeQuery({
                v: 1,
                tid: code,
                cid: uuid,
                t: 'pageview',
                dp: path
            });
            // console.log('SENDING', data);
            Ajax.post({
                url: 'https://www.google-analytics.com/collect',
                header: {
                    'Content-type': 'application/x-www-form-urlencoded'
                },
                withCredentials: true,
                data: data
            })
                .then(function (result) {
                    //alert('yay, sent pageview to analytics');
                    // console.log(result);
                })
                .catch(function (err) {
                    //alert('boo, it failed. check the log');
                
                    console.error('ERROR sending to GA', err);
                });
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