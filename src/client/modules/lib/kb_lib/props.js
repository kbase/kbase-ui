define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Props = exports.deleteProp = exports.incrProp = exports.setProp = exports.hasProp = exports.getProp = void 0;
    function getProp(obj, propPath, defaultValue) {
        if (typeof propPath === 'string') {
            propPath = propPath.split('.');
        }
        else if (!(propPath instanceof Array)) {
            throw new TypeError('Invalid type for key: ' + (typeof propPath));
        }
        for (var i = 0; i < propPath.length; i += 1) {
            if ((obj === undefined) ||
                (typeof obj !== 'object') ||
                (obj === null)) {
                return defaultValue;
            }
            obj = obj[propPath[i]];
        }
        if (obj === undefined) {
            return defaultValue;
        }
        return obj;
    }
    exports.getProp = getProp;
    function hasProp(obj, propPath) {
        if (typeof propPath === 'string') {
            propPath = propPath.split('.');
        }
        else if (!(propPath instanceof Array)) {
            throw new TypeError('Invalid type for key: ' + (typeof propPath));
        }
        for (var i = 0; i < propPath.length; i += 1) {
            if ((obj === undefined) ||
                (typeof obj !== 'object') ||
                (obj === null)) {
                return false;
            }
            obj = obj[propPath[i]];
        }
        if (obj === undefined) {
            return false;
        }
        return true;
    }
    exports.hasProp = hasProp;
    function setProp(obj, propPath, value) {
        if (typeof propPath === 'string') {
            propPath = propPath.split('.');
        }
        else if (!(propPath instanceof Array)) {
            throw new TypeError('Invalid type for key: ' + (typeof propPath));
        }
        if (propPath.length === 0) {
            return;
        }
        // pop off the last property for setting at the end.
        var propKey = propPath[propPath.length - 1];
        var key;
        // Walk the path, creating empty objects if need be.
        for (var i = 0; i < propPath.length - 1; i += 1) {
            key = propPath[i];
            if (obj[key] === undefined) {
                obj[key] = {};
            }
            obj = obj[key];
        }
        // Finally set the property.
        obj[propKey] = value;
    }
    exports.setProp = setProp;
    function incrProp(obj, propPath, increment) {
        if (typeof propPath === 'string') {
            propPath = propPath.split('.');
        }
        else if (!(propPath instanceof Array)) {
            throw new TypeError('Invalid type for key: ' + (typeof propPath));
        }
        if (propPath.length === 0) {
            throw new TypeError('Property path must have at least one element');
        }
        increment = (typeof increment === 'undefined') ? 1 : increment;
        var propKey = propPath[propPath.length - 1];
        for (var i = 0; i < propPath.length - 1; i += 1) {
            var key = propPath[i];
            if (obj[key] === undefined) {
                obj[key] = {};
            }
            obj = obj[key];
        }
        if (typeof obj[propKey] === 'undefined') {
            obj[propKey] = increment;
        }
        else {
            if (typeof obj[propKey] === 'number') {
                obj[propKey] += increment;
            }
            else {
                throw new Error('Can only increment a number');
            }
        }
        return obj[propKey];
    }
    exports.incrProp = incrProp;
    function deleteProp(obj, propPath) {
        if (typeof propPath === 'string') {
            propPath = propPath.split('.');
        }
        else if (!(propPath instanceof Array)) {
            throw new TypeError('Invalid type for key: ' + (typeof propPath));
        }
        if (propPath.length === 0) {
            return false;
        }
        var propKey = propPath[propPath.length - 1];
        for (var i = 0; i < propPath.length - 1; i += 1) {
            var key = propPath[i];
            if (obj[key] === undefined) {
                // for idempotency, and utility, do not throw error if
                // the key doesn't exist.
                return false;
            }
            obj = obj[key];
        }
        if (obj[propKey] === undefined) {
            return false;
        }
        delete obj[propKey];
        return true;
    }
    exports.deleteProp = deleteProp;
    var Props = /** @class */ (function () {
        function Props(_a) {
            var data = _a.data;
            this.obj = typeof data === 'undefined' ? {} : data;
        }
        Props.prototype.getItem = function (props, defaultValue) {
            return getProp(this.obj, props, defaultValue);
        };
        Props.prototype.hasItem = function (propPath) {
            return hasProp(this.obj, propPath);
        };
        Props.prototype.setItem = function (path, value) {
            return setProp(this.obj, path, value);
        };
        Props.prototype.incrItem = function (path, increment) {
            return incrProp(this.obj, path, increment);
        };
        Props.prototype.deleteItem = function (path) {
            return deleteProp(this.obj, path);
        };
        Props.prototype.getRaw = function () {
            return this.obj;
        };
        return Props;
    }());
    exports.Props = Props;
});
