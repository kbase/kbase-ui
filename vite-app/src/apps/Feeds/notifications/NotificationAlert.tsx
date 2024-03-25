import { faBan, faCheck, faCircleQuestion, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Component, PropsWithChildren, ReactNode } from "react";
import styles from './Notification.module.css';

// Unfortunately too loosely typed?
// export type Variant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' |
// 'info' | 'dark' | 'light' | string;

export type StrictVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'dark' | 'light';



export interface NotificationAlertProps extends PropsWithChildren {
    variant: StrictVariant;
    unselected?: boolean;
    message?: string;
    icon?: ReactNode;
    renderControls?: () => ReactNode;
    renderBody?: () => ReactNode;

}

export class NotificationAlert extends Component<NotificationAlertProps> {
    renderLevelBackgroundVariant(): string {
        if (this.props.unselected) {
            return ''
        }
        return `bg-${this.props.variant}-subtle`;
    }

    renderLevelBorderVariant(): string {
        return `border border-${this.props.variant}`;
    }

    renderLevelTextVariant(): string {
        return `text-${this.props.variant}`;
    }

    renderVariantIcon(): ReactNode {
        if (this.props.icon) {
            return this.props.icon;
        }
        switch (this.props.variant) {
            case 'danger': return <FontAwesomeIcon icon={faBan} />
            case 'success': return <FontAwesomeIcon icon={faCheck} />
            case 'info': return <FontAwesomeIcon icon={faCircleQuestion} />;
            case 'warning': return <FontAwesomeIcon icon={faExclamationTriangle} />;

        }
    }

    renderControlsColumn() {
        if (!this.props.renderControls) {
            return;
        }
        return <div className={styles.NotificationControls}>
            {this.props.renderControls()}
        </div>;
    }

    render() {
        const classNames: Array<string> = [
            styles.Notification,
            `${this.renderLevelBackgroundVariant()}`,
            `${this.renderLevelBorderVariant()}`,
            `${this.renderLevelTextVariant()}`
        ]
        return <div className={classNames.join(' ')}>
            <div className={styles.NotificationIcon}>
                {this.renderVariantIcon()}
            </div>
            {this.renderControlsColumn()}
            <div className={styles.NotificationMessage}>
                {this.props.renderBody ? this.props.renderBody() : (this.props.message ? this.props.message : this.props.children)}
            </div>
        </div>
    }
}