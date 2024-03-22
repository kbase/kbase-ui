import { faBan } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FeedNotificationLevel } from 'lib/clients/Feeds';
import { Component, PropsWithChildren, ReactNode } from "react";
import styles from './Notification.module.css';
import { NotificationAlert } from './NotificationAlert';

// Unfortunately too loosely typed?
// export type Variant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' |
// 'info' | 'dark' | 'light' | string;

export type StrictVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'dark' | 'light';



export interface NotificationLevelAlertProps extends PropsWithChildren {
    level: FeedNotificationLevel;
    unselected?: boolean;
    message?: string;
    renderControls?: () => ReactNode;
    renderBody?: () => ReactNode;

}

export class NotificationLevelAlert extends Component<NotificationLevelAlertProps> {

    levelToVariant(): StrictVariant {
        switch (this.props.level) {
            case 'error': return 'danger';
            case 'success': return 'success';
            case 'request': return 'success';
            case 'warning': return 'warning';
            case 'alert': return 'info';
        }
    }

    // renderLevelBackgroundVariant(): string {
    //     if (this.props.unselected) {
    //         return ''
    //     }
    //     switch (this.props.level) {
    //         case 'error': return 'bg-danger-subtle';
    //         case 'success': return 'bg-success-subtle';
    //         case 'request': return 'bg-success-subtle';
    //         case 'warning': return 'bg-warning-subtle';
    //         case 'alert': return 'bg-info-subtle';
    //     }
    // }

    // renderLevelBorderVariant(): string {
    //     switch (this.props.level) {
    //         case 'error': return 'border border-danger';
    //         case 'success': return 'border border-success';
    //         case 'request': return 'border border-success';
    //         case 'warning': return 'border border-warning';
    //         case 'alert': return 'border border-info';
    //     }
    // }

    // renderLevelTextVariant(): string {
    //     switch (this.props.level) {
    //         case 'error': return 'text-danger';
    //         case 'success': return 'text-success';
    //         case 'request': return 'text-success';
    //         case 'warning': return 'text-warning';
    //         case 'alert': return 'text-info';
    //     }
    // }

    // renderLevelIcon(): ReactNode {
    //     switch (this.props.level) {
    //         case 'error': return <span className="bi bi-ban" />
    //         case 'success': return <FontAwesomeIcon icon={faCheck} />
    //         case 'request': return <FontAwesomeIcon icon={faCircleQuestion} />;
    //         case 'warning': return <ExclamationTriangle />;
    //         case 'alert': return <FontAwesomeIcon icon={faInfoCircle} />;
    //     }
    // }

    renderControlsColumn() {
        if (!this.props.renderControls) {
            return;
        }
        return <div className={styles.NotificationControls}>
            {this.props.renderControls()}
        </div>;
    }

    render() {
        return <NotificationAlert variant={this.levelToVariant()}>
            {this.props.children}
        </NotificationAlert>


        // const classNames: Array<string> = [
        //     styles.Notification,
        //     `${this.renderLevelBackgroundVariant()}`,
        //     `${this.renderLevelBorderVariant()}`,
        //     `${this.renderLevelTextVariant()}`
        // ]
        // return <div className={classNames.join(' ')}>
        //     <div className={styles.NotificationIcon}>
        //         {this.renderLevelIcon()}
        //     </div>
        //     {this.renderControlsColumn()}
        //     <div className={styles.NotificationMessage}>
        //         {this.props.renderBody ? this.props.renderBody() : (this.props.message ? this.props.message : this.props.children)}
        //     </div>
        // </div>
    }
}

export interface NoNotificationProps extends PropsWithChildren {
}

export default class NoNotification extends Component<NoNotificationProps> {
    render() {
        return <NotificationAlert variant="secondary" unselected={true} icon={<FontAwesomeIcon icon={faBan}/>}>
            {this.props.children}
        </NotificationAlert>
        // return <NotificationLevelAlert level='alert' unselected={true}>
        //     {this.props.children}
        // </NotificationLevelAlert>
    }
}