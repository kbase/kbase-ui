
import { getProp } from './props';
import AsyncQueue from './asyncQueue';
import { SimpleMap } from '../types';

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
                return () => {
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

    // modifyItem(key, modifier) {
    //     var oldState = props.getProp(this.state, key),
    //         newValue = modifier(oldState.value),
    //         newListeners = [];
    //     if (this.listeners[key]) {
    //         this.listeners[key].forEach((item) => {
    //             this.queue.addItem({
    //                 onRun: ((fun, value, oldvalue) => {
    //                     return () => {
    //                         try {
    //                             fun(value, oldvalue);
    //                         } catch (ex) {
    //                             //TODO: need a sensible way to manage exception reporting.
    //                             //console.log('EX running onrun handler');
    //                             //console.log(ex);
    //                         }
    //                     };
    //                 })(item.onSet, newValue, oldState && oldState.value)
    //             });
    //             if (!item.oneTime) {
    //                 newListeners.push(item);
    //             }
    //         });
    //         this.listeners[key] = newListeners;
    //     }

    //     props.setProp(this.state, key, { status: 'set', value: newValue, time: new Date() });
    //     return this;
    // }

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

    // whenItem(key, timeout) {
    //     var p = new Promise((resolve, reject) => {
    //         if (props.hasProp(this.state, key)) {
    //             var item = props.getProp(this.state, key);
    //             if (item.status === 'error') {
    //                 reject(item.error);
    //             } else {
    //                 resolve(item.value);
    //             }
    //         } else {
    //             this.listenForItem(key, {
    //                 oneTime: true,
    //                 addedAt: new Date().getTime(),
    //                 onSet: (value) => {
    //                     resolve(value);
    //                 },
    //                 onError: (err) => {
    //                     reject(err);
    //                 }
    //             });
    //         }
    //     });
    //     if (timeout) {
    //         return p.timeout(timeout);
    //     }
    //     return p;
    // }
}


