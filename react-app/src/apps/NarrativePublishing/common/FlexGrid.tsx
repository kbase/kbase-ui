import { Component, CSSProperties, PropsWithChildren } from 'react';
import styles from './FlexGrid.module.css';

export interface FlexRowProps extends PropsWithChildren {
    style?: CSSProperties;
    className?: string;
    header?: boolean;
}

export class FlexRow extends Component<FlexRowProps> {
    render() {
        const classes = [styles.row];
        if (this.props.header) {
            classes.push(styles.rowHeader);
            classes.push('bg-light');
            // classes.push('text-white');
            classes.push('rounded-3')
            classes.push('border')
            classes.push('border-2')
        }
        if (this.props.className) {
            classes.push(this.props.className);
        }
        return (
            <div className={classes.join(' ')} style={this.props.style}>
                {this.props.children}
            </div>
        );
    }
}

export interface FlexColProps extends PropsWithChildren {
    style?: CSSProperties;
    title?: boolean;
    width?: string;
}

export class FlexCol extends Component<FlexColProps> {
    render() {
        const classes = [styles.col];
        if (this.props.title) {
            classes.push(styles.colTitle);
        }
        const style: CSSProperties = this.props.style || {};
        if (this.props.width) {
            style.flex = `0 0 ${this.props.width}`;
        }
        return (
            <div className={classes.join(' ')} style={style}>
                {this.props.children}
            </div>
        );
    }
}

export interface FlexGridProps extends PropsWithChildren {
    style?: CSSProperties;
    className?: string;
}

export default class FlexGrid extends Component<FlexGridProps> {
    render() {
        const className: string = `${styles.table} ${this.props.className}`;
        return (
            <div className={className} style={this.props.style}>
                {this.props.children}
            </div>
        );
    }
}
