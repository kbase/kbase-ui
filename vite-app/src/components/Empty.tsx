import React, { PropsWithChildren } from 'react';
import styles from './Empty.module.css';

export interface EmptyProps extends PropsWithChildren {
    message?: string;
    icon?: string;
    size?: 'normal' | 'compact' | 'inline'
    style?: React.CSSProperties
}

export default class Empty extends React.Component<EmptyProps> {
    render() {
        const mainClasses = [styles.main];
        const iconClasses = [styles.icon];
        switch (this.props.size || 'normal') {
            case 'normal':
                mainClasses.push(styles.normalSize);
                iconClasses.push(styles.iconNormal);
                break;
            case 'compact':
                mainClasses.push(styles.compactSize);
                iconClasses.push(styles.iconCompact);
                break;
            case 'inline':
                mainClasses.push(styles.inlineSize);
                iconClasses.push(styles.iconInline);
                break;
        }
        const message = (() => {
            if (this.props.message) {
                return <div className={styles.message}>{this.props.message}</div>
            }
            return this.props.children;
        })();
        return (
            <div className={mainClasses.join(' ')} style={this.props.style || {}}>
                <div className={iconClasses.join(' ')}>
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
                {message}
            </div>
        );
    }
}
