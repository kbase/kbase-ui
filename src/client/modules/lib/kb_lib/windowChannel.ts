import { v4 as uuidv4 } from 'uuid';

interface ListenerParams {
    name: string;
    callback: (payload: Payload) => void;
    onError?: (error: Error) => void;
}

class Listener {
    name: string;
    callback: (payload: Payload) => void;
    onError?: (error: any) => void;

    constructor({ name, callback, onError }: ListenerParams) {
        this.name = name;
        this.callback = callback;
        this.onError = onError;
    }
}

type Payload = any;

interface WaitingListenerParams extends ListenerParams {
    timeout?: number;
}

class WaitingListener extends Listener {
    started: Date;
    timeout: number;

    constructor(params: WaitingListenerParams) {
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

interface Handler {
    started: Date;
    handler: (response: any) => any;
}

interface ReplyHandler {
    started: Date;
    handler: (status: 'ok' | 'error', response: any) => any;
}

export interface WindowChannelInitParams {
    window?: Window;
    host?: string;
    id?: string;
    to?: string;
}

export class WindowChannelInit {
    private readonly window: Window;
    private readonly host: string;
    private readonly id: string;
    constructor(params: WindowChannelInitParams = {}) {
        // The given window upon which we will listen for messages.
        this.window = params.window || window;

        // The host for the window; required for postmessage
        this.host = params.host || this.window.document.location.origin;

        // The channel id. Used to filter all messages received to
        // this channel.
        this.id = params.id || uuidv4();
    }

    makeChannel(partnerId: string) {
        return new WindowChannel({
            window: this.window,
            host: this.host,
            id: this.id,
            to: partnerId,
        });
    }

    getId() {
        return this.id;
    }
}

export interface WindowChannelParams {
    window: Window;
    host: string;
    id: string;
    to: string;
}

interface Stats {
    sent: number;
    received: number;
    ignored: number;
}

export class WindowChannel {
    private readonly window: Window;
    private readonly host: string;
    private readonly id: string;
    private partnerId: string;
    private awaitingResponses: Map<string, ReplyHandler>;
    private waitingListeners: Map<string, Array<Listener>>;
    private listeners: Map<string, Array<Listener>>;
    private lastId: number;
    private currentListener: ((message: MessageEvent) => void) | null;
    private running: boolean;
    private readonly stats: Stats;

    constructor({ window, host, id, to }: WindowChannelParams) {
        // The given window upon which we will listen for messages.
        this.window = window;

        // The host for the window; required for postmessage
        this.host = host;

        // The channel id. Used to filter all messages received to
        // this channel.
        this.id = id;

        this.partnerId = to;

        this.awaitingResponses = new Map<string, Handler>();
        this.waitingListeners = new Map<string, Array<Listener>>();
        this.listeners = new Map<string, Array<Listener>>();

        this.lastId = 0;

        this.currentListener = null;
        this.running = false;
        this.stats = {
            sent: 0,
            received: 0,
            ignored: 0,
        };
    }

    getId(): string {
        return this.id;
    }

    getPartnerId(): string {
        return this.partnerId;
    }

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

        this.stats.received += 1;

        // A message sent as a request will have registered a response handler
        // in the awaitingResponses hash, using a generated id as the key.
        // TODO: to to rethink using the message id here. Perhaps somehting like a
        // chain of ids, the root of which is the origination id, which is the one
        // known here when it it is sent; the message "id" should be assigned whenver
        // a message is sent, but a response  message would include the original
        // message in the "chain"...

        // We can also have awaiting responses without an originating request.
        // These are useful for, e.g., a promise which awaits a message to be sent
        // within some window...

        // if a reply, we ...
        if (
            message.envelope.type === 'reply' &&
            this.awaitingResponses.has(message.envelope.inReplyTo)
        ) {
            const response = this.awaitingResponses.get(
                message.envelope.inReplyTo
            );
            this.awaitingResponses.delete(message.envelope.inReplyTo);
            if (response) {
                response.handler(message.envelope.status, message.payload);
            }
            return;
        }

        // and also awaiting by message name. Like a listener, but they are only used
        // once.

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
                case 'request': {
                    const [ok, err] = (() => {
                        try {
                            return [listener.callback(message.payload), null];
                        } catch (ex) {
                            const message = (() => {
                                if (ex instanceof Error) {
                                    return ex.message;
                                }
                                return '';
                            })();
                            return [
                                null,
                                {
                                    message,
                                },
                            ];
                        }
                    })();
                    const replyEnvelop: ReplyEnvelope = {
                        type: 'reply',
                        from: message.envelope.to,
                        to: message.envelope.from,
                        created: Date.now(),
                        id: uuidv4(),
                        inReplyTo: message.envelope.id,
                        status: ok ? 'ok' : 'error',
                    };
                    const replyMessage = new Message({
                        envelope: replyEnvelop,
                        name: 'reply',
                        payload: ok || err,
                    });
                    this.sendMessage(replyMessage);
                    break;
                }
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

    listen(listener: Listener) {
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
            new Listener({
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

    sendMessage(message: Message) {
        if (!this.running) {
            throw new Error('Not running - may not send ');
        }
        this.stats.sent += 1;
        this.window.postMessage(message.toJSON(), this.host);
    }

    send(name: string, payload: Payload) {
        const envelope: PlainEnvelope = {
            type: 'plain',
            from: this.id,
            to: this.partnerId,
            created: Date.now(),
            id: uuidv4(),
        };
        const message = new Message({ name, payload, envelope });
        this.sendMessage(message);
    }

    sendRequest(
        message: Message,
        handler: (status: 'ok' | 'error', response: any) => any
    ) {
        if (!this.running) {
            throw new Error('Not running - may not send ');
        }
        this.awaitingResponses.set(message.envelope.id, {
            started: new Date(),
            handler,
        });
        this.sendMessage(message);
    }

    request(name: string, payload: Payload) {
        return new Promise((resolve, reject) => {
            const envelope: RequestEnvelope = {
                type: 'request',
                from: this.id,
                to: this.partnerId,
                created: Date.now(),
                id: uuidv4(),
            };
            const message = new Message({
                name,
                payload,
                envelope,
            });
            this.sendRequest(
                message,
                (status: 'ok' | 'error', response: any) => {
                    if (status === 'ok') {
                        resolve(response);
                    } else {
                        // TODO: tighten up the typing!!!
                        reject(new Error(response.message));
                    }
                }
            );
        });
    }

    startMonitor() {
        window.setTimeout(() => {
            const now = new Date().getTime();

            // first take care of listeners awaiting a message.
            for (const [id, listeners] of Array.from(
                this.waitingListeners.entries()
            )) {
                const newListeners = listeners.filter((listener) => {
                    if (listener instanceof WaitingListener) {
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

    listenOnce(listener: WaitingListener) {
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
            new WaitingListener({
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
                new WaitingListener({
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

    setPartner(id: string) {
        this.partnerId = id;
    }

    start(): WindowChannel {
        this.currentListener = (message: MessageEvent) => {
            this.receiveMessage(message);
        };
        this.window.addEventListener('message', this.currentListener, false);
        this.running = true;
        return this;
    }

    stop() {
        this.running = false;
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
