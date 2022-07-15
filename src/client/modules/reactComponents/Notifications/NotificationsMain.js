define([
    'preact',
    'htm',
    'uuid',
    './Notifications'
], (
    preact,
    htm,
    {v4: uuidv4},
    Notifications
) => {

    const {h, Component} = preact;
    const html = htm.bind(h);

    const AUTODISMISSER_INTERVAL = 1000;


    class Notification {
        constructor({notification, parent}) {
            const newNotification = notification;
            this.id = newNotification.id || uuidv4();
            this.message = newNotification.message;
            this.description = newNotification.description;
            this.autodismiss = newNotification.autodismiss;
            this.icon = newNotification.icon;
            this.autodismissStartedAt = newNotification.autodismiss ? new Date().getTime() : null;
            this.type = newNotification.type;
            this.parent = parent;

            // this.type.subscribeChanged((newVal, oldVal) => {
            //     this.parent.summary[oldVal].count(this.parent.summary[oldVal].count() - 1);
            //     this.parent.summary[newVal].count(this.parent.summary[newVal].count() + 1);
            // });

            // this.autodismiss.subscribe((newVal) => {
            //     if (newVal) {
            //         // TODO: this
            //         this.autodismissStartedAt = new Date().getTime();
            //         this.parent.startAutoDismisser();
            //     }
            // });
        }
    }

    class AutoDismisser {
        constructor({runner}) {
            this.runner = runner;
        }

        run() {
            if (this.runner()) {
                this.loop();
            }
        }

        loop() {
            this.autoDismisser = window.setTimeout(() => {
                this.run();
            }, AUTODISMISSER_INTERVAL);
        }

        startLoop(force) {
            if (this.autoDismisser && !force) {
                return;
            }
            this.run();
        }
    }

    class NotificationsMain extends Component {
        constructor(props) {
            super(props);

            this.runtime = this.props.runtime;
            this.sendingChannel = uuidv4();
            this.autoDismisser = new AutoDismisser({
                runner: this.autodismissRunner.bind(this)
            });

            this.state = {
                notifications: [],
                summary: {
                    info: 0,
                    success: 0,
                    warning: 0,
                    error: 0
                },
                show: false
            };
        }

        closeNotifications() {
            this.setState({
                show: false
            });
        }

        showNotifications() {
            this.setState({
                show: true
            });
        }

        toggleNotifications() {
            this.setState({
                show: !this.state.show
            });
        }

        autodismissRunner() {
            const toRemove = [];
            const now = new Date().getTime();
            let autodismissLeft = 0;
            this.state.notifications.forEach((item) => {
                if (item.autodismiss) {
                    const elapsed = now - item.autodismissStartedAt;
                    if (item.autodismiss < elapsed) {
                        toRemove.push(item);
                    } else {
                        autodismissLeft += 1;
                    }
                }
            });

            toRemove.forEach((item) => {
                this.removeNotification(item);
            });

            // Return true to keep on truckin'
            return (autodismissLeft > 0);
        }

        componentDidMount() {
            this.runtime.send('notification', 'ready', {
                channel: this.sendingChannel
            });

            this.runtime.receive(this.sendingChannel, 'new', (message) => {
                this.processMessage(message);
            });

        }

        // TODO: without observables, we need to force the
        // component to update when the notification is modified.
        updateNotification(newMessage) {
            const {summary, notifications} = this.state;

            const notification = notifications.filter((notification) => {
                return (notification.id === newMessage.id);
            })[0];

            if (!notification) {
                // console.error('Cannot update message, not found: ' + newMessage.id, newMessage);
                // return;
                return false;
            }

            if (notification.type !== newMessage.type) {
                summary[notification.type] -= 1;
                summary[newMessage.type] += 1;
            }

            notification.type = newMessage.type;
            notification.message = newMessage.message;
            notification.autodismiss = newMessage.autodismiss;
            if (newMessage.autodismiss) {
                notification.autodismissStartedAt = new Date().getTime();
            }

            this.setState({
                notifications, summary
            }, () => {
                this.autoDismisser.run();
            });

            return true;
        }

        addNotification(newMessage) {
            const notification = new Notification({notification: newMessage, parent: this});
            const {summary, notifications} = this.state;
            // const summaryItem = summary[notification.type];
            // if (summaryItem) {
            //     summaryItem.count += 1;
            // }

            summary[notification.type] += 1;

            notifications.unshift(notification);
            // this.notificationMap[notification.id] = notification;
            this.setState({
                notifications, summary
            }, () => {
                this.autoDismisser.run();
            });
        }

        removeNotification(notificationToRemove) {
            const {summary, notifications: currentNotifications} = this.state;
            const notifications = currentNotifications.filter((notification) => {
                return (notification.id !== notificationToRemove.id);
            });
            // const summaryItem = summary[notificationToRemove.type];
            // if (summaryItem) {
            //     summaryItem.count -= 1;
            // }

            summary[notificationToRemove.type] -= 1;

            this.setState({
                notifications, summary
            });
        }

        clearNotification(notification) {
            this.removeNotification(notification);
        }

        processMessage(message) {
            if (!message.type) {
                console.error('Message not processed - no type', message);
                return;
            }
            if (['success', 'info', 'warning', 'error'].indexOf(message.type) === -1) {
                console.error('Message not processed - invalid type', message);
                return;
            }

            if (!this.updateNotification(message)) {
                this.addNotification(message);
            }
            this.setState({
                show: true
            });
        }

        render() {
            const props = {
                notifications: this.state.notifications,
                summary: this.state.summary,
                show: this.state.show,
                closeNotifications: this.closeNotifications.bind(this),
                toggleNotifications: this.toggleNotifications.bind(this),
                clearNotification: this.clearNotification.bind(this)
            };
            return html`
                <div className="NotificationsMain"
                     data-k-b-testhook-component="notificationsmain">
                    <${Notifications} ...${props}/>
                </div>
            `;
        }
    }

    return NotificationsMain;
});