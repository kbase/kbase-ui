import AsyncQueue from './kb_lib/asyncQueue';
import { tryPromise, UIError } from './kb_lib/Utils';

interface Channel {
    messageHandlers: Map<string, MessageHandler>;
}

interface MessageHandler {
    subscriptions: Array<Subscription>;
    subscriptionMap: Map<string, Subscription>;
}

// interface Listener {
//     id: string;
// }

interface Message {

}

interface SubscriptionDef {
    channel?: string;
    message: string;
    handler: (payload: any) => void;
}

interface Subscription {
    id: string;
    channelName: string;
    message: string;
    handler: (payload: any) => void;
}

export interface SubscriptionRef {
    id: string;
    channelName: string;
    message: string;
}

interface PublishDefinition {
    channel: string;
    message: string;
    payload: any;
}

export class Messenger {
    channels: Map<string, Channel>;
    // listeners: Map<string, Listener>;
    subId: number;
    queue: AsyncQueue;
    constructor() {
        this.channels = new Map();
        // this.listeners = new Map();
        this.subId = 0;
        this.queue = new AsyncQueue();
    }

    nextSubscriptionId() {
        this.subId += 1;
        return 'sub_' + this.subId;
    }

    receive(subscriptionDef: SubscriptionDef): SubscriptionRef {
        const channelName = subscriptionDef.channel || 'default';
        const message = subscriptionDef.message;

        // Get the channel, and create it if it doesn't exist.
        let channel = this.channels.get(channelName);
        if (!channel) {
            channel = {
                messageHandlers: new Map<string, MessageHandler>()
            };
            this.channels.set(channelName, channel);
        }

        // Get the message definitions for this message, create if doesn't exist
        let messageHandler = channel.messageHandlers.get(message);
        if (!messageHandler) {
            messageHandler = {
                subscriptions: [],
                subscriptionMap: new Map<string, Subscription>()
            };
            channel.messageHandlers.set(message, messageHandler);
        }

        // Add our message definition
        const id = this.nextSubscriptionId();
        const subscription = {
            id,
            channelName,
            message,
            handler: subscriptionDef.handler
        };
        messageHandler.subscriptionMap.set(id, subscription);
        messageHandler.subscriptions.push(subscription);

        return {
            id,
            channelName,
            message
        };
    }

    drop(subscriptionRef: SubscriptionRef) {
        return this.unreceive(subscriptionRef);
    }

    unreceive(subscriptionRef: SubscriptionRef) {
        const channel = this.channels.get(subscriptionRef.channelName);
        if (!channel) {
            return false;
        }
        const messageListener = channel.messageHandlers.get(subscriptionRef.message);
        if (!messageListener) {
            return false;
        }

        const subscription = messageListener.subscriptionMap.get(subscriptionRef.id);
        if (!subscription) {
            return false;
        }

        messageListener.subscriptionMap.delete(subscriptionRef.id);
        messageListener.subscriptions = messageListener.subscriptions.filter((listener) => {
            return (listener.id !== subscriptionRef.id);
        });
        return true;
    }

    send(publishDef: PublishDefinition) {
        const channelName = publishDef.channel;
        const message = publishDef.message;

        const console_workaround = console;
        console_workaround.log("Messenger.send",publishDef)

        const channel = this.channels.get(channelName);
        if (!channel) {
            return;
        }
        const messageHandler = channel.messageHandlers.get(message);
        if (!messageHandler) {
            return;
        }

        messageHandler.subscriptions.forEach((subscription) => {
            this.queue.addItem(() => {
                try {
                    subscription.handler(publishDef.payload);
                } catch (ex) {
                    console.error(ex);
                    throw new UIError({
                        type: 'RuntimeError',
                        reason: 'MessageHandlerError',
                        message: 'Exception running message ' + message + ', sub ' + subscription.id,
                        blame: 'subscription',
                        code: 'subscription-handler-error',
                        suggestion: 'This is an application error, not your fault'
                    });
                }
            });
        });
    }

    sendPromise(publishDef: PublishDefinition) {
        const channelName = publishDef.channel;
        const message = publishDef.message;

        const channel = this.channels.get(channelName);
        if (!channel) {
            return;
        }
        const messageHandler = channel.messageHandlers.get(message);
        if (!messageHandler) {
            return;
        }

        return tryPromise<any>(() => {
            const channel = this.channels.get(channelName);
            if (!channel) {
                throw new Error('Channel not found : ' + channelName);
            }
            const messageHandler = channel.messageHandlers.get(message);
            if (!messageHandler) {
                throw new Error('No listener found for message : ' + message);
                // return [];
            }

            const subscriptions = messageHandler.subscriptions;
            return Promise.all(
                subscriptions
                    .map((subscription) => {
                        return new Promise((resolve, reject) => {
                            this.queue.addItem(
                                () => {
                                    try {
                                        resolve(subscription.handler(publishDef.payload));
                                    } catch (ex) {
                                        console.error(ex);
                                        reject(
                                            new UIError({
                                                type: 'RuntimeError',
                                                reason: 'MessageHandlerError',
                                                message:
                                                    'Exception running message ' +
                                                    message +
                                                    ', sub ' +
                                                    subscription.id,
                                                blame: 'message handler handler',
                                                code: 'message-handler-handler-error',
                                                suggestion: 'This is an application error, not your fault'
                                            })
                                        );
                                    }
                                },
                                (err) => {
                                    reject(err);
                                }
                            );
                        });
                    })
            );
        });
    }
}

