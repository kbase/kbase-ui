define([
    'kb_common/jsonRpc/dynamicServiceClient',
    'kb_common/jsonRpc/genericClient',
    'kb_common/jsonRpc/exceptions'
], function (
    DynamicService,
    GenericClient,
    exceptions
) {
    'use strict';

    class RPCError extends Error {
        constructor(source, code, message, detail, info) {
            super(message);
            this.source = source;
            this.code = code;
            this.message = message;
            this.detail = detail;
            this.info = info;
            this.stack = new Error().stack;
        }
    }

    class RPC {
        constructor(config) {
            this.runtime = config.runtime;
            this.RPCError = RPCError;
        }

        call(moduleName, functionName, params) {
            let serviceUrl = this.runtime.config(['services', moduleName, 'url'].join('.'));
            let token = this.runtime.service('session').getAuthToken();
            let client;
            if (serviceUrl) {
                client = new GenericClient({
                    module: moduleName,
                    url: serviceUrl,
                    token: token
                });
            } else {
                client = new DynamicService({
                    url: this.runtime.config('services.service_wizard.url'),
                    token: token,
                    module: moduleName
                });
            }
            let funcParams = params || [];
            return client.callFunc(functionName, funcParams)
                .catch((err) => {
                    if (err instanceof exceptions.AjaxError) {
                        console.error('AJAX Error', err);
                        throw new RPCError('AJAX Error: ' + err.name, err.code, err.message, null, {
                            originalError: err
                        });
                    } else if (err instanceof RPCError) {
                        console.error('RPC Error', err);
                        let message = 'An error was encountered running an rpc method';
                        let detail = 'The module is "' + err.module + '", the method "' + err.func + '", ' +
                                    'the error returned from the service is "' + (err.message || 'unknown') + '"';
                        throw new RPCError('service-call-error', err.name, message, detail , {
                            originalError: err
                        });
                    } else {
                        throw new RPCError('rpc-call', err.name, err.message, null, {
                            originalError: err
                        });
                    }
                });
        }
    }

    class RPCClient {
        constructor(config) {
            this.runtime = config.runtime;
            this.moduleName = config.module;
            this.RPCError = RPCError;
            // Note: setup must be synchronous
            this.setup();
        }

        setup() {
            let serviceUrl = this.runtime.config(['services', this.moduleName, 'url'].join('.'));
            let token = this.runtime.service('session').getAuthToken();
            let client;
            if (serviceUrl) {
                client = new GenericClient({
                    module: this.moduleName,
                    url: serviceUrl,
                    token: token
                });
            } else {
                client = new DynamicService({
                    url: this.runtime.config('services.service_wizard.url'),
                    token: token,
                    module: this.moduleName
                });
            }
            this.client = client;
        }

        callFunc(functionName, params) {
            let funcParams = params || [];
            return this.client.callFunc(functionName, funcParams)
                .catch((err) => {
                    if (err instanceof exceptions.AjaxError) {
                        console.error('AJAX Error', err);
                        throw new RPCError('AJAX Error: ' + err.name, err.code, err.message, null, {
                            originalError: err
                        });
                    } else if (err instanceof RPCError) {
                        console.error('RPC Error', err);
                        let message = 'An error was encountered running an rpc method';
                        let detail = 'The module is "' + err.module + '", the method "' + err.func + '", ' +
                                    'the error returned from the service is "' + (err.message || 'unknown') + '"';
                        throw new RPCError('service-call-error', err.name, message, detail , {
                            originalError: err
                        });
                    } else {
                        throw new RPCError('rpc-call', err.name, err.message, null, {
                            originalError: err
                        });
                    }
                });
        }
    }

    return {RPC, RPCClient};
});