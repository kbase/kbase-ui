define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ServiceClass = exports.CoreServicesMonitor = void 0;
    var CoreServicesMonitor = /** @class */ (function () {
        function CoreServicesMonitor(_a) {
            var runtime = _a.params.runtime;
            this.runtime = runtime;
        }
        CoreServicesMonitor.prototype.start = function () {
            return Promise.resolve();
        };
        CoreServicesMonitor.prototype.stop = function () {
            return Promise.resolve();
        };
        CoreServicesMonitor.prototype.pluginHandler = function () {
        };
        CoreServicesMonitor.prototype.addCoreServiceDependency = function () {
        };
        return CoreServicesMonitor;
    }());
    exports.CoreServicesMonitor = CoreServicesMonitor;
    exports.ServiceClass = CoreServicesMonitor;
});
