// class HttpQueryField {
//     key: string;
//     value: string;
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HTTPQuery = void 0;
    var HTTPQuery = /** @class */ (function () {
        function HTTPQuery(map) {
            this.queryMap = {};
            if (typeof map === 'undefined') {
                map = {};
            }
            this.queryMap = map;
        }
        HTTPQuery.prototype.addField = function (key, value) {
            this.queryMap[key] = value;
        };
        HTTPQuery.prototype.removeField = function (key) {
            delete this.queryMap[key];
        };
        HTTPQuery.prototype.toString = function () {
            var that = this;
            return Object.keys(this.queryMap).map(function (key) {
                return [key, that.queryMap[key]]
                    .map(encodeURIComponent)
                    .join('=');
            }).join('&');
        };
        return HTTPQuery;
    }());
    exports.HTTPQuery = HTTPQuery;
});
