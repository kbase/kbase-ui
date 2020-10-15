import { uniqueId } from "./Utils";

// Default period with which to poll for stale listeners.
const DEFAULT_MONITOR_FREQUENCY = 100;


interface ListenerParams {
    name: string;
    onSuccess: (payload: any) => void;
    onError: (error: Error) => void;
}

class Listener {
    name: string;
    onSuccess: (payload: any) => void;
    onError: (error: Error) => void;
    constructor({ name, onSuccess, onError }: ListenerParams) {
        this.name = name;
        this.onSuccess = onSuccess;
        this.onError = onError;
    }
}

interface Response {
    handler: (payload: any) => void;
    started: number;
}

class Envelope {
    from: string;
    to: string;
    id: string;
    created: Date;
    constructor({ from, to }: { from: string, to: string; }) {
        this.from = from;
        this.to = to;
        this.id = uniqueId();
        this.created = new Date();
    }

    toJSON() {
        return {
            from: this.from,
            to: this.to,
            id: this.id,
            created: this.created.getTime()
        };
    }
}



class Message {
    id: string;
    name: string;
    payload: any;
    envelope: Envelope;

    constructor({ name, payload, from, to }: { name: string, payload: any, from: string, to: string; }) {
        this.name = name;
        this.payload = payload;
        this.envelope = new Envelope({ from, to });
        this.id = uniqueId();
    }

    toJSON() {
        return {
            envelope: this.envelope.toJSON(),
            name: this.name,
            payload: this.payload
        };
    }
}

interface WaitingListenerParams extends ListenerParams {
    timeout: number;
}

class WaitingListener extends Listener {
    started: number;
    timeout: number;
    status: 'new' | 'waiting' | 'timedout' | 'completed';
    constructor(config: WaitingListenerParams) {
        super(config);
        this.started = Date.now();
        this.timeout = config.timeout;
        this.status = 'new';
    }
}

interface WindowChannelParams {
    on: Window;
    host: string;
    to: string;
}

type MessageId = string;

export class WindowChannel {
    global: Window;
    host: string;
    channelId: string;
    partnerId: string;
    awaitingResponse: Map<MessageId, Response>;
    waitingListeners: Map<MessageId, Array<WaitingListener>>;
    listeners: Map<MessageId, Array<Listener>>;
    lastId: number;
    sentCount: number;
    receivedCount: number;
    isDebug: boolean;
    currentListener: ((event: MessageEvent<any>) => void) | null;
    constructor({ on, host, to }: WindowChannelParams) {
        // The given window upon which we will listen for messages.
        this.global = on;

        // The host for the window; required for postmessage
        this.host = host || document.location.origin;

        // The channel id. Used to filter all messages received to
        // this channel.
        this.channelId = uniqueId();

        this.partnerId = to;

        // And we also filter by the envelope.to field matching
        // this id, recipientID.
        // this.receiveFor = config.receiveFor;

        this.awaitingResponse = new Map();
        this.waitingListeners = new Map();
        this.listeners = new Map();

        this.lastId = 0;
        this.sentCount = 0;
        this.receivedCount = 0;

        this.isDebug = false;
        this.currentListener = null;
    }

    setDebug(isDebug: boolean) {
        this.isDebug = isDebug;
    }

    setPartner(partnerChannelId: string) {
        this.partnerId = partnerChannelId;
    }

    setWindow(global: Window) {
        this.global = global;
    }

    genId() {
        this.lastId += 1;
        return 'msg_' + String(this.lastId);
    }

    receiveMessage(messageEvent: MessageEvent<any>) {
        const possibleMessage = messageEvent.data;

        if (!possibleMessage) {
            if (this.isDebug) {
                console.warn('No message data; message ignored', messageEvent);
            }
            return;
        }
        // TODO: more positive way of asserting this is a kbase message?
        if (!possibleMessage.envelope) {
            if (this.isDebug) {
                console.warn('No message envelope, not from KBase; message ignored', messageEvent);
            }
            return;
        }

        const message = (possibleMessage as unknown) as Message;

        if (message.envelope.to !== this.channelId) {
            if (this.isDebug) {
                console.warn('Message envelope does not match this channel\'s id', messageEvent);
            }
            return;
        }



        // A message sent as a request will have registered a response handler
        // in the awaitingResponse hash, using a generated id as the key.
        // TODO: to to rethink using the message id here. Perhaps something like a
        // chain of ids, the root of which is the origination id, which is the one
        // known here when it it is sent; the message "id" should be assigned whenver
        // a message is sent, but a response  message would include the original
        // message in the "chain"...

        // We can also have awaiting responses without an originating request.
        // These are useful for, e.g., a promise which awaits a message to be sent
        // within some window...

        if (message.envelope.id && this.awaitingResponse.has(message.envelope.id)) {
            try {
                const response = this.awaitingResponse.get(message.envelope.id)!;
                this.awaitingResponse.delete(message.envelope.id);
                response.handler(message.payload);
            } catch (ex) {
                console.error('Error handling response for message ', message, ex);
            }
        }

        // and also awaiting by message name. Like a listener, but they are only used
        // once.
        if (this.waitingListeners.has(message.name)) {
            const awaiting = this.waitingListeners.get(message.name)!;
            this.waitingListeners.delete(message.name);
            awaiting.forEach((listener) => {
                try {
                    listener.onSuccess(message.payload);
                } catch (ex) {
                    console.error('Error handling listener for message', message, ex);
                    if (listener.onError) {
                        listener.onError(ex);
                    }
                }
            });
        }

        // Otherwise, permanently registered handlers are found in the listeners for the
        // message name.
        if (this.listeners.has(message.name)) {
            this.listeners.get(message.name)!.forEach((listener) => {
                if (!listener.onSuccess) {
                    console.warn('no handler for listener!', listener);
                }
                try {
                    listener.onSuccess(message.payload);
                } catch (ex) {
                    console.error('Error handling listener for message', message, ex);
                    if (listener.onError) {
                        listener.onError(ex);
                    }
                }
            });
        }
    }

    listen(listener: Listener) {
        if (!this.listeners.has(listener.name)) {
            this.listeners.set(listener.name, []);
        }
        // if (this.listeners[listener.name]) {
        //     throw new Error('Listener already established for "' + listener.name + '"');
        // }
        this.listeners.get(listener.name)!.push(listener);
    }

    on(name: string, onSuccess: (payload: any) => void, onError: (error: Error) => void) {
        this.listen(
            new Listener({
                name,
                onSuccess,
                onError
            })
        );
    }

    sendMessage(message: Message) {
        this.global.postMessage(message.toJSON(), this.host);
    }

    send(name: string, payload: any) {
        const message = new Message({ name, payload, from: this.channelId, to: this.partnerId });
        this.sendMessage(message);
    }

    sendRequest(message: Message, handler: (payload: any) => void) {
        this.awaitingResponse.set(message.id, {
            started: Date.now(),
            handler
        });
        this.sendMessage(message);
    }

    request(name: string, payload: any) {
        return new Promise((resolve, reject) => {
            try {
                this.sendRequest(new Message({ name, payload, from: this.channelId, to: this.partnerId }), (response) => {
                    resolve(response);
                });
            } catch (ex) {
                reject(ex);
            }
        });
    }

    startMonitor() {
        window.setTimeout(() => {
            const now = Date.now();
            this.waitingListeners.forEach((listeners, key) => {
                const newListeners = listeners.filter((listener) => {
                    if (listener.timeout) {
                        const elapsed = now - listener.started;
                        if (elapsed > listener.timeout) {
                            try {
                                if (listener.onError) {
                                    listener.onError(new Error('timeout after ' + elapsed));
                                }
                            } catch (ex) {
                                console.error('Error calling error handler', key, ex);
                            }
                            return false;
                        } else {
                            return true;
                        }
                    } else {
                        return true;
                    }
                });
                if (newListeners.length === 0) {
                    this.waitingListeners.delete(key);
                }
            });
            // Here we restart the monitor if there are any waitingListeners left.

            if (this.waitingListeners.size > 0) {
                this.startMonitor();
            }

            // if (
            //     Object.keys(this.waitingListeners).some((key) => {
            //         return this.waitingListeners[key].some((listener) => {
            //             return listener.timeout ? true : false;
            //         });
            //     })
            // ) {
            //     this.startMonitor();
            // }
        }, DEFAULT_MONITOR_FREQUENCY);
    }

    listenOnce(listener: WaitingListener) {
        if (!this.waitingListeners.has(listener.name)) {
            this.waitingListeners.set(listener.name, []);
        }
        this.waitingListeners.get(listener.name)!.push(listener);
        if (listener.timeout) {
            this.startMonitor();
        }
    }

    once(name: string, onSuccess: (payload: any) => string, onError: (error: Error) => void, timeout: number) {
        this.listenOnce(
            new WaitingListener({
                name,
                onSuccess,
                onError,
                timeout
            })
        );
    }

    when(name: string, timeout: number) {
        return new Promise((resolve, reject) => {
            return this.listenOnce(
                new WaitingListener({
                    name: name,
                    timeout: timeout,
                    onSuccess: (payload) => {
                        resolve(payload);
                    },
                    onError: (error) => {
                        reject(error);
                    }
                })
            );
        });
    }

    stats() {
        return {
            sent: this.sentCount,
            received: this.receivedCount
        };
    }

    attach(global: Window) {
        this.global = global;
    }

    start() {
        this.currentListener = (event: MessageEvent<any>) => {
            this.receiveMessage(event);
        };
        this.global.addEventListener('message', this.currentListener, false);
    }

    stop() {
        if (this.currentListener && this.global) {
            if (!this.global.removeEventListener) {
                console.warn('HUH?', this.global);
            } else {
                this.global.removeEventListener('message', this.currentListener, false);
            }
        }
    }
}

