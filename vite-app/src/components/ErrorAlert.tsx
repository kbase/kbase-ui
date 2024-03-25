import { Component, PropsWithChildren } from 'react';
import { Alert, AlertHeading } from 'react-bootstrap';
import styles from './ErrorAlert.module.css';

export type ErrorAlertProps = PropsWithChildren<{
    title?: string;
    message?: string;
    render?: () => JSX.Element;
}>;

export default class ErrorAlert extends Component<ErrorAlertProps> {
    renderTitle() {
        const title = this.props.title || 'Error!';
        return (
            <AlertHeading>
                <span className="fa fa-exclamation-triangle" />
                {title}
            </AlertHeading>
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
            <Alert variant="danger" className={styles.main}>
                {this.renderTitle()}
                {content}
            </Alert>
        );
    }
}
