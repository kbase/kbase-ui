import { Runtime } from "../../lib/types";

interface HeartbeatServiceParams {
    params: {
        runtime: Runtime;
    },
    config: {
        interval: number;
    };
}

export class HeartbeatService {
    runtime: Runtime;
    interval: number;
    heartbeat: number;
    heartbeatTimer: number | null;
    constructor({ config: { interval }, params: { runtime } }: HeartbeatServiceParams) {
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
        return Promise.resolve();
    }

    stop() {
        if (this.heartbeatTimer) {
            window.clearInterval(this.heartbeatTimer);
        }
        return Promise.resolve();
    }
}

export const ServiceClass = HeartbeatService;
