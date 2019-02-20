define([
    'kb_common_ts/HttpClient'
], function (
    HttpClient
) {
    'use strict';

    function encodeQuery(params) {
        return Object.keys(params).map((key) => {
            return [encodeURIComponent(key), encodeURIComponent(params[key])].join('=');
        }).join('&');
    }

    class GoogleAnalytics {
        constructor({ apiEndpoint, code, hostname, clientId, dailyClientId, ipAddress }) {
            this.code = code;
            this.host = hostname;
            this.clientId = clientId;
            this.dailyClientId = dailyClientId;
            this.url = apiEndpoint;
            this.ipAddress = ipAddress;
            // this.url = window.location.origin + '/google-analytics-collect';
            // 'https://www.google-analytics.com/collect'
        }

        sendToGA(query) {
            const http = new HttpClient.HttpClient();
            query.ua = window.navigator.userAgent;
            // query.uip = this.ipAddress
            return http.request({
                method: 'POST',
                url: this.url,
                header: new HttpClient.HttpHeader({
                    'content-type': 'application/x-www-form-urlencoded'
                }),
                withCredentials: true,
                data: encodeQuery(query)
            })
                .catch((err) => {
                    console.error('ERROR sending to GA', err);
                });
        }

        send(path) {
            const query = {
                v: 1,
                tid: this.code,
                cid: this.clientId,
                _gid: this.dailyClientId,

                t: 'pageview',
                ds: 'kbase-ui',
                dp: path,
                dl: encodeURIComponent(document.location.href),
                dh: this.host
            };
            return this.sendToGA(query);
        }

        sendEvent({ category, action, label, value }) {
            // see https://developers.google.com/analytics/devguides/collection/protocol/v1/parameters#ec

            const query = {
                v: 1,
                tid: this.code,
                cid: this.clientId,
                _gid: this.dailyClientId,

                t: 'event',
                ec: category, // event category, required
                ea: action, // event action, required
            };
            if (label) {
                query.el = label;
            }
            if (value) {
                query.ev = value;
            }
            return this.sendToGA(query);
        }

        sendTiming({ category, variable, time, label }) {
            // see https://developers.google.com/analytics/devguides/collection/protocol/v1/parameters#ec

            const query = {
                v: 1,
                tid: this.code,
                cid: this.clientId,
                _gid: this.dailyClientId,

                t: 'timing',
                utc: category,
                utv: variable,
                utt: time,
                utl: label
            };
            return this.sendToGA(query);
        }
    }

    return GoogleAnalytics;
});
