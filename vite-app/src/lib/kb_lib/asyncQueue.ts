interface QueueItem {
    id: number;
    callback: () => Promise<void>;
    errorCallback?: (error: any) => void;
}

export default class AsyncQueue {
    queue: Array<QueueItem>;
    queuePauseTime: number;
    itemId: number;
    timer: number | null;
    constructor({ queuePauseTime }: { queuePauseTime?: number } = {}) {
        this.queue = [];
        this.queuePauseTime =
            typeof queuePauseTime === 'undefined' ? 0 : queuePauseTime;
        this.itemId = 0;
        this.timer = null;
    }

    processNext(): void {
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

    async processQueue() {
        const queue = this.queue;
        this.queue = [];
        for (const item of queue) {
            try {
                await item.callback();
            } catch (ex) {
                console.error('Error processing queue item');
                console.error(ex);
                if (item.errorCallback) {
                    item.errorCallback(ex);
                }
            }
        }
    }

    start(): void {
        this.timer = window.setTimeout(() => {
            this.processQueue();
        }, this.queuePauseTime);
    }

    stop(): void {
        if (this.timer !== null) {
            window.clearTimeout(this.timer);
        }
        this.timer = null;
    }

    nextItemId(): number {
        this.itemId += 1;
        return this.itemId;
    }

    addItem(callback: () => Promise<void>, errorCallback?: (error: any) => Promise<void>): void {
        const item: QueueItem = {
            id: this.nextItemId(),
            callback,
            errorCallback,
        };
        this.queue.push(item);
        this.start();
    }
}
