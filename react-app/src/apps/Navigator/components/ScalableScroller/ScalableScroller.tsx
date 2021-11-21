import { Component, createRef, ReactElement, RefObject } from 'react';
import Loading from '../../../../components/Loading';
import MessageAlert from '../../../../components/AlertMessage';
import {
    DataProviderState,
    DataProviderStateFetched,
    DataProviderStateRefetching,
    DataProviderStatus,
    Row,
} from './DataProviderState';
import ResizeObserver from './ResizeObserver';
import styles from './ScalableScroller.module.css';

function outerDimensions(el: HTMLElement) {
    const rect = el.getBoundingClientRect();
    const width = Math.ceil(rect.right - rect.left);
    const height = Math.ceil(rect.bottom - rect.top);
    return {
        width,
        height,
    };
}

export enum DataStatus {
    NONE = 'NONE',
    FETCHING = 'FETCHING',
    FETCHED = 'FETCHED',
    ERROR = 'ERROR',
    RE_FETCHING = 'RE_FETCHING',
    DESYNCED = 'DESYNCED',
}

export interface DataStateBase {
    status: DataStatus;
}

export interface DataStateNone extends DataStateBase {
    status: DataStatus.NONE;
}

export interface DataStateFetching extends DataStateBase {
    status: DataStatus.FETCHING;
}

export interface DataStateFetched<T> extends DataStateBase {
    status: DataStatus.FETCHED;
    rows: Array<Row<T>>;
    totalCount: number;
}

export interface DataStateError extends DataStateBase {
    status: DataStatus.ERROR;
    error: {
        message: string;
    };
}

export interface DataStateReFetching<T> extends DataStateBase {
    status: DataStatus.RE_FETCHING;
    rows: Array<Row<T>>;
    totalCount: number;
}

export interface DataStateDesynced<T> extends DataStateBase {
    status: DataStatus.DESYNCED;
    rows: Array<Row<T>>;
    totalCount: number;
}

export type DataState<T> =
    | DataStateNone
    | DataStateFetching
    | DataStateFetched<T>
    | DataStateError
    | DataStateReFetching<T>
    | DataStateDesynced<T>;

export enum UIStatus {
    NONE = 'NONE',
    MEASURED = 'MEASURED',
}

export interface UIStateBase {
    status: UIStatus;
}

export interface UIStateNone extends UIStateBase {
    status: UIStatus.NONE;
}

export interface UIStateMeasured<T> extends UIStateBase {
    status: UIStatus.MEASURED;
    firstRow: number;
    lastRow: number;
    dataState: DataState<T>;
}

export type UIState<T> = UIStateNone | UIStateMeasured<T>;

export interface FetchResult<T> {
    rows: Array<Row<T>>;
    totalCount: number;
    filterCount: number;
}

export interface ScalableScrollerProps<T> {
    rowHeight: number;
    onRowRangeChanged: (from: number, to: number) => void;
    renderRow: (item: T) => ReactElement;
    dataProviderState: DataProviderState<T>;
}
interface ScalableScrollerState<T> {
    uiState: UIState<T>;
}

export default class ScalableScroller<T> extends Component<
    ScalableScrollerProps<T>,
    ScalableScrollerState<T>
> {
    bodyRef: RefObject<HTMLDivElement>;
    scrollTimer: number | null;
    resizeTimer: number | null;
    observer: ResizeObserver;

    constructor(props: ScalableScrollerProps<T>) {
        super(props);
        this.bodyRef = createRef();
        this.observer = new ResizeObserver(this.bodyObserver.bind(this));
        this.scrollTimer = null;
        this.resizeTimer = null;
        this.state = {
            uiState: {
                status: UIStatus.NONE,
            },
        };
    }

    componentDidMount() {
        if (this.bodyRef.current) {
            this.observer.observe(this.bodyRef.current);
        }

        // Should still be in initial state.

        if (
            this.props.dataProviderState.status !== DataProviderStatus.INITIAL
        ) {
            return;
        }

        this.updateMeasurements();
    }

    updateMeasurements() {
        if (this.props.dataProviderState.status === DataProviderStatus.ERROR) {
            return;
        }

        const { firstRow, lastRow } = this.measure();
        this.props.onRowRangeChanged(firstRow, lastRow);
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
            this.updateMeasurements();
            this.resizeTimer = null;
        }, 100);
    }

    measure() {
        const body = this.bodyRef.current;
        if (!body) {
            throw new Error('doMeasurements called before DOM is ready');
        }

        // Actual height of the scrolling container
        const { height } = outerDimensions(body);

        const firstRow = Math.floor(body.scrollTop / this.props.rowHeight);
        const lastRow = firstRow + Math.ceil(height / this.props.rowHeight);

        if (firstRow < 0) {
            return { firstRow: 0, lastRow };
        } else {
            return { firstRow, lastRow };
        }
    }

    handleBodyScroll() {
        if (this.scrollTimer) {
            return;
        }

        this.scrollTimer = window.setTimeout(() => {
            this.updateMeasurements();
            this.scrollTimer = null;
        }, 100);
    }

    renderOverlay() {
        switch (this.props.dataProviderState.status) {
            case DataProviderStatus.INITIAL:
                return (
                    <div className={styles.overlay}>
                        <Loading message="Measuring..." />
                    </div>
                );
            case DataProviderStatus.FETCHING:
            case DataProviderStatus.REFETCHING:
            case DataProviderStatus.FETCHED:
                return null;
        }
    }

    renderTable(
        scrollerState:
            | DataProviderStateFetched<T>
            | DataProviderStateRefetching<T>
    ) {
        const containerHeight =
            scrollerState.value.totalCount * this.props.rowHeight;
        return (
            <div className={styles.grid} style={{ height: containerHeight }}>
                {this.renderRows(scrollerState)}
            </div>
        );
    }

    renderRows(
        scrollerState:
            | DataProviderStateFetched<T>
            | DataProviderStateRefetching<T>
    ) {
        const { rows } = scrollerState.value;

        return rows.map(({ index, value }) => {
            const top = index * this.props.rowHeight;
            const style = {
                top,
                right: '0',
                left: '0',
                height: `${this.props.rowHeight}px`,
            };

            // freeform row
            const row = this.props.renderRow(value);
            const rowClasses = [styles['grid-row']];
            return (
                <div
                    key={index}
                    className={rowClasses.join(' ')}
                    style={style}
                    role="row"
                >
                    {row}
                </div>
            );
        });
    }

    renderInitial() {
        return <Loading message="Measuring..." />;
    }

    fetchedNotFound() {
        return <MessageAlert message="No Narratives found" type="warning" />;
    }

    renderScroller() {
        switch (this.props.dataProviderState.status) {
            case DataProviderStatus.INITIAL:
            case DataProviderStatus.FETCHING:
                return null;

            case DataProviderStatus.FETCHED:
                if (this.props.dataProviderState.value.filterCount === 0) {
                    return this.fetchedNotFound();
                }
                return this.renderTable(this.props.dataProviderState);
            case DataProviderStatus.REFETCHING:
                return this.renderTable(this.props.dataProviderState);
            case DataProviderStatus.ERROR:
        }
    }

    render() {
        return (
            <div className={styles.wrapper}>
                <div
                    className={styles.body}
                    ref={this.bodyRef}
                    onScroll={this.handleBodyScroll.bind(this)}
                >
                    {this.renderOverlay()}
                    {this.renderScroller()}
                </div>
            </div>
        );
    }
}
