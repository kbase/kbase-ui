export type QueueItem = () => Promise<void>;

export default class ActionQueue {
    queue: Array<QueueItem> = [];
    interval: number;
    currentTimer: number | null = null;
    constructor(interval: number) {
        this.interval = interval;
    }

    add(item: QueueItem) {
        this.queue.push(item);
        this.run();
    }

    run() {
        if (this.queue.length === 0) {
            return;
        }
        if (this.currentTimer) {
            return;
        }

        this.currentTimer = window.setTimeout(async () => {
            await this.processQueue();
            this.currentTimer = null;
            this.run();
        }, this.interval);
    }

    async processQueue() {
        const queue = this.queue;
        this.queue = [];
        for await (const item of queue) {
            try {
                await item();
            } catch (ex) {
                // what to do?
                console.error('Error processing queue item');
                console.error(ex);
            }
        }
    }
}
