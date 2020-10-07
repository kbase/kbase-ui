// a simple reactive database for in-browser general usage
import { Props } from './props';
import { isEqual, uniqueId } from './Utils';

interface Query {
    path: string;
    filter: (value: any) => boolean;
}

interface Subscriptions {
    query: Query;
    callback: () => void;
    lastValue: any;
    errorCount: number;
}

export class ReactiveDB {
    db: Props;
    subscriptions: Map<string, any>;
    queries: Map<string, Query>;
    timer: number | null;
    timerInterval: number;
    constructor() {
        this.db = new Props({});
        this.subscriptions = new Map();
        this.queries = new Map();
        this.timer = null;
        this.timerInterval = 100;
    }

    runOnce() {
        if (this.timer) {
            return;
        }

        if (Object.keys(this.subscriptions).length === 0) {
            return;
        }

        this.timer = window.setTimeout(() => {
            this.runSubscriptions();
            this.timer = null;
            // this.runIfNeedTo();
        }, this.timerInterval);
    }

    runQuery(query: Query) {
        const dbValue = this.db.getItem<any>(query.path, undefined);
        if (typeof dbValue === 'undefined') {
            return;
        }
        if (!query.filter) {
            return dbValue;
        }
        return query.filter(dbValue);
    }

    runSubscriptions() {
        this.subscriptions.forEach((subscription) => {
            try {
                const dbValue = this.runQuery(subscription.query);
                if (typeof dbValue === 'undefined') {
                    return;
                }

                if (typeof subscription.lastValue !== 'undefined') {
                    // TODO: this is pure object equality; but if the
                    // query returns a new collection (via the filter)
                    // we need to do a shallow comparison.
                    if (!isEqual(subscription.lastValue, dbValue)) {
                        subscription.lastValue = dbValue;
                        subscription.fun(dbValue);
                    }
                } else {
                    subscription.lastValue = dbValue;
                    subscription.fun(dbValue);
                }
            } catch (ex) {
                console.error('Error running subscription.');
                subscription.errorCount += 1;
            }
        });
    }

    // PUBLIC api

    set(path: string, value: any) {
        this.db.setItem(path, value);
        this.runOnce();
    }

    get(path: string, defaultValue: any) {
        return this.db.getItem(path, defaultValue);
    }

    subscribe(query: Query, callback: () => void) {
        const subscription = {
            query,
            callback,
            errorCount: 0,
            lastValue: undefined
        };
        const id = uniqueId();
        this.subscriptions.set(id, subscription);
        // this.runOnce();
        return id;
    }

    remove(path: string) {
        this.db.deleteItem(path);
        this.runOnce();
    }

    unsubscribe(id: string) {
        this.subscriptions.delete(id);
    }

    toJSON() {
        return this.db.getRaw();
    }
}

