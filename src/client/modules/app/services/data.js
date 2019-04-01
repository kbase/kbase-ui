define(['bluebird', 'kb_common_ts/HttpClient'], function (Promise, HttpClient) {
    'use strict';

    function factory() {
        function start() {
            // nothing to do?
            return Promise.try(function () {
                return true;
            });
        }

        function stop() {
            // nothing to do?
            return Promise.try(function () {
                return true;
            });
        }

        function getJson(arg) {
            const url = '/data/' + arg.path + '/' + arg.file + '.json';
            const http = new HttpClient.HttpClient();
            return http
                .request({
                    method: 'GET',
                    url: url
                })
                .then((result) => {
                    if (result.status === 200) {
                        try {
                            return JSON.parse(result.response);
                        } catch (ex) {
                            throw new Error('Error parsing response as JSON: ' + ex.message);
                        }
                    } else {
                        throw new Error('Error fetching file: ' + result.status);
                    }
                });
        }
        return {
            start: start,
            stop: stop,
            getJson: getJson
        };
    }

    return {
        make: factory
    };
});
