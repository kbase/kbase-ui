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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
define(["require", "exports", "./HTTPUtils"], function (require, exports, HTTPUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HTTPClient = exports.AbortError = exports.GeneralError = exports.TimeoutError = exports.HTTPHeader = void 0;
    var DEFAULT_TIMEOUT = 10000;
    var HTTPHeader = /** @class */ (function () {
        function HTTPHeader(initialHeaders) {
            if (typeof initialHeaders === 'undefined') {
                this.header = {};
            }
            else if (initialHeaders instanceof XMLHttpRequest) {
                this.header = HTTPHeader.fromXHR(initialHeaders);
            }
            else {
                this.header = HTTPHeader.fromMap(initialHeaders);
            }
        }
        HTTPHeader.fromXHR = function (xhr) {
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
        HTTPHeader.fromMap = function (header) {
            var fieldsMap = {};
            Object.keys(header).forEach(function (name) {
                fieldsMap[name.toLowerCase()] = header[name];
            });
            return fieldsMap;
        };
        HTTPHeader.prototype.getHeader = function (fieldName) {
            return this.header[fieldName.toLowerCase()];
        };
        HTTPHeader.prototype.setHeader = function (fieldName, fieldValue) {
            this.header[fieldName.toLowerCase()] = fieldValue;
        };
        HTTPHeader.prototype.exportHeader = function (xhr) {
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
                })(_this.getHeader(key));
                xhr.setRequestHeader(key, stringValue);
            });
        };
        HTTPHeader.prototype.getContentType = function () {
            var value = this.header['content-type'];
            if (!value) {
                return null;
            }
            var values = value.split(';').map(function (x) { return x.trim(); });
            if (values[1]) {
                return {
                    mediaType: values[0],
                    charset: values[1]
                };
            }
            else {
                return {
                    mediaType: values[0]
                };
            }
        };
        return HTTPHeader;
    }());
    exports.HTTPHeader = HTTPHeader;
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
    var HTTPClient = /** @class */ (function () {
        function HTTPClient(options) {
            this.options = options;
        }
        HTTPClient.prototype.request = function (options) {
            var _a;
            return __awaiter(this, void 0, void 0, function () {
                var startTime, timeout;
                return __generator(this, function (_b) {
                    startTime = new Date().getTime();
                    timeout = options.timeout || ((_a = this.options) === null || _a === void 0 ? void 0 : _a.timeout) || DEFAULT_TIMEOUT;
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            var xhr = new XMLHttpRequest();
                            xhr.onload = function () {
                                // TODO: if support multiple return types, handle that here.
                                switch (xhr.responseType) {
                                    case 'text':
                                        resolve({
                                            status: xhr.status,
                                            response: xhr.response,
                                            responseType: xhr.responseType,
                                            header: new HTTPHeader(xhr)
                                        });
                                        return;
                                    default:
                                        throw new Error("Unsupported response type " + xhr.responseType);
                                }
                            };
                            xhr.ontimeout = function () {
                                var elapsed = (new Date().getTime()) - startTime;
                                reject(new TimeoutError(timeout, elapsed, 'Request timeout', xhr));
                            };
                            xhr.onerror = function () {
                                reject(new GeneralError('General request error ' + options.url, xhr));
                            };
                            xhr.onabort = function () {
                                reject(new AbortError('Request was aborted', xhr));
                            };
                            var url = options.url;
                            if (options.query) {
                                url += '?' + new HTTPUtils_1.HTTPQuery(options.query).toString();
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
                            xhr.timeout = timeout;
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
                                    if (options.onCancel) {
                                        options.onCancel(function () {
                                            xhr.abort();
                                        });
                                    }
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
                        })];
                });
            });
        };
        return HTTPClient;
    }());
    exports.HTTPClient = HTTPClient;
});
