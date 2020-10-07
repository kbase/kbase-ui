import { GenericClient } from './kb_lib/comm/JSONRPC11/GenericClient';
import { HttpClient, HttpHeader } from './kb_lib/HttpClient';
import { Runtime } from './types';
import { getProp } from './kb_lib/props';
import { tryPromise } from './kb_lib/Utils';

function semverIntersects(semver1: string, semver2: string): boolean {
    const semver11List = semver1.split('.');
    const semver2List = semver2.split('.');
    if (semver11List.length !== semver2List.length) {
        return false;
    }
    return !semver11List.some((item, index) => {
        return item !== semver2List[index];
    });
}

interface KBaseServiceManagerParams {
    runtime: Runtime;
    coreServices: any;
    timeout: number;
    throwErrors: boolean;
}

interface ServiceConfig {
    type: string;
    url: string;
    version: {
        path: string;
        method: string;
        semverNotImplemented?: boolean;
        propertyPath: string;
        required?: string;
    },
    module: string;
}

class KBaseServiceManager {
    runtime: Runtime;
    coreServices: Array<ServiceConfig>;
    timeout: number;
    throwErrors: boolean;
    constructor({ runtime, throwErrors }: KBaseServiceManagerParams) {
        this.runtime = runtime;
        this.coreServices = this.runtime.config('coreServices');
        this.timeout = runtime.config<number>('ui.constants.service_check_timeouts.hard');
        this.throwErrors = throwErrors || false;
    }

    checkREST(serviceConfig: ServiceConfig) {
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
                    const errorMessage = `Unexpected content type; expected "application/json", received "${contentType}"`;
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

    checkJSONRPC(serviceConfig: ServiceConfig) {
        const client = new GenericClient({
            module: serviceConfig.module,
            url: serviceConfig.url,
            timeout: this.timeout
        });
        return client
            .callFunc<any, any>(serviceConfig.version.method, [])
            .then(([result]) => {
                return result;
            })
            .catch((err) => {
                const errorMessage = `An error was encountered checking the service ${serviceConfig.module}: ${err.message}`;
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
                    return tryPromise<any>(() => {
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
                            version = getProp<string>(result, serviceConfig.version.propertyPath);
                        } else {
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
                        } else {
                            console.warn(`for service "${serviceConfig.module}", semver check not disabled, but no required version provided`);
                        }
                    });
                }))
            .then((result) => {
                const mismatches = result.filter((result) => {
                    if (result === null) {
                        return false;
                    }
                    if (typeof result === 'undefined') {
                        return false;
                    }
                    return true;
                });
                if (mismatches.length > 0) {
                    const message = mismatches
                        .map((mismatch) => {
                            if (mismatch === null || typeof mismatch === 'undefined') {
                                return '';
                            }
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

//     return {KBaseServiceManager};
// });
