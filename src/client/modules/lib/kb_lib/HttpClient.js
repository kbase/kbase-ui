var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define(["require", "exports", "./HttpUtils"], function (require, exports, HttpUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HttpClient = exports.AbortError = exports.GeneralError = exports.TimeoutError = exports.HttpHeader = void 0;
    var HttpHeader = /** @class */ (function () {
        function HttpHeader(initialHeaders) {
            if (typeof initialHeaders === 'undefined') {
                this.header = {};
            }
            else if (initialHeaders instanceof XMLHttpRequest) {
                this.header = HttpHeader.fromXHR(initialHeaders);
            }
            else if (initialHeaders instanceof Map) {
                this.header = HttpHeader.fromMap(initialHeaders);
            }
            else {
                this.header = HttpHeader.fromMap(initialHeaders);
            }
        }
        HttpHeader.fromXHR = function (xhr) {
            var responseHeaders = xhr.getAllResponseHeaders();
            if (!responseHeaders) {
                return {};
            }
            var fieldsArray = responseHeaders.split(/\n/);
            var fieldsMap = {};
            fieldsArray.forEach(function (field) {
                var firstColon = field.indexOf(':', 0);
                var name = field.substr(0, firstColon).trim();
                var value = field.substr(firstColon + 1).trim();
                fieldsMap[name.toLowerCase()] = value;
            });
            return fieldsMap;
        };
        HttpHeader.fromMap = function (header) {
            var fieldsMap = {};
            header.forEach(function (value, key) {
                fieldsMap[key.toLowerCase()] = value;
            });
            return fieldsMap;
        };
        HttpHeader.fromObject = function (header) {
            var fieldsMap = {};
            Object.keys(header).forEach(function (name) {
                fieldsMap[name.toLowerCase()] = header[name];
            });
            return fieldsMap;
        };
        HttpHeader.prototype.getHeader = function (fieldName) {
            return this.header[fieldName.toLowerCase()];
        };
        HttpHeader.prototype.setHeader = function (fieldName, fieldValue) {
            this.header[fieldName.toLowerCase()] = fieldValue;
        };
        HttpHeader.prototype.exportHeader = function (xhr) {
            var _this = this;
            Object.keys(this.header)
                .filter(function (key) {
                if (_this.getHeader(key) === undefined ||
                    _this.getHeader(key) === null) {
                    return false;
                }
                return true;
            })
                .forEach(function (key) {
                // normalize value?
                var stringValue = (function (value) {
                    switch (typeof value) {
                        case 'string': return value;
                        case 'number': return String(value);
                        case 'boolean': return String(value);
                        default:
                            throw new Error('Invalid type for header value: ' + typeof value);
                    }
                }(_this.getHeader(key)));
                xhr.setRequestHeader(key, stringValue);
            });
        };
        return HttpHeader;
    }());
    exports.HttpHeader = HttpHeader;
    // interface HttpHeaderField {
    //     name: string;
    //     value: string;
    // }
    var TimeoutError = /** @class */ (function (_super) {
        __extends(TimeoutError, _super);
        function TimeoutError(timeout, elapsed, message, xhr) {
            var _this = _super.call(this, message) || this;
            Object.setPrototypeOf(_this, TimeoutError.prototype);
            _this.name = 'TimeoutError';
            _this.stack = new Error().stack;
            _this.timeout = timeout;
            _this.elapsed = elapsed;
            _this.xhr = xhr;
            return _this;
        }
        TimeoutError.prototype.toString = function () {
            return this.message;
        };
        return TimeoutError;
    }(Error));
    exports.TimeoutError = TimeoutError;
    var GeneralError = /** @class */ (function (_super) {
        __extends(GeneralError, _super);
        function GeneralError(message, xhr) {
            var _this = _super.call(this, message) || this;
            Object.setPrototypeOf(_this, GeneralError.prototype);
            _this.name = 'GeneralError';
            _this.stack = new Error().stack;
            _this.xhr = xhr;
            return _this;
        }
        GeneralError.prototype.toString = function () {
            return this.message;
        };
        return GeneralError;
    }(Error));
    exports.GeneralError = GeneralError;
    var AbortError = /** @class */ (function (_super) {
        __extends(AbortError, _super);
        function AbortError(message, xhr) {
            var _this = _super.call(this, message) || this;
            Object.setPrototypeOf(_this, AbortError.prototype);
            _this.name = 'AbortError';
            _this.stack = new Error().stack;
            _this.xhr = xhr;
            return _this;
        }
        AbortError.prototype.toString = function () {
            return this.message;
        };
        return AbortError;
    }(Error));
    exports.AbortError = AbortError;
    var HttpClient = /** @class */ (function () {
        function HttpClient() {
        }
        HttpClient.prototype.request = function (options) {
            var startTime = new Date().getTime();
            var that = this;
            return new Promise(function (resolve, reject) {
                var xhr = new XMLHttpRequest();
                xhr.onload = function () {
                    resolve({
                        status: xhr.status,
                        response: xhr.response,
                        responseType: xhr.responseType,
                        header: new HttpHeader(xhr)
                    });
                };
                xhr.ontimeout = function () {
                    var elapsed = (new Date().getTime()) - startTime;
                    reject(new TimeoutError(options.timeout, elapsed, 'Request timeout', xhr));
                };
                xhr.onerror = function () {
                    reject(new GeneralError('General request error ' + options.url, xhr));
                };
                xhr.onabort = function () {
                    reject(new AbortError('Request was aborted', xhr));
                };
                var url = options.url;
                if (options.query) {
                    url += '?' + new HttpUtils_1.HttpQuery(options.query).toString();
                }
                var rt = (options.responseType || 'text');
                xhr.responseType = rt;
                try {
                    xhr.open(options.method, url, true);
                }
                catch (ex) {
                    reject(new GeneralError('Error opening request ' + ex.name, xhr));
                    return;
                }
                if (options.timeout) {
                    xhr.timeout = options.timeout;
                }
                xhr.withCredentials = options.withCredentials || false;
                try {
                    if (options.header) {
                        options.header.exportHeader(xhr);
                    }
                }
                catch (ex) {
                    reject(new GeneralError('Error applying header before send ' + ex.name, xhr));
                }
                try {
                    if (typeof options.data === 'string') {
                        xhr.send(options.data);
                        // if (onCancel) {
                        //     onCancel(() => {
                        //         xhr.abort();
                        //     });
                        // }
                    }
                    else if (options.data instanceof Array) {
                        xhr.send(new Uint8Array(options.data));
                    }
                    else if (typeof options.data === 'undefined') {
                        xhr.send();
                    }
                    else if (options.data === null) {
                        xhr.send();
                    }
                    else {
                        reject(new Error('Invalid type of data to send: ' + typeof options.data));
                    }
                }
                catch (ex) {
                    reject(new GeneralError('Error sending data in request', xhr));
                }
            });
        };
        return HttpClient;
    }());
    exports.HttpClient = HttpClient;
});
