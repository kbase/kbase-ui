import { Component } from 'react';
import { Notification, NotificationState } from '../../contexts/RuntimeContext';
import Notifications from './Notifications';

// const AUTODISMISSER_INTERVAL = 1000;

// class AutoDismisser {
//     timeout: number | null;
//     runner: () => boolean;
//     constructor({ runner }: { runner: () => boolean}) {
//         this.runner = runner;
//         this.timeout = null;
//     }

//     run() {
//         if (this.runner()) {
//             this.loop();
//         }
//     }

//     loop() {
//         this.timeout = window.setTimeout(() => {
//             this.run();
//         }, AUTODISMISSER_INTERVAL);
//     }

//     startLoop(force: boolean) {
//         if (this.timeout && !force) {
//             return;
//         }
//         this.run();
//     }
// }


export interface NotificationsMainProps {
    notificationState: NotificationState,
    addNotification: (n: Notification) => void;
    removeNotification: (n: Notification) => void;
}


interface NotificationsMainState {
    show: boolean;
    // notifications: Array<Notification>;
    // summary: NotificationsSummary
}


export default class NotificationsMain extends Component<NotificationsMainProps, NotificationsMainState> {
    // autoDismisser: AutoDismisser;

    constructor(props: NotificationsMainProps) {
        super(props);

        // this.runtime = this.props.runtime;
        // this.sendingChannel = uuidv4();
        // this.autoDismisser = new AutoDismisser({
        //     runner: this.autodismissRunner.bind(this),
        // });

        this.state = {
            // notifications: demoNotifications,
            // summary: {
            //     info: 1,
            //     success: 2,
            //     warning: 3,
            //     error: 4,
            // },
            show: true,
        };
    }

    closeNotifications() {
        this.setState({
            show: false
        });
    }

    showNotifications() {
        this.setState({
            show: true,
        });
    }

    toggleNotifications() {
        this.setState({
            show: !this.state.show,
        });
    }

    // autodismissRunner() {
    //     const toRemove: Array<Notification> = [];
    //     const now = new Date().getTime();
    //     let autodismissLeft = 0;
    //     this.props.notificationState.notifications.forEach((item) => {
    //         if (item.kind === NotificationKind.AUTODISMISS) {
    //             const elapsed = now - item.startedAt;
    //             if (item.dismissAfter < elapsed) {
    //                 toRemove.push(item);
    //             } else {
    //                 autodismissLeft += 1;
    //             }
    //         }
    //     });

    //     toRemove.forEach((item) => {
    //         this.props.removeNotification(item);
    //     });

    //     // Return true to keep on truckin'
    //     return autodismissLeft > 0;
    // }

    componentDidMount() {
        // TODO: refactor to use the runtime context...
        // this.runtime.send('notification', 'ready', {
        //     channel: this.sendingChannel,
        // });

        // this.runtime.receive(this.sendingChannel, 'new', (message) => {
        //     this.processMessage(message);
        // });
    }

    // TODO: without observables, we need to force the
    // component to update when the notification is modified.
    // TODO: disabled for now ... re-enable when needed
    // updateNotification(newMessage) {
    //     const { summary, notifications } = this.state;

    //     const notification = notifications.filter((notification) => {
    //         return notification.id === newMessage.id;
    //     })[0];

    //     if (!notification) {
    //         // console.error('Cannot update message, not found: ' + newMessage.id, newMessage);
    //         // return;
    //         return false;
    //     }

    //     if (notification.type !== newMessage.type) {
    //         summary[notification.type] -= 1;
    //         summary[newMessage.type] += 1;
    //     }

    //     notification.type = newMessage.type;
    //     notification.message = newMessage.message;
    //     notification.autodismiss = newMessage.autodismiss;
    //     if (newMessage.autodismiss) {
    //         notification.autodismissStartedAt = new Date().getTime();
    //     }

    //     this.setState(
    //         {
    //             notifications,
    //             summary,
    //         },
    //         () => {
    //             this.autoDismisser.run();
    //         }
    //     );

    //     return true;
    // }

    // addNotification(notification: Notification) {
    //     // const notification = new Notification({
    //     //     notification: newMessage,
    //     // });
    //     const { summary, notifications } = this.props.notificationState;
    //     // const summaryItem = summary[notification.type];
    //     // if (summaryItem) {
    //     //     summaryItem.count += 1;
    //     // }

    //     summary[notification.type] += 1;

    //     notifications.unshift(notification);
    //     // this.notificationMap[notification.id] = notification;
    //     this.setState({
    //         notifications,
    //         summary,
    //     });
    // }

    // removeNotification(notification: Notification) {
    //     const { summary, notifications: currentNotifications } = this.state;
    //     const notifications = currentNotifications.filter(({id}) => {
    //         return id !== notification.id;
    //     });
    //     // const summaryItem = summary[notificationToRemove.type];
    //     // if (summaryItem) {
    //     //     summaryItem.count -= 1;
    //     // }

    //     summary[notification.type] -= 1;

    //     console.log('summary?', summary);

    //     this.setState({
    //         notifications,
    //         summary,
    //     });
    // }

    clearNotification(notification: Notification) {
        this.props.removeNotification(notification);
    }

    // processMessage(message) {
    //     if (!message.type) {
    //         console.error('Message not processed - no type', message);
    //         return;
    //     }
    //     if (
    //         ['success', 'info', 'warning', 'error'].indexOf(message.type) === -1
    //     ) {
    //         console.error('Message not processed - invalid type', message);
    //         return;
    //     }

    //     if (!this.updateNotification(message)) {
    //         this.addNotification(message);
    //     }
    //     this.setState({
    //         show: true,
    //     });
    // }

    render() {
        const props = {
            notifications: this.props.notificationState.notifications,
            summary: this.props.notificationState.summary,
            show: this.state.show,
            closeNotifications: this.closeNotifications.bind(this),
            toggleNotifications: this.toggleNotifications.bind(this),
            clearNotification: this.clearNotification.bind(this),
        };
        return <div
            className="NotificationsMain"
            data-k-b-testhook-component="notificationsmain"
        >
            <Notifications {...props} />
        </div>;
    }
}
