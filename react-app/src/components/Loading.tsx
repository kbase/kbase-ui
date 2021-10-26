import { Component } from 'react';
import styles from './Loading.styles';

export interface LoadingProps {
    size: 'small' | 'normal' | 'large';
    type: 'inline' | 'block';
    message: string;
}

interface LoadingState {}

export default class Loading extends Component<LoadingProps, LoadingState> {
    render() {
        const spinner = (() => {
            switch (this.props.size) {
                case 'small':
                    return (
                        <span className="fa fa-sm fa-spinner fa-pulse"></span>
                    );
                case 'normal':
                    return <span className="fa fa-spinner fa-pulse"></span>;
                default:
                    return (
                        <span className="fa fa-2x fa-spinner fa-pulse"></span>
                    );
            }
        })();
        if (this.props.type === 'inline') {
            return (
                <div style={styles.LoadingInline}>
                    {spinner}{' '}
                    <span style={styles.LoadingMessage}>
                        {this.props.message}
                    </span>
                </div>
            );
        } else {
            return (
                <div style={styles.LoadingContainer}>
                    <div style={styles.Loading}>
                        {spinner}{' '}
                        <span style={styles.LoadingMessage}>
                            {this.props.message}
                        </span>
                    </div>
                </div>
            );
        }
    }
}
