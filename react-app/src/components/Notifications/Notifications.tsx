import { Component } from 'react';
import { NotificationsSummary, NotificationType, Notification } from '../../contexts/RuntimeContext';
import './Notifications.css';

export interface NotificationsProps {
    closeNotifications: () => void;
    clearNotification: (notification: Notification) => void;
    toggleNotifications: () => void;
    notifications: Array<Notification>;
    summary: NotificationsSummary
    show: boolean;
}

interface NotificationsState {

}


export default class Notifications extends Component<NotificationsProps, NotificationsState> {
    renderSummaryItem(name: NotificationType) {
        const summary = this.props.summary[name];
        const activeClass = summary ? ' -has-items' : '';
        return <div className={`-item -${name}${activeClass}`}>
            <div className="-count">
                {summary}
            </div>
            <div className="-label">
                {name}
            </div>
        </div>
    }

    renderSummary() {
        return <div className="-summary"
            onClick={this.doToggleNotifications.bind(this)}>
            {this.renderSummaryItem('success')}
            {this.renderSummaryItem('info')}
            {this.renderSummaryItem('warning')}
            {this.renderSummaryItem('error')}
        </div>
    }

    doCloseNotifications() {
        this.props.closeNotifications();
    }

    doClearNotification(notification: Notification) {
        this.props.clearNotification(notification);
    }

    doToggleNotifications() {
        this.props.toggleNotifications();
    }

    renderNotifications() {
        return this.props.notifications.map((notification, index) => {
            const typeClass = (() => {
                switch (notification.type) {
                    case 'success': return '-success';
                    case 'info': return '-info';
                    case 'warning': return '-warning';
                    case 'error': return '-error';
                }
            })();   
            return <div className={'-notification ' + typeClass} key={index} >
                <div className="-button -close-button"
                    title="Clear this notification"
                    onClick={() => {this.doClearNotification(notification);}}>
                    <span className="fa fa-trash"></span>
                </div>
                <div className="-message"
                    title={notification.description}>
                    {notification.message}
                </div>
            </div>
        });
    }

    renderNotificationDisplay() {
        if (!this.props.show) {
            return;
        }
        return <div className={'-container'}>
                    <div className={'-notification-set' + (this.props.show ? '' : ' hidden')}>
                        <div className="-pointer">
                            <svg  viewBox='0 0 25 25'
                                    xmlns='http://www.w3.org/2000/svg'
                                    width='25px'
                                    height='25px'>
                                <polygon points='0 0, 0 20, 20 10'
                                        fill='gray'>
                                </polygon>
                            </svg>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'row' }}>
                            <a className="-button"
                               onClick={this.doCloseNotifications.bind(this)}
                               style={{
                padding: '2px 4px',
                display: 'inline-block',
                marginTop: '2px',
                marginBottom: '3px'
                        }}><span className="fa fa-times" /></a>
                    <div style={{ flex: '1 1 0', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                Notifications 
                            </div>
                        </div>
                        <div className="notifications-container">
                            {this.renderNotifications()}
                        </div>
                    </div>
                </div>
    }

    render() {
        if (this.props.notifications.length === 0) {
            return;
        }
        return <div className="Notifications"
                    data-k-b-testhook-component="notifications">
            {this.renderSummary()}
            {this.renderNotificationDisplay()}
        </div>
    }
}