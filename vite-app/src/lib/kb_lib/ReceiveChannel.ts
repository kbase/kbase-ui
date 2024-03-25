import { v4 as uuidv4 } from 'uuid';

interface ChannelListenerParams {
    name: string;
    callback: (payload: Payload) => void;
    onError?: (error: Error) => void;
}

class ChannelListener {
    name: string;
    callback: (payload: Payload) => void;
    onError?: (error: any) => void;

    constructor({ name, callback, onError }: ChannelListenerParams) {
        this.name = name;
        this.callback = callback;
        this.onError = onError;
    }
}

type Payload = any;

interface ChannelWaitingListenerParams extends ChannelListenerParams {
    timeout?: number;
}

class ChannelWaitingListener extends ChannelListener {
    started: Date;
    timeout: number;

    constructor(params: ChannelWaitingListenerParams) {
        super(params);
        this.started = new Date();
        this.timeout = params.timeout || 5000;
    }
}

type EnvelopeType = 'plain' | 'request' | 'reply';

interface EnvelopeBase {
    type: EnvelopeType;
    from: string;
    to: string;
    id: string;
    created: number;
}

interface PlainEnvelope extends EnvelopeBase {
    type: 'plain';
}

interface RequestEnvelope extends EnvelopeBase {
    type: 'request';
}

interface ReplyEnvelope extends EnvelopeBase {
    type: 'reply';
    inReplyTo: string;
    status: 'ok' | 'error';
}

type Envelope = PlainEnvelope | RequestEnvelope | ReplyEnvelope;

class Message {
    name: string;
    payload: any;
    id: string;
    created: Date;
    envelope: Envelope;

    constructor({
        name,
        payload,
        envelope,
    }: {
        name: string;
        payload: any;
        envelope: Envelope;
    }) {
        this.name = name;
        this.payload = payload;
        this.id = uuidv4();
        this.created = new Date();
        this.envelope = envelope;
    }

    toJSON() {
        return {
            envelope: this.envelope,
            name: this.name,
            payload: this.payload,
        };
    }
}


export interface WindowChannelParams {
    window: Window;
    // host: string;
    id: string;
}

interface Stats {
    sent: number;
    received: number;
    ignored: number;
}

export class ReceiveChannel {
    private readonly window: Window;
    private readonly id: string;
    private receiveFromIds: Array<string>
    private waitingListeners: Map<string, Array<ChannelListener>>;
    private listeners: Map<string, Array<ChannelListener>>;
    private currentListener: ((message: MessageEvent) => void) | null;
    private readonly stats: Stats;

    constructor({ window, id }: WindowChannelParams) {
        // The given window upon which we will listen for messages.
        this.window = window;

        // The host for the window; required for postmessage
        // this.host = host;

        // The channel id. Used to filter all messages received to
        // this channel.
        this.receiveFromIds = [];

        this.id = id;

        this.waitingListeners = new Map<string, Array<ChannelListener>>();
        this.listeners = new Map<string, Array<ChannelListener>>();

        this.currentListener = null;
        this.stats = {
            sent: 0,
            received: 0,
            ignored: 0,
        };
    }

    receiveFrom(id: string) {
        this.receiveFromIds.push(id);
    }

    getId(): string {
        return this.id;
    }

    // getPartnerId(): string {
    //     return this.partnerId;
    // }

    getStats(): Stats {
        return this.stats;
    }

    /**
     * Receives all messages sent via postMessage to the associated window.
     *
     * @param messageEvent - a post message event
     */
    receiveMessage(messageEvent: MessageEvent) {
        const message = messageEvent.data as Message;
        // Here we have a series of filters to determine whether this message should be
        // handled by this post message bus.
        // In all cases we issue a warning, and return.

        if (typeof message !== 'object' || message === null) {
            this.stats.ignored += 1;
            return;
        }

        // TODO: could do more here.
        if (!message.envelope) {
            this.stats.ignored += 1;
            return;
        }

        // Here we ignore messages intended for another windowChannel object.
        if (message.envelope.to !== this.id) {
            this.stats.ignored += 1;
            return;
        }

        if (!this.receiveFromIds.includes(message.envelope.from)) {
            this.stats.ignored += 1;
            return;
        }

        this.stats.received += 1;

        if (this.waitingListeners.has(message.name)) {
            const awaiting = this.waitingListeners.get(message.name)!;
            this.waitingListeners.delete(message.name);
            awaiting.forEach((listener) => {
                try {
                    listener.callback(message.payload);
                } catch (ex) {
                    if (listener.onError) {
                        listener.onError(ex);
                    }
                }
            });
        }

        // Otherwise, permanently registered handlers are found in the listeners for the
        // message name.
        const listeners = this.listeners.get(message.name) || [];
        for (const listener of listeners) {
            switch (message.envelope.type) {
                case 'plain':
                default:
                    // default case handles older messages without the envelope type.
                    try {
                        return listener.callback(message.payload);
                    } catch (ex) {
                        if (listener.onError) {
                            listener.onError(ex as unknown as Error);
                        }
                    }
                    break;
            }
        }
    }

    listen(listener: ChannelListener) {
        if (!this.listeners.has(listener.name)) {
            this.listeners.set(listener.name, []);
        }
        this.listeners.get(listener.name)!.push(listener);
    }

    on(
        messageId: string,
        callback: (payload: any) => any,
        onError?: (error: any) => void
    ) {
        this.listen(
            new ChannelListener({
                name: messageId,
                callback,
                onError: (error: Error) => {
                    if (onError) {
                        onError(error);
                    }
                },
            })
        );
    }

    startMonitor() {
        window.setTimeout(() => {
            const now = new Date().getTime();

            // first take care of listeners awaiting a message.
            for (const [id, listeners] of Array.from(
                this.waitingListeners.entries()
            )) {
                const newListeners = listeners.filter((listener) => {
                    if (listener instanceof ChannelWaitingListener) {
                        const elapsed = now - listener.started.getTime();
                        if (elapsed > listener.timeout) {
                            try {
                                if (listener.onError) {
                                    listener.onError(
                                        new Error('timout after ' + elapsed)
                                    );
                                }
                            } catch (ex) {
                                console.error(
                                    'Error calling error handler',
                                    id,
                                    ex
                                );
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
                    this.waitingListeners.delete(id);
                }
            }

            if (this.waitingListeners.size > 0) {
                this.startMonitor();
            }
        }, 100);
    }

    listenOnce(listener: ChannelWaitingListener) {
        if (!this.waitingListeners.has(listener.name)) {
            this.waitingListeners.set(listener.name, []);
        }
        this.waitingListeners.get(listener.name)!.push(listener);
        if (listener.timeout) {
            this.startMonitor();
        }
    }

    once(
        name: string,
        timeout: number,
        callback: (payload: Payload) => void,
        onError?: (error: Error) => void
    ) {
        this.listenOnce(
            new ChannelWaitingListener({
                name,
                callback,
                timeout,
                onError: (error: Error) => {
                    if (onError) {
                        onError(error);
                    }
                },
            })
        );
    }

    when(name: string, timeout: number) {
        return new Promise((resolve, reject) => {
            return this.listenOnce(
                new ChannelWaitingListener({
                    name,
                    timeout,
                    callback: (payload) => {
                        resolve(payload);
                    },
                    onError: (error) => {
                        reject(error);
                    },
                })
            );
        });
    }

    // setPartner(id: string) {
    //     this.partnerId = id;
    // }

    start(): ReceiveChannel {
        this.currentListener = (message: MessageEvent) => {
            this.receiveMessage(message);
        };
        this.window.addEventListener('message', this.currentListener, false);
        return this;
    }

    stop() {
        if (this.currentListener) {
            this.window.removeEventListener(
                'message',
                this.currentListener,
                false
            );
        }
        return this;
    }
}


