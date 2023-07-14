interface QueueItem {
    id: number;
    callback: () => Promise<void>;
    errorCallback?: (error: any) => void;
}

export default class Tasks {
    queue: Array<QueueItem>;
    interval: number;
    itemId: number;
    timer: number | null;
    constructor({ interval }: { interval: number }) {
        this.queue = [];
        this.interval = interval;
        this.itemId = 0;
        this.timer = null;
    }

    async processQueue(): Promise<void> {
        const queue = this.queue;
        this.queue = [];
        for await (const queueItem of queue) {
            try {
                await queueItem.callback();
            } catch (ex) {
                if (queueItem.errorCallback) {
                    queueItem.errorCallback(ex);
                }
            }
        }
    }

    start(): void {
        this.timer = window.setTimeout(async () => {
            await this.processQueue();
        }, this.interval);
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

    add(
        callback: () => Promise<void>,
        errorCallback?: (error: Error) => void
    ): void {
        const item: QueueItem = {
            id: this.nextItemId(),
            callback,
            errorCallback,
        };
        this.queue.push(item);
        this.start();
    }
}
