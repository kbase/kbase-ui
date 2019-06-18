define([], function () {
    'use strict';

    // copy pasta: https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
    function uuidv4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            if (c === 'x') {
                return r.toString(16);
            } else {
                return ((r & 0x3) | 0x8).toString(16);
            }
        });
    }

    class Listener {
        constructor(config) {
            this.name = config.name;
            this.onSuccess = config.onSuccess;
            this.onError = config.onError;
        }
    }

    class Envelope {
        constructor({ from, to }) {
            this.from = from;
            this.to = to;
            this.id = uuidv4();
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
        constructor({ name, payload, from, to }) {
            this.name = name;
            this.payload = payload;
            this.envelope = new Envelope({ from, to });
        }

        toJSON() {
            return {
                envelope: this.envelope.toJSON(),
                name: this.name,
                payload: this.payload
            };
        }
    }

    class WaitingListener extends Listener {
        constructor(config) {
            super(config);
            this.started = new Date();
            this.timeout = config.timeout || 5000;
        }
    }

    class BidirectionalWindowChannel {
        constructor({ on, host, to }) {
            // The given window upon which we will listen for messages.
            this.window = on;

            // The host for the window; required for postmessage
            this.host = host || document.location.origin;

            // The channel id. Used to filter all messages received to
            // this channel.
            this.channelId = uuidv4();

            this.partnerId = to;

            // And we also filter by the envelope.to field matching
            // this id, recipientID.
            // this.receiveFor = config.receiveFor;

            this.awaitingResponse = {};
            this.waitingListeners = {};
            this.listeners = {};

            this.lastId = 0;
            this.sentCount = 0;
            this.receivedCount = 0;

            this.unwelcomeReceivedCount = 0;
            this.unwelcomeReceivedCountThreshhold = 100;
            this.unwelcomeReceiptWarning = true;
        }

        setPartner(partnerChannelId) {
            this.partnerId = partnerChannelId;
        }

        setWindow(window) {
            this.window = window;
        }

        genId() {
            this.lastId += 1;
            return 'msg_' + String(this.lastId);
        }

        // addRoute(route) {
        //     this.routes.push(route);
        // }

        // haveRoute(route) {
        //     this.
        // }

        receiveMessage(messageEvent) {
            const message = messageEvent.data;
            if (!message) {
                this.unwelcomeReceivedCount++;
                if (this.unwelcomeReceiptWarning) {
                    console.warn('No message data; message ignored', messageEvent);
                }
                return;
            }
            if (!message.envelope) {
                this.unwelcomeReceivedCount++;
                if (this.unwelcomeReceiptWarning) {
                    console.warn('No message envelope, not from KBase; message ignored', messageEvent);
                }
                return;
            }
            if (!message.envelope.to === this.channelId) {
                this.unwelcomeReceivedCount++;
                if (this.unwelcomeReceiptWarning) {
                    console.warn('Message envelope does not match this channel\'s id', messageEvent);
                }
                return;
            }
            if (this.unwelcomeReceiptWarningCount > this.unwelcomeReceivedCountThreshhold) {
                this.unwelcomeReceiptWarning = false;
                console.warn(
                    'Unwelcome message warning disabled after ' + this.unwelcomeReceiptWarningCount + ' instances.'
                );
            }

            // A message sent as a request will have registered a response handler
            // in the awaitingResponse hash, using a generated id as the key.
            // TODO: to to rethink using the message id here. Perhaps somehting like a
            // chain of ids, the root of which is the origination id, which is the one
            // known here when it it is sent; the message "id" should be assigned whenver
            // a message is sent, but a response  message would include the original
            // message in the "chain"...

            // We can also have awaiting responses without an originating request.
            // These are useful for, e.g., a promise which awaits a message to be sent
            // within some window...
            if (message.envelope.id && this.awaitingResponse[message.envelope.id]) {
                try {
                    const response = this.awaitingResponse[message.envelope.id];
                    delete this.awaitingResponse[message.envelope.id];
                    response.handler(message.payload);
                } catch (ex) {
                    console.error('Error handling response for message ', message, ex);
                }
            }

            // and also awaiting by message name. Like a listener, but they are only used
            // once.
            if (this.waitingListeners[message.name]) {
                const awaiting = this.waitingListeners[message.name];
                delete this.waitingListeners[message.name];
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
            if (this.listeners[message.name]) {
                this.listeners[message.name].forEach((listener) => {
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

        listen(listener) {
            if (!this.listeners[listener.name]) {
                this.listeners[listener.name] = [];
            }
            // if (this.listeners[listener.name]) {
            //     throw new Error('Listener already established for "' + listener.name + '"');
            // }
            this.listeners[listener.name].push(listener);
        }

        on(message, success, error) {
            this.listen(
                new Listener({
                    name: message,
                    onSuccess: success,
                    onError: error
                })
            );
        }

        sendMessage(message) {
            this.window.postMessage(message.toJSON(), this.host);
        }

        send(name, payload) {
            const message = new Message({ name, payload, from: this.channelId, to: this.partnerId });
            this.sendMessage(message);
        }

        sendRequest(message, handler) {
            // message.to(this.clientId);
            // message.from(this.hostId);
            this.awaitingResponse[message.id] = {
                started: new Date(),
                handler: handler
            };
            this.sendMessage(message);
        }

        request(name, payload) {
            return new Promise((resolve, reject) => {
                try {
                    this.sendRequest(new Message({ name, payload, from: this.channelId }), (response) => {
                        resolve(response);
                    });
                } catch (ex) {
                    reject(ex);
                }
            });
        }

        startMonitor() {
            // start with a silly simple one.
            window.setTimeout(() => {
                const now = new Date().getTime();
                Object.keys(this.waitingListeners).forEach((key) => {
                    const listeners = this.waitingListeners[key];
                    const newListeners = listeners.filter((listener) => {
                        if (listener.timeout) {
                            const elapsed = now - listener.started.getTime();
                            if (elapsed > listener.timeout) {
                                try {
                                    if (listener.onError) {
                                        listener.onError(new Error('timout after ' + elapsed));
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
                        delete this.waitingListeners[key];
                    }
                });
                if (
                    Object.keys(this.waitingListeners).some((key) => {
                        return this.waitingListeners[key].some((listener) => {
                            return listener.timeout ? true : false;
                        });
                    })
                ) {
                    this.startMonitor();
                }
            }, 100);
        }

        listenOnce(listener) {
            if (!this.waitingListeners[listener.name]) {
                this.waitingListeners[listener.name] = [];
            }
            this.waitingListeners[listener.name].push(listener);
            if (listener.timeout) {
                this.startMonitor();
            }
        }

        once(name, success, error) {
            this.listenOnce(
                new WaitingListener({
                    name: name,
                    onSuccess: success,
                    onError: error
                })
            );
        }

        when(name, timeout) {
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

        attach(window) {
            this.window = window;
        }

        start() {
            this.currentListener = (message) => {
                this.receiveMessage(message);
            };
            this.window.addEventListener('message', this.currentListener, false);
        }

        stop() {
            if (this.currentListener) {
                this.window.removeEventListener('message', this.currentListener, false);
            }
        }
    }

    class SendOnlyWindowChannel {
        constructor({ on, host, to }) {
            // The given window upon which we will listen for messages.
            this.window = on;

            // The host for the window; required for postmessage
            this.host = host || document.location.origin;
            this.channelId = uuidv4();
            this.partnerId = to;
            this.lastId = 0;
            this.sentCount = 0;
        }

        setPartner(partnerChannelId) {
            this.partnerId = partnerChannelId;
        }

        setWindow(window) {
            this.window = window;
        }

        genId() {
            this.lastId += 1;
            return 'msg_' + String(this.lastId);
        }

        sendMessage(message) {
            this.window.postMessage(message.toJSON(), this.host);
        }

        send(name, payload) {
            const message = new Message({ name, payload, from: this.channelId, to: this.partnerId });
            this.sendMessage(message);
        }

        stats() {
            return {
                sent: this.sentCount
            };
        }

        attach(window) {
            this.window = window;
        }

        start() {}

        stop() {}
    }

    class ReceiveOnlyWindowChannel {
        constructor({ on, host, to }) {
            // The given window upon which we will listen for messages.
            this.window = on;

            // The host for the window; required for postmessage
            this.host = host || document.location.origin;

            // The channel id. Used to filter all messages received to
            // this channel.
            this.channelId = uuidv4();

            this.partnerId = to;

            // And we also filter by the envelope.to field matching
            // this id, recipientID.
            // this.receiveFor = config.receiveFor;

            this.awaitingResponse = {};
            this.waitingListeners = {};
            this.listeners = {};

            this.lastId = 0;
            this.sentCount = 0;
            this.receivedCount = 0;

            this.unwelcomeReceivedCount = 0;
            this.unwelcomeReceivedCountThreshhold = 100;
            this.unwelcomeReceiptWarning = true;
        }

        setPartner(partnerChannelId) {
            this.partnerId = partnerChannelId;
        }

        setWindow(window) {
            this.window = window;
        }

        genId() {
            this.lastId += 1;
            return 'msg_' + String(this.lastId);
        }

        receiveMessage(messageEvent) {
            const message = messageEvent.data;
            if (!message) {
                this.unwelcomeReceivedCount++;
                if (this.unwelcomeReceiptWarning) {
                    console.warn('No message data; message ignored', messageEvent);
                }
                return;
            }
            if (!message.envelope) {
                this.unwelcomeReceivedCount++;
                if (this.unwelcomeReceiptWarning) {
                    console.warn('No message envelope, not from KBase; message ignored', messageEvent);
                }
                return;
            }
            if (!message.envelope.to === this.channelId) {
                this.unwelcomeReceivedCount++;
                if (this.unwelcomeReceiptWarning) {
                    console.warn('Message envelope does not match this channel\'s id', messageEvent);
                }
                return;
            }
            if (this.unwelcomeReceiptWarningCount > this.unwelcomeReceivedCountThreshhold) {
                this.unwelcomeReceiptWarning = false;
                console.warn(
                    'Unwelcome message warning disabled after ' + this.unwelcomeReceiptWarningCount + ' instances.'
                );
            }

            // A message sent as a request will have registered a response handler
            // in the awaitingResponse hash, using a generated id as the key.
            // TODO: to to rethink using the message id here. Perhaps somehting like a
            // chain of ids, the root of which is the origination id, which is the one
            // known here when it it is sent; the message "id" should be assigned whenver
            // a message is sent, but a response  message would include the original
            // message in the "chain"...

            // We can also have awaiting responses without an originating request.
            // These are useful for, e.g., a promise which awaits a message to be sent
            // within some window...
            if (message.envelope.id && this.awaitingResponse[message.envelope.id]) {
                try {
                    const response = this.awaitingResponse[message.envelope.id];
                    delete this.awaitingResponse[message.envelope.id];
                    response.handler(message.payload);
                } catch (ex) {
                    console.error('Error handling response for message ', message, ex);
                }
            }

            // and also awaiting by message name. Like a listener, but they are only used
            // once.
            if (this.waitingListeners[message.name]) {
                const awaiting = this.waitingListeners[message.name];
                delete this.waitingListeners[message.name];
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
            if (this.listeners[message.name]) {
                this.listeners[message.name].forEach((listener) => {
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

        listen(listener) {
            if (!this.listeners[listener.name]) {
                this.listeners[listener.name] = [];
            }
            // if (this.listeners[listener.name]) {
            //     throw new Error('Listener already established for "' + listener.name + '"');
            // }
            this.listeners[listener.name].push(listener);
        }

        on(message, success, error) {
            this.listen(
                new Listener({
                    name: message,
                    onSuccess: success,
                    onError: error
                })
            );
        }

        startMonitor() {
            window.setTimeout(() => {
                const now = new Date().getTime();
                Object.keys(this.waitingListeners).forEach((key) => {
                    const listeners = this.waitingListeners[key];
                    const newListeners = listeners.filter((listener) => {
                        if (listener.timeout) {
                            const elapsed = now - listener.started.getTime();
                            if (elapsed > listener.timeout) {
                                try {
                                    if (listener.onError) {
                                        listener.onError(new Error('timout after ' + elapsed));
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
                        delete this.waitingListeners[key];
                    }
                });
                if (
                    Object.keys(this.waitingListeners).some((key) => {
                        return this.waitingListeners[key].some((listener) => {
                            return listener.timeout ? true : false;
                        });
                    })
                ) {
                    this.startMonitor();
                }
            }, 100);
        }

        listenOnce(listener) {
            if (!this.waitingListeners[listener.name]) {
                this.waitingListeners[listener.name] = [];
            }
            this.waitingListeners[listener.name].push(listener);
            if (listener.timeout) {
                this.startMonitor();
            }
        }

        once(name, success, error) {
            this.listenOnce(
                new WaitingListener({
                    name: name,
                    onSuccess: success,
                    onError: error
                })
            );
        }

        when(name, timeout) {
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

        attach(window) {
            this.window = window;
        }

        start() {
            this.currentListener = (message) => {
                this.receiveMessage(message);
            };
            this.window.addEventListener('message', this.currentListener, false);
        }

        stop() {
            if (this.currentListener) {
                this.window.removeEventListener('message', this.currentListener, false);
            }
        }
    }

    return { BidirectionalWindowChannel, SendOnlyWindowChannel, ReceiveOnlyWindowChannel, Message };
});
