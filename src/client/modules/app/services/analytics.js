/*global define */
/*jslint white: true, browser: true */
define([
    'bluebird',
    'app/analytics'
], function (Promise, GoogleAnalytics) {
    'use strict';
    function factory(config) {
        var runtime = config.runtime, analytics = GoogleAnalytics.make(config);

        function page() {
            analytics.send('pageview');
        }

        // API

        function start() {
            return analytics.init({
                code: runtime.config('resources.googleAnalytics.code'),
                host: runtime.config('deployment.hostname')
            });
        }
        function stop() {
            // nothing to do?
            return Promise.try(function () {
                return true;
            });
        }

        return {
            start: start,
            stop: stop,
            page: page
        };
    }

    return {
        make: function (config) {
            return factory(config);
        }
    };
});