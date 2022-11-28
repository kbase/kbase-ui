import React, { Component, PropsWithChildren } from 'react';
import styles from './AlertMessage.module.css';

export type AlertMessageProps = PropsWithChildren<{
    title?: string;
    icon?: string;
    variant: 'error' | 'danger' | 'info' | 'warning' | 'success' | 'secondary';
    message?: string;
    style?: React.CSSProperties;
    className?: string;
    render?: () => JSX.Element;
}>;

export default class AlertMessage extends Component<AlertMessageProps> {
    iconClass() {
        switch (this.props.variant) {
            case 'danger':
            case 'error':
                return 'exclamation-triangle';
            case 'warning':
                return 'exclamation-triangle';
            case 'info':
                return 'info-circle';
            case 'success':
                return 'check';
            case 'secondary':
                return null
        }
    }
    renderAlertTypeClass() {
        switch (this.props.variant) {
            case 'danger':
            case 'error':
                return 'danger';
            case 'warning':
                return 'warning';
            case 'info':
                return 'info';
            case 'success':
                return 'success';
            case 'secondary':
                return 'secondary';
        }
    }
    defaultTitle() {
        switch (this.props.variant) {
            case 'danger':
            case 'error':
                return 'Error!';
            case 'warning':
                return 'Warning!';
            case 'info':
                return 'Info';
            case 'success':
                return 'Success';
            case 'secondary':
                return '';
        }
    }
    renderTitle() {
        const title = this.props.title || this.defaultTitle();
        const className = (() => {
            const iconClass = this.props.icon || this.iconClass();
            if (iconClass) {
                return `fa fa-${iconClass}`
            }
        })();
        return (
            <div className="alert-title">
                <span className={className} />
                {title}
            </div>
        );
    }
    render() {
        const content = (() => {
            if (this.props.render) {
                return this.props.render();
            }
            return this.props.message || this.props.children;
        })();
        return (
            <div
                className={`alert alert-${this.renderAlertTypeClass()} ${styles.AlertMessage} ${this.props.className}`}
                style={this.props.style}
            >
                {this.renderTitle()}
                {content}
            </div>
        );
    }
}
