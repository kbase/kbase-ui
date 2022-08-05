import React from 'react';
import styles from './Empty.module.css';

export interface EmptyProps {
    icon?: string;
    message: string;
}

export default class Empty extends React.Component<EmptyProps> {
    render() {
        return (
            <div className={styles.Empty}>
                <div className={styles.icon}>
                    <span className="fa-stack fa-lg">
                        <i
                            className={`fa fa-stack-1x fa-${this.props.icon || 'database'
                                }`}
                        ></i>
                        <i
                            className="fa fa-ban fa-stack-2x text-danger"
                            style={{ opacity: 0.5 }}
                        ></i>
                    </span>
                </div>
                <div className={styles.message}>{this.props.message}</div>
            </div>
        );
    }
}
