/**
 * A class to provide a simple data store of one item, to which
 * listeners may be added to listen for updates to that data.
 */

const SCHEDULE_WAIT = 100;

// Tracks a piece of data, with live updates.
export class DataState<T> {
    data: T;
    listeners: Array<(data: T) => void>;
    running: boolean;
    scheduler: number | null = null;
    constructor(initialData: T) {
        this.listeners = [];
        this.running = false;
        this.data = initialData;
    }

    onChange(callback: (data: T) => void): void {
        this.listeners.push(callback);
    }

    start(): void {
        this.running = true;
        this.notify();
        this.schedule();
    }

    stop(): void {
        this.running = false;
        if (this.scheduler) {
            window.clearTimeout(this.scheduler);
            this.scheduler = null;
        }
    }

    schedule(): void {
        this.scheduler = window.setTimeout(() => {
            this.notify();
            if (this.running) {
                this.schedule();
            }
        }, SCHEDULE_WAIT);
    }

    notify(): void {
        for (const listener of this.listeners) {
            try {
                listener(this.data);
            } catch (ex) {
                const message =
                    ex instanceof Error ? ex.message : 'Unknown error';
                console.error(`Error processing: ${message}`, ex, this.data);
            }
        }
    }

    set(data: T): void {
        this.data = data;
        this.notify();
    }
}
