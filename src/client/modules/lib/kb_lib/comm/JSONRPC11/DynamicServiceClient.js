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
define(["require", "exports", "../coreServices/ServiceWizard", "./ServiceClient", "../Cache"], function (require, exports, ServiceWizard_1, ServiceClient_1, Cache_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DynamicServiceClient = void 0;
    Cache_1 = __importDefault(Cache_1);
    var ITEM_LIFETIME = 1800000;
    var MONITORING_FREQUENCY = 60000;
    var WAITER_TIMEOUT = 30000;
    var WAITER_FREQUENCY = 100;
    var moduleCache = new Cache_1.default({
        itemLifetime: ITEM_LIFETIME,
        monitoringFrequency: MONITORING_FREQUENCY,
        waiterTimeout: WAITER_TIMEOUT,
        waiterFrequency: WAITER_FREQUENCY
    });
    var DynamicServiceClient = /** @class */ (function (_super) {
        __extends(DynamicServiceClient, _super);
        function DynamicServiceClient(params) {
            var _this = _super.call(this, params) || this;
            _this.serviceDiscoveryModule = 'ServiceWizard';
            var version = params.version;
            _this.version = version || null;
            if (_this.version === 'auto') {
                _this.version = null;
            }
            _this.serviceDiscoveryURL = params.url;
            return _this;
            // this.module = module;
        }
        DynamicServiceClient.prototype.moduleId = function () {
            var moduleId;
            if (!this.version) {
                moduleId = this.module + ':auto';
            }
            else {
                moduleId = this.module + ':' + this.version;
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
                var moduleInfo;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.getCached(function () {
                                var client = new ServiceWizard_1.ServiceWizardClient({
                                    url: _this.serviceDiscoveryURL,
                                    authorization: _this.authorization,
                                    timeout: _this.timeout
                                });
                                // NB wrapped in promise.resolve because the promise we have 
                                // here is bluebird, which supports cancellation, which we need.
                                return Promise.resolve(client.getServiceStatus({
                                    module_name: _this.module,
                                    version: _this.version
                                }));
                            })];
                        case 1:
                            moduleInfo = _a.sent();
                            this.module = moduleInfo.module_name;
                            this.url = moduleInfo.url;
                            return [2 /*return*/, moduleInfo];
                    }
                });
            });
        };
        // private async syncModule()
        // async callFunc<P, T>(funcName: string, params: P): Promise<T> {
        //     const moduleInfo = await this.lookupModule();
        //     const client = new ServiceClient({
        //         module: moduleInfo.module_name,
        //         url: moduleInfo.url,
        //         token: this.token
        //     });
        //     return await client.callFunc<P, T>(funcName, params);
        // }
        DynamicServiceClient.prototype.callFunc = function (funcName, params) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.lookupModule()];
                        case 1:
                            _a.sent();
                            return [2 /*return*/, _super.prototype.callFunc.call(this, funcName, params)];
                    }
                });
            });
        };
        DynamicServiceClient.prototype.callFuncEmptyResult = function (funcName, params) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.lookupModule()];
                        case 1:
                            _a.sent();
                            return [2 /*return*/, _super.prototype.callFuncEmptyResult.call(this, funcName, params)];
                    }
                });
            });
        };
        return DynamicServiceClient;
    }(ServiceClient_1.ServiceClient));
    exports.DynamicServiceClient = DynamicServiceClient;
});
