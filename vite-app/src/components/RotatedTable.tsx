import { Component, CSSProperties, ReactNode } from 'react';
import styles from './RotatedTable.module.css';

export type RotatedTableColumnValue = ReactNode | (() => ReactNode);

export type RotatedTableRow = [string, RotatedTableColumnValue];

export interface RotatedTableProps {
    rows: Array<RotatedTableRow>;
    noRowsMessage?: string;
    title?: string;
    footer?: RotatedTableRow;
    header?: RotatedTableRow;
    styles?: {
        col1?: CSSProperties;
        col2?: CSSProperties;
        body?: CSSProperties;
    };
    omitEmptyRows?: boolean;
}

interface RotatedTableState { }

export default class RotatedTable extends Component<
    RotatedTableProps,
    RotatedTableState
> {
    col1Style: CSSProperties;
    col2Style: CSSProperties;
    bodyStyle: CSSProperties;
    constructor(props: RotatedTableProps) {
        super(props);
        if (this.props.styles && this.props.styles.col1) {
            this.col1Style = this.props.styles.col1;
        } else {
            this.col1Style = {};
        }

        if (this.props.styles && this.props.styles.col2) {
            this.col2Style = this.props.styles.col2;
        } else {
            this.col2Style = {};
        }

        if (this.props.styles && this.props.styles.body) {
            this.bodyStyle = this.props.styles.body;
        } else {
            this.bodyStyle = {};
        }
    }

    renderTitle() {
        if (!this.props.title) {
            return null;
        }
        return (
            <div className={styles.header}>
                <div className={styles.title}>{this.props.title}</div>
            </div>
        );
    }

    renderHeader() {
        if (!this.props.header) {
            return null;
        }
        return (
            <div className={styles.header}>
                {this.renderRow(this.props.header)}
            </div>
        );
    }

    renderColumnValue(value: RotatedTableColumnValue) {
        if (typeof value === 'function') {
            return value();
        } else if (typeof value === 'undefined') {
            return 'n/a';
        } else {
            return value;
        }
    }

    renderRow([key, valueRender]: RotatedTableRow) {
        const value = this.renderColumnValue(valueRender);
        if (value === null && this.props.omitEmptyRows) {
            return;
        }
        return (
            <div className={styles.row} key={key}>
                <div className={styles.col1} style={this.col1Style}>
                    {key}
                </div>
                <div className={styles.col2} style={this.col2Style}>
                    {value}
                </div>
            </div>
        );
    }

    renderBody() {
        if (this.props.rows.length === 0) {
            return (
                <div className={styles.noRowsMessage}>
                    {this.props.noRowsMessage || 'No rows to display'}
                </div>
            );
        }

        const rows = this.props.rows.map((row) => {
            return this.renderRow(row);
        });
        return (
            <div className={styles.body} style={this.bodyStyle}>
                {rows}
            </div>
        );
    }

    renderFooter() {
        if (!this.props.footer) {
            return null;
        }
        return (
            <div className={styles.footer}>
                {this.renderRow(this.props.footer)}
            </div>
        );
    }

    render() {
        return (
            <div className={styles.RotatedTable}>
                {this.renderTitle()}
                {this.renderHeader()}
                {this.renderBody()}
                {this.renderFooter()}
            </div>
        );
    }
}
