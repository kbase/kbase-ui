define(["require", "exports", "./props", "./Utils"], function (require, exports, props_1, Utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ReactiveDB = void 0;
    var ReactiveDB = /** @class */ (function () {
        function ReactiveDB() {
            this.db = new props_1.Props({});
            this.subscriptions = new Map();
            this.queries = new Map();
            this.timer = null;
            this.timerInterval = 100;
        }
        ReactiveDB.prototype.runOnce = function () {
            var _this = this;
            if (this.timer) {
                return;
            }
            if (Object.keys(this.subscriptions).length === 0) {
                return;
            }
            this.timer = window.setTimeout(function () {
                _this.runSubscriptions();
                _this.timer = null;
                // this.runIfNeedTo();
            }, this.timerInterval);
        };
        ReactiveDB.prototype.runQuery = function (query) {
            var dbValue = this.db.getItem(query.path, undefined);
            if (typeof dbValue === 'undefined') {
                return;
            }
            if (!query.filter) {
                return dbValue;
            }
            return query.filter(dbValue);
        };
        ReactiveDB.prototype.runSubscriptions = function () {
            var _this = this;
            this.subscriptions.forEach(function (subscription) {
                try {
                    var dbValue = _this.runQuery(subscription.query);
                    if (typeof dbValue === 'undefined') {
                        return;
                    }
                    if (typeof subscription.lastValue !== 'undefined') {
                        // TODO: this is pure object equality; but if the
                        // query returns a new collection (via the filter)
                        // we need to do a shallow comparison.
                        if (!Utils_1.isEqual(subscription.lastValue, dbValue)) {
                            subscription.lastValue = dbValue;
                            subscription.fun(dbValue);
                        }
                    }
                    else {
                        subscription.lastValue = dbValue;
                        subscription.fun(dbValue);
                    }
                }
                catch (ex) {
                    console.error('Error running subscription.');
                    subscription.errorCount += 1;
                }
            });
        };
        // PUBLIC api
        ReactiveDB.prototype.set = function (path, value) {
            this.db.setItem(path, value);
            this.runOnce();
        };
        ReactiveDB.prototype.get = function (path, defaultValue) {
            return this.db.getItem(path, defaultValue);
        };
        ReactiveDB.prototype.subscribe = function (query, callback) {
            var subscription = {
                query: query,
                callback: callback,
                errorCount: 0,
                lastValue: undefined
            };
            var id = Utils_1.uniqueId();
            this.subscriptions.set(id, subscription);
            // this.runOnce();
            return id;
        };
        ReactiveDB.prototype.remove = function (path) {
            this.db.deleteItem(path);
            this.runOnce();
        };
        ReactiveDB.prototype.unsubscribe = function (id) {
            this.subscriptions.delete(id);
        };
        ReactiveDB.prototype.toJSON = function () {
            return this.db.getRaw();
        };
        return ReactiveDB;
    }());
    exports.ReactiveDB = ReactiveDB;
});
