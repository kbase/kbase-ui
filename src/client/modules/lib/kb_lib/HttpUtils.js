// class HttpQueryField {
//     key: string;
//     value: string;
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HttpQuery = void 0;
    var HttpQuery = /** @class */ (function () {
        function HttpQuery(map) {
            this.queryMap = {};
            if (typeof map === 'undefined') {
                map = {};
            }
            this.queryMap = map;
        }
        HttpQuery.prototype.addField = function (key, value) {
            this.queryMap[key] = value;
        };
        HttpQuery.prototype.removeField = function (key) {
            delete this.queryMap[key];
        };
        HttpQuery.prototype.toString = function () {
            var that = this;
            return Object.keys(this.queryMap).map(function (key) {
                return [key, that.queryMap[key]]
                    .map(encodeURIComponent)
                    .join('=');
            }).join('&');
        };
        return HttpQuery;
    }());
    exports.HttpQuery = HttpQuery;
});
