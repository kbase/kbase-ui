import { Component } from 'react';
import { Notification, NotificationState } from '../../contexts/RuntimeContext';
import Notifications from './Notifications';

export interface NotificationsMainProps {
    notificationState: NotificationState,
    addNotification: (n: Notification) => void;
    removeNotification: (n: Notification) => void;
}

interface NotificationsMainState {
    show: boolean;
}

export default class NotificationsMain extends Component<NotificationsMainProps, NotificationsMainState> {
    constructor(props: NotificationsMainProps) {
        super(props);

        this.state = {
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
    clearNotification(notification: Notification) {
        this.props.removeNotification(notification);
    }

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
