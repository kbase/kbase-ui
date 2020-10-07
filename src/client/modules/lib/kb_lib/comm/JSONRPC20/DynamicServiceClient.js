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
define(["require", "exports", "../coreServices/ServiceWizard", "./GenericClient", "../Cache"], function (require, exports, ServiceWizard_1, GenericClient_1, Cache_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DynamicServiceClient = void 0;
    Cache_1 = __importDefault(Cache_1);
    var moduleCache = new Cache_1.default({
        itemLifetime: 1800000,
        monitoringFrequency: 60000,
        waiterTimeout: 30000,
        waiterFrequency: 100
    });
    var DEFAULT_TIMEOUT = 10000;
    var DynamicServiceClient = /** @class */ (function () {
        function DynamicServiceClient(_a) {
            var token = _a.token, url = _a.url, version = _a.version, timeout = _a.timeout, rpcContext = _a.rpcContext, urlBaseOverride = _a.urlBaseOverride;
            // Establish an auth object which has properties token and user_id.
            this.token = token;
            this.timeout = timeout || DEFAULT_TIMEOUT;
            this.rpcContext = rpcContext || null;
            this.urlBaseOverride = urlBaseOverride || null;
            if (!url) {
                throw new Error('The service discovery url was not provided');
            }
            this.url = url;
            this.version = version || null;
            if (version === 'auto') {
                this.version = null;
            }
        }
        DynamicServiceClient.prototype.options = function () {
            return {
                timeout: this.timeout,
                authorization: this.token,
                rpcContext: this.rpcContext
            };
        };
        DynamicServiceClient.prototype.getModule = function () {
            return this.constructor.module;
        };
        DynamicServiceClient.prototype.moduleId = function () {
            var moduleId;
            if (!this.version) {
                moduleId = this.getModule() + ':auto';
            }
            else {
                moduleId = this.getModule() + ':' + this.version;
            }
            return moduleId;
        };
        DynamicServiceClient.prototype.getCached = function (fetcher) {
            return moduleCache.getItemWithWait({
                id: this.moduleId(),
                fetcher: fetcher
            });
        };
        // setCached(value: any) {
        //     moduleCache.setItem(this.moduleId(), value);
        // }
        // TODO: Promise<any> -> Promise<ServiceStatusResult>
        DynamicServiceClient.prototype.lookupModule = function () {
            return __awaiter(this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.getCached(function () {
                            var client = new ServiceWizard_1.ServiceWizardClient({
                                url: _this.url,
                                authorization: _this.token,
                                timeout: _this.timeout
                            });
                            // NB wrapped in promise.resolve because the promise we have 
                            // here is bluebird, which supports cancellation, which we need.
                            return Promise.resolve(client.getServiceStatus({
                                module_name: _this.getModule(),
                                version: _this.version
                            }));
                        })];
                });
            });
        };
        DynamicServiceClient.prototype.callFunc = function (funcName, params) {
            return __awaiter(this, void 0, void 0, function () {
                var _a, url, module_name, client;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.lookupModule()];
                        case 1:
                            _a = _b.sent(), url = _a.url, module_name = _a.module_name;
                            client = new GenericClient_1.AuthorizedGenericClient({
                                module: module_name,
                                url: url,
                                token: this.token,
                                timeout: this.timeout
                            });
                            return [4 /*yield*/, client.callFunc(funcName, params)];
                        case 2: return [2 /*return*/, _b.sent()];
                    }
                });
            });
        };
        return DynamicServiceClient;
    }());
    exports.DynamicServiceClient = DynamicServiceClient;
});
