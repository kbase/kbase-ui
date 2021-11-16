import { Component } from 'react';
import { NarrativeSearchDoc } from '../../utils/NarrativeModel';
import Narrative from '../NarrativeList/Narrative';
import ScalableScroller from '../ScalableScroller/ScalableScroller';
import {
    Row,
    DataProviderStatus,
    DataProviderState,
} from '../ScalableScroller/DataProviderState';
import IconSpinner from '../IconSpinner';
import { NavigatorContext } from '../../context/NavigatorContext';
import AsyncQueue from '../NarrativeList/AsyncQueue';
import { SearchState, SearchStatus } from '../../context/DataModel';
import Loading from '../../../../components/Loading';
import { AsyncProcessStatus } from '../../../../lib/AsyncProcess';
import ErrorMessage from '../../../../components/ErrorMessage';
import { updateHistory } from '../../utils/navigation';
import styles from './NarrativeListing.module.css';

const ROW_HEIGHT = 64;

/**
 * The NarrativeListing component is the hub of it all.
 * It receives updates from the search query input, sort control,
 * category (via tab selection), and navigation.
 *
 * Some of this is available initially, and others arrive only after
 * displaying the initial view, since it the initial view size depends on the
 * size of the ScalableScroller display area.
 *
 * This component coordinates
 */

interface NarrativeListingProps {
    onRowRange: (from: number, to: number) => void;
    // dataVersion: string;
    searchState: SearchState;
}

interface NarrativeListingState {
    dataProviderState: DataProviderState<NarrativeSearchDoc>;
}

export interface Message {
    id: string;
    handler: () => void;
}

// Simple UI for a list of selectable search results
export default class NarrativeListing extends Component<
    NarrativeListingProps,
    NarrativeListingState
> {
    // A cache of narrative search documents. Its zero is the
    // beginning of the search results, as search always starts
    // with the first page and then scrolls forward.
    cache: Array<Row<NarrativeSearchDoc>>;
    totalCount: number | null;
    filterCount: number | null;
    queue: AsyncQueue;
    constructor(props: NarrativeListingProps) {
        super(props);
        this.cache = [];
        this.totalCount = null;
        this.filterCount = null;
        this.queue = new AsyncQueue({ queuePauseTime: 100 });
    }

    renderRow(narrative: NarrativeSearchDoc) {
        return (
            <div style={{ flex: '1 1 0', minWidth: '0' }}>
                <NavigatorContext.Consumer>
                    {(value) => {
                        const isSelected = (() => {
                            if (
                                value !== null &&
                                value.selectedNarrative.status ===
                                    AsyncProcessStatus.SUCCESS
                            ) {
                                return (
                                    value.selectedNarrative.value.narrativeDoc
                                        .access_group === narrative.access_group
                                );
                            }
                            return false;
                        })();
                        return (
                            <Narrative
                                narrative={narrative}
                                isSelected={isSelected}
                                height={64}
                                onSelect={() => {
                                    updateHistory(
                                        'id',
                                        String(narrative.access_group)
                                    );
                                    value?.selectNarrative(
                                        narrative.access_group
                                    );
                                }}
                            />
                        );
                    }}
                </NavigatorContext.Consumer>
            </div>
        );
    }

    isPending() {
        switch (this.props.searchState.status) {
            case SearchStatus.NONE:
            case SearchStatus.INITIAL:
            case SearchStatus.MEASURED:
            case SearchStatus.SEARCHING:
            case SearchStatus.RE_SEARCHING:
                return true;
            case SearchStatus.SEARCHED:
            case SearchStatus.SEARCHED_NOT_FOUND:
            case SearchStatus.ERROR:
                return false;
        }
    }

    renderSearchStats() {
        switch (this.props.searchState.status) {
            case SearchStatus.NONE:
            case SearchStatus.INITIAL:
            case SearchStatus.MEASURED:
            case SearchStatus.SEARCHING:
            case SearchStatus.ERROR:
            case SearchStatus.SEARCHED_NOT_FOUND:
                return null;
            case SearchStatus.SEARCHED:
            case SearchStatus.RE_SEARCHING:
                if (
                    this.props.searchState.totalCount ===
                    this.props.searchState.filterCount
                ) {
                    return (
                        <span>
                            {this.props.searchState.totalCount} Narratives
                        </span>
                    );
                } else {
                    return (
                        <span>
                            {this.props.searchState.filterCount} Narratives
                            found (out of {this.props.searchState.totalCount})
                        </span>
                    );
                }
        }
    }

    renderHeader() {
        return (
            <div
                style={{
                    backgroundColor: 'rgba(100, 100, 100, 1)',
                    color: 'white',
                    padding: '0.2em',
                    paddingLeft: '1em',
                    borderRadius: '0.4em',
                }}
            >
                <IconSpinner
                    iconClass="fa-database"
                    isActive={this.isPending()}
                />{' '}
                {this.renderSearchStats()}
            </div>
        );
    }

    renderLoading() {
        return <Loading message="Loading ..." />;
    }

    renderError(errorMessage: string) {
        return <ErrorMessage message={errorMessage} />;
    }

    renderSearchState() {
        switch (this.props.searchState.status) {
            case SearchStatus.NONE:
            case SearchStatus.INITIAL:
                return (
                    <ScalableScroller<NarrativeSearchDoc>
                        rowHeight={ROW_HEIGHT}
                        renderRow={this.renderRow.bind(this)}
                        onRowRangeChanged={(from: number, to: number) => {
                            this.props.onRowRange(from, to);
                        }}
                        // onRowRangeChanged={this.props.onRowRange}
                        dataProviderState={{
                            status: DataProviderStatus.INITIAL,
                        }}
                    />
                );
            case SearchStatus.MEASURED:
            case SearchStatus.SEARCHING:
                return (
                    <ScalableScroller<NarrativeSearchDoc>
                        rowHeight={ROW_HEIGHT}
                        renderRow={this.renderRow.bind(this)}
                        onRowRangeChanged={this.props.onRowRange}
                        dataProviderState={{
                            status: DataProviderStatus.FETCHING,
                        }}
                    />
                );
            case SearchStatus.SEARCHED: {
                const {
                    items,
                    filterCount,
                    totalCount,
                    searchParams: { offset, limit },
                } = this.props.searchState;
                return (
                    <ScalableScroller<NarrativeSearchDoc>
                        rowHeight={ROW_HEIGHT}
                        renderRow={this.renderRow.bind(this)}
                        onRowRangeChanged={this.props.onRowRange}
                        dataProviderState={{
                            status: DataProviderStatus.FETCHED,
                            value: {
                                rows: items,
                                filterCount,
                                totalCount,
                                from: offset,
                                to: offset + limit - 1,
                            },
                        }}
                    />
                );
            }

            // case SearchStatus.SEARCHED_NOT_FOUND:{
            //     const {
            //         searchParams: { offset, limit },
            //     } = this.props.searchState;
            //     <ScalableScroller<NarrativeSearchDoc>
            //         rowHeight={ROW_HEIGHT}
            //         renderRow={this.renderRow.bind(this)}
            //         onRowRangeChanged={this.props.onRowRange}
            //         dataProviderState={{
            //             status: DataProviderStatus.FETCHED,
            //             value: {
            //                 rows: [],
            //                 filterCount,
            //                 totalCount,
            //                 from: offset,
            //                 to: offset + limit - 1,
            //             },
            //         }}
            //     />;
            //     break;
            // }

            case SearchStatus.RE_SEARCHING: {
                const {
                    items,
                    filterCount,
                    totalCount,
                    searchParams: { offset, limit },
                } = this.props.searchState;
                return (
                    <ScalableScroller<NarrativeSearchDoc>
                        rowHeight={ROW_HEIGHT}
                        renderRow={this.renderRow.bind(this)}
                        onRowRangeChanged={this.props.onRowRange}
                        dataProviderState={{
                            status: DataProviderStatus.REFETCHING,
                            value: {
                                rows: items,
                                filterCount,
                                totalCount,
                                from: offset,
                                to: offset + limit - 1,
                            },
                        }}
                    />
                );
            }
            case SearchStatus.ERROR:
                return this.renderError(this.props.searchState.error.message);
        }
    }

    render() {
        return (
            <div className={styles.NarrativeListing}>
                <div className={styles.header}>{this.renderHeader()}</div>
                <div className={styles.listing}>{this.renderSearchState()}</div>
            </div>
        );
    }
}
