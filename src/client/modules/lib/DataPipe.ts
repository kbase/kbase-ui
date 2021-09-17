const SCHEDULE_WAIT = 100;

type Payload = any;

export type Tap = (payload: Payload) => void;

export class DataPipe {
    pipe: Array<Payload>;
    taps: Array<Tap>;
    started: boolean;
    constructor() {
        this.pipe = [];
        this.taps = [];
        this.started = false;
    }

    tap(tap: Tap) {
        this.taps.push(tap);
    }

    start() {
        this.started = true;
        this.processPipe();
    }

    schedule() {
        window.setTimeout(() => {
            this.processPipe();
        }, SCHEDULE_WAIT);
    }

    processPipe() {
        if (this.pipe.length === 0) {
            return;
        }
        const pipe = this.pipe;
        this.pipe = [];
        pipe.forEach((item) => {
            this.taps.forEach((tap) => {
                try {
                    tap(item);
                } catch (ex) {
                    const message = (() => {
                        if (ex instanceof Error) {
                            return ex.message;
                        }
                        return '';
                    })();
                    console.error(
                        'Error processing tap: ' + message,
                        ex,
                        tap,
                        item
                    );
                }
            });
        });
    }

    // notify() {
    //     if (this.pipe.length === 0) {
    //         return;
    //     }

    //     this.callbacks.forEach((callback) => {
    //         try {
    //             callback(this);
    //         } catch (ex) {
    //             console.error('Error processing DataPipe callback: ' + ex.message, ex);
    //         }
    //     });
    // }

    available() {
        return this.pipe.length > 0;
    }

    put(payload: Payload) {
        this.pipe.push(payload);
        if (this.started) {
            this.schedule();
        }
    }

    // take(count = 1) {
    //     const taken = this.pipe.slice(0, count);
    //     this.pipe = this.pipe.slice(taken.length);
    //     // if (taken.length < count) {
    //     //     this.pipe = [];
    //     // } else {
    //     //     this.pipe = this.pipe.slice(taken.length);
    //     // }
    //     return taken;
    // }
}
