import React, { Component, PropsWithChildren } from 'react';
import { Alert } from 'react-bootstrap';

// For some reason, react-bootstrap also adds "string" to the union, which pretty much
// makes Variant useless as a restriction... There is an open ticket, but it has been ope
// for a couple of years! There may be some reason to have Variant be looser, but c'mon.
export type Variant =
    'primary' | 'secondary' | 'success' | 'danger' |
    'warning' | 'info' | 'dark' | 'light';

export type AlertMessageProps = PropsWithChildren<{
    showTitle?: boolean;
    title?: string;
    showIcon?: boolean;
    icon?: string;
    variant: Variant
    message?: string;
    style?: React.CSSProperties;
    className?: string;
    render?: () => JSX.Element;
}>;

export default class AlertMessage extends Component<AlertMessageProps> {
    iconClass(): string | null {
        console.log('icon?', this.props.variant);
        if (typeof this.props.showIcon !== 'undefined' && this.props.showIcon !== false) {
            switch (this.props.variant) {
                case 'primary':
                    return null;
                case 'secondary':
                    return null
                case 'success':
                    return 'check';
                case 'danger':
                    return 'exclamation-circle';
                case 'warning':
                    return 'exclamation-triangle';
                case 'info':
                    return 'info-circle';
                case 'dark':
                    return null;
                case 'light':
                    return null;
            }
        }

        return this.props.icon || null;

    }
    defaultTitle() {
        if (!this.props.showTitle) {
            return;
        }
        switch (this.props.variant) {
            case 'danger':
                return 'Error!';
            case 'warning':
                return 'Warning!';
            case 'info':
                return 'Info';
            case 'success':
                return 'Success';
            default:
                return;
        }
    }
    renderIcon() {
        const iconClass = this.iconClass();
        if (iconClass === null) {
            return;
        }
        return <span className={`fa fa-${iconClass}`} style={{ marginRight: '0.25em' }} />
    }
    renderTitle() {
        const title = this.props.title || this.defaultTitle();
        if (!title) {
            return;
        }
        return <Alert.Heading>
            {this.renderIcon()}
            {title}
        </Alert.Heading>
    }
    render() {
        console.log('show icon?', this.props.showIcon);
        const content = (() => {
            if (this.props.render) {
                return this.props.render();
            }
            return this.props.message || this.props.children;
        })();
        return <Alert variant={this.props.variant} style={this.props.style}>
            {this.renderTitle()}
            {content}
        </Alert>
    }
}
