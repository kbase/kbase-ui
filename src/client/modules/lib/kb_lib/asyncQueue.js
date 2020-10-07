define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var AsyncQueue = /** @class */ (function () {
        function AsyncQueue(_a) {
            var queuePauseTime = _a.queuePauseTime;
            this.queue = [];
            this.queuePauseTime = typeof queuePauseTime === 'undefined' ? 0 : queuePauseTime;
            this.itemId = 0;
            this.timer = null;
        }
        AsyncQueue.prototype.processQueue = function () {
            var item = this.queue.shift();
            if (item) {
                try {
                    item.callback();
                }
                catch (ex) {
                    console.error('Error processing queue item');
                    console.error(ex);
                }
                finally {
                    this.start();
                }
            }
        };
        AsyncQueue.prototype.start = function () {
            var _this = this;
            this.timer = window.setTimeout(function () {
                _this.processQueue();
            }, this.queuePauseTime);
        };
        AsyncQueue.prototype.stop = function () {
            if (this.timer !== null) {
                window.clearTimeout(this.timer);
            }
            this.timer = null;
        };
        AsyncQueue.prototype.nextItemId = function () {
            this.itemId += 1;
            return this.itemId;
        };
        AsyncQueue.prototype.addItem = function (callback) {
            var item = {
                id: this.nextItemId(),
                callback: callback
            };
            this.queue.push(item);
            this.start();
        };
        return AsyncQueue;
    }());
    exports.default = AsyncQueue;
});
