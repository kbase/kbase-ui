import { Component, createRef, CSSProperties, RefObject } from 'react';
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
    style?: CSSProperties;
    render: (row: T) => JSX.Element;
    // sort?: (state: SortState, dataSource: Array<T>) => Array<T>;
    sorter?: (a: T, b: T) => number;
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

export interface Row<T> {
    rowNumber: number;
    data: T;
}

interface DataBrowsereState<T> {
    trigger: boolean;
    triggerRefresh: number;
    columns: Array<ColumnState<T>>;
    rows: Array<Row<T>>;
}

export type SortDirection = 1 | -1;

export function optionalStringComparator(a?: string, b?: string) {
    if (typeof a !== 'undefined') {
        if (typeof b !== 'undefined') {
            return a.localeCompare(b);
        } else {
            return 0;
        }
    } else {
        if (typeof b !== 'undefined') {
            return -1;
        } else {
            return 1;
        }
    }
}

export function nullableStringComparator(a: string | null, b: string | null) {
    if (a === null) {
        if (b === null) {
            return 0;
        } else {
            return -1;
        }
    } else {
        if (b === null) {
            return 1;
        } else {
            return a.localeCompare(b);
        }
    }
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
            rows: this.props.dataSource.map((row: T, index: number) => {
                return {
                    rowNumber: index,
                    data: row,
                };
            }),
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

    nextSortState(sortState: SortState) {
        switch (sortState) {
            case SortState.NONE:
                return SortState.ASCENDING;
            case SortState.ASCENDING:
                return SortState.DESCENDING;
            case SortState.DESCENDING:
                return SortState.NONE;
        }
    }

    onHeaderClick(columnNumber: number) {
        const column = this.state.columns[columnNumber];
        const sorter = column.def.sorter;
        if (typeof sorter === 'undefined') {
            return;
        }
        const nextSortState = this.nextSortState(column.state.sort);
        // Unset the sort state for the currently sorted column.

        const columns = this.state.columns.map((column, index) => {
            return {
                ...column,
                state: {
                    ...column.state,
                    sort:
                        index === columnNumber ? nextSortState : SortState.NONE,
                },
            };
        });

        if (nextSortState === SortState.NONE) {
            this.setState({
                ...this.state,
                columns,
                rows: this.state.rows.sort((a, b) => {
                    return a.rowNumber - b.rowNumber;
                }),
            });
        } else {
            // const newRows = column.def.sort(nextSortState, this.state.rows);
            const direction = nextSortState === SortState.ASCENDING ? 1 : -1;
            const newRows = this.state.rows.sort((a: Row<T>, b: Row<T>) => {
                return sorter(a.data, b.data) * direction;
            });
            this.setState({
                ...this.state,
                columns,
                rows: newRows,
            });
        }
    }

    renderSortState(sort: SortState) {
        switch (sort) {
            case SortState.NONE:
                return <span className="fa fa-sort text-secondary" />;
            case SortState.ASCENDING:
                return <span className="fa fa-sort-asc text-primary" />;
            case SortState.DESCENDING:
                return <span className="fa fa-sort-desc text-primary" />;
        }
    }

    renderHeader() {
        const style = {
            height: `{this.props.heights.header}px`,
        };
        const header = this.state.columns.map((column, index) => {
            const {
                def: { label, style, sorter },
            } = column;
            if (sorter) {
                return (
                    <div
                        key={column.def.id}
                        className={styles.headerCol}
                        style={style || {}}
                        onClick={() => {
                            this.onHeaderClick(index);
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
                        <div className={styles.headerTitle}>{label}</div>
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
                        return col.def.render(values.data);
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
