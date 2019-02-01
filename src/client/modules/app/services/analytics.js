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
        const runtime = params.runtime;
        let analytics;

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
            const cookieManager = new Cookie.CookieManager();
            const cookieName = runtime.config('ui.services.analytics.cookie.name');
            const cookieDomain = runtime.config('ui.services.analytics.cookie.domain', null);
            let analyticsCookie = cookieManager.getItem(cookieName);
            if (!analyticsCookie) {
                analyticsCookie = new Uuid(4).format();
                // 2 year cookie, per Google recommendation.
                const maxAge = runtime.config('ui.services.analytics.cookie.maxAge', 60 * 60 * 24 * 365 * 2);
                const cookie = new Cookie.Cookie(cookieName)
                    .setValue(analyticsCookie)
                    .setPath('/')
                    .setMaxAge(maxAge)
                    .setSecure(true);
                if (cookieDomain) {
                    cookie.setDomain(cookieDomain);
                }
                cookieManager.setItem(cookie);
            }
            return analyticsCookie;
        }

        // API

        function start() {
            return Promise.try(function () {
                const clientId = ensureCookie();
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
