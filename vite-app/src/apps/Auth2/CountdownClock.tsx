const DEFAULT_TICK_INTERVAL = 250;

export interface CountdownClockParams {
    expiresAt?: number;
    expiresIn?: number;
    tick?: number;
    onTick: (remaining: number) => void;
    onExpired: () => void;
}

enum CountdownClockStatus {
    NONE = 'NONE',
    RUNNING = 'RUNNING',
    STOPPED = 'STOPPED'
}

export default class CountdownClock {
    params: CountdownClockParams;
    targetTime: number;
    tickInterval: number;
    timer: number | null;
    status: CountdownClockStatus
    constructor(params: CountdownClockParams) {
        this.params = params;
        const { expiresAt, expiresIn, tick } = params;
        // Either countdown until a specific time ...
        if (expiresAt) {
            this.targetTime = expiresAt;
            // ... or for a quantity of time.
        } else if (expiresIn) {
            this.targetTime = new Date().getTime() + expiresIn;
        } else {
            console.error;
            throw new Error('Either "expiresAt" or "expiresIn" must be provided');
        }
        this.tickInterval = tick || DEFAULT_TICK_INTERVAL;
        // this.onTick = onTick;
        // this.onExpired = onExpired;
        this.timer = null;
        this.status = CountdownClockStatus.NONE;
    }

    remaining() {
        const now = new Date().getTime();
        return this.targetTime - now;
    }

    tick() {
        if (this.status !== 'RUNNING') {
            return;
        }
        const remaining = this.remaining();
        try {
            this.params.onTick(remaining);
        } catch (ex) {
            console.error(`clock onRun: ${ex instanceof Error ? ex.message : 'Unknown Error'}`);
        }
        if (remaining > 0) {
            this.tock();
        } else {
            this.params.onExpired();
        }
    }

    tock() {
        this.timer = window.setTimeout(() => {
            if (!this.timer) {
                return;
            }
            this.tick();
        }, this.tickInterval);
    }

    start() {
        this.status = CountdownClockStatus.RUNNING;
        this.tick();
    }

    stop() {
        this.status = CountdownClockStatus.STOPPED;
        if (this.timer) {
            window.clearTimeout(this.timer);
            this.timer = null;
        }
    }
}
