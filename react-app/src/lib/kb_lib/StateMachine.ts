/*
state machine is an observable data store.

It can be used as a global store, by storing it in some global location, but is agnostic.

It is based on the redux model.

The state is established initially.

The state is updated through Modifiers.

The state can be extracted at any time.

A change in state can be listened to by a simple listener.

*/

export type Listener<T> = (state: T) => void;

export type Updater<T> = (currentState: T) => T;

export interface StateMachineParams<T> {
    initialState: T,
    interval: number;
}

export class StateMachine<T> {
    state: T;
    listeners: Array<Listener<T>>;
    scheduledUpdates: Array<Updater<T>>;
    updateTimer: number | null;
    updateTimerInterval: number;
    running: boolean;
    constructor({ initialState, interval }: StateMachineParams<T>) {
        this.state = initialState;
        this.listeners = [];
        this.scheduledUpdates = [];
        this.updateTimer = null;
        this.updateTimerInterval = interval;
        this.running = true;
    }

    stop() {
        this.running = false;
        if (this.updateTimer !== null) {
            window.clearTimeout(this.updateTimer);
            this.updateTimer = null;
        }
    }

    onChange(listener: Listener<T>): void {
        this.listeners.push(listener);
    }

    getState(): T {
        // TODO: wish we could copy the state --
        // we possibly can, but is it worth it? 
        return this.state;
    }

    update(updater: Updater<T>): void {
        this.scheduledUpdates.push(updater);
        this.scheduleUpdates();
    }

    scheduleUpdates() {
        if (this.updateTimer !== null) {
            return;
        }
        this.updateTimer = window.setTimeout(() => {
            try {
                this.runUpdates();
            } catch (ex) {
                console.error('Error running updates!', ex);
            }
            try {
                this.runOnChangeListeners();
            } catch (ex) {
                console.error('Error running onChange listeners', ex);
            }
            this.updateTimer = null;
        }, this.updateTimerInterval);
    }

    runOnChangeListeners() {
        if (!this.running) {
            return;
        }
        this.listeners.forEach((listener) => {
            try {
                listener(this.state);
            } catch (ex) {
                console.error('Error running onChange listener', ex);
            }
        });
    }

    runUpdates() {
        if (!this.running) {
            return;
        }
        const updaters = this.scheduledUpdates;
        this.scheduledUpdates = [];
        updaters.forEach((updater) => {
            try {
                this.state = updater(this.state);
            } catch (error) {
                console.error('[StateMachine] Error running updater', error);
            }
        });
    }
}
