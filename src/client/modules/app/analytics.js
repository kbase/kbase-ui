define([
    'kb_common_ts/HttpClient'
], function (
    HttpClient
) {
    'use strict';

    function factory(config) {
        const code = config.code;
        const host = config.hostname;
        const clientId = config.clientId;

        function encodeQuery(params) {
            return Object.keys(params).map(function (key) {
                return [encodeURIComponent(key), encodeURIComponent(params[key])].join('=');
            }).join('&');
        }

        function sendToGA(query) {
            const data = encodeQuery(query);
            const http = new HttpClient.HttpClient();
            return http.request({
                method: 'POST',
                url: 'https://www.google-analytics.com/collect',
                header: new HttpClient.HttpHeader({
                    'content-type': 'application/x-www-form-urlencoded'
                }),
                withCredentials: true,
                data: data
            })
                .catch(function (err) {
                    //alert('boo, it failed. check the log');
                    console.error('ERROR sending to GA', err);
                });
        }

        function send(path) {
            const query = {
                v: 1,
                tid: code,
                cid: clientId,
                t: 'pageview',
                ds: 'kbase-ui',
                dp: path,
                dl: encodeURIComponent(document.location.href),
                dh: host
            };
            return sendToGA(query);
        }

        function sendEvent(arg) {
            // see https://developers.google.com/analytics/devguides/collection/protocol/v1/parameters#ec

            const query = {
                v: 1,
                tid: code,
                cid: clientId,

                t: 'event',
                ec: arg.category, // event category, required
                ea: arg.action, // event action, required
            };
            if (arg.label) {
                query.el = arg.label;
            }
            if (arg.value) {
                query.ev = arg.value;
            }
            return sendToGA(query);
        }

        function sendTiming(arg) {
            // see https://developers.google.com/analytics/devguides/collection/protocol/v1/parameters#ec

            const query = {
                v: 1,
                tid: code,
                cid: clientId,

                t: 'timing',
                utc: arg.category,
                utv: arg.variable,
                utt: arg.time,
                utl: arg.label
            };
            return sendToGA(query);
        }

        return {
            send: send,
            sendEvent: sendEvent,
            sendTiming: sendTiming
        };
    }

    return {
        make: function (config) {
            return factory(config);
        }
    };
});
