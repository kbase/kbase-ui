define([
    'bluebird',
    'uuid',
    'lib/analytics',
    'kb_common_ts/Cookie'
], function (
    Promise,
    Uuid,
    GoogleAnalytics,
    Cookie
) {
    'use strict';

    class AnalyticsService {
        constructor({ params }) {
            if (!params.runtime) {
                throw new Error('AnalyticsService requires a runtime object; provide as "runtime"');
            }
            this.runtime = params.runtime;
            this.analyticsClient = null;
            this.routeListener = null;
            this.cookiePrefix = 'GA1.2.';
            this.cookieRegex = /^GA1\.2\.(.+)$/;
        }

        pageView(path) {
            return this.analyticsClient.send(path);
        }

        sendEvent(arg) {
            return this.analyticsClient.sendEvent(arg);
        }

        sendTiming(arg) {
            return this.analyticsClient.sendTiming(arg);
        }

        extractClientId(cookie) {
            const match = this.cookieRegex.exec(cookie);
            if (!match) {
                // throw new Error('Invalid cookie');
                return null;
            }
            return match[1];
        }

        setDailyCookie() {
            const clientId = new Uuid(4).format();
            const cookieName = '_gid';
            const analyticsCookie = this.cookiePrefix + clientId;
            const cookieDomain = this.runtime.config('ui.services.analytics.cookie.domain', null);
            // 24 hours for this cookie, per Google recommendation.
            // const maxAge = this.runtime.config('ui.services.analytics.cookie.maxAge', 60 * 60 * 24 * 365 * 2);
            const maxAge = 60 * 60 * 24;
            const cookie = new Cookie.Cookie(cookieName)
                .setValue(analyticsCookie)
                .setPath('/')
                .setMaxAge(maxAge)
                .setSecure(true);
            if (cookieDomain) {
                cookie.setDomain(cookieDomain);
            }
            const cookieManager = new Cookie.CookieManager();
            cookieManager.setItem(cookie);
        }

        ensureDailyCookie() {
            const cookieManager = new Cookie.CookieManager();
            // const cookieName = this.runtime.config('ui.services.analytics.cookie.name');
            const cookieName = '_gid';

            const analyticsCookie = cookieManager.getItem(cookieName);
            let clientId;
            if (analyticsCookie) {
                clientId = this.extractClientId(analyticsCookie);
                if (clientId) {
                    return clientId;
                }
            }
            return this.setDailyCookie();
        }

        setCookie() {
            const clientId = new Uuid(4).format();
            const analyticsCookie = this.cookiePrefix + clientId;
            const cookieName = this.runtime.config('ui.services.analytics.cookie.name');
            const cookieDomain = this.runtime.config('ui.services.analytics.cookie.domain', null);
            // 2 year cookie, per Google recommendation.
            const maxAge = this.runtime.config('ui.services.analytics.cookie.maxAge', 60 * 60 * 24 * 365 * 2);
            const cookie = new Cookie.Cookie(cookieName)
                .setValue(analyticsCookie)
                .setPath('/')
                .setMaxAge(maxAge)
                .setSecure(true);
            if (cookieDomain) {
                cookie.setDomain(cookieDomain);
            }
            const cookieManager = new Cookie.CookieManager();
            cookieManager.setItem(cookie);
        }

        ensureCookie() {
            const cookieManager = new Cookie.CookieManager();
            const cookieName = this.runtime.config('ui.services.analytics.cookie.name');
            const analyticsCookie = cookieManager.getItem(cookieName);
            let clientId;
            if (analyticsCookie) {
                clientId = this.extractClientId(analyticsCookie);
                if (clientId) {
                    return clientId;
                }
            }
            return this.setCookie();
        }

        start() {
            return Promise.try(() => {
                const clientId = this.ensureCookie();
                const dailyClientId = this.ensureDailyCookie();
                this.analyticsClient = new GoogleAnalytics({
                    apiEndpoint: this.runtime.config('ui.services.analytics.google.apiEndpoint'),
                    code: this.runtime.config('ui.services.analytics.google.code'),
                    hostname: this.runtime.config('ui.services.analytics.google.hostname'),
                    clientId: clientId,
                    dailyClientId: dailyClientId,
                    ip: null // this.runtime.service('ui').publicIPAddress()
                });
                this.routeListener = this.runtime.receive('route', 'routing', (route) => {
                    this.pageView(route.request.original || '/');
                });
            });
        }

        stop() {
            if (this.routeListener) {
                this.runtime.drop(this.routeListener);
            }
        }
    }

    return { ServiceClass: AnalyticsService };
});
