export type StatusCall = () => Promise<void>;

interface ConnectionMonitorParams {
  callback: StatusCall;
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
    this.monitorRunning = true;
    return this.runCallback();
  }

  //   monitoringLoop() {
  //     if (this.monitoringTimer) {
  //       return;
  //     }

  //     const loop = () => {
  //       if (!this.monitorRunning) {
  //         return;
  //       }
  //       this.monitoringTimer = window.setTimeout(async () => {
  //         await this.runCallback();
  //         loop();
  //       }, this.params.interval);
  //     };
  //     loop();
  //   }

  nextIteration() {
    this.monitoringTimer = window.setTimeout(async () => {
      this.runCallback();
    }, this.params.interval);
  }

  async runCallback() {
    try {
      this.monitoringRunCount += 1;
      await this.params.callback();
    } catch (ex) {
      console.error('[Monitor] error running callback', ex);
      this.monitoringErrorCount += 1;
    } finally {
      this.nextIteration();
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
