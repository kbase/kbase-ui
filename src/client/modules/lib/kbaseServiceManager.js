define(["require", "exports", "./kb_lib/comm/JSONRPC11/GenericClient", "./kb_lib/HttpClient", "./kb_lib/props", "./kb_lib/Utils"], function (require, exports, GenericClient_1, HttpClient_1, props_1, Utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function semverIntersects(semver1, semver2) {
        var semver11List = semver1.split('.');
        var semver2List = semver2.split('.');
        if (semver11List.length !== semver2List.length) {
            return false;
        }
        return !semver11List.some(function (item, index) {
            return item !== semver2List[index];
        });
    }
    var KBaseServiceManager = /** @class */ (function () {
        function KBaseServiceManager(_a) {
            var runtime = _a.runtime, throwErrors = _a.throwErrors;
            this.runtime = runtime;
            this.coreServices = this.runtime.config('coreServices');
            this.timeout = runtime.config('ui.constants.service_check_timeouts.hard');
            this.throwErrors = throwErrors || false;
        }
        KBaseServiceManager.prototype.checkREST = function (serviceConfig) {
            var _this = this;
            var http = new HttpClient_1.HttpClient();
            var header = new HttpClient_1.HttpHeader();
            header.setHeader('accept', 'application/json');
            return http
                .request({
                method: 'GET',
                url: serviceConfig.url + serviceConfig.version.path,
                header: header,
                timeout: this.timeout
            })
                .then(function (result) {
                var contentType = result.header.getHeader('content-type');
                if (contentType !== 'application/json') {
                    var errorMessage = "Unexpected content type; expected \"application/json\", received \"" + contentType + "\"";
                    if (_this.throwErrors) {
                        throw new Error(errorMessage);
                    }
                    else {
                        console.error(errorMessage);
                    }
                }
                return JSON.parse(result.response);
            })
                .catch(function (err) {
                var errorMessage = 'An error was encountered checking the service "' + serviceConfig.module + '": ' + err.message;
                if (_this.throwErrors) {
                    throw new Error(errorMessage);
                }
                else {
                    console.error(errorMessage);
                    return null;
                }
            });
        };
        KBaseServiceManager.prototype.checkJSONRPC = function (serviceConfig) {
            var _this = this;
            var client = new GenericClient_1.GenericClient({
                module: serviceConfig.module,
                url: serviceConfig.url,
                timeout: this.timeout
            });
            return client
                .callFunc(serviceConfig.version.method, [])
                .then(function (_a) {
                var result = _a[0];
                return result;
            })
                .catch(function (err) {
                var errorMessage = "An error was encountered checking the service " + serviceConfig.module + ": " + err.message;
                if (_this.throwErrors) {
                    throw new Error(errorMessage);
                }
                else {
                    console.error(errorMessage);
                    return null;
                }
            });
        };
        KBaseServiceManager.prototype.check = function () {
            var _this = this;
            var disabledServices = this.runtime.config('ui.coreServices.disabled', []);
            return Promise.all(this.coreServices
                .filter(function (serviceConfig) {
                var disabled = disabledServices.includes(serviceConfig.module);
                if (disabled) {
                    console.warn('Check disabled for core service: ' + serviceConfig.module);
                }
                return !disabled;
            })
                .map(function (serviceConfig) {
                return Utils_1.tryPromise(function () {
                    switch (serviceConfig.type) {
                        case 'jsonrpc':
                            return _this.checkJSONRPC(serviceConfig);
                        case 'rest':
                            return _this.checkREST(serviceConfig);
                        case 'jsonrpc2':
                            console.warn('Ignoring jsonrpc core service for now', serviceConfig);
                            return null;
                        default:
                            var errorMessage = 'Unsupported core service type: ' + serviceConfig.type;
                            if (_this.throwErrors) {
                                throw new Error(errorMessage);
                            }
                            else {
                                console.error(errorMessage);
                                return null;
                            }
                    }
                }).then(function (result) {
                    var version;
                    if (result === null) {
                        if (!_this.throwErrors) {
                            return null;
                        }
                        else {
                            throw new Error('Invalid semver check result: ' + result);
                        }
                    }
                    if (serviceConfig.version.semverNotImplemented) {
                        return null;
                    }
                    else if (serviceConfig.version.propertyPath) {
                        version = props_1.getProp(result, serviceConfig.version.propertyPath);
                    }
                    else {
                        version = result;
                    }
                    if (serviceConfig.version.required) {
                        if (semverIntersects(version, serviceConfig.version.required)) {
                            return null;
                        }
                        return {
                            module: serviceConfig.module,
                            requiredVersion: serviceConfig.version.required,
                            serviceVersion: version
                        };
                    }
                    else {
                        console.warn("for service \"" + serviceConfig.module + "\", semver check not disabled, but no required version provided");
                    }
                });
            }))
                .then(function (result) {
                var mismatches = result.filter(function (result) {
                    if (result === null) {
                        return false;
                    }
                    if (typeof result === 'undefined') {
                        return false;
                    }
                    return true;
                });
                if (mismatches.length > 0) {
                    var message = mismatches
                        .map(function (mismatch) {
                        if (mismatch === null || typeof mismatch === 'undefined') {
                            return '';
                        }
                        return "service \"" + mismatch.module + "\" version " + mismatch.serviceVersion + " incompatible with the required " + mismatch.requiredVersion;
                    })
                        .join('; ');
                    var prefix = void 0;
                    if (mismatches.length === 1) {
                        prefix = 'Incompatible service';
                    }
                    else {
                        prefix = 'Incompatible services';
                    }
                    var errorMessage = prefix + ": " + message;
                    if (_this.throwErrors) {
                        throw new Error(errorMessage);
                    }
                    else {
                        console.error(errorMessage);
                    }
                }
            });
        };
        return KBaseServiceManager;
    }());
});
//     return {KBaseServiceManager};
// });
