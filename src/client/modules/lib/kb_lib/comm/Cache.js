var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CacheItemState = void 0;
    var CacheItemState;
    (function (CacheItemState) {
        CacheItemState[CacheItemState["RESERVED"] = 0] = "RESERVED";
        CacheItemState[CacheItemState["PRESENT"] = 1] = "PRESENT";
    })(CacheItemState = exports.CacheItemState || (exports.CacheItemState = {}));
    var Cache = /** @class */ (function () {
        function Cache(_a) {
            var itemLifetime = _a.itemLifetime, monitoringFrequency = _a.monitoringFrequency, waiterTimeout = _a.waiterTimeout, waiterFrequency = _a.waiterFrequency;
            this.cache = new Map();
            // 10 minute cache lifetime
            this.cacheLifetime = itemLifetime || 1800000;
            // Frequency with which to monitor the cache for expired items
            // or refreshing them.
            this.monitoringFrequency = monitoringFrequency || 60000;
            // The waiter waits for a cache item to become available if it has
            // been reserved. These settings determine how long to wait
            // for a waiter to wait, and how often to check the cache item to see if it has
            // yet been fulfilled.
            this.waiterTimeout = waiterTimeout || 30000;
            this.waiterFrequency = waiterFrequency || 100;
            this.isMonitoring = false;
        }
        Cache.prototype.runMonitor = function () {
            var _this = this;
            if (this.isMonitoring) {
                return;
            }
            this.isMonitoring = true;
            setTimeout(function () {
                var newCache = new Map();
                var cacheRenewed = false;
                Object.keys(_this.cache).forEach(function (id) {
                    var item = _this.cache.get(id);
                    if (!_this.isExpired(item)) {
                        newCache.set(id, item);
                        cacheRenewed = true;
                    }
                });
                _this.cache = newCache;
                _this.isMonitoring = false;
                if (cacheRenewed) {
                    _this.runMonitor();
                }
            }, this.monitoringFrequency);
        };
        Cache.prototype.isExpired = function (cacheItem) {
            var now = new Date().getTime();
            var elapsed = now - cacheItem.createdAt;
            return elapsed > this.cacheLifetime;
        };
        Cache.prototype.getItem = function (id) {
            if (this.cache.get(id) === undefined) {
                return null;
            }
            var cached = this.cache.get(id);
            if (this.isExpired(cached)) {
                this.cache.delete(id);
                return;
            }
            return cached;
        };
        /**
         * Wait for a reserved item associated with id to become available, and then
         * return it.
         * Implements this by polling for a given amount of time, with a given pause time between
         * poll attempts.
         * Handles the case of a reserve item disappearing between polls, in which case the item
         * will be reserved and fetched.
         *
         * @param id - an identifier which uniquely identifies an item of type T
         * @param fetcher - a function returning a promise of an item of type T
         */
        Cache.prototype.reserveWaiter = function (id, fetcher) {
            return __awaiter(this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            var started = new Date().getTime();
                            var resolveItem = function () { return __awaiter(_this, void 0, void 0, function () {
                                var item, elapsed;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            item = this.cache.get(id);
                                            if (!(typeof item === 'undefined')) return [3 /*break*/, 2];
                                            return [4 /*yield*/, this.reserveAndFetch(id, fetcher)];
                                        case 1: return [2 /*return*/, _a.sent()];
                                        case 2:
                                            switch (item.state) {
                                                case CacheItemState.RESERVED:
                                                    elapsed = new Date().getTime() - started;
                                                    if (elapsed < this.waiterTimeout) {
                                                        // Our time spent waiting is still within the timeout window, so keep going.
                                                        waiter();
                                                    }
                                                    else {
                                                        // Otherwise we have waited too long, and we just give up.
                                                        reject(new Error("Timed-out waiting for cache item to become available; timeout " + this.waiterTimeout + ", waited " + elapsed));
                                                    }
                                                    break;
                                                case CacheItemState.PRESENT:
                                                    resolve(item);
                                            }
                                            return [2 /*return*/];
                                    }
                                });
                            }); };
                            var waiter = function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    setTimeout(resolveItem, this.waiterFrequency);
                                    return [2 /*return*/];
                                });
                            }); };
                            waiter();
                        })];
                });
            });
        };
        /**
         * Reserve an item of type T, uniquely identified by id, and the proceed to fetch it
         * and add it to the cache (under that id).
         *
         * @param id -
         * @param fetcher - a function which returns promise of a thing T
         */
        Cache.prototype.reserveAndFetch = function (id, fetcher) {
            return __awaiter(this, void 0, void 0, function () {
                var newItem, newCacheItem;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            // now, reserve it.
                            this.reserveItem(id, fetcher);
                            return [4 /*yield*/, fetcher()];
                        case 1:
                            newItem = _a.sent();
                            newCacheItem = {
                                id: id, fetcher: fetcher,
                                createdAt: new Date().getTime(),
                                value: newItem,
                                state: CacheItemState.PRESENT
                            };
                            this.cache.set(id, newCacheItem);
                            this.runMonitor();
                            return [2 /*return*/, newItem];
                    }
                });
            });
        };
        /**
         * Given an id which uniquely identifies an item of type T,
         * and a fetcher with which to retrieve such an item,
         * return a promise for such an item.
         *
         * @param id - unique identifier for an object of type T
         * @param fetcher - a function returning a promise of an item of type T
         */
        Cache.prototype.getItemWithWait = function (_a) {
            var id = _a.id, fetcher = _a.fetcher;
            return __awaiter(this, void 0, void 0, function () {
                var cached, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            cached = this.cache.get(id);
                            // If there is no item cached yet, we reserve it and then fetch it. We don't
                            // need to wait. (Others asking for this cache item, though, will need to wait
                            // until the reserve is cleared.)
                            if (typeof cached === 'undefined') {
                                return [2 /*return*/, this.reserveAndFetch(id, fetcher)];
                            }
                            // If an item is expired, we immediately remove it and then re-reserve-and-fetch-it
                            if (this.isExpired(cached)) {
                                this.cache.delete(id);
                                return [2 /*return*/, this.reserveAndFetch(id, fetcher)];
                            }
                            _b = cached.state;
                            switch (_b) {
                                case CacheItemState.RESERVED: return [3 /*break*/, 1];
                                case CacheItemState.PRESENT: return [3 /*break*/, 3];
                            }
                            return [3 /*break*/, 4];
                        case 1: return [4 /*yield*/, this.reserveWaiter(id, fetcher)];
                        case 2: return [2 /*return*/, (_c.sent()).value];
                        case 3: return [2 /*return*/, cached.value];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Adds an item to the cache in a "reserved" state.
         * This state implies that item is or is going to soon be
         * fetched.
         *
         * @param id - some opaque string identifier uniquely associated with the thing T
         * @param fetcher
         */
        Cache.prototype.reserveItem = function (id, fetcher) {
            var reservedItem = {
                id: id, fetcher: fetcher,
                reservedAt: new Date().getTime(),
                state: CacheItemState.RESERVED
            };
            this.cache.set(id, reservedItem);
            return reservedItem;
        };
        return Cache;
    }());
    exports.default = Cache;
});
