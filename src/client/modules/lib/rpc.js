define([
    'kb_lib/jsonRpc/dynamicServiceClient',
    'kb_lib/jsonRpc/genericClient',
    'kb_lib/jsonRpc/exceptions'
], function (
    DynamicService,
    GenericClient,
    exceptions
) {

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
            const serviceUrl = this.runtime.config(['services', moduleName, 'url'].join('.'));
            const token = this.runtime.service('session').getAuthToken();
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
            const funcParams = params || [];
            return client.callFunc(functionName, funcParams)
                .catch((err) => {
                    if (err instanceof exceptions.AjaxError) {
                        // console.error('AJAX Error', err);
                        throw new RPCError('AJAX Error: ' + err.name, err.code, err.message, null, {
                            originalError: err
                        });
                    } else if (err instanceof RPCError) {
                        // console.error('RPC Error', err);
                        const message = 'An error was encountered running an rpc method';
                        const detail = 'The module is "' + err.module + '", the method "' + err.func + '", ' +
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
        constructor({runtime, module, timeout, authenticated}) {
            this.runtime = runtime;
            this.moduleName = module;
            this.timeout = timeout || 60000;
            this.RPCError = RPCError;
            this.authenticated = authenticated;
            // Note: setup must be synchronous
            this.setup();
        }

        setup() {
            const serviceUrl = this.runtime.config(['services', this.moduleName, 'url'].join('.'));
            let token;
            if (this.authenticated) {
                token = this.runtime.service('session').getAuthToken();
            } else {
                token = null;
            }
            if (serviceUrl) {
                this.client = new GenericClient({
                    module: this.moduleName,
                    url: serviceUrl,
                    token: token,
                    timeout: this.timeout
                });
            } else {
                this.client = new DynamicService({
                    url: this.runtime.config('services.service_wizard.url'),
                    token: token,
                    module: this.moduleName,
                    timeout: this.timeout
                });
            }
        }

        callFunc(functionName, params) {
            const funcParams = params || [];
            return this.client.callFunc(functionName, funcParams)
                .catch((err) => {
                    if (err instanceof exceptions.AjaxError) {
                        console.error('AJAX Error', err);
                        throw new RPCError('AJAX Error: ' + err.name, err.code, err.message, null, {
                            originalError: err
                        });
                    } else if (err instanceof RPCError) {
                        console.error('RPC Error', err);
                        const message = 'An error was encountered running an rpc method';
                        const detail = 'The module is "' + err.module + '", the method "' + err.func + '", ' +
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