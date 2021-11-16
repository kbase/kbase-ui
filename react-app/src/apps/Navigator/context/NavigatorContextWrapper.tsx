import { JSONObject } from '@kbase/ui-lib/lib/json';
import { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { AuthInfo } from '../../../contexts/Auth';
import { AsyncProcessStatus } from '../../../lib/AsyncProcess';
import { Config } from '../../../types/config';
import Tasks from '../components/NarrativeList/Tasks';

import { Row } from '../components/ScalableScroller/DataProviderState';
import { NarrativeSearchDoc } from '../utils/NarrativeModel';
import {
    NarrativeSearch,
    SearchOptions,
    SearchParams,
} from '../utils/NarrativeSearch';
// import ActionQueue from './ActionQueue';
import { DataModel, SearchStatus, DetailOptions } from './DataModel';
import MessageQueue from './MessageQueue';
import {
    NarrativeSelectedBy,
    NavigatorContext,
    NavigatorContextState,
} from './NavigatorContext';

export interface NavigatorContextWrapperProps {
    authInfo: AuthInfo;
    config: Config;
    routeProps: RouteComponentProps;
    searchOptions: SearchOptions;
    detailOptions: DetailOptions;
}

interface NavigatorContextWrapperState {
    navigatorContextState: NavigatorContextState;
}

export default class NavigatorContextWrapper extends Component<
    NavigatorContextWrapperProps,
    NavigatorContextWrapperState
> {
    cache: Array<Row<NarrativeSearchDoc>>;
    searchTasks: Tasks;
    // actionQueue: ActionQueue;
    messageQueue: MessageQueue<JSONObject>;

    constructor(props: NavigatorContextWrapperProps) {
        super(props);
        this.cache = [];
        // this.searchRequests = [];
        this.searchTasks = new Tasks({ interval: 100 });
        // this.actionQueue = new ActionQueue(100);
        this.messageQueue = new MessageQueue<JSONObject>(100);
        this.state = {
            navigatorContextState: {
                searchState: {
                    status: SearchStatus.INITIAL,
                    detailOptions: this.props.detailOptions,
                    searchOptions: this.props.searchOptions,
                },
                selectedNarrative: {
                    status: AsyncProcessStatus.NONE,
                },
                userInteractions: {
                    narrativeSelectedBy: NarrativeSelectedBy.NONE,
                },
                selectNarrative: this.selectNarrative.bind(this),
                setCategory: this.setCategory.bind(this),
                setSort: this.setSort.bind(this),
                setQuery: this.setQuery.bind(this),
                setRange: this.setRange.bind(this),
                refresh: this.refresh.bind(this),

                // fetchRows: this.fetchRows.bind(this),
            },
        };

        this.messageQueue.register({
            name: 'setRange',
            task: (payload: JSONObject) => {
                return new Promise((resolve) => {
                    switch (
                        this.state.navigatorContextState.searchState.status
                    ) {
                        case SearchStatus.NONE:
                        case SearchStatus.ERROR:
                        case SearchStatus.RE_SEARCHING:
                        case SearchStatus.SEARCHING:
                            break;
                        case SearchStatus.INITIAL: {
                            this.messageQueue.send({
                                name: 'measured',
                                payload,
                            });
                            this.messageQueue.send({
                                name: 'search',
                                payload: {},
                            });
                            break;
                        }
                        case SearchStatus.SEARCHED: {
                            const { offset, limit } =
                                this.state.navigatorContextState.searchState
                                    .searchParams;
                            const from = payload['from'] as number;
                            const to = payload['to'] as number;
                            if (offset === from && offset + limit === to) {
                                console.warn('supressing duplicate');
                                resolve();
                                return;
                            }
                            this.messageQueue.send({
                                name: 're-searching',
                                payload,
                            });
                            this.messageQueue.send({
                                name: 'search',
                                payload: {},
                            });
                            break;
                        }
                        case SearchStatus.MEASURED:
                        case SearchStatus.SEARCHED_NOT_FOUND: {
                            this.messageQueue.send({
                                name: 'searching',
                                payload,
                            });
                            this.messageQueue.send({
                                name: 'search',
                                payload: {},
                            });
                            break;
                        }
                    }
                    resolve();
                });
            },
        });

        this.messageQueue.register({
            name: 'measured',
            task: (payload: JSONObject) => {
                const to = payload['to'] as number;
                const from = payload['from'] as number;
                return new Promise((resolve) => {
                    if (
                        this.state.navigatorContextState.searchState.status !==
                        SearchStatus.INITIAL
                    ) {
                        return;
                    }
                    const searchParams: SearchParams = Object.assign(
                        {},
                        this.state.navigatorContextState.searchState
                            .searchOptions,
                        {
                            offset: from,
                            limit: to - from + 1,
                        }
                    );
                    this.setState(
                        {
                            ...this.state,
                            navigatorContextState: {
                                ...this.state.navigatorContextState,
                                searchState: {
                                    ...this.state.navigatorContextState
                                        .searchState,
                                    status: SearchStatus.MEASURED,
                                    searchParams,
                                },
                            },
                        },
                        () => {
                            resolve();
                        }
                    );
                });
            },
        });

        this.messageQueue.register({
            name: 're-searching',
            task: (payload: JSONObject) => {
                const to = payload['to'] as number;
                const from = payload['from'] as number;
                return new Promise((resolve) => {
                    if (
                        this.state.navigatorContextState.searchState.status !==
                        SearchStatus.SEARCHED
                    ) {
                        return;
                    }
                    const searchParams = Object.assign(
                        {},
                        this.state.navigatorContextState.searchState
                            .searchParams
                    );
                    searchParams.offset = from;
                    searchParams.limit = to - from + 1;
                    this.setState(
                        {
                            ...this.state,
                            navigatorContextState: {
                                ...this.state.navigatorContextState,
                                searchState: {
                                    ...this.state.navigatorContextState
                                        .searchState,
                                    status: SearchStatus.RE_SEARCHING,
                                    searchParams,
                                },
                            },
                        },
                        () => {
                            resolve();
                        }
                    );
                });
            },
        });

        this.messageQueue.register({
            name: 'searching',
            task: (payload: JSONObject) => {
                const to = payload['to'] as number;
                const from = payload['from'] as number;
                return new Promise((resolve) => {
                    if (
                        !(
                            this.state.navigatorContextState.searchState
                                .status === SearchStatus.MEASURED ||
                            this.state.navigatorContextState.searchState
                                .status === SearchStatus.SEARCHED_NOT_FOUND
                        )
                    ) {
                        return;
                    }
                    const searchParams = Object.assign(
                        {},
                        this.state.navigatorContextState.searchState
                            .searchParams
                    );
                    searchParams.offset = from;
                    searchParams.limit = to - from + 1;
                    this.setState(
                        {
                            ...this.state,
                            navigatorContextState: {
                                ...this.state.navigatorContextState,
                                searchState: {
                                    ...this.state.navigatorContextState
                                        .searchState,
                                    status: SearchStatus.SEARCHING,
                                    searchParams,
                                },
                            },
                        },
                        () => {
                            resolve();
                        }
                    );
                });
            },
        });

        this.messageQueue.register({
            name: 'search',
            task: (payload: JSONObject) => {
                return new Promise<void>(async (resolve, reject) => {
                    switch (
                        this.state.navigatorContextState.searchState.status
                    ) {
                        case SearchStatus.NONE:
                        case SearchStatus.INITIAL:
                        case SearchStatus.ERROR:
                            return;
                        case SearchStatus.MEASURED:
                        case SearchStatus.SEARCHING:
                        case SearchStatus.SEARCHED:
                        case SearchStatus.SEARCHED_NOT_FOUND:
                        case SearchStatus.RE_SEARCHING:
                    }

                    const searchParams =
                        this.state.navigatorContextState.searchState
                            .searchParams;

                    const dataModel = new DataModel({
                        searchAPIURL: this.props.config.services.SearchAPI2.url,
                        token: this.props.authInfo.token,
                        username: this.props.authInfo.account.user,
                    });
                    const { narratives, totalCount, filterCount } =
                        await dataModel.searchFromSearchParams(searchParams);

                    const items = narratives.map((narrative, index) => {
                        return {
                            index: index + searchParams.offset,
                            value: narrative,
                        };
                    });

                    const nextState: NavigatorContextWrapperState = {
                        ...this.state,
                        navigatorContextState: {
                            ...this.state.navigatorContextState,
                            searchState: {
                                ...this.state.navigatorContextState.searchState,
                                status: SearchStatus.SEARCHED,
                                items,
                                filterCount,
                                totalCount,
                            },
                        },
                    };
                    const selectedBy =
                        nextState.navigatorContextState.userInteractions
                            .narrativeSelectedBy;
                    if (
                        (selectedBy === NarrativeSelectedBy.NONE ||
                            selectedBy === NarrativeSelectedBy.SEARCH) &&
                        narratives.length > 0
                    ) {
                        nextState.navigatorContextState.selectedNarrative = {
                            status: AsyncProcessStatus.SUCCESS,
                            value: {
                                narrativeDoc: narratives[0],
                            },
                        };
                    }

                    this.setState(nextState, () => {
                        resolve();
                    });
                });
            },
        });
    }

    componentDidMount() {
        // nothing to do for initial search results, since the narrative list will need to
        // inspect itself first to see how many rows to return.
        //
        // but will need to incorporate the search params...
        // and may need to fetch a narrative for showing the detail.
        if (this.props.detailOptions.narrativeId) {
            this.selectNarrative(this.props.detailOptions.narrativeId);
        }
    }

    setRange(from: number, to: number) {
        // First save the category

        this.messageQueue.send({
            name: 'setRange',
            payload: { from, to },
        });
        // this.messageQueue.send({
        //     name: 'measured',
        //     payload: { from, to },
        // });
        // this.messageQueue.send({
        //     name: 'search',
        //     payload: { from, to },
        // });
        // this.actionQueue.add(() => {
        //     const subQueue = new ActionQueue(0);
        //     return new Promise((resolve) => {
        //         switch (this.state.navigatorContextState.searchState.status) {
        //             case SearchStatus.NONE:
        //             case SearchStatus.ERROR:
        //             case SearchStatus.RE_SEARCHING:
        //             case SearchStatus.SEARCHING:
        //                 console.log('skipping search...', from, to);
        //                 return;
        //             case SearchStatus.INITIAL: {
        //                 subQueue.add(() => {
        //                     const searchParams: SearchParams = Object.assign(
        //                         {},
        //                         this.state.navigatorContextState.searchState
        //                             .searchOptions,
        //                         {
        //                             offset: from,
        //                             limit: to - from + 1,
        //                         }
        //                     );
        //                     this.setState(
        //                         {
        //                             ...this.state,
        //                             navigatorContextState: {
        //                                 ...this.state.navigatorContextState,
        //                                 searchState: {
        //                                     ...this.state.navigatorContextState
        //                                         .searchState,
        //                                     status: SearchStatus.MEASURED,
        //                                     searchParams,
        //                                 },
        //                             },
        //                         },
        //                         () => {
        //                             this.search(searchParams);
        //                         }
        //                     );
        //                 })
        //                 const searchParams: SearchParams = Object.assign(
        //                     {},
        //                     this.state.navigatorContextState.searchState.searchOptions,
        //                     {
        //                         offset: from,
        //                         limit: to - from + 1,
        //                     }
        //                 );
        //                 this.setState(
        //                     {
        //                         ...this.state,
        //                         navigatorContextState: {
        //                             ...this.state.navigatorContextState,
        //                             searchState: {
        //                                 ...this.state.navigatorContextState.searchState,
        //                                 status: SearchStatus.MEASURED,
        //                                 searchParams,
        //                             },
        //                         },
        //                     },
        //                     () => {
        //                         this.search(searchParams);
        //                     }
        //                 );
        //                 break;
        //             }
        //             case SearchStatus.SEARCHED: {
        //                 const searchParams = Object.assign(
        //                     {},
        //                     this.state.navigatorContextState.searchState.searchParams
        //                 );
        //                 searchParams.offset = from;
        //                 searchParams.limit = to - from + 1;
        //                 this.setState(
        //                     {
        //                         ...this.state,
        //                         navigatorContextState: {
        //                             ...this.state.navigatorContextState,
        //                             searchState: {
        //                                 ...this.state.navigatorContextState.searchState,
        //                                 status: SearchStatus.RE_SEARCHING,
        //                                 searchParams,
        //                             },
        //                         },
        //                     },
        //                     () => {
        //                         this.search(searchParams);
        //                     }
        //                 );
        //                 break;
        //             }
        //             case SearchStatus.MEASURED:
        //             case SearchStatus.SEARCHED_NOT_FOUND: {
        //                 const searchParams = Object.assign(
        //                     {},
        //                     this.state.navigatorContextState.searchState.searchParams
        //                 );
        //                 searchParams.offset = from;
        //                 searchParams.limit = to - from + 1;
        //                 this.setState(
        //                     {
        //                         ...this.state,
        //                         navigatorContextState: {
        //                             ...this.state.navigatorContextState,
        //                             searchState: {
        //                                 ...this.state.navigatorContextState.searchState,
        //                                 status: SearchStatus.SEARCHING,
        //                                 searchParams,
        //                             },
        //                         },
        //                     },
        //                     () => {
        //                         this.search(searchParams);
        //                     }
        //                 );
        //                 break;
        //             }
        //         }
    }

    // xsetRange(from: number, to: number) {
    //     // First save the category
    //     switch (this.state.navigatorContextState.searchState.status) {
    //         case SearchStatus.NONE:
    //         case SearchStatus.ERROR:
    //         case SearchStatus.RE_SEARCHING:
    //         case SearchStatus.SEARCHING:
    //             console.log('skipping search...', from, to);
    //             return;
    //         case SearchStatus.INITIAL: {
    //             const searchParams: SearchParams = Object.assign(
    //                 {},
    //                 this.state.navigatorContextState.searchState.searchOptions,
    //                 {
    //                     offset: from,
    //                     limit: to - from + 1,
    //                 }
    //             );
    //             this.setState(
    //                 {
    //                     ...this.state,
    //                     navigatorContextState: {
    //                         ...this.state.navigatorContextState,
    //                         searchState: {
    //                             ...this.state.navigatorContextState.searchState,
    //                             status: SearchStatus.MEASURED,
    //                             searchParams,
    //                         },
    //                     },
    //                 },
    //                 () => {
    //                     this.search(searchParams);
    //                 }
    //             );
    //             break;
    //         }
    //         case SearchStatus.SEARCHED: {
    //             const searchParams = Object.assign(
    //                 {},
    //                 this.state.navigatorContextState.searchState.searchParams
    //             );
    //             searchParams.offset = from;
    //             searchParams.limit = to - from + 1;
    //             this.setState(
    //                 {
    //                     ...this.state,
    //                     navigatorContextState: {
    //                         ...this.state.navigatorContextState,
    //                         searchState: {
    //                             ...this.state.navigatorContextState.searchState,
    //                             status: SearchStatus.RE_SEARCHING,
    //                             searchParams,
    //                         },
    //                     },
    //                 },
    //                 () => {
    //                     this.search(searchParams);
    //                 }
    //             );
    //             break;
    //         }
    //         case SearchStatus.MEASURED:
    //         case SearchStatus.SEARCHED_NOT_FOUND: {
    //             const searchParams = Object.assign(
    //                 {},
    //                 this.state.navigatorContextState.searchState.searchParams
    //             );
    //             searchParams.offset = from;
    //             searchParams.limit = to - from + 1;
    //             this.setState(
    //                 {
    //                     ...this.state,
    //                     navigatorContextState: {
    //                         ...this.state.navigatorContextState,
    //                         searchState: {
    //                             ...this.state.navigatorContextState.searchState,
    //                             status: SearchStatus.SEARCHING,
    //                             searchParams,
    //                         },
    //                     },
    //                 },
    //                 () => {
    //                     this.search(searchParams);
    //                 }
    //             );
    //             break;
    //         }
    //     }
    // }

    setCategory(category: string) {
        // First save the category
        switch (this.state.navigatorContextState.searchState.status) {
            case SearchStatus.NONE:
            case SearchStatus.INITIAL:
            case SearchStatus.ERROR:
            case SearchStatus.RE_SEARCHING:
            case SearchStatus.SEARCHING:
                return;
        }

        const searchParams = Object.assign(
            {},
            this.state.navigatorContextState.searchState.searchParams
        );
        searchParams.category = category;

        switch (this.state.navigatorContextState.searchState.status) {
            case SearchStatus.SEARCHED:
                this.setState({
                    ...this.state,
                    navigatorContextState: {
                        ...this.state.navigatorContextState,
                        searchState: {
                            ...this.state.navigatorContextState.searchState,
                            status: SearchStatus.RE_SEARCHING,
                            searchParams,
                        },
                    },
                });
                break;
            case SearchStatus.MEASURED:
            case SearchStatus.SEARCHED_NOT_FOUND:
                this.setState({
                    ...this.state,
                    navigatorContextState: {
                        ...this.state.navigatorContextState,
                        searchState: {
                            ...this.state.navigatorContextState.searchState,
                            status: SearchStatus.SEARCHING,
                            searchParams,
                        },
                    },
                });
                break;
        }

        this.search(searchParams);
    }

    setSort(sort: string) {
        // First save the category
        switch (this.state.navigatorContextState.searchState.status) {
            case SearchStatus.NONE:
            case SearchStatus.INITIAL:
            case SearchStatus.ERROR:
            case SearchStatus.RE_SEARCHING:
            case SearchStatus.SEARCHING:
                return;
        }

        const searchParams = Object.assign(
            {},
            this.state.navigatorContextState.searchState.searchParams
        );
        searchParams.sort = sort;

        switch (this.state.navigatorContextState.searchState.status) {
            case SearchStatus.SEARCHED:
                this.setState({
                    ...this.state,
                    navigatorContextState: {
                        ...this.state.navigatorContextState,
                        searchState: {
                            ...this.state.navigatorContextState.searchState,
                            status: SearchStatus.RE_SEARCHING,
                            searchParams,
                        },
                    },
                });
                break;
            case SearchStatus.MEASURED:
            case SearchStatus.SEARCHED_NOT_FOUND:
                this.setState({
                    ...this.state,
                    navigatorContextState: {
                        ...this.state.navigatorContextState,
                        searchState: {
                            ...this.state.navigatorContextState.searchState,
                            status: SearchStatus.SEARCHING,
                            searchParams,
                        },
                    },
                });
                break;
        }

        this.search(searchParams);
    }

    setQuery(query: string) {
        // First save the category
        switch (this.state.navigatorContextState.searchState.status) {
            case SearchStatus.NONE:
            case SearchStatus.INITIAL:
            case SearchStatus.ERROR:
            case SearchStatus.RE_SEARCHING:
            case SearchStatus.SEARCHING:
                return;
        }

        const searchParams = Object.assign(
            {},
            this.state.navigatorContextState.searchState.searchParams
        );
        searchParams.query = query;

        switch (this.state.navigatorContextState.searchState.status) {
            case SearchStatus.SEARCHED:
                this.setState({
                    ...this.state,
                    navigatorContextState: {
                        ...this.state.navigatorContextState,
                        searchState: {
                            ...this.state.navigatorContextState.searchState,
                            status: SearchStatus.RE_SEARCHING,
                            searchParams,
                        },
                    },
                });
                break;
            case SearchStatus.MEASURED:
            case SearchStatus.SEARCHED_NOT_FOUND:
                this.setState({
                    ...this.state,
                    navigatorContextState: {
                        ...this.state.navigatorContextState,
                        searchState: {
                            ...this.state.navigatorContextState.searchState,
                            status: SearchStatus.SEARCHING,
                            searchParams,
                        },
                    },
                });
                break;
        }

        this.search(searchParams);
    }

    refresh() {
        // First save the category
        switch (this.state.navigatorContextState.searchState.status) {
            case SearchStatus.NONE:
            case SearchStatus.INITIAL:
            case SearchStatus.ERROR:
            case SearchStatus.RE_SEARCHING:
            case SearchStatus.SEARCHING:
                return;
        }

        const searchParams = Object.assign(
            {},
            this.state.navigatorContextState.searchState.searchParams
        );

        switch (this.state.navigatorContextState.searchState.status) {
            case SearchStatus.SEARCHED:
                this.setState({
                    ...this.state,
                    navigatorContextState: {
                        ...this.state.navigatorContextState,
                        searchState: {
                            ...this.state.navigatorContextState.searchState,
                            status: SearchStatus.RE_SEARCHING,
                            searchParams,
                        },
                    },
                });
                break;
            case SearchStatus.MEASURED:
            case SearchStatus.SEARCHED_NOT_FOUND:
                this.setState({
                    ...this.state,
                    navigatorContextState: {
                        ...this.state.navigatorContextState,
                        searchState: {
                            ...this.state.navigatorContextState.searchState,
                            status: SearchStatus.SEARCHING,
                            searchParams,
                        },
                    },
                });
                break;
        }

        this.search(searchParams);
    }

    async selectNarrative(narrativeId: number) {
        this.setState({
            navigatorContextState: {
                ...this.state.navigatorContextState,
                selectedNarrative: {
                    status: AsyncProcessStatus.PENDING,
                },
            },
        });
        try {
            const search = new NarrativeSearch({
                searchAPIURL: this.props.config.services.SearchAPI2.url,
                token: this.props.authInfo.token,
                username: this.props.authInfo.account.user,
            });
            const result = await search.searchNarrative(narrativeId);
            if (result.hits.length === 0) {
                throw new Error(`Narrative ${narrativeId} not found`);
            }
            const narrativeDoc = result.hits[0];
            this.setState({
                navigatorContextState: {
                    ...this.state.navigatorContextState,
                    userInteractions: {
                        narrativeSelectedBy: NarrativeSelectedBy.USER,
                    },
                    selectedNarrative: {
                        status: AsyncProcessStatus.SUCCESS,
                        value: {
                            narrativeDoc,
                        },
                    },
                },
            });
        } catch (ex) {
            this.setState({
                navigatorContextState: {
                    ...this.state.navigatorContextState,
                    selectedNarrative: {
                        status: AsyncProcessStatus.ERROR,
                        error:
                            ex instanceof Error ? ex.message : 'Unknown error',
                    },
                },
            });
        }
    }

    async search(searchParams: SearchParams) {
        this.searchTasks.add(() => {
            return new Promise<void>(async (resolve, reject) => {
                switch (this.state.navigatorContextState.searchState.status) {
                    case SearchStatus.NONE:
                    case SearchStatus.INITIAL:
                    case SearchStatus.ERROR:
                        return;
                    case SearchStatus.MEASURED:
                    case SearchStatus.SEARCHING:
                    case SearchStatus.SEARCHED:
                    case SearchStatus.SEARCHED_NOT_FOUND:
                    case SearchStatus.RE_SEARCHING:
                }

                const dataModel = new DataModel({
                    searchAPIURL: this.props.config.services.SearchAPI2.url,
                    token: this.props.authInfo.token,
                    username: this.props.authInfo.account.user,
                });
                const { narratives, totalCount, filterCount } =
                    await dataModel.searchFromSearchParams(searchParams);

                const items = narratives.map((narrative, index) => {
                    return {
                        index: index + searchParams.offset,
                        value: narrative,
                    };
                });

                const nextState: NavigatorContextWrapperState = {
                    ...this.state,
                    navigatorContextState: {
                        ...this.state.navigatorContextState,
                        searchState: {
                            ...this.state.navigatorContextState.searchState,
                            status: SearchStatus.SEARCHED,
                            items,
                            filterCount,
                            totalCount,
                        },
                    },
                };
                const selectedBy =
                    nextState.navigatorContextState.userInteractions
                        .narrativeSelectedBy;
                if (
                    (selectedBy === NarrativeSelectedBy.NONE ||
                        selectedBy === NarrativeSelectedBy.SEARCH) &&
                    narratives.length > 0
                ) {
                    nextState.navigatorContextState.selectedNarrative = {
                        status: AsyncProcessStatus.SUCCESS,
                        value: {
                            narrativeDoc: narratives[0],
                        },
                    };
                }

                this.setState(nextState, () => {
                    resolve();
                });
            });
        });
    }

    render() {
        return (
            <NavigatorContext.Provider value={this.state.navigatorContextState}>
                {this.props.children}
            </NavigatorContext.Provider>
        );
    }
}
