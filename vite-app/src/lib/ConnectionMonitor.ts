export type StatusCall = () => Promise<void>;

interface ConnectionMonitorParams {
    callback: StatusCall
    interval: number;
}

export default class ConnectionMonitor {
    params: ConnectionMonitorParams;
    monitorRunning: boolean;
    monitoringRunCount: number;
    monitoringErrorCount: number;
    monitoringTimer: number | null;

    constructor(params: ConnectionMonitorParams) {
        this.params = params;

        this.monitorRunning = false;
        this.monitoringRunCount = 0;
        this.monitoringErrorCount = 0;
        this.monitoringTimer = null;
    }

    async start() {
        if (this.monitorRunning) {
            return;
        }
        await this.runCallback();
        this.monitorRunning = true;
        this.monitoringLoop();
    }

    monitoringLoop() {
        if (this.monitoringTimer) {
            return;
        }

        const loop = () => {
            if (!this.monitorRunning) {
                return;
            }
            this.monitoringTimer = window.setTimeout(async () => {
                await this.runCallback();
                loop();
            }, this.params.interval);
        };
        loop();
    }

    async runCallback() {
        try { 
            this.monitoringRunCount += 1;
            return this.params.callback();
        } catch (ex) {
            console.error('[Monitor] error running callback', ex);
            this.monitoringErrorCount += 1;
        }
    }

    stop() {
        this.monitorRunning = false;
        if (this.monitoringTimer !== null) {
            window.clearTimeout(this.monitoringTimer);
        }
        this.monitoringTimer = null;
    }
}
