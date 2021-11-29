import { Component, RefObject, createRef, CSSProperties } from 'react';
import KBResizeObserver from '../lib/KBResizeObserver';
import styles from './DataBrowser.module.css';

function outerDimensions(el: Element) {
    const rect = el.getBoundingClientRect();
    const width = Math.ceil(rect.right - rect.left);
    const height = Math.ceil(rect.bottom - rect.top);
    return {
        width,
        height,
    };
}

export interface ColumnDef<T> {
    id: string;
    label: string;
    style: CSSProperties;
    render: (row: T) => JSX.Element;
    sort?: (state: SortState, dataSource: Array<T>) => Array<T>;
}

export enum SortState {
    NONE = 'NONE',
    ASCENDING = 'ASCENDING',
    DESCENDING = 'DESCENDING',
}

// export enum SortDirection {
//     ASCENDING = 'ASCENDING',
//     DESCENDING = 'DESCENDING',
// }

export interface ColumnState<T> {
    def: ColumnDef<T>;
    state: {
        sort: SortState;
    };
}

export interface DataBrowserProps<T> {
    heights: {
        header: number;
        row: number;
    };
    columns: Array<ColumnDef<T>>;
    dataSource: Array<T>;
    onClick?: (values: T) => void;
}

interface DataBrowsereState<T> {
    trigger: boolean;
    triggerRefresh: number;
    columns: Array<ColumnState<T>>;
    rows: Array<T>;
}

export default class DataBrowser<T> extends Component<
    DataBrowserProps<T>,
    DataBrowsereState<T>
> {
    bodyRef: RefObject<HTMLDivElement>;
    observer: KBResizeObserver;
    scrollTimer?: number | null;
    resizeTimer?: number | null;
    tableHeight?: number;
    firstRow?: number;
    lastRow?: number;

    constructor(props: DataBrowserProps<T>) {
        super(props);
        this.bodyRef = createRef();
        this.observer = new KBResizeObserver(this.bodyObserver.bind(this));
        this.state = {
            trigger: false,
            triggerRefresh: 0,
            columns: this.props.columns.map((def) => {
                return {
                    def,
                    state: {
                        sort: SortState.NONE,
                    },
                };
            }),
            rows: this.props.dataSource,
        };
    }

    componentDidMount() {
        window.setTimeout(() => {
            this.setState({
                trigger: true,
            });
        }, 0);
        if (this.bodyRef.current) {
            this.observer.observe(this.bodyRef.current);
        }
    }

    componentWillUnmount() {
        if (this.scrollTimer) {
            window.clearTimeout(this.scrollTimer);
        }
        if (this.observer) {
            this.observer.unobserve(this.bodyRef.current!);
        }
    }

    bodyObserver() {
        if (this.resizeTimer) {
            return;
        }

        this.resizeTimer = window.setTimeout(() => {
            this.setState({
                triggerRefresh: new Date().getTime(),
            });
            this.resizeTimer = null;
        }, 100);
    }

    onHeaderClick(column: ColumnState<T>) {
        if (typeof column.def.sort === 'undefined') {
            return;
        }
        const nextSortState = (() => {
            switch (column.state.sort) {
                case SortState.NONE:
                    return SortState.ASCENDING;
                case SortState.ASCENDING:
                    return SortState.DESCENDING;
                case SortState.DESCENDING:
                    return SortState.NONE;
            }
        })();

        if (nextSortState === SortState.NONE) {
            this.setState({
                ...this.state,
                rows: this.props.dataSource,
            });
        } else {
            const newRows = column.def.sort(nextSortState, this.state.rows);
            this.setState({
                ...this.state,
                rows: newRows,
            });
        }
    }

    renderSortState(sort: SortState) {
        switch (sort) {
            case SortState.NONE:
                return '-';
            case SortState.ASCENDING:
                return 'Asc';
            case SortState.DESCENDING:
                return 'Desc';
        }
    }

    renderHeader() {
        const style = {
            height: `{this.props.heights.header}px`,
        };
        const header = this.state.columns.map((column) => {
            const {
                def: { label, style, sort },
            } = column;
            if (sort) {
                return (
                    <div
                        key={column.def.id}
                        className={styles.headerCol}
                        style={style || {}}
                        onClick={() => {
                            this.onHeaderClick(column);
                        }}
                    >
                        <div className={styles.headerTitle}>{label}</div>
                        <div className={styles.headerSortIndicator}>
                            {this.renderSortState(column.state.sort)}
                        </div>
                    </div>
                );
            } else {
                return (
                    <div
                        className={styles.headerCol}
                        style={style || {}}
                        key={column.def.id}
                    >
                        <div className={styles.headerColTitle}>{label}</div>
                    </div>
                );
            }
        });
        return (
            <div className={styles.header} style={style}>
                {header}
            </div>
        );
    }

    doMeasurements() {
        this.tableHeight = this.state.rows.length * this.props.heights.row;

        const body = this.bodyRef.current;
        if (!body) {
            return;
        }

        const { height } = outerDimensions(body);
        this.firstRow = Math.floor(body.scrollTop / this.props.heights.row);
        this.lastRow =
            this.firstRow + Math.ceil(height / this.props.heights.row);
    }

    renderRows() {
        if (typeof this.firstRow === 'undefined') {
            return;
        }
        const table = this.state.rows.slice(this.firstRow, this.lastRow! + 1);
        return table.map((values, index) => {
            const top = (this.firstRow! + index) * this.props.heights.row;
            const style = {
                top,
                right: '0',
                left: '0',
                height: `${this.props.heights.row}px`,
            };

            const row = this.state.columns.map((col) => {
                // TODO: format value
                const content = (() => {
                    try {
                        return col.def.render(values);
                    } catch (ex) {
                        return (
                            <span className="text-danger">
                                {ex instanceof Error
                                    ? ex.message
                                    : 'Unknown error'}
                            </span>
                        );
                    }
                })();
                const style = col.def.style || {};
                return (
                    <div
                        key={col.def.id}
                        className={styles.col}
                        style={style}
                        data-k-b-testhook-cell={col.def.id}
                        role="cell"
                    >
                        <div className={styles.colContent}>{content}</div>
                    </div>
                );
            });
            const rowClasses = [styles.gridRow];
            return (
                <div
                    className={rowClasses.join(' ')}
                    style={style}
                    role="row"
                    key={index}
                >
                    {row}
                </div>
            );
        });
    }

    onRowClick(values: T) {
        if (!this.props.onClick) {
            return;
        }
        this.props.onClick(values);
    }

    handleBodyScroll() {
        if (this.scrollTimer) {
            return;
        }

        this.scrollTimer = window.setTimeout(() => {
            this.setState({
                triggerRefresh: new Date().getTime(),
            });
            this.scrollTimer = null;
        }, 100);
    }

    renderBody() {
        const rows = this.renderRows();
        const tableHeight = this.state.rows.length * this.props.heights.row;
        const style = {
            height: `${tableHeight}px`,
        };
        return (
            <div
                className={styles.body}
                ref={this.bodyRef}
                onScroll={this.handleBodyScroll.bind(this)}
            >
                <div className={styles.grid} style={style}>
                    {rows}
                </div>
            </div>
        );
    }

    render() {
        this.doMeasurements();
        return (
            <div className={styles.main}>
                {this.renderHeader()} {this.renderBody()}
            </div>
        );
    }
}
