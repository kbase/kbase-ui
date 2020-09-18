define([], function () {

    const SCHEDULE_WAIT = 100;

    class DataPipe {
        constructor() {
            this.pipe = [];
            this.taps = [];
            this.started = false;
        }

        tap(tap) {
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
                        console.error('Error processing tap: ' + ex.message, ex, tap, item);
                    }
                });
            });
        }

        notify() {
            if (this.pipe.length === 0) {
                return;
            }

            this.callbacks.forEach((callback) => {
                try {
                    callback(this);
                } catch (ex) {
                    console.error('Error processing DataPipe callback: ' + ex.message, ex);
                }
            });
        }

        available() {
            return this.pipe.length > 0;
        }

        put(payload) {
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

    return DataPipe;
});
