import { JSONObject } from '@kbase/ui-lib/lib/json';
import { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { AuthInfo } from '../../../contexts/Auth';
import { AsyncProcessStatus } from '../../../lib/AsyncProcess2';
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
import MessageQueue, { Queue } from './MessageQueue';
import {
    NarrativeSelectedBy,
    NavigatorContext,
    NavigatorContextState,
} from './NavigatorContext';

const BUFFER_INTERVAL = 200;

export class RollupBuffer<T> {
    interval: number;
    buffer: Array<T>;
    handler: (buffer: Array<T>) => void;
    intervalTimer: number | null;
    constructor(interval: number, handler: (buffer: Array<T>) => void) {
        this.interval = interval;
        this.buffer = [];
        this.handler = handler;
        this.intervalTimer = null;
    }

    add(item: T) {
        this.buffer.push(item);
        this.run();
    }

    run() {
        if (this.buffer.length === 0) {
            return;
        }
        if (this.intervalTimer !== null) {
            return;
        }
        window.setTimeout(() => {
            this.intervalTimer = null;
            this.rollup();
        }, this.interval);
    }

    rollup() {
        const buffer = this.buffer;
        this.buffer = [];
        try {
            this.handler(buffer);
        } catch (ex) {
            console.error('ERROR handling buffer', ex);
        }
    }
}

export interface SetRangePayload {
    from: number;
    to: number;
}

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
    dataModel: DataModel;
    setRangeBuffer = new RollupBuffer<SetRangePayload>(
        BUFFER_INTERVAL,
        this.handleSetRangeBuffer.bind(this)
    );
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
                    initialValue: this.props.detailOptions,
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

        this.dataModel = new DataModel({
            searchAPIURL: this.props.config.services.SearchAPI2.url,
            token: this.props.authInfo.token,
            username: this.props.authInfo.account.user,
        });

        this.messageQueue.register({
            name: 'setRange',
            task: (payload: JSONObject, queue: Queue<JSONObject>) => {
                return new Promise((resolve) => {
                    let nextQueue: Queue<JSONObject> | null = null;
                    const lastSuchItem = queue
                        .filter((item) => {
                            return item.item.name === 'setRange';
                        })
                        .slice(-1)[0];
                    if (lastSuchItem) {
                        nextQueue = queue.filter((item) => {
                            return item.item.name !== 'setRange';
                        });
                        payload = lastSuchItem.item.payload;
                    }

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
                                resolve(null);
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
                    resolve(nextQueue);
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
                            resolve(null);
                        }
                    );
                });
            },
        });

        this.messageQueue.register({
            name: 're-searching',
            task: (payload: JSONObject, queue: Queue<JSONObject>) => {
                // condense all the requests of this type to 1.
                let nextQueue: Queue<JSONObject> | null = null;
                // const lastSuchItem = queue
                //     .filter((item) => {
                //         return item.id === 're-search';
                //     })
                //     .slice(-1)[0];
                // if (lastSuchItem) {
                //     console.log(
                //         'hmm',
                //         queue.filter((item) => {
                //             return item.id === 're-search';
                //         }).length
                //     );
                //     nextQueue = queue.filter((item) => {
                //         return item.id !== 're-search';
                //     });
                //     payload = lastSuchItem.item.payload;
                // }

                const to = payload['to'] as number;
                const from = payload['from'] as number;
                return new Promise((resolve) => {
                    if (
                        this.state.navigatorContextState.searchState.status !==
                        SearchStatus.SEARCHED
                    ) {
                        resolve(null);
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
                            resolve(nextQueue);
                        }
                    );
                });
            },
        });

        this.messageQueue.register({
            name: 'searching',
            task: (payload: JSONObject, queue: Queue<JSONObject>) => {
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
                            resolve(null);
                        }
                    );
                });
            },
        });

        this.messageQueue.register({
            name: 'search',
            task: (payload: JSONObject, queue: Queue<JSONObject>) => {
                return new Promise(async (resolve, reject) => {
                    switch (
                        this.state.navigatorContextState.searchState.status
                    ) {
                        case SearchStatus.NONE:
                        case SearchStatus.INITIAL:
                        case SearchStatus.ERROR:
                            resolve(null);
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

                    const { narratives, totalCount, filterCount } =
                        await this.dataModel.searchFromSearchParams(
                            searchParams
                        );

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
                            ...nextState.navigatorContextState
                                .selectedNarrative,
                            status: AsyncProcessStatus.SUCCESS,
                            value: {
                                narrativeDoc: narratives[0],
                            },
                        };
                    }

                    this.setState(nextState, () => {
                        resolve(null);
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

    handleSetRangeBuffer(buffer: Array<SetRangePayload>) {
        // We want to process the buffer to fetch from the
        // minimal from, to the maximum to.
        if (buffer.length === 0) {
            return;
        }

        let minFrom = buffer[0].from;
        let maxTo = buffer[0].to;

        for (const { from, to } of buffer) {
            minFrom = Math.min(minFrom, from);
            maxTo = Math.max(maxTo, to);
        }

        this.messageQueue.send({
            name: 'setRange',
            payload: { from: minFrom, to: maxTo },
        });
    }

    setRange(from: number, to: number) {
        // Buffer set range requests.
        this.setRangeBuffer.add({ from, to });
    }

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
                    ...this.state.navigatorContextState.selectedNarrative,
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
                        ...this.state.navigatorContextState.selectedNarrative,
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
                        ...this.state.navigatorContextState.selectedNarrative,
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

                const { narratives, totalCount, filterCount } =
                    await this.dataModel.searchFromSearchParams(searchParams);

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
                        ...this.state.navigatorContextState.selectedNarrative,
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
