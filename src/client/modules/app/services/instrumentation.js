define([
], function (
) {
    'use strict';

    class InstrumentationService {
        constructor() {
        }

        // METHODS
        send(instrumentation) {
            console.warn('[instrumentation]', instrumentation);
        }

        // API

        start() {
        }

        stop() {
        }

        pluginHandler() {
        }
    }

    return { ServiceClass: InstrumentationService };
});
