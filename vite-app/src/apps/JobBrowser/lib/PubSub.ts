import { v4 as uuid } from 'uuid';

export interface SubscriptionDefinition {
    channel: string | null;
    message: string;
}

export interface Subscription {
    id: string,
    channelName: string,
    messageName: string;
}

export interface Channel {
    messages: Map<string, MessageListener>;
}

// export interface Listener {

// }

export interface PublishDefinition {
    channel: string;
    message: string;

}

export interface Payload { }

export interface Message {
    id: MessageID,
    payload: any;
}

const SEND_WINDOW = 1000 / 60;

// Listen for message T
export interface Listener {
    id: string;
    messageID: MessageID;
    handler: (message: Message) => void;
}

export interface MessageListener {
    listeners: Array<Listener>;
}

export type MessageID = string;

export class PubSubProxy {
    subscriptions: Array<string>;
    pubsub: PubSub;

    constructor(pubsub: PubSub) {
        this.subscriptions = [];
        this.pubsub = pubsub;
    }

    on(messageID: string, handler: (payload: any) => void) {
        const id = this.pubsub.on(messageID, handler);
        this.subscriptions.push(id);
    }

    off() {
        this.subscriptions.forEach((id) => {
            this.pubsub.off(id);
        });
    }
}

export default class PubSub {
    sendQueue: Array<Message>;
    messageListeners: Map<MessageID, MessageListener>;
    allListeners: Map<string, Listener>;
    constructor() {
        this.sendQueue = [];
        this.messageListeners = new Map<MessageID, MessageListener>();
        this.allListeners = new Map<string, Listener>();
    }

    private sendMessages() {
        const queue = this.sendQueue;
        this.sendQueue = [];
        queue.forEach((message: Message) => {
            const messageListener = this.messageListeners.get(message.id);
            if (!messageListener) {
                return;
            }
            messageListener.listeners.forEach((listener: Listener) => {
                try {
                    listener.handler(message.payload);
                } catch (ex) {
                    console.error('ERROR', ex);
                }
            });
        });
    }

    private processQueue() {
        if (this.sendQueue.length === 0) {
            return;
        }
        window.setTimeout(() => {
            this.sendMessages();
        }, SEND_WINDOW);
    }

    send(messageID: string, payload: any) {
        const message: Message = {
            id: messageID,
            payload
        };
        this.sendQueue.push(message);
        this.processQueue();
    }

    on(messageID: string, handler: (m: Message) => void): string {
        let messageListener = this.messageListeners.get(messageID);
        if (!messageListener) {
            messageListener = {
                listeners: []
            };
            this.messageListeners.set(messageID, messageListener);
        }
        const id = uuid();
        const listener = {
            id, messageID, handler
        };
        messageListener.listeners.push(listener);
        this.allListeners.set(id, listener);
        return id;
    }

    off(id: string) {
        const listener = this.allListeners.get(id);
        if (!listener) {
            return;
        }
        const messageListener = this.messageListeners.get(listener.messageID);
        if (!messageListener) {
            return;
        }
        messageListener.listeners = messageListener.listeners.filter((l) => {
            return l.id !== listener.id;
        });
    }
}