/*global define */
/*jslint white: true, browser: true */
define([
    'bluebird',
    'uuid',
    'app/analytics',
    'kb_common_ts/Cookie'
], function(
    Promise,
    Uuid,
    GoogleAnalytics,
    Cookie
) {
    'use strict';

    function factory(config) {
        var runtime = config.runtime,
            analytics = GoogleAnalytics.make({
                code: runtime.config('ui.services.analytics.googleAnalytics.code'),
                host: runtime.config('deployment.hostname')
            });

        function pageView(path, clientId) {
            analytics.send(path, clientId);
        }

        function ensureCookie() {
            var cookieManager = new Cookie.CookieManager();
            var cookieName = runtime.config('ui.services.analytics.cookie.name', 'kbase_client_id');
            var analyticsCookie = cookieManager.getItem('kbase_client_id');
            if (!analyticsCookie) {
                analyticsCookie = new Uuid(4).format();
                // 2 year cookie, per Google recommendation.
                var maxAge = runtime.config('ui.services.analytics.cookie.maxAge', 60 * 60 * 24 * 365 * 2);
                cookieManager.setItem(new Cookie.Cookie('kbase_client_id')
                    .setValue(analyticsCookie)
                    .setPath('/')
                    .setMaxAge(maxAge)
                    .setSecure(true));
            }
            return analyticsCookie;
        }

        // API

        function start() {
            return Promise.try(function() {
                var clientId = ensureCookie();
                runtime.recv('route', 'routing', function(route) {
                    pageView(route.request.original, clientId);
                });
                // window.addEventListener('hashchange', function(e) {

                // });
                // eventListeners.push({
                //     target: window,
                //     type: 'hashchange',
                //     listener: function(e) {

                //     }
                // });
                // eventListeners.forEach(function(listener) {
                //     listener.target.addEventListener(listener.type, listener.listener);
                // });
            });
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
        make: function(config) {
            return factory(config);
        }
    };
});