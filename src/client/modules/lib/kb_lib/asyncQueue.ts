interface QueueItem {
    id: number;
    callback: () => void;
    errorCallback?: (error: Error) => void;
}

export default class AsyncQueue {
    queue: Array<QueueItem>;
    queuePauseTime: number;
    itemId: number;
    timer: number | null;
    constructor({ queuePauseTime }: { queuePauseTime?: number; } = {}) {
        this.queue = [];
        this.queuePauseTime = typeof queuePauseTime === 'undefined' ? 0 : queuePauseTime;
        this.itemId = 0;
        this.timer = null;
    }

    processQueue() {
        const item = this.queue.shift();
        if (item) {
            try {
                item.callback();
            } catch (ex) {
                console.error('Error processing queue item');
                console.error(ex);
                if (item.errorCallback) {
                    item.errorCallback(ex);
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
        if (this.timer !== null) {
            window.clearTimeout(this.timer);
        }
        this.timer = null;
    }

    nextItemId() {
        this.itemId += 1;
        return this.itemId;
    }

    addItem(callback: () => void, errorCallback?: (error: Error) => void) {
        const item: QueueItem = {
            id: this.nextItemId(),
            callback, errorCallback
        };
        this.queue.push(item);
        this.start();
    }
}

