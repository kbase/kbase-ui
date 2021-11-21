import * as uuid from 'uuid';

export type Queue<T> = Array<TaskItemRecord<T>>;

// export type QueueItem<T> = (queue: Queue<T>) => Promise<void>;

export interface TaskItem<T> {
    name: string;
    payload: T;
}

export interface ActionTask<T> {
    name: string;
    task: (payload: T, queue: Queue<T>) => Promise<Queue<T> | null>;
}

export interface TaskItemRecord<T> {
    id: string;
    item: TaskItem<T>;
}

export default class MessageQueue<T> {
    queue: Queue<T> = [];
    interval: number;
    currentTimer: number | null = null;
    registry: Map<string, ActionTask<T>> = new Map();
    constructor(interval: number) {
        this.interval = interval;
    }

    register(task: ActionTask<T>) {
        this.registry.set(task.name, task);
    }

    send(item: TaskItem<T>) {
        this.queue.push({
            id: uuid.v4(),
            item,
        });
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
        let queue = this.queue;
        this.queue = [];

        // try processing only the most recent of a set of messages.

        for await (const item of queue) {
            if (!this.registry.has(item.item.name)) {
                console.warn(`No handler for task ${item.item.name}`);
            } else {
                try {
                    const handler = this.registry.get(item.item.name)!;
                    const result = await handler.task(item.item.payload, queue);
                    if (result === null) {
                        continue;
                    } else {
                        queue = result;
                    }
                } catch (ex) {
                    // what to do?
                    console.error('Error processing queue item');
                    console.error(ex);
                }
            }
        }
    }
}
