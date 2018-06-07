define([
    'bluebird',
    'kb_common/jsonRpc/genericClient',
    'kb_lib/props',
    'kb_lib/semver'
], function (
    Promise,
    GenericClient,
    props,
    semver
) {
    'use strict';

    class KBaseServiceManager {
        constructor({runtime}) {
            this.runtime = runtime;
            this.servicesToCheck = this.runtime.config('coreServices');
        }

        check() {
            return Promise.all(this.servicesToCheck
                .map((serviceConfig) => {
                    let client = new GenericClient({
                        module: serviceConfig.module,
                        url: serviceConfig.url,
                        token: this.runtime.service('session').getAuthToken()
                    });
                    return client.callFunc(serviceConfig.version.method, [])
                        .spread((result) => {
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