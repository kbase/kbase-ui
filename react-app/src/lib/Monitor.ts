export type StatusCall = () => Promise<void>;

interface MonitorParams {
    callback: StatusCall
    interval: number;
}

export class Monitor {
    statusCall: StatusCall;
    monitoringInterval: number;
    monitorRunning: boolean;
    monitoringRunCount: number;
    monitoringErrorCount: number;
    monitoringTimer: number | null;

    constructor({callback, interval}: MonitorParams) {
        this.statusCall = callback;

        this.monitoringInterval = interval;
        
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
            }, this.monitoringInterval);
        };
        loop();
    }

    async runCallback() {
        try { 
            this.monitoringRunCount += 1;
            return this.statusCall();
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
