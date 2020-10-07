define(["require", "exports", "../../lib/kb_lib/comm/coreServices/Feeds", "../../lib/kb_lib/Utils"], function (require, exports, Feeds_1, Utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ServiceClass = void 0;
    var MONITORING_INTERVAL = 10000;
    var FeedsService = /** @class */ (function () {
        function FeedsService(_a) {
            var runtime = _a.params.runtime;
            this.runtime = runtime;
            // TODO: move to service config.
            this.monitoringInterval = MONITORING_INTERVAL;
            this.monitorRunning = false;
            this.monitoringRunCount = 0;
            this.monitoringErrorCount = 0;
            this.monitoringTimer = null;
            this.disabled = this.runtime.config('ui.coreServices.disabled', []).includes('Feeds');
        }
        FeedsService.prototype.start = function () {
            var _this = this;
            return Utils_1.tryPromise(function () {
                _this.runtime.db().set('feeds', {
                    notifications: null,
                    error: null
                });
                if (_this.disabled) {
                    console.warn('Feeds service disabled; skipping monitoring hooks');
                    return;
                }
                // if logged in, populate and start monitoring for feeds notifications
                if (_this.runtime.service('session').getAuthToken()) {
                    return _this.startFeedsMonitoring();
                }
                // listen for login and out events...
                _this.runtime.receive('session', 'loggedin', function () {
                    _this.startFeedsMonitoring();
                });
                _this.runtime.receive('session', 'loggedout', function () {
                    _this.stopFeedsMonitoring();
                });
            });
        };
        FeedsService.prototype.stop = function () {
            var _this = this;
            return Utils_1.tryPromise(function () {
                _this.stopFeedsMonitoring();
            });
        };
        FeedsService.prototype.startFeedsMonitoring = function () {
            if (this.monitorRunning) {
                return;
            }
            this.monitorRunning = true;
            this.monitoringLoop();
        };
        FeedsService.prototype.monitoringLoop = function () {
            var _this = this;
            if (this.monitoringTimer) {
                return;
            }
            var monitoringJob = function () {
                var feedsClient = new Feeds_1.Feeds({
                    url: _this.runtime.config('services.Feeds.url'),
                    token: _this.runtime.service('session').getAuthToken()
                });
                return feedsClient.getUnseenNotificationCount()
                    .then(function (_a) {
                    var _b = _a.unseen, global = _b.global, user = _b.user;
                    var currentUnseen = global + user;
                    // are notifications different than the last time?
                    var unseenNotificationsCount = _this.runtime.db().get('feeds.unseenNotificationsCount', 0);
                    // only way is a deep equality comparison
                    if (unseenNotificationsCount === currentUnseen) {
                        return;
                    }
                    _this.runtime.db().set('feeds', {
                        unseenNotificationsCount: currentUnseen,
                        error: null
                    });
                })
                    .catch(function (err) {
                    console.error('ERROR', err.message);
                    _this.runtime.db().set('feeds', {
                        error: err.message
                    });
                });
            };
            var loop = function () {
                _this.monitoringTimer = window.setTimeout(function () {
                    monitoringJob()
                        .then(function () {
                        _this.monitoringRunCount += 1;
                        if (_this.monitorRunning) {
                            loop();
                        }
                    })
                        .catch(function (err) {
                        _this.monitoringErrorCount += 1;
                        console.error('ERROR', err);
                    });
                }, _this.monitoringInterval);
            };
            monitoringJob()
                .then(function () {
                loop();
            })
                .catch(function (err) {
                console.error('Error', err);
            });
        };
        FeedsService.prototype.stopFeedsMonitoring = function () {
            this.monitorRunning = false;
            if (this.monitoringTimer !== null) {
                window.clearTimeout(this.monitoringTimer);
            }
            this.monitoringTimer = null;
        };
        FeedsService.prototype.pluginHandler = function () {
        };
        return FeedsService;
    }());
    exports.ServiceClass = FeedsService;
});
