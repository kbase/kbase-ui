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
define(["require", "exports", "../HTTPClient", "../../Utils"], function (require, exports, HTTPClient_1, Utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.JSONRPCClient = exports.JSONRPC11Exception = void 0;
    var JSONRPC11Exception = /** @class */ (function (_super) {
        __extends(JSONRPC11Exception, _super);
        function JSONRPC11Exception(error) {
            var _this = _super.call(this, error.message) || this;
            _this.error = error;
            return _this;
        }
        return JSONRPC11Exception;
    }(Error));
    exports.JSONRPC11Exception = JSONRPC11Exception;
    var JSONRPCClient = /** @class */ (function () {
        function JSONRPCClient(_a) {
            var url = _a.url, timeout = _a.timeout, authorization = _a.authorization;
            this.url = url;
            this.timeout = timeout;
            this.authorization = authorization;
        }
        JSONRPCClient.prototype.isGeneralError = function (error) {
            return (error instanceof HTTPClient_1.GeneralError);
        };
        JSONRPCClient.prototype.makePayload = function (method, params) {
            return {
                version: '1.1',
                method: method,
                id: Utils_1.uniqueId(),
                params: params
            };
        };
        JSONRPCClient.prototype.callMethod = function (method, params, _a) {
            var timeout = (_a === void 0 ? {} : _a).timeout;
            return __awaiter(this, void 0, void 0, function () {
                var payload, header, requestOptions, httpClient;
                return __generator(this, function (_b) {
                    payload = this.makePayload(method, params);
                    header = new HTTPClient_1.HTTPHeader();
                    header.setHeader('content-type', 'application/json');
                    header.setHeader('accept', 'application/json');
                    if (this.authorization) {
                        header.setHeader('authorization', this.authorization);
                    }
                    requestOptions = {
                        method: 'POST',
                        url: this.url,
                        timeout: timeout || this.timeout,
                        data: JSON.stringify(payload),
                        header: header
                    };
                    httpClient = new HTTPClient_1.HTTPClient();
                    return [2 /*return*/, httpClient.request(requestOptions)
                            .then(function (httpResponse) {
                            var result;
                            try {
                                result = JSON.parse(httpResponse.response);
                            }
                            catch (ex) {
                                throw new JSONRPC11Exception({
                                    name: 'parse error',
                                    code: 100,
                                    message: 'The response from the service could not be parsed',
                                    error: {
                                        originalMessage: ex.message,
                                        responseText: httpResponse.response
                                    }
                                });
                            }
                            if (result.hasOwnProperty('error')) {
                                var errorResult = result;
                                throw new JSONRPC11Exception({
                                    name: errorResult.error.name,
                                    code: errorResult.error.code,
                                    message: errorResult.error.message,
                                    error: errorResult.error.error
                                });
                            }
                            // if (!(result instanceof Array)) {
                            //     throw new JSONRPC11Exception({
                            //         name: 'params not array',
                            //         code: 100,
                            //         message: 'Parameter is not an array',
                            //         error: {}
                            //     });
                            // }
                            var rpcResponse = result;
                            return rpcResponse.result;
                            // let x: T = ({} as unknown) as T;
                            // return x;
                        })];
                });
            });
        };
        return JSONRPCClient;
    }());
    exports.JSONRPCClient = JSONRPCClient;
});
