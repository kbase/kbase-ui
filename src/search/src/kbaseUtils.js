/*jslint browser: true,  todo: true, vars: true, nomen: true */
/**
 * A collection of useful function provided on a single Utils object.
 * @module Utils
 * @author Erik Pearson <eapearson@lbl.gov>
 * @version 0.0.2
 * 
 * @todo complete testing
 * @todo determine if methods are unused, and if so, remove them
 * @todo move the xProp methods to their own module
 * @todo add exception and async testing
 * @todo move any kbase api methods into kb.utils.api
 */

/**
 * Any Javsascript type.
 * 
 * @typedef {(object|string|number|boolean|undefined|function)} Any
 */

/**
 * An ordered list of properties that specify a path into an object. Each
 * path item represents a property name of the current object. The first 
 * item represents a property of the immediate object, the second a property
 * of the value of the first property, if that contained an object, and so
 * forth. The canonical representation is an array of strings, but a string
 * with property components separated by dots is a natural and easier form
 * for people.
 * 
 * @typedef {(string|string[])} PropertyPath
 */

define(['q'], function (Q) {
    "use strict";
    var Utils = Object.create({}, {
        version: {
            value: '0.0.2',
            writable: false
        },
        /**
         * Get the value for property from an object. The property may
         * be provided as string or array of strings. If a string, it 
         * will be converted to an array by splitting at each period (.). 
         * The array of strings forms a "path" into the object. 
         * 
         * @function  getProp
         * 
         * @param {object} obj - The object containing the property
         * @param {string|string[]} props - The path into the object on 
         * which to find the value.
         * @param {Any} defaultValue - A value to return if the property was not 
         * found. Defaults to undefined.
         * 
         * @returns {Any} - The property value, if found, or the 
         * default value, if not.
         * 
         * @example
         * var room = {livingroom: {chair: {color: 'red'}}}
         * var color = U.getProp(room, 'livingroom.chair.color');
         * // color === 'red';
         * 
         * @static
         */
        getProp: {
            value: function (obj, props, defaultValue) {
                if (typeof props === 'string') {
                    props = props.split('.');
                } else if (!(props instanceof Array)) {
                    throw new TypeError('Invalid type for key: ' + (typeof props));
                }
                var i;
                for (i = 0; i < props.length; i += 1) {
                    if ((obj === undefined) ||
                            (typeof obj !== 'object') ||
                            (obj === null)) {
                        return defaultValue;
                    }
                    obj = obj[props[i]];
                }
                if (obj === undefined) {
                    return defaultValue;
                } else {
                    return obj;
                }
            }
        },
        /**
         * Determine whether a nested property exists on the given 
         * object.
         * 
         * @function hasProp
         * 
         * @param {object} obj - The object in question
         * @param {PropertyPath} propPath - The property to be 
         * inspected.
         * 
         * @returns {boolean} - true if the property exists, false 
         * otherwise.
         * 
         * @example
         * var obj = {earth: {northamerica: {unitedstates: {california: {berkeley: {university: 'ucb'}}}}}};
         * var hasUniversity = U.hasProp(obj, 'earth.northamerica.unitedstates.california.berkeley.university');
         * // hasUniversity === true
         * 
         * @static
         */
        hasProp: {
            value: function (obj, propPath) {
                if (typeof propPath === 'string') {
                    propPath = propPath.split('.');
                }
                var i;
                for (i = 0; i < propPath.length; i += 1) {
                    if ((obj === undefined) ||
                            (typeof obj !== 'object') ||
                            (obj === null)) {
                        return false;
                    }
                    obj = obj[propPath[i]];
                }
                if (obj === undefined) {
                    return false;
                } else {
                    return true;
                }
            }
        },
        /**
         * Set the nested property of the object to the given value.
         * Since this is a nested property, the final property key
         * is the one that actually gets the value, any prior property
         * path components are used to "walk" the object to that 
         * property.
         * 
         * @function setProp
         * 
         * @param {object} obj - the object in which to set the property
         * @param {string|string[]} path - the property path on which to
         * set the property value
         * @param {any} value - the value to set on the property
         * 
         * @static
         */
        setProp: {
            value: function (obj, path, value) {
                if (typeof path === 'string') {
                    path = path.split('.');
                }
                if (path.length === 0) {
                    return;
                }
                // pop off the last property for setting at the end.
                var propKey = path.pop(),
                    key;
                // Walk the path, creating empty objects if need be.
                while (path.length > 0) {
                    key = path.shift();
                    if (obj[key] === undefined) {
                        obj[key] = {};
                    }
                    obj = obj[key];
                }
                // Finally set the property.
                obj[propKey] = value;
                return value;
            }
        },
        /**
         * Increments a numeric property by a 1 or a given optional value.
         * Creates the property if it does not exist, setting the initial
         *  value to the increment value.
         * 
         * @function incrProp
         * 
         * @param {object} obj - the object on which to increment the property
         * @param {string|string[]} path - the property path on which to 
         * increment the property
         * @param {value} [increment=1] - the value by which to increment
         * the property
         * 
         * @returns {number|undefined} the new value of the incremented 
         * property or undefined if an invalid property is supplied.
         * 
         * @throws {TypeError} Thrown if the target property contains a
         * non-numeric value.
         * 
         * @example
         * var obj = {cars: 0};
         * Utils.incrProp(obj, cars);
         * // {cars: 1}
         * 
         * @example
         * var obj = {countdown: 10};
         * Utils.incrProp(obj, countdown, -1);
         * // {countdown: 9}
         * 
         * @static
         */
        incrProp: {
            value: function (obj, path, increment) {
                if (typeof path === 'string') {
                    path = path.split('.');
                }
                if (path.length === 0) {
                    return;
                }
                increment = (increment === undefined) ? 1 : increment;
                var propKey = path.pop(),
                    key;
                while (path.length > 0) {
                    key = path.shift();
                    if (obj[key] === undefined) {
                        obj[key] = {};
                    }
                    obj = obj[key];
                }
                if (obj[propKey] === undefined) {
                    obj[propKey] = increment;
                } else {
                    if (typeof obj[propKey] === 'number') {
                        obj[propKey] += increment;
                    } else {
                        throw new Error('Can only increment a number');
                    }
                }
                return obj[propKey];
            }
        },
        /**
         * For a given object delets a property specified by a path 
         * 
         * @function deleteProp
         * 
         * @param {object} - the object on which to remove the property
         * @param {string|string[]} - the property specified as a path to delete
         * 
         * @returns {boolean} - true if the deletion was carried out, false
         *  if the property could not be found.
         *  
         * @example
         * var obj = {pets: {fido: {type: 'dog'}, {spot: {type: 'lizard'}}};
         * U.deleteProp(obj, 'pets.spot');
         * // {pets: {fido: {type: 'dog'}}}
         *  
         * @static
         */
        deleteProp: {
            value: function (obj, path) {
                if (typeof path === 'string') {
                    path = path.split('.');
                }
                if (path.length === 0) {
                    return;
                }
                var propKey = path.pop(),
                        key;
                while (path.length > 0) {
                    key = path.shift();
                    if (obj[key] === undefined) {
                        return false;
                    }
                    obj = obj[key];
                }
                delete obj[propKey];
                return true;
            }
        },
        /**
         * Calls a kbase service client method inside of a promise. Returns
         * a promise that can be used in promises-style composition.
         * KBase service clients are generated by the kbase type compiler,
         * and follow an unvarying call pattern of:
         * Client.method(data, successFunction, errorFunction)
         * Note: the name of this function was chosen to be short and
         * context-free -- the context provided by the specific client
         * and method provided as input (and thus appearing in the 
         * call to promise). More descriptive might be
         * KBaseServiceClientMethodCallPromise, but ...
         * 
         * @function promise
         * 
         * @param {object} client - An instance of a KBase service client
         * @param {string} method - the name of a method on the service client
         * @param {any} arg1 - an arbitrary object passed directly to the
         * method. It should be a json-compatible object, for that is what
         * is passed to the service endpoint (via ajax).
         * 
         * @returns {Promise} a promise which when fulfilled with supply
         * the return value from the kbase api call.
         * 
         * @throws {TypeError} - if the method is not found on the client
         * 
         * @static
         * 
         * @todo testing
         */
        promise: {
            value: function (client, method, arg1) {
                return Q.Promise(function (resolve, reject) {
                    if (!client[method]) {
                        throw new TypeError('Invalid KBase Client call; method "' + method + '" not found in client "' + client.constructor + '"');
                    }
                    client[method](arg1,
                            function (result) {
                                resolve(result);
                            },
                            function (err) {
                                reject(err);
                            });
                });
            }
        },
        /**
         * Get a node from within a json schema specification object.
         * 
         * @function getSchemaNode
         * 
         * @param {object} schema - a json schmea object
         * @param {PropertyPath} propPath - the path to the schema node
         * 
         * @returns {Any} the value at the specified node.
         * 
         * @static
         * 
         * @todo is this really used? If so, needs own module
         * @todo testing
         */
        getSchemaNode: {
            value: function (schema, propPath) {
                var props = propPath.split('.'),
                        i;
                // doesn't handle arrays now.
                for (i = 0; i < props.length; (i += 1)) {
                    var prop = props[i];
                    // Get the node.
                    switch (schema.type) {
                        case 'object':
                            var field = schema.properties[prop];
                            if (!field) {
                                throw 'Field ' + prop + ' in ' + propPath + ' not found.';
                            }
                            schema = field;
                            break;
                        case 'string':
                        case 'integer':
                        case 'boolean':
                        default:
                            throw 'Cannot get a node on type type ' + schema.type;
                    }
                }

                return schema;
            }
        },
        /**
         * The old classic standby - determines if an arbitrary value is
         * considered to be blank, empty, devoid of information.
         * This is very useful in the context of rendering a value for 
         * human consumption, also for validation.
         * A value is considered blank if:
         * it is undefined, it is null
         * it is a string or array of 0 length
         * it is an object with 0 own property names
         * This leaves any number, boolean, or function as non-blank.
         * 
         * @function isBlank
         * 
         * @param {Any} value - any javascript value of any type
         * 
         * @returns {boolean} - true if the object is considered blank,
         * false otherwise.
         * 
         * @static
         */
        isBlank: {
            value: function (value) {
                if (value === undefined) {
                    return true;
                } else if (typeof value === 'object') {
                    if (value === null) {
                        return true;
                    } else if (value.push && value.pop) {
                        if (value.length === 0) {
                            return true;
                        }
                    } else {
                        if (Object.getOwnPropertyNames(value).length === 0) {
                            return true;
                        }
                    }
                } else if (typeof value === 'string' && value.length === 0) {
                    return true;
                }
                return false;
            }
        },
        /**
         * Given two objects, overlays the second on top of the first, 
         * ensuring that any property on the second exists on the first, 
         * creating or overwriting properties as necessary.
         * Why another mix/extend/merge? I wanted to be in control of 
         * policy regarding the overwriting, or not, of properties.
         * E.g. I consider null to be a value indicating lack of any
         * other value, whereas undefined indicates no value, but we
         * don't know whether it might have a value.
         * 
         * @function merge
         * 
         * @param {object} objA - the target object, will be modified
         * @param {object} objB - the source object
         * 
         * @returns {object} - the merged object
         * 
         * @throws {TypeError} if a destination property value cannot 
         * support a sub-property, yet the merge calls for it.
         * 
         * @static
         */
        merge: {
            value: function (objA, objB) {
                var Merger = {
                    init: function (obj) {
                        this.dest = obj;
                        return this;
                    },
                    getType: function (x) {
                        var t = typeof x;
                        if (t === 'object') {
                            if (x === null) {
                                return 'null';
                            } else if (x.pop && x.push) {
                                return 'array';
                            } else {
                                return 'object';
                            }
                        } else {
                            return t;
                        }
                    },
                    merge: function (dest, obj) {
                        this.dest = dest;
                        switch (this.getType(obj)) {
                            case 'string':
                            case 'integer':
                            case 'boolean':
                            case 'null':
                                throw new TypeError("Can't merge a '" + (typeof obj) + "'");
                                break;
                            case 'object':
                                return this.mergeObject(obj);
                                break;
                            case 'array':
                                return this.mergeArray(obj);
                                break;
                            default:
                                throw new TypeError("Can't merge a '" + (typeof obj) + "'");
                        }

                    },
                    mergeObject: function (obj) {
                        var keys = Object.keys(obj);
                        for (var i = 0; i < keys.length; i++) {
                            var key = keys[i];
                            var val = obj[key];
                            var t = this.getType(val);
                            switch (t) {
                                case 'string':
                                case 'number':
                                case 'boolean':
                                case 'null':
                                    this.dest[key] = val;
                                    break;
                                case 'object':
                                    if (!this.dest[key]) {
                                        this.dest[key] = {};
                                    }
                                    this.dest[key] = Object.create(Merger).init(this.dest[key]).mergeObject(obj[key]);
                                    break;
                                case 'array':
                                    if (!this.dest[key]) {
                                        this.dest[key] = [];
                                    } else {
                                        this.dest[key] = [];
                                    }
                                    this.dest[key] = Object.create(Merger).init(this.dest[key]).mergeArray(obj[key]);
                                    break;
                                case 'undefined':
                                    if (this.dest[key]) {
                                        delete this.dest[key];
                                    }
                                    break;
                            }
                        }
                        return this.dest;
                    },
                    mergeArray: function (arr) {
                        var deleted = false;
                        for (var i = 0; i < arr.length; i++) {
                            var val = arr[i];
                            var t = this.getType(val);
                            switch (t) {
                                case 'string':
                                case 'number':
                                case 'boolean':
                                case 'null':
                                    this.dest[i] = val;
                                    break;
                                case 'object':
                                    if (!this.dest[i]) {
                                        this.dest[i] = {};
                                    }
                                    this.dest[i] = Object.create(Merger).init(this.dest[i]).mergeObject(arr[i]);
                                    break;
                                case 'array':
                                    if (!this.dest[i]) {
                                        this.dest[i] = [];
                                    }
                                    this.dest[i] = Object.create(Merger).init(this.dest[i]).mergeArray(arr[i]);
                                    break;
                                case 'undefined':
                                    if (this.dest[i]) {
                                        this.dest[i] = undefined;
                                    }
                                    break;
                            }
                        }
                        if (deleted) {
                            return this.dest.filter(function (value) {
                                if (value === undefined) {
                                    return false;
                                } else {
                                    return true;
                                }
                            });
                        } else {
                            return this.dest;
                        }
                    }
                };
                return Object.create(Merger).merge(objA, objB);
            }
        },
        /**
         * Given an ISO8601 date in full regalia, with a GMT/UTC timezone offset attached
         * in #### format, reformat the date into ISO8601 with no timezone.
         * Javascript (at present) does not like timezone attached and assumes all such
         * datetime strings are UTC.
         * YYYY-MM-DDThh:mm:ss[+-]hh[:]mm
         * where the +is + or -, and the : in the timezone is optional. 
         * 
         * @function iso8601ToDate
         * 
         * @param {string} dateString - an string encoding a date-time in iso8601 format
         * 
         * @returns {Date} - a date object representing the same time as provided in the input.
         * 
         * @throws {TypeError} if the input date string does not parse strictly as 
         * an ISO8601 full date format.
         * 
         * @static
         */
        iso8601ToDate: {
            value: function (dateString) {
                if (!dateString) {
                    return null;
                }
                var isoRE = /(\d\d\d\d)-(\d\d)-(\d\d)T(\d\d):(\d\d):(\d\d)([\+\-])(\d\d)(:?[\:]*)(\d\d)/;
                var dateParts = isoRE.exec(dateString);
                if (!dateParts) {
                    throw new TypeError('Invalid Date Format for ' + dateString);
                }
                // This is why we do this -- JS insists on the colon in the tz offset.
                var offset = dateParts[7] + dateParts[8] + ':' + dateParts[10];
                var newDateString = dateParts[1] + '-' + dateParts[2] + '-' + dateParts[3] + 'T' + dateParts[4] + ':' + dateParts[5] + ':' + dateParts[6] + offset;
                return new Date(newDateString);
            }
        },
        /**
         * Shows a date with a more human oriented approach to expressing the difference 
         * between the current date and the subject date.
         * 
         * @function niceElapsedTime
         * 
         * @param {Date|string|integer} - a Javascript date object,
         * a parsable date string or a UTC time in milliseconds (from
         * 1/1/1970)
         * 
         * @returns {string} - a formatted representation of the time elapsed
         * from the given date to the present moment.
         * 
         * @example
         * If a time a time is within the last hour, express it in minutes.
         * If it is in the last day, express it in hours.
         * If it is yesterday, yesterday.
         * If it is any other date in the past, use the date, with no time.
         * If it is in the past and it is not a date, append "ago", as in "3 hours ago"
         * If it is in the future, prepend "in", as in "in 5 minues"
         * 
         * @static
         * 
         */
        niceElapsedTime: {
            value: function (dateObj, nowDateObj) {
                if (typeof dateObj === 'string') {
                    var date = new Date(dateObj);
                } else if (typeof dateObj === 'number') {
                    var date = new Date(dateObj);
                } else {
                    var date = dateObj;
                }
                if (nowDateObj === undefined) {
                    var now = new Date();
                } else if (typeof nowDateObj === 'string') {
                    var now = new Date(nowDateObj);
                } else {
                    var now = nowDateObj;
                }

                var shortMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

                var elapsed = Math.round((now.getTime() - date.getTime()) / 1000);
                var elapsedAbs = Math.abs(elapsed);

                // Within the last 7 days...
                if (elapsedAbs < 60 * 60 * 24 * 7) {
                    if (elapsedAbs === 0) {
                        return 'now';
                    } else if (elapsedAbs < 60) {
                        var measure = elapsed;
                        var measureAbs = elapsedAbs;
                        var unit = 'second';
                    } else if (elapsedAbs < 60 * 60) {
                        var measure = Math.round(elapsed / 60);
                        var measureAbs = Math.round(elapsedAbs / 60);
                        var unit = 'minute';
                    } else if (elapsedAbs < 60 * 60 * 24) {
                        var measure = Math.round(elapsed / 3600);
                        var measureAbs = Math.round(elapsedAbs / 3600);
                        var unit = 'hour';
                    } else if (elapsedAbs < 60 * 60 * 24 * 7) {
                        var measure = Math.round(elapsed / (3600 * 24));
                        var measureAbs = Math.round(elapsedAbs / (3600 * 24));
                        var unit = 'day';
                    }

                    if (measureAbs > 1) {
                        unit += 's';
                    }

                    var prefix = null;
                    var suffix = null;
                    if (measure < 0) {
                        var prefix = 'in';
                    } else if (measure > 0) {
                        var suffix = 'ago';
                    }

                    return (prefix ? prefix + ' ' : '') + measureAbs + ' ' + unit + (suffix ? ' ' + suffix : '');
                } else {
                    // otherwise show the actual date, with or without the year.
                    if (now.getFullYear() === date.getFullYear()) {
                        return shortMonths[date.getMonth()] + " " + date.getDate();
                    } else {
                        return shortMonths[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();
                    }
                }
            }
        },
        /**
         * Displays a friendly timestamp, with full date and time details
         * down to the minute, in local time.
         * 
         * @function niceTimestamp
         * 
         * @params {string|number|Date} - A date in either a Date object
         * or a form that can be converted by the Date constructor.
         * 
         * @returns {string} a friendly formatted timestamp.
         * 
         * @static
         */
        niceTimestamp: {
            value: function (dateObj) {
                if (typeof dateObj === 'string') {
                    var date = new Date(dateObj);
                } else if (typeof dateObj === 'number') {
                    var date = new Date(dateObj);
                } else {
                    var date = dateObj;
                }

                var shortMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                var minutes = date.getMinutes();
                if (minutes < 10) {
                    minutes = "0" + minutes;
                }
                if (date.getHours() >= 12) {
                    if (date.getHours() !== 12) {
                        var time = (date.getHours() - 12) + ":" + minutes + "pm";
                    } else {
                        var time = "12:" + minutes + "pm";
                    }
                } else {
                    var time = date.getHours() + ":" + minutes + "am";
                }
                var timestamp = shortMonths[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear() + " at " + time;
                return timestamp;
            }
        },
        /**
         * Given a number, formats it in a manner appropriate for 
         * representing a file size. It uses recognizable units, 
         * bytes, K, M, G, T and attempts to show at meaningful scale.
         * 
         * @function fileSizeFormat
         * 
         * @params {number} - the size of the file
         * 
         * @returns {string} a formatted string representing the size of the
         * file in recognizable units.
         * 
         * @static
         * 
         * @todo complete, test
         * @todo there is a complete version somewhere else 
         */
        fileSizeFormat: {
            value: function (num) {
                if (typeof num === 'string') {
                    var num = parseInt(num);
                }

                var pieces = [];
                while (num > 0) {
                    var group = num % 1000;
                    pieces.unshift(group + '');
                    num = Math.floor(num / 1000);
                    if (num > 0) {
                        pieces.unshift(',');
                    }
                }
                return pieces.join('') + ' bytes';
            }
        },
        /**
         * Do an ajax call wrapped in a promise.
         * 
         * @function getJSON
         * 
         * @param {string} path - the url to get
         * @param {integer} timeout - how long to wait before returning an error
         * 
         * @static
         */
        // TODO: is this really used? It does not appear to be.
        getJSON: {
            value: function (path, timeout) {
                // web just wrap the jquery ajax promise in a REAL Q promise.
                // JQuery ajax config handles the json conversion.
                // If we want more control, we could just handle the jquery promise
                // first, and then return a promise.
                return Q($.ajax(path, {
                    type: 'GET',
                    dataType: 'json',
                    timeout: timeout || 10000
                }));

            }
        },
        /**
         * Convert an object to an array, transforming the key and value
         * into properties of a simple object which becomes the array
         * element values.
         * 
         * @function object_to_array
         * 
         * @param {object} obj - some object
         * @param {string} keyName - becomes the property name of each 
         * array item holding the key value
         * @param {string} valueName - becomes the property name of each 
         * array item holding the object.
         * 
         * @returns {array} an array of simple objects of two proerties,
         * holding the key and value of for each original property of the
         * input object.
         * 
         * @static 
         */
        object_to_array: {
            value: function (obj, keyName, valueName) {
                var keys = Object.keys(obj);
                var arr = [];
                for (var i in keys) {
                    var newObj = {};
                    newObj[keyName] = keys[i];
                    newObj[valueName] = obj[keys[i]];
                    arr.push(newObj);
                }
                return arr;
            }
        },
        /**
         * Given an array of objects...
         * 
         * @function mapAnd
         * 
         * @param {object[][]} arrs - an array of arrays
         * @param {function} run - apply to each
         * 
         * @return {boolean} 
         * 
         * @todo is this used? it does not appear to be.
         */
        mapAnd: {
            value: function (arrs, fun) {
                var keys = Object.keys(arrs[0]);
                for (var i = 0; i < arrs[0].length; i++) {
                    var args = [];
                    for (var j = 0; j < arrs.length; j++) {
                        args.push(arrs[j][i]);
                        if (!fun.call(null, args)) {
                            return false;
                        }
                    }
                }
                return true;
            }
        },
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
        isEqual: {
            value: function (v1, v2) {
                var _this = this;
                var path = [];
                var iseq = function (v1, v2) {

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
                                } else {
                                    for (var i = 0; i < v1.length; i++) {
                                        path.push(i);
                                        if (!iseq(v1[i], v2[i])) {
                                            return false;
                                        }
                                        path.pop();
                                    }
                                }
                            } else if (v1 === null) {
                                if (v2 !== null) {
                                    return false;
                                }
                            } else if (v2 === null) {
                                return false;
                            } else {
                                var k1 = Object.keys(v1);
                                var k2 = Object.keys(v2);
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
                }.bind(this);
                return iseq(v1, v2);
            }
        }
    });

    return Utils;
});