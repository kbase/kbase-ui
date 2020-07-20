define([
], function (
) {
    'use strict';

    // class CoreService {
    //     constructor({moduleName, minimumVersion, url, versionMethod, versionPath}) {
    //         this.moduleName = moduleName;
    //         this.minimumVersion = minimumVersion;
    //         this.url = url;
    //         this.versionMethod = versionMethod;
    //         this.versionPath = versionPath;
    //     }
    // }

    class CoreServicesMonitor {
        constructor({ params: {runtime} }) {
            this.runtime = runtime;
            this.services = {};
        }

        start() {
        }

        stop() {
        }

        pluginHandler() {
        }

        addCoreServiceDependency() {
        }
    }

    return { ServiceClass: CoreServicesMonitor };
});