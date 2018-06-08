define([
    'bluebird',
    'kb_common/jsonRpc/genericClient',
    'kb_common_ts/HttpClient',
    'kb_lib/props',
    'kb_lib/semver'
], function (
    Promise,
    GenericClient,
    httpClient,
    props,
    semver
) {
    'use strict';

    class KBaseServiceManager {
        constructor({runtime}) {
            this.runtime = runtime;
            this.servicesToCheck = this.runtime.config('coreServices');
            this.timeout = runtime.config('ui.constants.service_check_timeouts.hard');
        }

        checkREST(serviceConfig) {
            let http = new httpClient.HttpClient();
            let header = new httpClient.HttpHeader();
            header.setHeader('accept', 'application/json');
            return http.request({
                method: 'GET',
                url: serviceConfig.url,
                header: header,
                timeout: this.timeout
            })
                .then((result) => {
                    let contentType = result.header.getHeader('content-type');
                    if (contentType !== 'application/json') {
                        throw new Error('Unexpected content type; expected "application/json", received "' + contentType + '"');
                    }
                    return JSON.parse(result.response);
                });
        }

        checkJSONRPC(serviceConfig) {
            let client = new GenericClient({
                module: serviceConfig.module,
                url: serviceConfig.url,
                timeout: this.timeout
            });
            return client.callFunc(serviceConfig.version.method, [])
                .spread((result) => {
                    return result;
                });
        }

        check() {
            return Promise.all(this.servicesToCheck
                .map((serviceConfig) => {
                    return Promise.try(() => {
                        switch (serviceConfig.type) {
                        case 'jsonrpc':
                            return this.checkJSONRPC(serviceConfig);
                        case 'rest':
                            return this.checkREST(serviceConfig);
                        default: 
                            throw new Error('Unsupported core service type: ' + serviceConfig.type);
                        }
                    }).then((result) => {
                        let version;
                        if (serviceConfig.version.propertyPath) {
                            version = props.getProp(result, serviceConfig.version.propertyPath);
                        } else {
                            version = result;
                        }
                        let semverResult = semver.semverIsAtLeast(version, serviceConfig.version.minimum);
                        if (semverResult === true) {
                            return null;
                        } else {
                            return {
                                module: serviceConfig.module,
                                minimumVersion: serviceConfig.version.minimum,
                                serviceVersion: version,
                                code: semverResult
                            };                                
                        }
                    });
                }))
                .then((result) => {
                    let mismatches = result .filter((result) => {
                        return result === null ? false : true;
                    });
                    if (mismatches.length > 0) {
                        let message = mismatches.map((mismatch) => {
                            return '(' + mismatch.code + ') ' + 
                              mismatch.module + ' needs to be at least ' + 
                              mismatch.minimumVersion + ' but is ' + mismatch.serviceVersion;
                        }).join('; ');
                        let prefix;
                        if (mismatches.length === 1) {
                            prefix = 'Incompatible service';
                        } else {
                            prefix = 'Incompatible services';
                        }
                        throw new Error(prefix + ': ' + message);
                    }
                });
               
        }
    }

    return {KBaseServiceManager};

});