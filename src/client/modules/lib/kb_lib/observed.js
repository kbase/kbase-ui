var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "./asyncQueue"], function (require, exports, asyncQueue_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Observed = void 0;
    asyncQueue_1 = __importDefault(asyncQueue_1);
    var Observed = /** @class */ (function () {
        function Observed(initialValue) {
            this.listeners = [];
            this.queue = new asyncQueue_1.default({});
            this.value = initialValue;
        }
        Observed.prototype.setValue = function (value) {
            var _this = this;
            this.value = value;
            var oldValue = this.previousValue;
            var newListeners = [];
            this.listeners.forEach(function (listener) {
                _this.queue.addItem((function (listener, value, oldValue) {
                    return function () {
                        try {
                            listener(value, oldValue);
                        }
                        catch (ex) {
                            //TODO: need a sensible way to manage exception reporting.
                            console.error('Error setting value', ex);
                        }
                    };
                })(listener.listener, value, oldValue));
                if (!listener.oneTime) {
                    newListeners.push(listener);
                }
            });
            this.listeners = newListeners;
        };
        // modifyItem(key, modifier) {
        //     var oldState = props.getProp(this.state, key),
        //         newValue = modifier(oldState.value),
        //         newListeners = [];
        //     if (this.listeners[key]) {
        //         this.listeners[key].forEach((item) => {
        //             this.queue.addItem({
        //                 onRun: ((fun, value, oldvalue) => {
        //                     return () => {
        //                         try {
        //                             fun(value, oldvalue);
        //                         } catch (ex) {
        //                             //TODO: need a sensible way to manage exception reporting.
        //                             //console.log('EX running onrun handler');
        //                             //console.log(ex);
        //                         }
        //                     };
        //                 })(item.onSet, newValue, oldState && oldState.value)
        //             });
        //             if (!item.oneTime) {
        //                 newListeners.push(item);
        //             }
        //         });
        //         this.listeners[key] = newListeners;
        //     }
        //     props.setProp(this.state, key, { status: 'set', value: newValue, time: new Date() });
        //     return this;
        // }
        Observed.prototype.getValue = function () {
            return this.value;
        };
        Observed.prototype.onChange = function (listener) {
            this.listeners.push({
                listener: listener,
                oneTime: false
            });
        };
        Observed.prototype.whenChanged = function () {
            var resolver;
            var promise = new Promise(function (resolve) {
                resolver = resolve;
            });
            var listener = function (value, oldValue) {
                resolver(value);
            };
            this.listeners.push({
                listener: listener,
                oneTime: true
            });
            return promise;
        };
        return Observed;
    }());
    exports.Observed = Observed;
});
