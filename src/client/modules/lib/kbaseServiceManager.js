define([
    'bluebird',
    'kb_lib/jsonRpc/genericClient',
    'kb_ts/HttpClient',
    'kb_lib/props',
    'semver'
], function (
    Promise,
    GenericClient,
    {HttpClient, HttpHeader },
    props,
    semver
) {
    class KBaseServiceManager {
        constructor({ runtime, throwErrors }) {
            this.runtime = runtime;
            this.coreServices = this.runtime.config('coreServices');
            this.timeout = runtime.config('ui.constants.service_check_timeouts.hard');
            this.throwErrors = throwErrors || false;
        }

        checkREST(serviceConfig) {
            const http = new HttpClient();
            const header = new HttpHeader();
            header.setHeader('accept', 'application/json');
            return http
                .request({
                    method: 'GET',
                    url: serviceConfig.url + serviceConfig.version.path,
                    header: header,
                    timeout: this.timeout
                })
                .then((result) => {
                    const contentType = result.header.getHeader('content-type');
                    if (contentType !== 'application/json') {
                        const errorMessage = 'Unexpected content type; expected "application/json", received "' + contentType + '"';
                        if (this.throwErrors) {
                            throw new Error(errorMessage);
                        } else {
                            console.error(errorMessage);
                        }
                    }
                    return JSON.parse(result.response);
                })
                .catch((err) => {
                    const errorMessage =
            'An error was encountered checking the service "' + serviceConfig.module + '": ' + err.message;
                    if (this.throwErrors) {
                        throw new Error(errorMessage);
                    } else {
                        console.error(errorMessage);
                        return null;
                    }
                });
        }

        checkJSONRPC(serviceConfig) {
            const client = new GenericClient({
                module: serviceConfig.module,
                url: serviceConfig.url,
                timeout: this.timeout
            });
            return client
                .callFunc(serviceConfig.version.method, [])
                .spread((result) => {
                    return result;
                })
                .catch((err) => {
                    const errorMessage =
            'An error was encountered checking the service "' + serviceConfig.module + '": ' + err.message;
                    if (this.throwErrors) {
                        throw new Error(errorMessage);
                    } else {
                        console.error(errorMessage);
                        return null;
                    }
                });
        }

        check() {
            const disabledServices = this.runtime.config('ui.coreServices.disabled', []);
            return Promise.all(
                this.coreServices
                    .filter((serviceConfig) => {
                        const disabled = disabledServices.includes(serviceConfig.module);
                        if (disabled) {
                            console.warn('Check disabled for core service: ' + serviceConfig.module);
                        }
                        return !disabled;
                    })
                    .map((serviceConfig) => {
                        return Promise.try(() => {
                            switch (serviceConfig.type) {
                            case 'jsonrpc':
                                return this.checkJSONRPC(serviceConfig);
                            case 'rest':
                                return this.checkREST(serviceConfig);
                            case 'jsonrpc2':
                                console.warn('Ignoring jsonrpc core service for now', serviceConfig);
                                return null;
                            default:
                                var errorMessage = 'Unsupported core service type: ' + serviceConfig.type;
                                if (this.throwErrors) {
                                    throw new Error(errorMessage);
                                } else {
                                    console.error(errorMessage);
                                    return null;
                                }
                            }
                        }).then((result) => {
                            let version;
                            if (result === null) {
                                if (!this.throwErrors) {
                                    return null;
                                } else {
                                    throw new Error('Invalid semver check result: ' + result);
                                }
                            }
                            if (serviceConfig.version.semverNotImplemented) {
                                return null;
                            } else if (serviceConfig.version.propertyPath) {
                                version = props.getProp(result, serviceConfig.version.propertyPath);
                            } else {
                                version = result;
                            }

                            if (serviceConfig.version.required) {
                                if (semver.intersects(version, serviceConfig.version.required)) {
                                    return null;
                                }
                                return {
                                    module: serviceConfig.module,
                                    requiredVersion: serviceConfig.version.required,
                                    serviceVersion: version
                                };
                            } else {
                                console.warn(`for service "${serviceConfig.module}", semver check not disabled, but no required version provided`);
                            }
                        });
                    }))
                .then((result) => {
                    const mismatches = result.filter((result) => {
                        return result === null ? false : true;
                    });
                    if (mismatches.length > 0) {
                        const message = mismatches
                            .map((mismatch) => {
                                return `service "${mismatch.module}" version ${mismatch.serviceVersion} incompatible with the required ${mismatch.requiredVersion}`;
                            })
                            .join('; ');
                        let prefix;
                        if (mismatches.length === 1) {
                            prefix = 'Incompatible service';
                        } else {
                            prefix = 'Incompatible services';
                        }
                        const errorMessage = `${prefix}: ${message}`;
                        if (this.throwErrors) {
                            throw new Error(errorMessage);
                        } else {
                            console.error(errorMessage);
                        }
                    }
                });
        }
    }

    return { KBaseServiceManager };
});
