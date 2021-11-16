import { Component } from 'react';

// Components
import NarrativeDetailsWrapper from '../NarrativeDetails/NarrativeDetailsWrapper';
import CategoryMenu from './CategoryMenu';
import { SearchInput } from '../SearchInput';
import SortControl from './SortControl';
import IconSpinner from '../IconSpinner';
import { updateHistory } from '../../utils/navigation';
import './NarrativeList.css';

import { NavigatorContext } from '../../context/NavigatorContext';
import NarrativeListing from '../NarrativeListing/NarrativeListing';
import {
    SearchState,
    SearchStateError,
    SearchStatus,
} from '../../context/DataModel';
import ErrorMessage from '../../../../components/ErrorMessage';

interface NarrativeListProps {
    searchState: SearchState;
    queryChange: (query: string) => void;
    sortChange: (query: string) => void;
    categoryChange: (category: string) => void;
    refresh: () => void;
}

interface NarrativeListState {}

// Like SearchOptions but all optional
// TODO: may be able to use a TS helper for this...
export interface SearchOptionsUpdate {
    category?: string;
    sort?: string;
    offset?: number;

    search?: string;
}

// This is a parent component to everything in the narrative browser (tabs,
// filters, search results, details, etc)
export default class NarrativeList extends Component<
    NarrativeListProps,
    NarrativeListState
> {
    handleFilterQueryChange(query: string) {
        // We want to update the search params state only
        // if we have a valid one.
        updateHistory('query', query);
        switch (this.props.searchState.status) {
            case SearchStatus.NONE:
            case SearchStatus.INITIAL:
            case SearchStatus.MEASURED:
            case SearchStatus.SEARCHING:
                break;
            case SearchStatus.SEARCHED:
            case SearchStatus.SEARCHED_NOT_FOUND:
            case SearchStatus.RE_SEARCHING:
                // This triggers the table display to refetch
                this.props.queryChange(query);
                break;

            case SearchStatus.ERROR:
                break;
        }
    }

    // Handle an onSetSearch callback from Filters
    async handleFilterSortChange(sort: string): Promise<void> {
        updateHistory('sort', sort);
        switch (this.props.searchState.status) {
            case SearchStatus.NONE:
            case SearchStatus.INITIAL:
            case SearchStatus.MEASURED:
            case SearchStatus.SEARCHING:
                break;
            case SearchStatus.SEARCHED:
            case SearchStatus.SEARCHED_NOT_FOUND:
            case SearchStatus.RE_SEARCHING:
                this.props.sortChange(sort);
                break;
            case SearchStatus.ERROR:
                break;
        }
    }

    async handleCategoryChange(category: string): Promise<void> {
        updateHistory('category', category);
        switch (this.props.searchState.status) {
            case SearchStatus.NONE:
            case SearchStatus.INITIAL:
            case SearchStatus.MEASURED:
            case SearchStatus.SEARCHING:
                break;
            case SearchStatus.SEARCHED:
            case SearchStatus.SEARCHED_NOT_FOUND:
            case SearchStatus.RE_SEARCHING:
                this.props.categoryChange(category);
                break;
            case SearchStatus.ERROR:
                break;
        }
    }

    renderError(searchState: SearchStateError) {
        return <ErrorMessage message={searchState.error.message} />;
    }

    renderNarrativeListing() {
        return (
            <NavigatorContext.Consumer>
                {(value) => {
                    return (
                        <NarrativeListing
                            onRowRange={value?.setRange!}
                            searchState={value?.searchState!}
                        />
                    );
                }}
            </NavigatorContext.Consumer>
        );
    }
    async handleRefresh() {
        switch (this.props.searchState.status) {
            case SearchStatus.NONE:
            case SearchStatus.INITIAL:
            case SearchStatus.MEASURED:
            case SearchStatus.SEARCHING:
                break;
            case SearchStatus.SEARCHED:
            case SearchStatus.SEARCHED_NOT_FOUND:
            case SearchStatus.RE_SEARCHING:
                this.props.refresh();
                break;
            case SearchStatus.ERROR:
                break;
        }
    }

    renderDetails() {
        return <NarrativeDetailsWrapper />;
    }

    newNarrative() {
        return null;
    }

    render() {
        const isSearching =
            this.props.searchState.status === SearchStatus.SEARCHING ||
            this.props.searchState.status === SearchStatus.RE_SEARCHING;

        // do we need a NONE?
        if (this.props.searchState.status === SearchStatus.NONE) {
            return null;
        }

        if (this.props.searchState.status === SearchStatus.ERROR) {
            return this.renderError(this.props.searchState);
        }

        const searchParamThing = (() => {
            switch (this.props.searchState.status) {
                case SearchStatus.INITIAL:
                    return this.props.searchState.searchOptions;
                case SearchStatus.MEASURED:
                    return this.props.searchState.searchParams;
                case SearchStatus.SEARCHING:
                    return this.props.searchState.searchParams;
                case SearchStatus.SEARCHED:
                    return this.props.searchState.searchParams;
                case SearchStatus.SEARCHED_NOT_FOUND:
                    return this.props.searchState.searchParams;
                case SearchStatus.RE_SEARCHING:
                    return this.props.searchState.searchParams;
            }
        })();

        return (
            <div className="container-fluid flex-grow-1 NarrativeList">
                <div className="row">
                    <div className="col-5">
                        <CategoryMenu
                            onChange={this.handleCategoryChange.bind(this)}
                            category={searchParamThing.category}
                        />
                    </div>
                    <div className="col-7">
                        <div className="Filters row align-items-center justify-content-end">
                            {/* Left-aligned actions (eg. search) */}
                            <div className="col-auto">
                                <SearchInput
                                    loading={isSearching}
                                    value={searchParamThing.query}
                                    onSetVal={this.handleFilterQueryChange.bind(
                                        this
                                    )}
                                    onRefresh={this.handleRefresh.bind(this)}
                                    placeholder="Search Narratives"
                                />
                            </div>
                            <div className="col-auto">
                                <div className="row align-items-center gx-1">
                                    {/* Right-aligned actions (eg. filter dropdown) */}
                                    <div className="col-auto">Sort</div>
                                    <div className="col-auto">
                                        <SortControl
                                            searching={isSearching}
                                            sort={searchParamThing.sort}
                                            onSortChange={this.handleFilterSortChange.bind(
                                                this
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="col-auto">
                                <button
                                    className="btn btn-outline-primary"
                                    title="Rerun the latest search"
                                    onClick={this.handleRefresh.bind(this)}
                                >
                                    <IconSpinner
                                        iconClass="fa-refresh"
                                        isActive={isSearching}
                                    />
                                </button>{' '}
                                <button
                                    className="btn btn-outline-primary"
                                    title="Create a new Narrative"
                                    onClick={this.newNarrative.bind(this)}
                                >
                                    <div className="fa fa-plus" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    className="row"
                    style={{
                        marginTop: '10px',
                        height: '100%',
                        overflow: 'hidden',
                    }}
                >
                    <div className="col-md-5 -fullheight">
                        {this.renderNarrativeListing()}
                    </div>

                    <div className="col-md-7 -fullheight">
                        {this.renderDetails()}
                    </div>
                </div>
            </div>
        );
    }
}
