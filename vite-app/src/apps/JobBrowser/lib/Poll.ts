// const POLLING_TIMEOUT = 10000;

export interface PollParams {
    // callback to trigger a polling action, whatever that is.
    onPoll: () => Promise<void>,
    // callback for progress
    onProgress?: (progress: number) => void,
    progressSteps: number,
    pollInterval: number,
    watchInterval: number;
}

export enum PollerState {
    STARTED,
    POLLING,
    WAITING,
    PAUSED,
    STOPPED,
    ERROR
}

export class Poll {
    params: PollParams;
    statusTimer: number | null;
    progressCount: number;
    watchStartAt: number;
    status: PollerState;
    error: string;
    watcherTimer: number | null;
    waitTimer: number | null;
    onPollFunc: () => Promise<void>;

    constructor(params: PollParams) {
        this.params = params;
        this.statusTimer = null;
        this.progressCount = 0;
        this.watchStartAt = 0;
        this.status = PollerState.STOPPED;
        this.watcherTimer = null;
        this.waitTimer = null;
        this.error = '';
        this.onPollFunc = params.onPoll;
    }

    pause() {
        this.status = PollerState.PAUSED;

        if (this.waitTimer) {
            window.clearInterval(this.waitTimer);
        }
        if (this.statusTimer) {
            window.clearInterval(this.statusTimer);
        }
        if (this.watcherTimer) {
            window.clearTimeout(this.watcherTimer);
        }

        this.progressCount = 0;
        this.updateOnProgress();
    }

    play() {
        this.start();
    }

    // startWatching() {
    //     this.watchStartAt = Date.now();
    //     this.status = PollerState.STARTED;

    //     const pollWatch = () => {
    //         const elapsed = Date.now() - this.watchStartAt;
    //         if (elapsed > POLLING_TIMEOUT) {
    //             this.status = PollerState.ERROR;
    //             this.error = `Polling took too long (${elapsed}ms)`;
    //             this.stopPolling();
    //             return;
    //         }

    //         switch (this.status) {
    //             case PollerState.STARTED:
    //             case PollerState.POLLING:
    //                 pollWatcherLoop();
    //                 return;
    //             case PollerState.WAITING:
    //                 if (this.watcherTimer) {
    //                     window.clearTimeout(this.watcherTimer);
    //                 }
    //                 this.status = PollerState.WAITING;
    //                 this.startWaiting();
    //                 break;
    //             case PollerState.STOPPED:
    //                 pollWatcherLoop();
    //                 break;
    //             case PollerState.PAUSED:
    //                 console.warn('unexpected state PAUSED');
    //                 // nothing to do
    //                 break;
    //             case PollerState.ERROR:
    //                 console.warn('unexpected state ERROR');
    //                 break;
    //         }
    //     };
    //     const pollWatcherLoop = () => {
    //         this.watcherTimer = window.setTimeout(pollWatch, this.params.watchInterval);
    //     };

    //     pollWatcherLoop();
    // }

    nextPoll() {
        if (this.status === PollerState.STOPPED) {
            return;
        }
        this.status = PollerState.WAITING;
        // Here we enter a loop to pause until the next polling event.
        const waitThenPoll = () => {
            // This will fire another polling request after the interval passes,
            // via a timeout.
            this.waitTimer = window.setTimeout(() => {
                // This stops the progress interval timer
                if (this.statusTimer) {
                    window.clearInterval(this.statusTimer);
                }

                this.runPoll();
            }, this.params.pollInterval);
            this.progressCount = 0;
            pollWaitProgressLoop();
        };

        // This interval timer is for animating the progress bar.
        // It is an interval which should run for the same period that the poll
        // waiter above does, but in steps defined by MONITORING_FEEDBACK_STEPS.
        const pollWaitProgressLoop = () => {
            this.statusTimer = window.setInterval(() => {
                this.progressCount += 1;
                this.updateOnProgress();
            }, this.params.pollInterval / this.params.progressSteps);
        };

        waitThenPoll();
    }

    async runPoll() {
        try {
            await this.onPollFunc();
        } catch (ex) {
            const message = ex instanceof Error ? ex.message : 'Unknown error';
            console.error(`Error running onPoll: ${message}`);
        }
        this.progressCount = 0;
        this.nextPoll();
    }


    start() {
        this.status = PollerState.STARTED;
        this.runPoll();
    }

    updateOnProgress() {
        if (this.params.onProgress) {
            this.params.onProgress(100 * this.progressCount / this.params.progressSteps);
        }
    }

    stop() {
        this.status = PollerState.STOPPED;
        if (this.waitTimer) {
            window.clearInterval(this.waitTimer);
        }
        if (this.statusTimer) {
            window.clearInterval(this.statusTimer);
        }
        if (this.watcherTimer) {
            window.clearTimeout(this.watcherTimer);
        }

        this.progressCount = 0;
        this.updateOnProgress();
    }

    onPoll(onPollFunc: () => Promise<void>) {
        this.onPollFunc = onPollFunc;
    }
}
