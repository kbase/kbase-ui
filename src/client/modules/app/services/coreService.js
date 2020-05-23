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
        constructor({ params }) {
            this.runtime = params.runtime;

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