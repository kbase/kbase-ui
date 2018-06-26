define([
    'bluebird',
    'uuid',
    'app/analytics',
    'kb_common_ts/Cookie'
], function (
    Promise,
    Uuid,
    GoogleAnalytics,
    Cookie
) {
    'use strict';

    function factory(config, params) {
        var runtime = params.runtime,
            analytics;

        function pageView(path) {
            return analytics.send(path);
        }

        function sendEvent(arg) {
            return analytics.sendEvent(arg);
        }

        function sendTiming(arg) {
            return analytics.sendTiming(arg);
        }

        function ensureCookie() {
            var cookieManager = new Cookie.CookieManager();
            // var cookieName = runtime.config('ui.services.analytics.cookie.name', 'kbase_client_id');
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
            return Promise.try(function () {
                var clientId = ensureCookie();
                analytics = GoogleAnalytics.make({
                    code: runtime.config('ui.services.analytics.google.code'),
                    hostname: runtime.config('ui.services.analytics.google.hostname'),
                    clientId: clientId
                });
                runtime.recv('route', 'routing', function (route) {
                    pageView(route.request.original);
                });
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
            pageView: pageView,
            sendEvent: sendEvent,
            sendTiming: sendTiming
        };
    }

    return {
        make: factory
    };
});
