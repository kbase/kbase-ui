/*global define */
/*jslint white: true, browser: true */
define([
    'bluebird',
    'app/analytics'
], function (Promise, GoogleAnalytics) {
    'use strict';
    function factory(config) {
        var runtime = config.runtime, 
            analytics = GoogleAnalytics.make({
                code: runtime.config('resources.googleAnalytics.code'),
                host: runtime.config('deployment.hostname')
            });

        

        function pageView(path) {
            analytics.send(path);
        }

        // API

        function start() {
//            return analytics.init({
//                code: runtime.config('resources.googleAnalytics.code'),
//                host: runtime.config('deployment.hostname')
//            });
        }
        function stop() {
            // nothing to do?
//            return Promise.try(function () {
//                return true;
//            });
        }

        return {
            start: start,
            stop: stop,
            pageView: pageView
        };
    }

    return {
        make: function (config) {
            return factory(config);
        }
    };
});