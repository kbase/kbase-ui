define([
    'bluebird',
    'uuid',
    'kb_common/ajax'
], function(
    Promise,
    Uuid,
    Ajax
) {
    'use strict';

    function factory(config) {
        var code = config.code,
            host = config.hostname,
            uuid = new Uuid(4).format();

        function encodeQuery(params) {
            return Object.keys(params).map(function(key) {
                return [encodeURIComponent(key), encodeURIComponent(params[key])].join('=');
            }).join('&');
        }

        function send(path, clientId) {
            var query = {
                v: 1,
                tid: code,
                cid: clientId,
                t: 'pageview',
                ds: 'kbase-ui',
                dp: path,
                dl: encodeURIComponent(document.location.href),
                dh: host
            };
            var data = encodeQuery(query);
            Ajax.post({
                    url: 'https://www.google-analytics.com/collect',
                    header: {
                        'Content-type': 'application/x-www-form-urlencoded'
                    },
                    withCredentials: true,
                    data: data
                })
                .then(function(result) {
                    //alert('yay, sent pageview to analytics');
                    // console.log('sent pageview to ga', result);
                })
                .catch(function(err) {
                    //alert('boo, it failed. check the log');

                    console.error('ERROR sending to GA', err);
                });
        }

        return {
            send: send
        };
    }

    return {
        make: function(config) {
            return factory(config);
        }
    };
});