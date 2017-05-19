define([
    'jquery',
    'bluebird'
], function (
    $,
    Promise
) {
    'use strict';

    function factory(config) {
        var runtime = config.runtime;

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
            if (arg.sync) {
                var returnData;
                $.get({
                    url: '/data/' + arg.path + '/' + arg.file + '.json', // should not be hardcoded!! but figure that out later
                    async: false,
                    dataType: 'json',
                    success: function (data) {
                        returnData = data;
                    },
                    error: function (err) {
                            throw {
                                type: 'AjaxError',
                                reason: 'Unknown',
                                message: 'There was an error fetching this data object',
                                data: {
                                    arg: arg,
                                    error: err
                                }
                            };
                            // throw new Error('Error getting data: ' + arg.file);
                        }
                        //complete: function (jq, status) {
                        //    console.log('COMPLETE');
                        //    console.log(status);
                        // }
                });
                return returnData;
            }
            return new Promise.resolve($.get('/data/' + arg.path + '/' + arg.file + '.json'));
        }
        return {
            start: start,
            stop: stop,
            getJson: getJson
        };
    }

    return {
        make: function (config) {
            return factory(config);
        }
    };
});