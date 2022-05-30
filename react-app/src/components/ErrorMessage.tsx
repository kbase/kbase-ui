import React from 'react';
import './ErrorMessage.css';

export interface ErrorMessageProps {
    title?: string;
    style?: React.CSSProperties;
    message: string;
}

interface ErrorMessageState {}

export default class ErrorMessage extends React.Component<
    ErrorMessageProps,
    ErrorMessageState
> {
    render() {
        return (
            <div className="alert alert-danger ErrorMessage" style={this.props.style} >
                <div className="-title">
                    <span className="fa fa-exclamation-triangle"></span>
                    <span className="-text">
                        {this.props.title || 'Error!'}
                    </span>
                </div>
                <div className="-message">{this.props.message}</div>
            </div>
        );
    }
}
