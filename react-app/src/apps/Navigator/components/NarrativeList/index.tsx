import React, {Component} from 'react';

// Components
import {Filters} from './Filters';
import {ItemList} from './ItemList';
import NarrativeDetails from '../NarrativeDetails';
import {Doc} from '../../utils/NarrativeModel';

// Utils
import {keepParamsLinkTo} from '../utils';
import {NarrativeSearch, SearchOptions, sorts,} from '../../utils/NarrativeSearch';
import {AuthInfo} from "../../../../contexts/Auth";
import {Config} from "../../../../types/config";
import {Tab, Tabs} from "react-bootstrap";


// Page length of search results
const PAGE_SIZE = 20;

// const NEW_NARR_URL = Runtime.getConfig().host_root + '/#narrativemanager/new';

interface Props {
    authInfo: AuthInfo;
    category: string;
    // history: History;
    id: number;
    limit: number;
    obj: number;
    search: string;
    sort: string;
    ver: number;
    view: string;
    config: Config;
}

interface State {
    // Currently activated narrative details
    activeIdx: number;
    // List of objects of narrative details
    items: Array<Doc>;
    // Whether we are loading data from the server
    loading: boolean;
    // Parameters to send to searchNarratives
    searchParams: SearchOptions;
    totalItems: number;
}

const upaKey = (id: number, obj: number, ver: number) => `${id}/${obj}/${ver}`;

// This is a parent component to everything in the narrative browser (tabs,
// filters, search results, details, etc)
export class NarrativeList extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        const {category, limit, search, sort} = this.props;
        const sortDefault = Object.keys(sorts)[0];
        this.state = {
            // Currently active narrative result, selected on the left and shown on the right
            // This is unused if the items array is empty.
            activeIdx: 0,
            // List of narrative data
            items: [],
            loading: false,
            // parameters to send to the searchNarratives function
            searchParams: {
                term: search,
                sort: sort || sortDefault,
                category,
                pageSize: limit || PAGE_SIZE,
            },
            totalItems: 0,
        };
    }

    async componentDidMount() {
        this.performSearch();
    }

    async componentDidUpdate(prevProps: Props) {
        const {category, search} = this.props;
        const pageSize = this.props.limit || PAGE_SIZE;
        const sort = this.props.sort;
        const nextSearchParams = {term: search, sort, category, pageSize};
        const performSearchCondition =
            prevProps.category !== this.props.category ||
            prevProps.id !== this.props.id ||
            prevProps.limit !== this.props.limit ||
            prevProps.search !== this.props.search ||
            prevProps.sort !== this.props.sort;
        if (performSearchCondition) {
            await this.performSearch(nextSearchParams);
            this.setState({
                searchParams: nextSearchParams,
            });
        }
    }

    // Handle an onSetSearch callback from Filters
    async handleSearch(
        searchP: { term: string; sort: string },
        invalidateCache: boolean = false
    ): Promise<void> {
        const searchParams = this.state.searchParams;
        searchParams.term = searchP.term;
        searchParams.sort = searchP.sort;
        await this.performSearch(searchParams, invalidateCache);
    }

    // Handle an onSelectItem callback from ItemList
    // Receives the index of the selected item
    handleSelectItem(idx: number) {
        this.setState({activeIdx: idx});
    }

    // Perform a search and return the Promise for the fetch
    async performSearch(
        searchParams?: SearchOptions,
        invalidateCache: boolean = false
    ) {
        if (!searchParams) {
            searchParams = this.state.searchParams;
        }
        this.setState({loading: true});
        const requestedId = this.props.id;

        const narrativeSearch = new NarrativeSearch({
            searchAPIURL: this.props.config.services.SearchAPI2.url,
            token: this.props.authInfo.token,
            username: this.props.authInfo.account.user
        });

        if (invalidateCache) {
            narrativeSearch.clearCache();
        }

        const resp = await narrativeSearch.searchNarratives(searchParams);

        // TODO handle error from server
        if (!resp || !resp.hits) {
            return;
        }
        const total = resp.count;
        const items = resp.hits;
        // Is the requested id in these results?
        const requestedItemArr = items
            .map<[number, Doc]>((item, idx) => [idx, item])
            .filter(([idx, item]) => item.access_group === requestedId);
        let requestedItemIdx = 0;
        if (requestedItemArr.length === 1) {
            requestedItemIdx = requestedItemArr[0][0];
        }
        // If we are loading a subsequent page, append to items. Otherwise, replace them.
        // console.log('hmm', requestedItemIdx, items, total);
        // return;
        this.setState({
            activeIdx: requestedItemIdx,
            items,
            loading: false,
            totalItems: total,
        });
    }

    render() {
        const {category, id, obj, sort, view, ver} = this.props;
        const upa = upaKey(id, obj, ver);
        const keepSort = (link: string) =>
            keepParamsLinkTo(['sort', 'search'], link);
        // const tabs = Object.entries({
        //   own: {
        //     name: 'My Narratives',
        //     link: keepSort('/'),
        //   },
        //   shared: {
        //     name: 'Shared With Me',
        //     link: keepSort('/shared/'),
        //   },
        //   tutorials: {
        //     name: 'Tutorials',
        //     link: keepSort('/tutorials/'),
        //   },
        //   public: {
        //     name: 'Public',
        //     link: keepSort('/public/'),
        //   },
        // });

        const activeItem = this.state.items[this.state.activeIdx];

        return (
            <div className="container-fluid">

                <div className="row">
                    {/* Search, sort, filter */}
                    <Filters
                        category={category}
                        // history={this.props.history}
                        loading={this.state.loading}
                        onSetSearch={this.handleSearch.bind(this)}
                        search={this.props.search}
                        sort={sort}
                    />
                </div>

                <div className="row" style={{marginTop: '10px', height: '100%'}}>
                    <div className="col col-md-5">
                        <Tabs variant="tabs">
                            <Tab eventKey="my-narratives" title="My Narratives">
                                <ItemList
                                    category='own'
                                    items={this.state.items}
                                    loading={this.state.loading}
                                    onSelectItem={this.handleSelectItem.bind(this)}
                                    pageSize={PAGE_SIZE}
                                    selected={upa}
                                    selectedIdx={this.state.activeIdx}
                                    sort={sort}
                                    totalItems={this.state.totalItems}
                                />
                            </Tab>
                            <Tab eventKey="shared-with-me" title="Shared With Me">
                                <ItemList
                                    category='shared'
                                    items={this.state.items}
                                    loading={this.state.loading}
                                    onSelectItem={this.handleSelectItem.bind(this)}
                                    pageSize={PAGE_SIZE}
                                    selected={upa}
                                    selectedIdx={this.state.activeIdx}
                                    sort={sort}
                                    totalItems={this.state.totalItems}
                                />
                            </Tab>
                            <Tab eventKey="tutorials" title="Tutorials">
                                <ItemList
                                    category='narratorials'
                                    items={this.state.items}
                                    loading={this.state.loading}
                                    onSelectItem={this.handleSelectItem.bind(this)}
                                    pageSize={PAGE_SIZE}
                                    selected={upa}
                                    selectedIdx={this.state.activeIdx}
                                    sort={sort}
                                    totalItems={this.state.totalItems}
                                />
                            </Tab>
                            <Tab eventKey="public" title="Public">
                                <ItemList
                                    category='public'
                                    items={this.state.items}
                                    loading={this.state.loading}
                                    onSelectItem={this.handleSelectItem.bind(this)}
                                    pageSize={PAGE_SIZE}
                                    selected={upa}
                                    selectedIdx={this.state.activeIdx}
                                    sort={sort}
                                    totalItems={this.state.totalItems}
                                />
                            </Tab>

                            <div>
                                <a
                                    className="btn btn-primary narrative-new"
                                    href='/#narrativemanager/new'
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <i className="mr1 fa fa-plus"></i> New Narrative
                                </a>
                            </div>

                        </Tabs>
                        {/*<TabHeader tabs={tabs} selected={category} />*/}
                    </div>

                    <div className="col col-md-7">
                        {activeItem ? (
                            <NarrativeDetails
                                authInfo={this.props.authInfo}
                                activeItem={activeItem}
                                view={view}
                                updateSearch={() => {
                                    this.performSearch();
                                }}
                                config={this.props.config}
                            />
                        ) : null}
                    </div>
                </div>
            </div>
        );
    }
}
