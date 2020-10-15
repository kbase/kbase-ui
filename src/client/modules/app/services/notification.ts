import { Runtime } from "../../lib/types";

/*
Notification service

This service is a helper for the notification components reactComponents/Notifications.

Since services are started up prior to any components, this services performs the important function
of queueing up notifications before the notification component is ready to receive them.

When the notification component is ready to process and display notifications, it will send a 'ready'
message. This will switch set the comm channel for the notifications component, and then this service
will send any pending notifications.
*/
interface NotificationServiceParams {
    params: {
        runtime: Runtime;
    };
}

export class NotificationService {
    runtime: Runtime;
    queued: Array<any>;
    recipientChannel: any;
    constructor({ params: { runtime } }: NotificationServiceParams) {
        this.runtime = runtime;
        this.queued = [];
        this.recipientChannel = null;
    }

    start() {
        // Listen for notifications to come in.
        this.runtime.receive('notification', 'ready', (message) => {
            this.recipientChannel = message.channel;
            const toSend = this.queued;
            this.queued = [];
            toSend.forEach((message) => {
                this.runtime.send(this.recipientChannel, 'new', message);
            });
        });
        this.runtime.receive('notification', 'notify', (message) => {
            if (!this.recipientChannel) {
                this.queued.push(message);
            } else {
                this.runtime.send(this.recipientChannel, 'new', message);
            }
        });
        return Promise.resolve();
    }

    stop() {
        return Promise.resolve();
    }
}

export const ServiceClass = NotificationService;
