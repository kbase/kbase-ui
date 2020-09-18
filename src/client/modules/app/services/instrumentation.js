define([
], function (
) {

    class InstrumentationService {
        constructor() {
        }

        // METHODS
        send(instrumentation) {
            console.warn('[instrumentation]', instrumentation);
        }

        // API

        start() {
            return Promise.resolve();
        }

        stop() {
            return Promise.resolve();
        }

        pluginHandler() {
        }
    }

    return { ServiceClass: InstrumentationService };
});
