define(["require", "exports", "../../lib/kb_lib/observed", "../../lib/kb_lib/HttpClient", "../../lib/kb_lib/HTML"], function (require, exports, observed_1, HttpClient_1, HTML_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ServiceClass = void 0;
    var html = new HTML_1.HTML(), t = html.tagMaker(), div = t('div'), p = t('p');
    function niceDuration(value, _a) {
        var resolution = _a.resolution;
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
            }
            else {
                minimized.push(parts[i]);
                if (resolution &&
                    resolution === parts[i].unit) {
                    break;
                }
            }
        }
        if (minimized.length === 0) {
            // This means that there is are no time measurements > 1 second.
            return '<1s';
        }
        else {
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
    var INTERVAL_NORMAL = 15000;
    var INTERVAL_DEFAULT = INTERVAL_NORMAL;
    var INTERVAL_DISCONNECT1 = 1000;
    var INTERVAL_DISCONNECT2 = 5000;
    var INTERVAL_DISCONNECT3 = 15000;
    var INTERVAL_OK_AUTODISMISS = 5000;
    var DISCONNECT_TIMEOUT = 60000;
    var DISCONNECT1_TIMEOUT = 300000;
    var ConnectionService = /** @class */ (function () {
        function ConnectionService(_a) {
            var runtime = _a.params.runtime;
            this.runtime = runtime;
            this.userProfile = new observed_1.Observed(null);
            this.lastCheckAt = 0;
            this.lastConnectionAt = 0;
            this.checking = false;
            this.lastStatus = null;
            this.interval = INTERVAL_NORMAL;
            this.intervals = {
                normal: INTERVAL_DEFAULT,
                disconnect1: INTERVAL_DISCONNECT1,
                disconnect2: INTERVAL_DISCONNECT2,
                disconnect3: INTERVAL_DISCONNECT3
            };
        }
        ConnectionService.prototype.notifyError = function (message) {
            this.runtime.send('notification', 'notify', {
                type: 'warning',
                id: 'connection',
                icon: 'exclamation-triangle',
                message: message.message,
                description: message.description
            });
        };
        ConnectionService.prototype.notifyOk = function (message) {
            this.runtime.send('notification', 'notify', {
                type: 'success',
                id: 'connection',
                icon: 'check',
                message: message.message,
                description: message.description,
                autodismiss: INTERVAL_OK_AUTODISMISS
            });
        };
        ConnectionService.prototype.start = function () {
            var _this = this;
            this.runtime.receive('app', 'heartbeat', function () {
                if (_this.checking) {
                    return;
                }
                var now = new Date().getTime();
                if (now - _this.lastCheckAt > _this.interval) {
                    _this.checking = true;
                    var httpClient = new HttpClient_1.HttpClient();
                    var buster = new Date().getTime();
                    httpClient.request({
                        method: 'GET',
                        url: document.location.origin + "/ping.txt?b=" + buster,
                        timeout: 10000
                    })
                        .then(function () {
                        _this.lastConnectionAt = new Date().getTime();
                        if (_this.lastStatus === 'error') {
                            _this.notifyOk({
                                message: 'Connection Restored (connection to server had been lost)',
                                description: ''
                            });
                            _this.interval = _this.intervals.normal;
                        }
                        _this.lastStatus = 'ok';
                    })
                        .catch(function (ex) {
                        if (ex instanceof HttpClient_1.GeneralError) {
                            (function () {
                                _this.lastStatus = 'error';
                                var currentTime = new Date().getTime();
                                var elapsed = currentTime - _this.lastConnectionAt;
                                var resolution;
                                if (elapsed < DISCONNECT_TIMEOUT) {
                                    _this.interval = _this.intervals.disconnect1;
                                    resolution = 'second';
                                }
                                else if (elapsed < DISCONNECT1_TIMEOUT) {
                                    _this.interval = _this.intervals.disconnect2;
                                    resolution = 'second';
                                }
                                else {
                                    _this.interval = _this.intervals.disconnect3;
                                    resolution = 'minute';
                                }
                                var prefix = '';
                                var suffix = '';
                                if (elapsed > 0) {
                                    suffix = ' ago';
                                }
                                else {
                                    prefix = ' in ';
                                }
                                var elapsedDisplay = prefix + niceDuration(elapsed, { resolution: resolution }) + suffix;
                                _this.notifyError({
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
                            })();
                        }
                        else if (ex instanceof HttpClient_1.TimeoutError) {
                            _this.lastStatus = 'error';
                            _this.notifyError({
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
                        }
                        else if (ex instanceof HttpClient_1.AbortError) {
                            (function () {
                                _this.lastStatus = 'error';
                                _this.notifyError({
                                    message: 'Connection aborted connecting to KBase: ' + ex.message
                                });
                            })();
                        }
                        else {
                            _this.lastStatus = 'error';
                            _this.notifyError({
                                message: 'Unknown error connecting to KBase: ' + ex.message
                            });
                        }
                    })
                        .finally(function () {
                        _this.checking = false;
                        _this.lastCheckAt = new Date().getTime();
                    });
                }
            });
            // also, monitor the kbase-ui server to ensure we are connected
            return Promise.resolve();
        };
        ConnectionService.prototype.stop = function () {
            var _this = this;
            return Promise.resolve(function () {
                _this.userProfile.setValue(null);
                return null;
            });
        };
        // Send out notifications when there is a change in connection state.
        // function onChange(fun, errFun) {
        ConnectionService.prototype.onChange = function () {
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
        };
        ConnectionService.prototype.whenChange = function () {
            // return state.whenItem('userprofile')
        };
        return ConnectionService;
    }());
    exports.ServiceClass = ConnectionService;
});
