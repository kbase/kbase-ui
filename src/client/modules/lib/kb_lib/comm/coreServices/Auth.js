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
define(["require", "exports", "../HTTPClient"], function (require, exports, HTTPClient_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var endpoints = {
        root: '',
        tokenInfo: 'api/V2/token',
        apiMe: 'api/V2/me',
        me: 'me',
        loginStart: 'login/start',
        logout: 'logout',
        loginChoice: 'login/choice',
        loginCreate: 'login/create',
        loginUsernameSuggest: 'login/suggestname',
        loginPick: 'login/pick',
        loginCancel: 'login/cancel',
        linkStart: 'link/start',
        linkCancel: 'link/cancel',
        linkChoice: 'link/choice',
        linkPick: 'link/pick',
        linkRemove: 'me/unlink',
        tokens: 'tokens',
        tokensRevoke: 'tokens/revoke',
        tokensRevokeAll: 'tokens/revokeall',
        userSearch: 'api/V2/users/search',
        adminUserSearch: 'api/V2/admin/search',
        adminUser: 'api/V2/admin/user'
    };
    var AuthClient = /** @class */ (function () {
        function AuthClient(_a) {
            var url = _a.url;
            this.url = url;
        }
        AuthClient.prototype.makePath = function (path) {
            if (typeof path === 'string') {
                return [this.url].concat([path]).join('/');
            }
            return [this.url].concat(path).join('/');
        };
        AuthClient.prototype.root = function () {
            return __awaiter(this, void 0, void 0, function () {
                var httpc, header, response;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            httpc = new HTTPClient_1.HTTPClient();
                            header = new HTTPClient_1.HTTPHeader({
                                Accept: 'application/json',
                            });
                            return [4 /*yield*/, httpc.request({
                                    url: this.makePath([endpoints.root]),
                                    method: 'GET',
                                    timeout: 10000,
                                    header: header
                                })];
                        case 1:
                            response = _a.sent();
                            return [2 /*return*/, JSON.parse(response.response)];
                    }
                });
            });
        };
        AuthClient.prototype.getTokenInfo = function (token) {
            return __awaiter(this, void 0, void 0, function () {
                var httpc, header, data;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            httpc = new HTTPClient_1.HTTPClient();
                            header = new HTTPClient_1.HTTPHeader({
                                Accept: 'application/json',
                                Authorization: token
                            });
                            return [4 /*yield*/, httpc.request({
                                    url: this.makePath([endpoints.tokenInfo]),
                                    method: 'GET',
                                    timeout: 10000,
                                    header: header
                                })];
                        case 1:
                            data = _a.sent();
                            // const { data } = await axios.get(this.makePath([endpoints.tokenInfo]), {
                            //     headers: {
                            //         Accept: 'application/json',
                            //         Authorization: token
                            //     }
                            // });
                            return [2 /*return*/, JSON.parse(data.response)];
                    }
                });
            });
        };
        AuthClient.prototype.getMe = function (token) {
            return __awaiter(this, void 0, void 0, function () {
                var httpc, header, result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            httpc = new HTTPClient_1.HTTPClient();
                            header = new HTTPClient_1.HTTPHeader({
                                Accept: 'application/json',
                                Authorization: token
                            });
                            return [4 /*yield*/, httpc.request({
                                    url: this.makePath([endpoints.apiMe]),
                                    method: 'GET',
                                    timeout: 10000,
                                    header: header
                                })];
                        case 1:
                            result = _a.sent();
                            return [2 /*return*/, JSON.parse(result.response)];
                    }
                });
            });
        };
        return AuthClient;
    }());
    exports.default = AuthClient;
});
