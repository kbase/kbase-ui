define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.tryPromise = exports.isEqual = exports.uniqueId = void 0;
    exports.uniqueId = (function () {
        var genIdSerial = 0;
        return function () {
            var random = Math.floor(Math.random() * 1000);
            var time = new Date().getTime();
            if (genIdSerial === 1000) {
                genIdSerial = 0;
            }
            genIdSerial += 1;
            return [random, time, genIdSerial].map(String).join('-');
        };
    })();
    /**
       * Determines, through a thorough and deep inspection, whether
       * two values are equal. Inspects all array items in order,
       * all object properties.
       *
       * @function isEqual
       *
       * @param {Any} v1 - a value to compare to a second
       * @param {Any} v2 - another value to compare to the first
       *
       * @returns {boolean} true if the two values are equal, false
       * otherwise.
       *
       * @static
       */
    function isEqual(v1, v2) {
        var path = [];
        function iseq(v1, v2) {
            var t1 = typeof v1;
            var t2 = typeof v2;
            if (t1 !== t2) {
                return false;
            }
            switch (t1) {
                case 'string':
                case 'number':
                case 'boolean':
                    if (v1 !== v2) {
                        return false;
                    }
                    break;
                case 'undefined':
                    if (t2 !== 'undefined') {
                        return false;
                    }
                    break;
                case 'object':
                    if (v1 instanceof Array) {
                        if (v1.length !== v2.length) {
                            return false;
                        }
                        else {
                            for (var i = 0; i < v1.length; i++) {
                                path.push(i);
                                if (!iseq(v1[i], v2[i])) {
                                    return false;
                                }
                                path.pop();
                            }
                        }
                    }
                    else if (v1 === null) {
                        if (v2 !== null) {
                            return false;
                        }
                    }
                    else if (v2 === null) {
                        return false;
                    }
                    else {
                        var k1 = Object.keys(v1).sort();
                        var k2 = Object.keys(v2).sort();
                        if (k1.length !== k2.length) {
                            return false;
                        }
                        for (var i = 0; i < k1.length; i++) {
                            path.push(k1[i]);
                            if (!iseq(v1[k1[i]], v2[k1[i]])) {
                                return false;
                            }
                            path.pop();
                        }
                    }
            }
            return true;
        }
        return iseq(v1, v2);
    }
    exports.isEqual = isEqual;
    function tryPromise(callback) {
        return new Promise(function (resolve, reject) {
            try {
                resolve(callback());
            }
            catch (ex) {
                reject(ex);
            }
        });
    }
    exports.tryPromise = tryPromise;
});
