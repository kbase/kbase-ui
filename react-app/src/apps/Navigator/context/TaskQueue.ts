export type QueueItem = () => Promise<void>;

export enum TaskQueueStatus {
    READY = 'READY',
    RUNNING = 'RUNNING',
    DONE = 'DONE',
}

export default class TaskQueue {
    queue: Array<QueueItem> = [];
    interval: number;
    currentTimer: number | null = null;
    status: TaskQueueStatus = TaskQueueStatus.READY;
    constructor(interval: number) {
        this.interval = interval;
    }

    add(item: QueueItem) {
        if (this.status !== TaskQueueStatus.READY) {
            throw new Error(`Cannot accept new tasks when ${this.status}`);
        }
        this.queue.push(item);
    }

    run(): Promise<void> {
        this.status = TaskQueueStatus.RUNNING;
        return new Promise((resolve, reject) => {
            if (this.queue.length === 0) {
                return;
            }
            if (this.currentTimer) {
                reject(new Error('Task runner already running'));
            }

            this.currentTimer = window.setTimeout(async () => {
                await this.processQueue();
                this.status = TaskQueueStatus.DONE;
                resolve();
            }, this.interval);
        });
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
