define([], function () {
    'use strict';

    class HeartbeatService {
        constructor({ config: {interval}, params: {runtime} }) {
            this.runtime = runtime;
            this.interval = interval;
            this.heartbeat = 0;
            this.heartbeatTimer = null;
        }

        start() {
            this.heartbeat = 0;
            this.heartbeatTimer = window.setInterval(() => {
                this.heartbeat += 1;
                this.runtime.send('app', 'heartbeat', { heartbeat: this.heartbeat });
            }, this.interval);
        }

        stop() {
            if (this.heartbeatTimer) {
                window.clearInterval(this.heartbeatTimer);
            }
        }
    }

    return { ServiceClass: HeartbeatService };
});