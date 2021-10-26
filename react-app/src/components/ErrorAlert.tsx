import { Component } from 'react';
import './ErrorAlert.css';

export interface ErrorAlertProps {
    title?: string;
    message: string;
    render?: () => JSX.Element;
}

export default class ErrorAlert extends Component<ErrorAlertProps> {
    renderTitle() {
        const title = this.props.title || 'Error!';
        return (
            <div className="alert-title">
                <span className="fa fa-exclamation-triangle" />
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
            <div className="alert alert-danger ErrorAlert">
                {this.renderTitle()}
                {content}
            </div>
        );
    }
}
