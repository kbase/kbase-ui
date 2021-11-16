import { Component } from 'react';
import styles from './Loading.styles';

export type Size = 'small' | 'normal' | 'large';
export type Type = 'inline' | 'block';

export interface LoadingProps {
    size?: Size;
    type?: Type;
    message: string;
}

interface LoadingState {}

export default class Loading extends Component<LoadingProps, LoadingState> {
    render() {
        const spinner = (() => {
            switch (this.props.size || 'normal') {
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
