import PubSub, { PubSubProxy } from "./PubSub";

const POLLING_TIMEOUT = 60000;

export interface PollerParams {
    // callback to trigger a polling action, whatever that is.
    onPoll: () => void,
    // callback for progress
    onProgress?: (progress: number) => void,
    pubsub: PubSub,
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

export class Poller {
    params: PollerParams;
    statusTimer: number | null;
    statusCount: number;
    watchStartAt: number;
    status: PollerState;
    error: string;
    watcherTimer: number | null;
    waitTimer: number | null;
    pubsubProxy: PubSubProxy;

    constructor(params: PollerParams) {
        this.params = params;
        this.statusTimer = null;
        this.statusCount = 0;
        this.watchStartAt = 0;
        this.status = PollerState.STOPPED;
        this.watcherTimer = null;
        this.waitTimer = null;
        this.pubsubProxy = new PubSubProxy(this.params.pubsub);
        this.error = '';
    }

    stop() {
        this.stopPolling();
        this.pubsubProxy.off();
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

        this.statusCount = 0;
        this.updateOnProgress();
    }

    play() {
        this.startWaiting();
    }

    /*
    This...
    watches the state of the poller to ensure that the poll doesn't exceed a timeout.
    */
    startWatching() {
        this.watchStartAt = Date.now();
        this.status = PollerState.STARTED;

        const pollWatch = () => {
            const elapsed = Date.now() - this.watchStartAt;
            if (elapsed > POLLING_TIMEOUT) {
                this.status = PollerState.ERROR;
                this.error = `polling timeout (${POLLING_TIMEOUT}) exceeded after ${elapsed}ms`;
                console.warn(this.error);
                this.stopPolling();
                return;
            }

            switch (this.status) {
                case PollerState.STARTED:
                case PollerState.POLLING:
                    pollWatcherLoop();
                    return;
                case PollerState.WAITING:
                    if (this.watcherTimer) {
                        window.clearTimeout(this.watcherTimer);
                    }
                    this.status = PollerState.WAITING;
                    this.startWaiting();
                    break;
                case PollerState.STOPPED:
                    pollWatcherLoop();
                    break;
                case PollerState.PAUSED:
                    console.warn('unexpected state PAUSED');
                    // nothing to do
                    break;
                case PollerState.ERROR:
                    console.warn('unexpected state ERROR');
                    break;
            }
        };
        const pollWatcherLoop = () => {
            this.watcherTimer = window.setTimeout(pollWatch, this.params.watchInterval);
        };

        pollWatcherLoop();
    }

    startWaiting() {
        this.status = PollerState.WAITING;
        // Here we enter a loop to pause until the next polling event.
        const pollWaitLoop = () => {
            // This will fire another polling request after the interval passes,
            // via a timeout.
            if (this.status === PollerState.STOPPED) {
                return;
            }
            this.waitTimer = window.setTimeout(
                this.runPoll.bind(this), this.params.pollInterval
            );
            this.statusCount = 0;
            pollWaitProgressLoop();
        };

        // This interval timer is for animating the progress bar.
        // It is an interval which should run for the same period that the poll
        // waiter above does, but in steps defined by MONITORING_FEEDBACK_STEPS.
        const pollWaitProgressLoop = () => {
            this.statusTimer = window.setInterval(() => {
                this.statusCount += 1;
                this.updateOnProgress();
            }, this.params.pollInterval / this.params.progressSteps);
        };

        pollWaitLoop();
    }

    runPoll() {
        if (this.statusTimer) {
            window.clearInterval(this.statusTimer);
        }

        this.params.onPoll();
        this.statusCount = 0;
        this.startWatching();
    }

    /*
        This provides a hook for an external event which should be the same
        logical even as this poller is polling for. So if the event happens
        outside of this poller, we want to control the polling. 
        Specifically, if we currently running the poll, we just continue doing
        that since it is equivalent to the event we received.
        If, on the other hand, we are waiting for the next polling event, we should
        pause polling.
        Upon the even finishing (signaled by the event with is=false), we resume
        polling if it were previously polled.
        TODO: this is not quite correct; rather, the previous state, whether waiting, 
        stopped, or paused, should be resumed.
    */
    startListeningForPollingEvent() {
        this.pubsubProxy.on('searching', ({ is }) => {
            if (is) {
                switch (this.status) {
                    case PollerState.STARTED:
                        // this is where we move into the polling state!
                        this.status = PollerState.POLLING;
                        break;
                    case PollerState.POLLING:
                        // hmm, if a polling event ('searching' for now) comes in,
                        // and we are already polling, this is weird, but lets stay
                        // in the polling state.
                        break;
                    case PollerState.WAITING:
                        this.pause();
                        break;
                    case PollerState.STOPPED:
                        break;
                    case PollerState.PAUSED:
                        // nothing to do
                        break;
                    case PollerState.ERROR:
                        break;
                }
            } else {
                switch (this.status) {
                    case PollerState.STARTED:
                        break;
                    case PollerState.POLLING:
                        this.status = PollerState.WAITING;
                        break;
                    case PollerState.WAITING:
                        break;
                    case PollerState.STOPPED:
                        break;
                    case PollerState.PAUSED:
                        this.play();
                        break;
                    case PollerState.ERROR:
                        break;
                }
            }
        });
    }

    stopListeningForPollingEvent() {
        this.pubsubProxy.off();
    }

    startPolling() {
        this.startListeningForPollingEvent();
        this.runPoll();
    }

    updateOnProgress() {
        if (this.params.onProgress) {
            this.params.onProgress(100 * this.statusCount / this.params.progressSteps);
        }
    }

    stopPolling() {
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

        this.statusCount = 0;
        this.updateOnProgress();
        this.stopListeningForPollingEvent();
    }
}
