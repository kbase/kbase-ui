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
    cache: Array<NarrativeSearchDoc>;
    searchQueryKey: string;
    filterCount: number;

    constructor({ searchAPIURL, token, username }: DataModelParams) {
        this.searchClient = new NarrativeSearch({
            searchAPIURL,
            token,
            username,
        });
        this.cache = [];
        this.searchQueryKey = '';
        this.filterCount = 0;
    }

    makeSearchQueryKey(searchParams: SearchParams): string {
        return `category:${searchParams.category};query:${
            searchParams.query || ''
        };sort:${searchParams.sort}`;
    }

    async searchFromSearchParams(
        searchParams: SearchParams
    ): Promise<SearchResults> {
        const searchQueryKey = this.makeSearchQueryKey(searchParams);
        console.log('cache key?', searchQueryKey, this.searchQueryKey);
        if (searchQueryKey !== this.searchQueryKey) {
            this.cache = [];
            this.searchQueryKey = searchQueryKey;
        }

        // Get as much cache as we can get
        const cached = this.cache.slice(
            searchParams.offset,
            searchParams.offset + searchParams.limit
        );

        console.log('cached?', cached);

        // Fetch the rest
        const offset = searchParams.offset + cached.length;
        const limit = searchParams.limit - cached.length;

        const actualSearchParams = {
            ...searchParams,
            offset,
            limit,
        };

        let narratives: Array<NarrativeSearchDoc>;
        if (cached.length < limit) {
            const { count, hits } = await this.searchClient.searchNarratives(
                actualSearchParams
            );
            narratives = cached.concat(hits);
            this.filterCount = count;
            this.cache = this.cache.concat(hits);
        } else {
            narratives = cached;
        }

        // const fetchedRows = hits.map((doc, index) => {
        //     return {
        //         index: index + offset,
        //         value: doc,
        //     };
        // });

        console.log('now?', this.cache);

        // const narratives = cached.concat(hits);

        const totalCount = await (async () => {
            if (
                actualSearchParams.query &&
                actualSearchParams.query.length > 0
            ) {
                const { count } = await this.searchClient.searchSummary(
                    actualSearchParams
                );
                return count;
            } else {
                return this.filterCount;
            }
        })();

        return {
            narratives,
            totalCount,
            filterCount: this.filterCount,
        };
    }
}
