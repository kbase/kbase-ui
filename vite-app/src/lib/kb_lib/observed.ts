
import AsyncQueue from './asyncQueue';

type Listener<T> = (value: T, oldValue: T | undefined) => void;

interface ListenerRecord<T> {
    listener: Listener<T>;
    oneTime: boolean;
}

export class Observed<T> {
    listeners: Array<ListenerRecord<T>>;
    queue: AsyncQueue;
    value: T;
    previousValue?: T;
    constructor(initialValue: T) {
        this.listeners = [];
        this.queue = new AsyncQueue({});
        this.value = initialValue;
    }

    setValue(value: T) {
        this.value = value;
        const oldValue = this.previousValue;
        const newListeners: Array<ListenerRecord<T>> = [];
        this.listeners.forEach((listener: ListenerRecord<T>) => {
            this.queue.addItem(((listener: Listener<T>, value: T, oldValue: T | undefined) => {
                return async () => {
                    try {
                        listener(value, oldValue);
                    } catch (ex) {
                        //TODO: need a sensible way to manage exception reporting.
                        console.error('Error setting value', ex);
                    }
                };
            })(listener.listener, value, oldValue));
            if (!listener.oneTime) {
                newListeners.push(listener);
            }
        });
        this.listeners = newListeners;
    }

    getValue() {
        return this.value;
    }

    onChange(listener: Listener<T>) {
        this.listeners.push({
            listener,
            oneTime: false
        });
    }

    whenChanged() {
        let resolver: (value: T) => void;
        const promise = new Promise<T>((resolve) => {
            resolver = resolve;
        });
        const listener = (value: T, oldValue?: T) => {
            resolver(value);
        };
        this.listeners.push({
            listener,
            oneTime: true
        });
        return promise;
    }
}


