import { NarrativeSearchDoc } from './NarrativeModel';

// Interface to the searchNarratives function

// Search options which may be provided from the url
export interface SearchOptions {
    category: string;
    sort: string;
    offset: number;

    query?: string;
}

// Purely internal search options
export interface InternalSearchParams {
    limit: number;
}

export type SearchParams = SearchOptions & InternalSearchParams;

// Sort direction
enum SortDir {
    Asc = 'asc',
    Desc = 'desc',
}

enum Operator {
    And = 'AND',
    Or = 'OR',
}

export type NarrativeListCategories = 'own' | 'shared' | 'tutorials' | 'public';

// `filters` key in the search query
type FilterClause = FilterBool | FilterField;

// Boolean combination of multiple filters
interface FilterBool {
    operator: Operator;
    fields: Array<FilterClause>;
}

// Filter on a single field
interface FilterField {
    field: string;
    range?: {
        max: number;
        min: number;
    };
    term?: string | boolean;
    not_term?: string;
}

// Parameters we pass to the searchapi2 server
interface SearchWorkspaceParams {
    types: Array<string>;
    include_fields?: Array<string>;
    search?: {
        query: string;
        fields: Array<string>;
    };
    filters?: FilterClause;
    sorts?: Array<[string, SortDir]>;
    paging?: {
        length?: number;
        offset?: number;
    };
    access?: {
        only_public?: boolean;
        only_private?: boolean;
    };
    track_total_hits: boolean;
}

/**
 * The direct response from the SearchAPI2 service.
 * This is (probably) JSON-RPC 2.0 format.
 */
// interface JSONRPCResponse<T> {
//     jsonrpc: '2.0';
//     result: T;
//     id: string;
// }

export interface SearchResults {
    count: number;
    search_time: number;
    hits: Array<NarrativeSearchDoc>;
}

export const sorts: Record<string, string> = {
    '-updated': 'Recently updated',
    updated: 'Least recently updated',
    '-created': 'Newest',
    created: 'Oldest',
    lex: 'Title (A-Za-z)',
    '-lex': 'Title (z-aZ-A)',
};

/**
 * Search narratives using ElasticSearch.
 * `term` is a search term
 * `sortBy` can be one of
 *   - "Recently updated",
 *   - "Recently created",
 *   - "Least recently updated",
 *   - "Oldest",
 *   - "Lexicographic (A-Za-z)",
 *   - "Reverse Lexicographic (z-aZ-A)",
 * `category` can be one of:
 *   - 'own' - narratives created by the current user
 *   - 'shared' - narratives shared with the current user
 *   - 'tutorials' - public narratives that are tutorials
 *   - 'public' - all public narratives
 *   - 'pageSize' - page length for search results
 * returns a fetch Promise that results in SearchResults
 *
 * Authentication is a little tricky here. Unauthenticated searches are allowed for things
 * like tutorials and public narratives (and, later, for static narratives).
 * Authentication is required to search by owner. When an incorrect auth token
 * is given, regardless of data permissions, the search request will fail.
 *
 * This gets addressed in this function in the following way:
 *  1. if a user-based search (narratives owned by or shared by) is done, without a token available,
 *       this will throw an AuthError.
 *       (note that actually making the call without a token will just not
 *         return any results, this wraps that to make it obvious)
 *  2. if any search results in a 401 from the server (typically a present, but
 *       invalid, token), this also throws an AuthError.
 * @param {SearchOptions} options
 * @return {Promise<SearchResults>}
 */
const cache: Map<string, any> = new Map();

export interface SearchSummary {
    name: string;
    count: number;
}

function getCategoryFilter(name: string, username: string) {
    switch (name) {
        case 'own':
            return {
                name: 'own',
                filter: [
                    {
                        field: 'owner',
                        term: username,
                    },
                ],
            };
        case 'shared':
            return {
                name: 'shared',
                filter: [
                    {
                        field: 'owner',
                        not_term: username,
                    },
                    {
                        field: 'shared_users',
                        term: username,
                    },
                ],
            };
        case 'tutorials':
            return {
                name: 'tutorials',
                filter: [
                    {
                        field: 'is_narratorial',
                        term: true,
                    },
                ],
                access: { only_public: true },
            };
        case 'public':
            return {
                name: 'public',
                filter: [],
                access: { only_public: true },
            };
    }
}

export class NarrativeSearch {
    searchAPIURL: string;
    token: string;
    username: string;

    constructor({
        searchAPIURL,
        token,
        username,
    }: {
        searchAPIURL: string;
        token: string;
        username: string;
    }) {
        this.searchAPIURL = searchAPIURL;
        this.token = token;
        this.username = username;
    }

    clearCache() {
        cache.clear();
    }

    async searchSummary({
        query,
        category,
    }: SearchParams): Promise<SearchSummary> {
        const params: SearchWorkspaceParams = {
            types: ['KBaseNarrative.Narrative'],
            paging: {
                length: 0,
                offset: 0,
            },
            track_total_hits: false,
        };
        // if (query) {
        //     params.search = {
        //         query,
        //         fields: ['agg_fields'], // Search on all text fields
        //     };
        // }
        const { filter, access } = getCategoryFilter(category, this.username)!;
        params.filters = {
            operator: Operator.And,
            fields: filter,
        };
        if (access) {
            params.access = access;
        }

        const { count } = await this.searchWorkspace(params);
        return { name: category, count };
    }

    async searchSummaries({
        query,
    }: SearchParams): Promise<Array<SearchSummary>> {
        const params: SearchWorkspaceParams = {
            types: ['KBaseNarrative.Narrative'],
            paging: {
                length: 0,
                offset: 0,
            },
            track_total_hits: true,
        };
        if (query) {
            params.search = {
                query,
                fields: ['agg_fields'], // Search on all text fields
            };
        }
        params.filters = {
            operator: Operator.And,
            fields: [],
        };

        const username = this.username;

        const categories = [
            {
                name: 'own',
                filter: [
                    {
                        field: 'owner',
                        term: username,
                    },
                ],
            },
            {
                name: 'shared',
                filter: [
                    {
                        field: 'owner',
                        not_term: username,
                    },
                    {
                        field: 'shared_users',
                        term: username,
                    },
                ],
            },
            {
                name: 'tutorials',
                filter: [
                    {
                        field: 'is_narratorial',
                        term: true,
                    },
                ],
                access: { only_public: true },
            },
            {
                name: 'public',
                filter: [],
                access: { only_public: true },
            },
        ];

        return Promise.all(
            categories.map(async ({ name, filter, access }) => {
                const summaryParams = Object.assign({}, params);
                summaryParams.filters = {
                    operator: Operator.And,
                    fields: filter,
                };
                if (access) {
                    summaryParams.access = access;
                }

                const { count } = await this.searchWorkspace(summaryParams);
                return { name, count };
            })
        );
    }

    async searchNarratives({
        query,
        category,
        sort,
        offset,
        limit,
    }: SearchParams): Promise<SearchResults> {
        // TODO: should make this key deterministic; key order is not guaranteed.

        // disable caching, may not need it now.
        // const key = JSON.stringify(options);
        // if (cache.has(key)) {
        //     return cache.get(key);
        // }
        const params: SearchWorkspaceParams = {
            types: ['KBaseNarrative.Narrative'],
            paging: {
                length: limit,
                offset,
            },
            track_total_hits: true,
        };
        if (query) {
            params.search = {
                query,
                fields: ['agg_fields'], // Search on all text fields
            };
        }
        params.filters = {
            operator: Operator.And,
            fields: [],
        };

        const username = this.username;
        switch (category) {
            case 'own':
                params.filters.fields.push({
                    field: 'owner',
                    term: username,
                });
                break;
            case 'shared':
                params.filters.fields.push({
                    field: 'owner',
                    not_term: username,
                });
                params.filters.fields.push({
                    field: 'shared_users',
                    term: username,
                });
                break;
            case 'public':
                params.access = { only_public: true };
                break;
            case 'tutorials':
                params.access = { only_public: true };
                params.filters.fields.push({
                    field: 'is_narratorial',
                    term: true,
                });
                break;
            default:
                throw new Error('Unknown search category');
        }

        params.sorts = [['_score', SortDir.Desc]];

        if (sort === '-created') {
            params.sorts.unshift(['creation_date', SortDir.Desc]);
        } else if (sort === 'created') {
            params.sorts.unshift(['creation_date', SortDir.Asc]);
        } else if (sort === 'updated') {
            params.sorts.unshift(['timestamp', SortDir.Asc]);
        } else if (sort === '-updated') {
            params.sorts.unshift(['timestamp', SortDir.Desc]);
        } else if (sort === 'lex') {
            params.sorts.unshift(['narrative_title.raw', SortDir.Asc]);
        } else if (sort === '-lex') {
            params.sorts.unshift(['narrative_title.raw', SortDir.Desc]);
        } else {
            throw new Error('Unknown sorting method');
        }

        const result = await this.searchWorkspace(params);
        // cache.set(key, result);
        return result;
    }

    async searchNarrative(narrativeId: number): Promise<SearchResults> {
        const params: SearchWorkspaceParams = {
            types: ['KBaseNarrative.Narrative'],
            paging: {
                length: 1,
                offset: 0,
            },
            track_total_hits: false,
            filters: {
                operator: Operator.And,
                fields: [
                    {
                        field: 'access_group',
                        // TODO: when refactoring into full search api support,
                        // can use a direct field equality comparison.
                        range: {
                            min: narrativeId,
                            max: narrativeId,
                        },
                    },
                ],
            },
        };

        const result = await this.searchWorkspace(params);
        return result;
    }

    // TODO: Use the JSONRPC 2.0 client!!

    /**
     *
     *
     * @param {SearchParams} params - this takes a query, number of documents to skip,
     *   sort parameter, auth (boolean, true if we're looking up personal data), and pageSize
     */
    async searchWorkspace(
        params: SearchWorkspaceParams
    ): Promise<SearchResults> {
        const headers: { [key: string]: string } = {
            'Content-Type': 'application/json',
            Authorization: this.token,
        };

        const response = await fetch(this.searchAPIURL, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: Date.now(),
                method: 'search_workspace',
                params,
            }),
        });
        // TODO: [SCT-2925] JSON-RPC does not make any guarantees of an error status code.
        // I know that KBase does typically issue 500 for rpc errors, but even this is
        // not guaranteed. One should ignore the status and just look
        // at the rpc result, with an "error" property indicating an error, and
        // properties of that indicating the nature of the error, the most important
        // of which is the "code" and "message".
        // And, reporting the status to the user is not very useful, rather better to pick
        // up the error message, and even better to process the entire error object which
        // typically has additional useful information.

        if (!response.ok) {
            throw new Error(
                'An error occurred while searching - ' + response.status
            );
        }
        const { result } = await response.json();
        return result as unknown as SearchResults;
    }
}
