define([
    'promise',
    'kb_common/observed',
    'kb_common/lang',
    'kb_common/html',
    'kb_common/format',
    'kb_common_ts/HttpClient'
], function (
    Promise,
    observed,
    lang,
    html,
    format,
    HttpClient
) {
    'use strict';
    var t = html.tag,
        div = t('div'),
        p = t('p');

    function niceDuration(value, options) {
        var minimized = [];
        var units = [{
            unit: 'millisecond',
            short: 'ms',
            single: 'm',
            size: 1000
        }, {
            unit: 'second',
            short: 'sec',
            single: 's',
            size: 60
        }, {
            unit: 'minute',
            short: 'min',
            single: 'm',
            size: 60
        }, {
            unit: 'hour',
            short: 'hr',
            single: 'h',
            size: 24
        }, {
            unit: 'day',
            short: 'day',
            single: 'd',
            size: 30
        }];
        var temp = Math.abs(value);
        var parts = units
            .map(function (unit) {
                // Get the remainder of the current value
                // sans unit size of it composing the next
                // measure.
                var unitValue = temp % unit.size;
                // Recompute the measure in terms of the next unit size.
                temp = (temp - unitValue) / unit.size;
                return {
                    name: unit.single,
                    unit: unit.unit,
                    value: unitValue
                };
            }).reverse();

        parts.pop();

        // We skip over large units which have not value until we
        // hit the first unit with value. This effectively trims off
        // zeros from the end.
        // We also can limit the resolution with options.resolution
        var keep = false;
        for (var i = 0; i < parts.length; i += 1) {
            if (!keep) {
                if (parts[i].value > 0) {
                    keep = true;
                    minimized.push(parts[i]);
                }
            } else {
                minimized.push(parts[i]);
                if (options.resolution &&
                    options.resolution === parts[i].unit) {
                    break;
                }
            }
        }

        if (minimized.length === 0) {
            // This means that there is are no time measurements > 1 second.
            return '<1s';
        } else {
            // Skip seconds if we are into the hours...
            // if (minimized.length > 2) {
            //     minimized.pop();
            // }
            return minimized.map(function (item) {
                    return String(item.value) + item.name;
                })
                .join(' ');
        }
    }

    function factory(config) {
        var runtime = config.runtime,
            state = observed.make(),
            lastCheckAt = 0,
            lastConnectionAt = 0,
            checking = false,
            lastStatus = null,
            interval = 15000,
            intervals = {
                normal: 15000,
                disconnect1: 1000,
                disconnect2: 5000,
                disconnect3: 15000
            };

        function checkConnection() {

        }

        function showDisconnected() {
            // alert('disconnected');
        }

        function notifyError(message) {
            runtime.send('notification', 'notify', {
                type: 'warning',
                id: 'connection',
                icon: 'exclamation-triangle',
                message: message.message,
                description: message.description
            });
        }

        function notifyOk(message) {
            runtime.send('notification', 'notify', {
                type: 'success',
                id: 'connection',
                icon: 'check',
                message: message.message,
                description: message.description,
                autodismiss: 5000
            });
        }

        // list for request fetch the user profile
        function start() {

            // listen for disconnection events.
            // runtime.recv('connection', 'disconnected', function() {
            //     console.warn('disconnected!!!');
            //     // alert('disconnected');
            //     // verify this is true

            //     // show the disconnected dialog
            //     // which starts listening back to home base to see if we are
            //     // connected yet. Allow the user to bail to a default "closer" 
            //     // page which is just a simple view which destroys the current view
            //     // and allows the user to just kill the tab.
            // });


            runtime.recv('app', 'heartbeat', function () {
                if (checking) {
                    return;
                }
                var now = new Date().getTime();
                if (now - lastCheckAt > interval) {
                    checking = true;
                    var httpClient = new HttpClient.HttpClient();
                    httpClient.request({
                            method: 'GET',
                            url: document.location.origin + '/ping.txt',
                            timeout: 10000
                        })
                        .then(function (pong) {
                            lastConnectionAt = new Date().getTime();
                            if (lastStatus === 'error') {
                                notifyOk({
                                    message: 'Connection Restored (connection to server had been lost)',
                                    description: ''
                                });
                                interval = intervals.normal;
                            }
                            lastStatus = 'ok';
                        })
                        .catch(HttpClient.GeneralError, function (err) {
                            lastStatus = 'error';
                            var currentTime = new Date().getTime();
                            var elapsed = currentTime - lastConnectionAt;
                            var resolution;
                            if (elapsed < 60000) {
                                interval = intervals.disconnect1;
                                resolution = 'second';
                            } else if (elapsed < 300000) {
                                interval = intervals.disconnect2;
                                resolution = 'second';
                            } else {
                                interval = intervals.disconnect3;
                                resolution = 'minute';
                            }
                            var prefix = '';
                            var suffix = '';
                            if (elapsed > 0) {
                                suffix = ' ago';
                            } else {
                                prefix = ' in ';
                            }
                            var elapsedDisplay = prefix + niceDuration(elapsed, { resolution: resolution }) + suffix;

                            notifyError({
                                message: 'Error connecting to KBase - last response ' + elapsedDisplay,
                                description: div([
                                    p('There was a problem connecting to KBase services.'),
                                    p('The KBase App may not work reliably until a connection is restored'),
                                    p([
                                        'You may either wait until a connection is restored, in which case ',
                                        'this message will notify you, or close the window and try again later.'
                                    ])
                                ])
                            });
                        })
                        .catch(HttpClient.TimeoutError, function (err) {
                            lastStatus = 'error';
                            notifyError({
                                message: 'Timeout connecting to KBase',
                                description: [
                                    p('The attempt to connect KBase services timed out.'),
                                    p('The KBase App may not work reliably until a connection is restored'),
                                    p([
                                        'You may either wait until a connection is restored, in which case ',
                                        'this message will notify you, or close the window and try again later.'
                                    ])
                                ]
                            });
                        })
                        .catch(HttpClient.AbortError, function (err) {
                            lastStatus = 'error';
                            notifyError({
                                message: 'Connection aborted connecting to KBase: ' + err.message
                            });
                        })
                        .catch(function (err) {
                            lastStatus = 'error';
                            notifyError({
                                message: 'Unknown error connecting to KBase: ' + err.message
                            });
                        })
                        .finally(function () {
                            checking = false;
                            lastCheckAt = new Date().getTime();
                        });
                }
            });

            // also, monitor the kbase-ui server to ensure we are connected
        }

        function stop() {
            return Promise.try(function () {
                state.setItem('userprofile', null);
            });
        }

        // Send out notifications when there is a change in connection state.
        function onChange(fun, errFun) {
            // state.listen('userprofile', {
            //     onSet: function(value) {
            //         fun(value);
            //     },
            //     onError: function(err) {
            //         console.error('ERROR in user profile service');
            //         console.error(err);
            //         if (errFun) {
            //             errFun(err);
            //         }
            //     }
            // });
        }

        function whenChange() {
            // return state.whenItem('userprofile')
        }

        return {
            // lifecycle api
            start: start,
            stop: stop,
            // useful api
            onChange: onChange,
            whenChange: whenChange
        };
    }
    return {
        make: function (config) {
            return factory(config);
        }
    };
});
