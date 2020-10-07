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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "axios"], function (require, exports, axios_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AuthorizedGenericClient = exports.GenericClient = exports.classJSONRPCServerException = exports.JSONRPCException = void 0;
    axios_1 = __importDefault(axios_1);
    var DEFAULT_TIMEOUT = 10000;
    // export interface MethodSuccessResult<T> {
    //     result: T;
    //     error: null;
    // }
    // export interface MethodErrorResult {
    //     result: null;
    //     error: JSONRPCError;
    // }
    // export type MethodResponse<T> = MethodSuccessResult<T> | MethodErrorResult;
    // export type JSONRPCResponse<T> =
    //     // success
    //     | [T, null, null]
    //     // success, but void result
    //     | [null, null, null]
    //     // error returned by method, not sdk wrapper
    //     | [null, MethodErrorResult, null]
    //     // error returned by sdk wrapper (caught exception)
    //     | [null, null, JSONRPCError];
    var JSONRPCException = /** @class */ (function (_super) {
        __extends(JSONRPCException, _super);
        function JSONRPCException(_a) {
            var code = _a.code, message = _a.message, data = _a.data;
            var _this = _super.call(this, message) || this;
            _this.code = code;
            _this.data = data;
            return _this;
        }
        return JSONRPCException;
    }(Error));
    exports.JSONRPCException = JSONRPCException;
    var classJSONRPCServerException = /** @class */ (function (_super) {
        __extends(classJSONRPCServerException, _super);
        function classJSONRPCServerException() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return classJSONRPCServerException;
    }(Error));
    exports.classJSONRPCServerException = classJSONRPCServerException;
    var GenericClient = /** @class */ (function () {
        function GenericClient(_a) {
            var url = _a.url, token = _a.token, module = _a.module, timeout = _a.timeout;
            this.url = url;
            this.token = token || null;
            this.module = module;
            this.timeout = timeout || DEFAULT_TIMEOUT;
        }
        GenericClient.prototype.makePayload = function (method, param) {
            return {
                jsonrpc: '2.0',
                method: this.module + '.' + method,
                id: String(Math.random()).slice(2),
                params: param
            };
        };
        // protected makeEmptyPayload<T>(method: string): JSONPayload<T> {
        //     const params: Array<T> = [];
        //     return {
        //         version: '1.1',
        //         method: this.module + '.' + method,
        //         id: String(Math.random()).slice(2),
        //         params
        //     };
        // }
        GenericClient.prototype.processResponse = function (response) {
            // if no response, error
            var responseText = response.data;
            if (responseText.length === 0) {
                throw new Error('Empty response');
            }
            // try to parse as json
            var responseData;
            try {
                responseData = JSON.parse(responseText);
            }
            catch (ex) {
                throw new Error('Error parsing response as JSON: ' + ex.message);
            }
            if ('error' in responseData) {
                // Were all good
                console.warn('about to throw error', responseData.error);
                throw new JSONRPCException(responseData.error);
            }
            return responseData.result;
            // if (response.status === 200) {
            //     const { result } = await response.json();
            //     return result as T;
            // }
            // if (response.status === 500) {
            //     if (response.headers.get('Content-Type') === 'application/json') {
            //         const { error } = await response.json();
            //         throw new JSONRPCException(error);
            //     } else {
            //         const text = await response.text();
            //         throw new classJSONRPCServerException(text);
            //     }
            // }
            // throw new Error('Unexpected response: ' + response.status + ', ' + response.statusText);
        };
        // protected async callFunc<T>(func: string, param: any): Promise<T> {
        //     const headers = new Headers();
        //     headers.append('Content-Type', 'application/json');
        //     headers.append('Accept', 'application/json');
        //     if (this.token) {
        //         headers.append('Authorization', this.token);
        //     }
        //     const response = await axios.post(this.url, this.makePayload(func, param), {
        //         // mode: 'cors',
        //         // cache: 'no-store',
        //         headers
        //     });
        //     // The response may be a 200 success, a 200 with method error,
        //     // an sdk 500 error, an internal 500 server error,
        //     // or any other http error code.
        //     return response.data as T
        //     // return this.processResponse<T>(response);
        // }
        GenericClient.prototype.callFunc = function (func, param) {
            return __awaiter(this, void 0, void 0, function () {
                var headers, params, response;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            headers = {
                                'Content-Type': 'application/json',
                                'Accept': 'application/json'
                            };
                            if (this.token) {
                                headers['Authorization'] = this.token;
                            }
                            params = this.makePayload(func, param);
                            return [4 /*yield*/, axios_1.default.post(this.url, params, {
                                    headers: headers,
                                    timeout: this.timeout,
                                    responseType: 'text'
                                })];
                        case 1:
                            response = _a.sent();
                            return [2 /*return*/, this.processResponse(response)];
                    }
                });
            });
        };
        return GenericClient;
    }());
    exports.GenericClient = GenericClient;
    var AuthorizedGenericClient = /** @class */ (function (_super) {
        __extends(AuthorizedGenericClient, _super);
        function AuthorizedGenericClient(params) {
            var _this = _super.call(this, params) || this;
            if (!params.token) {
                throw new Error('Authorized client requires token');
            }
            _this.token = params.token;
            return _this;
        }
        AuthorizedGenericClient.prototype.callFunc = function (func, param) {
            return __awaiter(this, void 0, void 0, function () {
                var headers, params, response;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            headers = {
                                'Content-Type': 'application/json',
                                'Accept': 'application/json',
                                'Authorization': this.token
                            };
                            if (this.token) {
                                headers['Authorization'] = this.token;
                            }
                            params = this.makePayload(func, param);
                            return [4 /*yield*/, axios_1.default.post(this.url, params, {
                                    headers: headers,
                                    timeout: this.timeout,
                                    responseType: 'text',
                                    transformResponse: function (data) {
                                        return data;
                                    }
                                })];
                        case 1:
                            response = _a.sent();
                            return [2 /*return*/, this.processResponse(response)];
                    }
                });
            });
        };
        return AuthorizedGenericClient;
    }(GenericClient));
    exports.AuthorizedGenericClient = AuthorizedGenericClient;
});
