define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isJSONValue = exports.isJSONArray = exports.isJSONObject = void 0;
    ;
    function isJSONObject(value) {
        if (typeof value !== 'object') {
            return false;
        }
        if (value === null) {
            return false;
        }
        if (Array.isArray(value)) {
            return false;
        }
        return true;
    }
    exports.isJSONObject = isJSONObject;
    function isJSONArray(value) {
        if (Array.isArray(value)) {
            return true;
        }
        return false;
    }
    exports.isJSONArray = isJSONArray;
    function isJSONValue(value) {
        var typeOf = typeof value;
        if (['string', 'number', 'boolean'].indexOf(typeOf) >= 0) {
            return true;
        }
        if (typeof value !== 'object') {
            return false;
        }
        if (value === null) {
            return true;
        }
        if (Array.isArray(value)) {
            return !value.some(function (subvalue) {
                return !isJSONValue(subvalue);
            });
        }
        if (value.constructor === {}.constructor) {
            return !Object.keys(value).some(function (key) {
                return !isJSONValue(value[key]);
            });
        }
        return false;
    }
    exports.isJSONValue = isJSONValue;
});
