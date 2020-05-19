define([], () => {
    'use strict';

    class AsyncQueue {
        constructor(config) {
            this.queue = [];
            this.queuePauseTime = (config && config.queuePauseTime) || 0;
            this.itemId = 0;
            this.timer = null;
        }

        processQueue() {
            const item = this.queue.shift();
            if (item) {
                try {
                    item.onRun();
                } catch (ex) {
                    if (item.onError) {
                        try {
                            item.onError(ex);
                        } catch (ignore) {
                            console.error('ERROR running onerror');
                            console.error(ex);
                        }
                    } else {
                        console.error('Error processing queue item');
                        console.error(ex);
                    }
                } finally {
                    this.start();
                }
            }
        }

        start() {
            this.timer = window.setTimeout(() => {
                this.processQueue();
            }, this.queuePauseTime);
        }

        stop() {
            window.clearTimeout(this.timer);
            this.timer = null;
        }

        addItem(item) {
            this.itemId += 1;
            item.id = this.itemId;
            this.queue.push(item);
            this.start();
        }
    }

    return AsyncQueue;
});
