define([
    'bluebird',
    'kb_lib/asyncQueue',
    'kb_lib/lang'
], (
    Promise,
    AsyncQueue,
    lang
) => {
    'use strict';

    class Messenger {
        constructor() {
            this.channels = {};
            this.listeners = {};
            this.subId = 0;
            this.queue = new AsyncQueue();
        }

        nextSubId() {
            this.subId += 1;
            return 'sub_' + this.subId;
        }

        static fail(msg) {
            throw new Error(msg);
        }

        receive(subDef) {
            const channelName = subDef.chan || subDef.channel || 'default';
            const messageName = subDef.msg || subDef.message || Messenger.fail('Message is required for a sub');

            // Get the channel, and create it if it doesn't exist.
            let channel = this.channels[channelName];
            if (!channel) {
                channel = {
                    messages: {}
                };
                this.channels[channelName] = channel;
            }

            // Get the message definitions for this message, create if doesn't exist
            let messageListener = channel.messages[messageName];
            if (!messageListener) {
                messageListener = {
                    listeners: [],
                    byId: {}
                };
                channel.messages[messageName] = messageListener;
            }

            // Add our message definition
            const subId = this.nextSubId();
            subDef.subId = subId;
            messageListener.byId[subId] = subDef;
            messageListener.listeners.push(subDef);
            return {
                chan: channelName,
                msg: messageName,
                id: subId
            };
        }

        drop(sub) {
            return this.unreceive(sub);
        }

        unreceive(sub) {
            const channel = this.channels[sub.chan];
            if (!channel) {
                return false;
            }
            const messageListener = channel.messages[sub.msg];
            if (!messageListener) {
                return false;
            }

            const subDef = messageListener.byId[sub.id];
            if (!subDef) {
                return false;
            }
            delete messageListener.byId[sub.id];
            messageListener.listeners = messageListener.listeners.filter((item) => {
                if (item.subId === sub.id) {
                    return false;
                }
                return true;
            });
            return true;
        }

        send(pubDef) {
            const channelName = pubDef.chan || pubDef.channel;
            const messageName = pubDef.msg || pubDef.message;

            const channel = this.channels[channelName];
            if (!channel) {
                return;
            }
            const messageListener = channel.messages[messageName];
            if (!messageListener) {
                return;
            }

            messageListener.listeners.forEach((subDef) => {
                this.queue.addItem({
                    onRun: () => {
                        try {
                            subDef.handler(pubDef.data);
                        } catch (ex) {
                            console.error(ex);
                            throw new lang.UIError({
                                type: 'RuntimeError',
                                reason: 'MessageHandlerError',
                                message: 'Exception running message ' + messageName + ', sub ' + subDef.subId,
                                data: ex,
                                suggestion: 'This is an application error, not your fault'
                            });
                        }
                    }
                });
            });
        }

        sendPromise(pubDef) {
            const channelName = pubDef.chan || pubDef.channel;
            const messageName = pubDef.msg || pubDef.message;

            return Promise.try(() => {

                const channel = this.channels[channelName];
                if (!channel) {
                    if (pubDef.propogate) {
                        return [];
                    } else {
                        throw new Error('Channel not found : ' + channelName);
                    }
                }
                const messageListener = channel.messages[messageName];
                if (!messageListener) {
                    if (pubDef.propogate) {
                        return [];
                    } else {
                        // throw new Error('No listener found for message : ' + messageName);
                        return [];
                    }
                }

                const listeners = messageListener.listeners;
                return Promise.all(
                    listeners
                        .map((subDef) => {
                            return new Promise((resolve, reject) => {
                                this.queue.addItem({
                                    onRun: () => {
                                        try {
                                            resolve(subDef.handler(pubDef.data));
                                        } catch (ex) {
                                            console.error(ex);
                                            reject(
                                                new lang.UIError({
                                                    type: 'RuntimeError',
                                                    reason: 'MessageHandlerError',
                                                    message:
                                                        'Exception running message ' +
                                                        messageName +
                                                        ', sub ' +
                                                        pubDef.subId,
                                                    data: ex,
                                                    suggestion: 'This is an application error, not your fault'
                                                })
                                            );
                                        }
                                    },
                                    onError: (err) => {
                                        reject(err);
                                    }
                                });
                            });
                        })
                        .map((promise) => {
                            return promise.reflect();
                        })
                );
            });
        }
    }

    return Messenger;
});
