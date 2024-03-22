import { CSSProperties, Component, ReactNode, RefObject, createRef } from "react";
import './DataTable7.css';

const SCROLL_DELAY = 100;

function outerDimensions(el: HTMLDivElement) {
    el.offsetHeight;
    const rect = el.getBoundingClientRect();
    const width = Math.ceil(rect.right - rect.left);
    const height = Math.ceil(rect.bottom - rect.top);
    return {
        width, height
    };
}

export interface ColumnDefinition<T> {
    id: string;
    label: string;
    style: CSSProperties;
    render: (value: any, rowValue?: T) => ReactNode
}

// export interface RowValue<T> {
//     isSelected: boolean;
//     value: T
// }

export interface DataTable7Props<T> {
    heights: {
        header: number,
        row: number
    },
    columns: Array<ColumnDefinition<T>>
    // render: {
    //     header: () => ReactElement
    // },
    dataSource: Array<T>,
    // onClick: (rowValue: T) => void
    bordered: boolean
}

interface DataTable7State {
    trigger: boolean;
    triggerRefresh: number;
}

export default class DataTable7<T> extends Component<DataTable7Props<T>, DataTable7State> {
    bodyRef: RefObject<HTMLDivElement>;
    observer: ResizeObserver;
    scrollTimer: number | null;
    resizeTimer: number | null;
    tableHeight?: number;
    firstRow?: number;
    lastRow?: number;
    constructor(props: DataTable7Props<T>) {
        super(props);
        this.bodyRef = createRef();
        this.observer = new ResizeObserver(this.bodyObserver.bind(this));
        this.scrollTimer = null;
        this.resizeTimer = null;
        this.state = {
            trigger: false,
            triggerRefresh: 0
        }
    }

    componentDidMount() {
        window.setTimeout(() => {
            this.setState({
                trigger: true
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
        if (this.observer && this.bodyRef.current) {
            this.observer.unobserve(this.bodyRef.current);
        }
    }

    bodyObserver() {
        if (this.resizeTimer) {
            return;
        }

        this.resizeTimer = window.setTimeout(() => {
            this.setState({
                triggerRefresh: new Date().getTime()
            });
            this.resizeTimer = null;
        }, SCROLL_DELAY);
    }
    renderHeader() {
        // const style = {
        //     height: `${this.props.heights.header}px`
        // };
        // if (this.props.columns) {
            return (() => {
                const header = this.props.columns.map(({id, label, style}) => {
                    return <div 
                        className="DataTable7-header-col" 
                        key={id}
                        style={style || {}}>
                        {label}
                    </div>
                });
                return <div className="DataTable7-header">{header}</div>
            })();
        // }
        // return (() => {
        //     const header = this.props.render.header();
        //     return <div className="DataTable7-header" style={style}>${header}</div>
        // })();
    }

    doMeasurements() {
        const rowHeight = this.rowHeight();

        this.tableHeight = this.props.dataSource.length * rowHeight;

        const body = this.bodyRef.current;
        if (!body) {
            return;
        }

        const {height} = outerDimensions(body);
        this.firstRow = Math.floor(body.scrollTop / rowHeight);
        if (this.firstRow < 0) {
            this.firstRow = 0;
        }
        this.lastRow = this.firstRow + Math.ceil(height / rowHeight);
    }

    rowHeight() {
        return this.props.heights.row; 
    }

    renderRowWrapper(rowValue: T, index: number) {
        // Compute the style for the row wrapper, which is positioned within the overall
        // grid according to the.
        const rowHeight = this.rowHeight();
        const top = (this.firstRow! + index) * rowHeight;
        const style = {
            top,
            right: '0',
            left: '0',
            height: `${rowHeight}px`
        };

        // Render actual table row
        const rowColumns = this.renderRow(rowValue);
        const row = <div className="DataTable7-row">
                {rowColumns}
            </div>

        // Render row wrapper.
        const rowClasses = ['DataTable7-grid-row'];
        // if (rowValue.isHighlighted) {
        //     rowClasses.push('DataTable7-row-highlighted');
        // }

        return <div style={style} 
            key={index}
            className={rowClasses.join(' ')}
            // onDoubleClick={() => {
            //     this.onRowClick(rowValue);
            // }}
            role="row">
            {row}  
        </div>
    }

    renderRow(rowValue: T) {
        return this.props.columns.map((col) => {
            // TODO: format value
            const content = (() => {
                if (col.render) {
                    try {
                        return col.render(rowValue);
                    } catch (ex) {
                        return <span className="text-danger">{ex instanceof Error ? ex.message : 'Unknown error'}</span>
                    }
                }
            })();
            const style = col.style || {};
            return <div className="DataTable7-col"
                        key={col.id}
                        style={style}
                        data-k-b-testhook-cell={col.id}
                        role="cell">
                    <div className="DataTable7-col-content">
                        {content}
                    </div>
                </div>
        });
    }

    renderRows() {
        if (typeof this.firstRow === 'undefined') {
            return;
        }

        const table = this.props.dataSource.slice(this.firstRow, this.lastRow! + 1);
        return table.map((rowValue, index) => {
            return this.renderRowWrapper(rowValue, index);
        });
    }

    // onRowClick(rowValue: T) {
    //     if (!this.props.onClick) {
    //         return;
    //     }
    //     this.props.onClick(rowValue);
    // }

    handleBodyScroll() {
        if (this.scrollTimer) {
            return;
        }

        this.scrollTimer = window.setTimeout(() => {
            this.setState({
                triggerRefresh: new Date().getTime()
            });
            this.scrollTimer = null;
        }, SCROLL_DELAY);
    }

    renderBody() {
        const rows = this.renderRows();
        const tableHeight = this.props.dataSource.length * this.rowHeight();
        const style = {
            height: `${tableHeight}px`
        };
        return <div className="DataTable7-body"
                 ref={this.bodyRef}
                 onScroll={this.handleBodyScroll.bind(this)}>
                <div className="DataTable7-grid"
                     style={style}>
                    {rows}
                </div>
            </div>
    }

    render() {
        this.doMeasurements();
        const classes = [
            "DataTable7"
        ];
        if (this.props.bordered !== false) {
            classes.push('-bordered');
        }
        return <div className={classes.join(' ')} role="table">
                {this.renderHeader()}
                {this.renderBody()}
            </div>
    }
}