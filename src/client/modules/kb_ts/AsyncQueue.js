define([
], (
) => {
    class QueueItem {
        constructor(id, run, error) {
            this.run = run;
            this.error = error;
            this.id = id;
        }
    }

    class AsyncQueue {
        // queue : Array<QueueItem>;
        // queuePauseTime : number;
        // itemId : number;
        // timer : any;

        constructor(queuePauseTime) {
            this.queuePauseTime = queuePauseTime;
            this.queue = [];
        }

        processQueue() {
            var item  = this.queue.shift();
            if (item) {
                try {
                    item.run();
                } catch (ex) {
                    if (item.error) {
                        try {
                            item.error(ex);
                        } catch (ignore) {
                            console.error('ERROR running error fun', ex);
                        }
                    } else {
                        console.error('Error processing queue item', ex);
                    }
                } finally {
                    this.start();
                }
            }
        }

        start() {
            const that = this;
            this.timer = window.setTimeout(() => {
                that.processQueue();
            }, this.queuePauseTime);
        }

        stop(fun) {
            this.addItem(() => {
                window.clearTimeout(this.timer);
                this.timer = null;
                fun();
            });
        }

        addItem(run, error) {
            this.itemId += 1;
            this.queue.push(new QueueItem(this.itemId, run, error));
            this.start();
        }
    }
    return {QueueItem, AsyncQueue};
});