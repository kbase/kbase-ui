import { Row } from '../components/ScalableScroller/DataProviderState';
import { NarrativeSearchDoc } from '../utils/NarrativeModel';
import {
    NarrativeSearch,
    SearchOptions,
    SearchParams,
} from '../utils/NarrativeSearch';

export interface DetailOptions {
    narrativeId?: number;
    view?: string;
}

export interface SearchResults {
    narratives: Array<NarrativeSearchDoc>;
    totalCount: number;
    filterCount: number;
}

export enum SearchStatus {
    NONE = 'NONE',
    INITIAL = 'INITIAL',
    MEASURED = 'MEASURED',
    SEARCHING = 'SEARCHING',
    SEARCHED = 'SEARCHED',
    SEARCHED_NOT_FOUND = 'SEARCHED_NOT_FOUND',
    RE_SEARCHING = 'RE_SEARCHING',
    ERROR = 'ERROR',
}

export interface SearchParamState {
    searchOptions: SearchParams;
    detailOptions: DetailOptions;
}

export interface SearchStateBase {
    status: SearchStatus;
}

export interface SearchStateNone extends SearchStateBase {
    status: SearchStatus.NONE;
}

// initially have just the options
export interface SearchStateInitial extends SearchStateBase {
    status: SearchStatus.INITIAL;
    searchOptions: SearchOptions;
    detailOptions: DetailOptions;
}

// on the first update from the search control, we will have
// the full search params, but no results yet.
export interface SearchStateMeasured extends SearchStateBase {
    status: SearchStatus.MEASURED;
    searchParams: SearchParams;
    detailOptions: DetailOptions;
}

// THen we will be searching with this info
export interface SearchStateSearching extends SearchStateBase {
    status: SearchStatus.SEARCHING;
    searchParams: SearchParams;
    detailOptions: DetailOptions;
}

export interface SearchStateWithResults extends SearchStateBase {
    status: SearchStatus.SEARCHED | SearchStatus.RE_SEARCHING;
    searchParams: SearchParams;
    detailOptions: DetailOptions;

    items: Array<Row<NarrativeSearchDoc>>;
    filterCount: number;
    totalCount: number;
    // searchKey: string;
    // selectedNarrative: NarrativeSearchDoc;
}

// After the first search, we'll have results
export interface SearchStateSearched extends SearchStateWithResults {
    status: SearchStatus.SEARCHED;
}

// We may search again.
export interface SearchStateReSearching extends SearchStateWithResults {
    status: SearchStatus.RE_SEARCHING;
}

// After the first search, we'll have results, or not!
export interface SearchStateSearchedNotFound extends SearchStateBase {
    status: SearchStatus.SEARCHED_NOT_FOUND;
    searchParams: SearchParams;
    detailOptions: DetailOptions;
    // searchKey: string;
}

// We may encounter an error

export interface SearchStateError extends SearchStateBase {
    status: SearchStatus.ERROR;
    error: {
        message: string;
    };
}

export type SearchState =
    | SearchStateNone
    | SearchStateInitial
    | SearchStateMeasured
    | SearchStateSearching
    | SearchStateSearched
    | SearchStateSearchedNotFound
    | SearchStateReSearching
    | SearchStateError;

export interface DataModelParams {
    searchAPIURL: string;
    token: string;
    username: string;
}

export class DataModel {
    searchClient: NarrativeSearch;
    // TODO: get rid of row ... or incorporate here.
    cache: Array<Row<NarrativeSearchDoc>>;

    constructor({ searchAPIURL, token, username }: DataModelParams) {
        this.searchClient = new NarrativeSearch({
            searchAPIURL,
            token,
            username,
        });
        this.cache = [];
    }

    async searchFromSearchParams(
        searchParams: SearchParams
    ): Promise<SearchResults> {
        const { count: filterCount, hits } =
            await this.searchClient.searchNarratives(searchParams);

        const totalCount = await (async () => {
            if (searchParams.query && searchParams.query.length > 0) {
                const { count } = await this.searchClient.searchSummary(
                    searchParams
                );
                return count;
            } else {
                return filterCount;
            }
        })();

        return {
            narratives: hits,
            totalCount,
            filterCount,
        };
    }
}
