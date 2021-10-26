import { Component, RefObject, createRef, CSSProperties } from 'react';
import KBResizeObserver from '../lib/KBResizeObserver';

function outerDimensions(el: Element) {
    const rect = el.getBoundingClientRect();
    const width = Math.ceil(rect.right - rect.left);
    const height = Math.ceil(rect.bottom - rect.top);
    return {
        width,
        height,
    };
}

export interface ColumnDef {
    id: string;
    label: string;
    style: CSSProperties;
    render: (value: any, values: Array<any>) => Element;
}

export interface DataTableProps {
    heights: {
        header: number;
        row: number;
    };
    columns: Array<ColumnDef>;
    render: {
        header: () => HTMLElement;
        row: (values: Array<any>) => HTMLElement;
    };
    dataSource: Array<any>;
    onClick: (values: Array<any>) => void;
}

interface DataTableState {}

export default class DataTable extends Component<
    DataTableProps,
    DataTableState
> {
    bodyRef: RefObject<HTMLDivElement>;
    observer: KBResizeObserver;
    scrollTimer?: number | null;
    resizeTimer?: number | null;
    tableHeight?: number;
    firstRow?: number;
    lastRow?: number;
    constructor(props: DataTableProps) {
        super(props);
        this.bodyRef = createRef();
        this.observer = new KBResizeObserver(this.bodyObserver.bind(this));
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
        // window.removeEventListener('resize', this.handleWindowResize.bind(this));
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

    renderHeader() {
        const style = {
            height: `${this.props.heights.header}px`,
        };
        if (this.props.columns) {
            return (() => {
                const header = this.props.columns.map(({ label, style }) => {
                    return (
                        <div
                            className="DataTable-header-col"
                            style={style || {}}
                        >
                            ${label}
                        </div>
                    );
                });
                return <div className="DataTable-header">{header}</div>;
            })();
        }
        return (() => {
            const header = this.props.render.header();
            return (
                <div className="DataTable-header" style={style}>
                    ${header}
                </div>
            );
        })();
    }

    doMeasurements() {
        this.tableHeight =
            this.props.dataSource.length * this.props.heights.row;

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
        const table = this.props.dataSource.slice(
            this.firstRow,
            this.lastRow! + 1
        );
        return table.map((values, index) => {
            const top = (this.firstRow! + index) * this.props.heights.row;
            const style = {
                top,
                right: '0',
                left: '0',
                height: `${this.props.heights.row}px`,
            };

            return (() => {
                if (this.props.columns) {
                    return (() => {
                        const row = this.props.columns.map((col) => {
                            // TODO: format value
                            const content = (() => {
                                if (col.render) {
                                    try {
                                        return col.render(
                                            values[col.id],
                                            values
                                        );
                                    } catch (ex) {
                                        return (
                                            <span className="text-danger">
                                                {ex instanceof Error
                                                    ? ex.message
                                                    : 'Unknown error'}
                                            </span>
                                        );
                                    }
                                } else {
                                    return values[col.id];
                                }
                            })();
                            const style = col.style || {};
                            return (
                                <div
                                    className="DataTable-col"
                                    style={style}
                                    data-k-b-testhook-cell={col.id}
                                    role="cell"
                                >
                                    <div className="DataTable-col-content">
                                        {content}
                                    </div>
                                </div>
                            );
                        });
                        const rowClasses = ['DataTable-grid-row'];
                        if (values.isHighlighted) {
                            rowClasses.push('DataTable-row-highlighted');
                        }
                        return (
                            <div
                                className={rowClasses.join(' ')}
                                style={style}
                                role="row"
                            >
                                {row}
                            </div>
                        );
                    })();
                }
                // freeform row
                return (() => {
                    const row = this.props.render.row(values);
                    const rowClasses = ['DataTable-grid-row'];
                    if (values.isHighlighted) {
                        rowClasses.push('DataTable-row-highlighted');
                    }
                    return (
                        <div
                            className={rowClasses.join(' ')}
                            style={style}
                            role="row"
                            onClick={() => {
                                this.onRowClick(values);
                            }}
                        >
                            {row}
                        </div>
                    );
                })();
            })();
        });
    }

    onRowClick(values: Array<any>) {
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
        const tableHeight =
            this.props.dataSource.length * this.props.heights.row;
        const style = {
            height: `${tableHeight}px`,
        };
        return (
            <div
                className="DataTable-body"
                ref={this.bodyRef}
                onScroll={this.handleBodyScroll.bind(this)}
            >
                <div className="DataTable-grid" style={style}>
                    {rows}
                </div>
            </div>
        );
    }

    render() {
        this.doMeasurements();
        return (
            <div className="DataTable">
                {this.renderHeader()} {this.renderBody()}
            </div>
        );
    }
}
