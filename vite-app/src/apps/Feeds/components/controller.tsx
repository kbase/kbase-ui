// define(['../api/feeds', './globalPoster', './feedTabs', '../util'], function (FeedsAPI, GlobalPoster, FeedTabs, Util) {

import ErrorAlert from "components/ErrorAlert";
import Loading from "components/Loading";

import { RouteProps } from "components/Router2";
import { AuthenticationStateAuthenticated, notifyError } from "contexts/EuropaContext";
import { RepeatAsyncProcess, RepeatAsyncProcessStatus } from "lib/RepeatableAsyncProcess";
import { SimpleError } from "lib/SimpleError";
import { Feed, FeedNotification, FeedsClient, UnseenNotificationCount } from "lib/clients/Feeds";
import { Component } from "react";
import { Config } from "types/config";
// import { Feed, FeedsAPI, Notifications, UnseenNotificationCount } from "../api/Feeds";
import AsyncQueue from "apps/Navigator/components/NarrativeList/AsyncQueue";
import { Monitor } from "lib/Monitor";
import { navigate2 } from "lib/navigation";
import FeedsView, { FeedsLayout } from "./view";


const FEEDS_ADMIN_ROLE = 'FEEDS_ADMIN';

export interface FeedsControllerProps  extends RouteProps {
    config: Config;
    authState: AuthenticationStateAuthenticated;
    setTitle: (title: string) => void;
}

export interface FeedWithId {
    id: string;
    feed: Feed;
}

export interface Filterable<T> {
    show: boolean;
    value: T;
}

export type FeedsFilter = 'all' | 'unseen';
export type NotificationsFilter = 'all' | 'unssen';

export interface FilterData {
    feedsFilter: FeedsFilter;
    allFeeds: Array<Filterable<FeedWithId>>;
    feedsMap: Record<string, Filterable<FeedWithId>>;

    global?: FeedWithId;
    user?: FeedWithId;
    userFeeds: Array<FeedWithId>;
    notifications: Array<FeedNotification>;
    selectedFeed?: FeedWithId;
}

export interface FeedData extends FilterData{
    isAdmin: boolean;
    // global: Filterable<FeedWithId>;
    // user: Filterable<FeedWithId>;
    // feeds: Array<FeedWithId>;
    // userFeeds: Array<Filterable<FeedWithId>>;
    // allFeeds: Array<Filterable<FeedWithId>>;
    // feedsMap: Record<string, Filterable<FeedWithId>>;
    unseen: UnseenNotificationCount;
    totalUnseenCount: number;
    feedsLayout: FeedsLayout;

    // selectedFeed?: FeedWithId;
    // feedsFilter: FeedsFilter;
    notificationsFilter: NotificationsFilter;
    feeds: Array<FeedWithId>;
}

interface FeedsControllerState {
    feedsState: RepeatAsyncProcess<FeedData, SimpleError>;
}

export default class FeedsController extends Component<FeedsControllerProps, FeedsControllerState> {
        monitor: Monitor;
        queue: AsyncQueue;
        constructor(props: FeedsControllerProps) {
            super(props);

            this.state = {
                feedsState: {
                    status: RepeatAsyncProcessStatus.NONE
                }
            }

            this.monitor = new Monitor({
                callback: this.doRefreshAlarm.bind(this),
                interval: 10000
            });

            this.queue = new AsyncQueue({queuePauseTime: 250});
        }

        async doRefreshAlarm() {
            // TODO: if the reloadData is async, we could ensure it is accounted for in
            // the monitor loop. Should not be a problem though, as the refresh time,
            // dominated by fetching the notifications from the service, should be much
            // shorter, far less than a second, than the refresh poll interval, which
            // should be on the order of 10 secons.
            this.doRefresh();
        }

        componentDidMount() {
            this.props.setTitle('Notification Feeds');
            this.loadData();
            this.monitor.start();
        }

        componentWillUnmount(): void {
            this.monitor.stop();
        }

        componentDidUpdate(prevProps: FeedsControllerProps) {
            const prevSelectedFeedId = prevProps.match.params.get('tab') || 'global';
            const selectedFeedId = this.props.match.params.get('tab') || 'global';

            if (prevSelectedFeedId === selectedFeedId) {
                return;
            }

            if (this.state.feedsState.status !== RepeatAsyncProcessStatus.SUCCESS) {
                return;
            }

            if (!(selectedFeedId in this.state.feedsState.value.feedsMap)) {
                this.setState({
                    feedsState: {
                        status: RepeatAsyncProcessStatus.ERROR,
                        error: {
                            message: `Could not find feed ${selectedFeedId}`
                        }
                    }
                });
                return;
            }

            this.setState({
                feedsState: {
                    ...this.state.feedsState,
                    value: {
                        ...this.state.feedsState.value,
                        selectedFeed: this.state.feedsState.value.feedsMap[selectedFeedId]!.value
                    }
                }
            });
        }

        async fetchFeeds() {
            const feedsClient2 = new FeedsClient({
                url: this.props.config.services.Feeds.url,
                token: this.props.authState.authInfo.token
            })

             // Get the initial feed.
             const rawFeeds = await feedsClient2.getNotifications({limit: 100, includeSeen: true});
             const {unseen} = await feedsClient2.getUnseenNotificationsCount();
            
             // Determine if an admin.
             const isAdmin = this.props.authState.authInfo.account.customroles.includes(FEEDS_ADMIN_ROLE)

             // GLOBAL POSTER?

             const feeds: Array<FeedWithId> = Object.entries(rawFeeds)
                 .map(([id, feed]) => {
                     return {
                         id,
                         feed
                     }
                 })


             return {unseen, isAdmin, feeds}
        }

        async loadData() {
            this.setState({
                feedsState: {
                    status: RepeatAsyncProcessStatus.PENDING
                }
            })

            try {

                const {unseen, isAdmin, feeds} = await this.fetchFeeds();
                // // Get the initial feed.
                // const rawFeeds = await feedsClient2.getNotifications({limit: 100, includeSeen: true});
                // const {unseen} = await feedsClient2.getUnseenNotificationsCount();
               
                // // Determine if an admin.
                // const isAdmin = this.props.authState.authInfo.account.customroles.includes(FEEDS_ADMIN_ROLE)

                // // GLOBAL POSTER?

                // const feeds: Array<FeedWithId> = Object.entries(rawFeeds)
                //     .map(([id, feed]) => {
                //         return {
                //             id,
                //             feed
                //         }
                //     })

                // const notifications: Array<FeedNotification> = [];

                // for (const [id, feed] of Object.entries(rawFeeds)) {
                //     for (const notification of feed.feed) {
                //         notifications.push(notification)
                //     }
                // }

                const feedsWithFilterApplied = this.applyFilter(feeds, 'all', this.props.match.params.get('tab') || 'global');

                this.setState({
                    feedsState: {
                        status: RepeatAsyncProcessStatus.SUCCESS,
                        value: {
                            isAdmin,
                            unseen,
                            totalUnseenCount: unseen.global + unseen.user,
                            notificationsFilter: 'all',
                            feedsLayout: 'source',
                            feeds,
                            ...feedsWithFilterApplied
                        }
                    }
                })

            } catch (ex) {
                this.setState({
                    feedsState: {
                        status: RepeatAsyncProcessStatus.ERROR,
                        error: {
                            message: ex instanceof Error ? ex.message : 'Unknown Error'
                        }
                    }
                })
            }
            // this.initializeData().then((feedData) => {
            //     const token = runtime.service('session').getAuthToken();
            //     return runtime
            //         .service('session')
            //         .auth2Client.getMe(token)
            //         .then(({ customroles }) => {
            //             this.element.innerHTML = '';
            //             if (customroles.includes('FEEDS_ADMIN')) {
            //                 this.isAdmin = true;
            //                 this.globalPoster = new GlobalPoster({
            //                     afterSubmitFn: this.refreshFeed.bind(this),
            //                     runtime: runtime
            //                 });
            //                 this.element.appendChild(this.globalPoster.element);
            //             }

            //             this.myFeeds = {};
            //             // make an object from all feeds where key = feed id, value = feed info
            //             Object.keys(feedData).forEach((feed) => {
            //                 this.myFeeds[feed] = [feed, feedData[feed].name];
            //             });
            //             this.myFeeds.global[1] = 'KBase Announcements';
            //             // make the order. Should be:
            //             // 0. global
            //             // 1. user
            //             // rest = other feeds in alphabetical order
            //             // seed with just global and user
            //             const feedOrder = Object.keys(this.myFeeds);
            //             feedOrder.splice(feedOrder.indexOf('global'), 1);
            //             feedOrder.splice(feedOrder.indexOf('user'), 1);
            //             feedOrder.sort((a, b) => {
            //                 return feedData[a].name.localeCompare(feedData[b].name);
            //             });
            //             feedOrder.unshift('user');
            //             feedOrder.unshift('global');

            //             const feedList = feedOrder.map((feed) => this.myFeeds[feed]);

            //             const unseenSet = {};
            //             for (const f in feedData) {
            //                 unseenSet[f] = feedData[f].unseen;
            //             }

            //             this.feedTabs = new FeedTabs({
            //                 feeds: feedList,
            //                 feedUpdateFn: this.updateFeed.bind(this),
            //                 unseen: unseenSet,
            //                 globalFeed: feedData.global.feed,
            //                 runtime: runtime,
            //                 isAdmin: this.isAdmin,
            //                 userId: this.userId
            //             });
            //             this.element.appendChild(this.feedTabs.element);
            //         });
            // });
        }

        async reloadData() {
            if (this.state.feedsState.status !== RepeatAsyncProcessStatus.SUCCESS) {
                return;
            }
            // const feedFilter = this.state.feedsState.value.feedsFilter;

            this.setState({
                feedsState: {
                    ...this.state.feedsState,
                    status: RepeatAsyncProcessStatus.SUCCESS_PENDING
                }
            })
            // const feedsClient = new FeedsAPI(this.props.config.services.Feeds.url, this.props.authState.authInfo.token);
            // const feedsClient2 = new FeedsClient({
            //     url: this.props.config.services.Feeds.url,
            //     token: this.props.authState.authInfo.token
            // })
            try {

                const {unseen, isAdmin, feeds} = await this.fetchFeeds();
                // // Get the initial feed.
                // const notifications = await feedsClient2.getNotifications({limit: 100, includeSeen: true});
                // const {unseen} = await feedsClient2.getUnseenNotificationsCount();
               
                // // GLOBAL POSTER?

                // // Determine if an admin.
                // const isAdmin = this.props.authState.authInfo.account.customroles.includes(FEEDS_ADMIN_ROLE)

                // // GLOBAL POSTER?

                // const feeds: Array<FeedWithId> = Object.entries(notifications)
                //     .map(([id, feed]) => {
                //         return {
                //             id,
                //             feed
                //         }
                //     })

                const {feedsFilter, selectedFeed, feedsLayout} = this.state.feedsState.value;
  
                const feedsWithFilterApplied = this.applyFilter(feeds, feedsFilter, selectedFeed ? selectedFeed.id : undefined);

                this.setState({
                    feedsState: {
                        status: RepeatAsyncProcessStatus.SUCCESS,
                        value: {
                            isAdmin,
                            unseen,
                            totalUnseenCount: unseen.global + unseen.user,
                            notificationsFilter: 'all',
                            feedsLayout,
                            feeds,
                            ...feedsWithFilterApplied
                        }
                    }
                })
            } catch (ex) {
                this.setState({
                    feedsState: {
                        status: RepeatAsyncProcessStatus.ERROR,
                        error: {
                            message: ex instanceof Error ? ex.message : 'Unknown Error'
                        }
                    }
                })
            }
        }

        // async reloadData2() {
        //     if (this.state.feedsState.status !== RepeatAsyncProcessStatus.SUCCESS) {
        //         return;
        //     }
        //     const feedFilter = this.state.feedsState.value.feedsFilter;

        //     await new Promise((resolve) => {
        //         if (this.state.feedsState.status !== RepeatAsyncProcessStatus.SUCCESS) {
        //             return;
        //         }
        //         this.setState({
        //             feedsState: {
        //                 ...this.state.feedsState,
        //                 status: RepeatAsyncProcessStatus.SUCCESS_PENDING
        //             }
        //         }, () => resolve);
        //     });
                
        //     // const feedsClient = new FeedsAPI(this.props.config.services.Feeds.url, this.props.authState.authInfo.token);
        //     const feedsClient2 = new FeedsClient({
        //         url: this.props.config.services.Feeds.url,
        //         token: this.props.authState.authInfo.token
        //     })
        //     try {
        //         // Get the initial feed.
        //         const notifications = await feedsClient2.getNotifications({limit: 100, includeSeen: true});
        //         const {unseen} = await feedsClient2.getUnseenNotificationsCount();
               
        //         // GLOBAL POSTER?

        //         function filterIt(feed: FeedWithId): Filterable<FeedWithId> {
        //             const show = (() => {
        //                 switch (feedFilter) {
        //                     case 'all': return true;
        //                     case 'unseen': return feed.feed.unseen > 0;
        //                 }
        //             })();
        //             return {show, value: feed}
        //         }

        //         const allFeeds: Array<Filterable<FeedWithId>> = Object.entries(notifications)
        //             .map(([id, feed]) => {
        //                 // Show if current feed filter is honored.
        //                 return filterIt({id, feed});
        //             })

        //         allFeeds.sort((a: Filterable<FeedWithId>, b: Filterable<FeedWithId>) => {
        //             return a.value.feed.name.localeCompare(b.value.feed.name);
        //         })

        //         const userFeeds = allFeeds.filter((feed) => {
        //             return feed.value.id !== "global" && feed.value.id !== "user"
        //         })

        //         const selectedFeedId = this.props.match.params.get('tab') || 'global'

        //         const feedsMap = allFeeds.reduce< Record<string, Filterable<FeedWithId>>>((accum, feed) => {
        //             accum[feed.value.id] = feed;
        //             return accum;
        //         },{});

             
        //         // const globalFeed: FeedWithId = {id: 'global', feed: notifications['global']!}

        //         const global = feedsMap['global'];

        //         // const global = {
        //         //     show: true, 
        //         //     value: globalFeed
        //         // };

        //         // const userFeed: FeedWithId = {id: 'user', feed: notifications['user']!};
        //         const user = feedsMap['user'];

        //         return new Promise((resolve) => {
        //             if (this.state.feedsState.status === RepeatAsyncProcessStatus.SUCCESS_PENDING) {
        //                 this.setState({
        //                     feedsState: {
        //                         status: RepeatAsyncProcessStatus.SUCCESS,
        //                         value: {
        //                             ...this.state.feedsState.value,
        //                             allFeeds,
        //                             feedsMap,
        //                             feeds: userFeeds,
        //                             unseen,
        //                             totalUnseenCount: unseen.global + unseen.user,
        //                             global,
        //                             user,
        //                             selectedFeed: {id: selectedFeedId, feed: notifications[selectedFeedId]!},
        //                         }
        //                     }
        //                 }, () => resolve);
        //             } else {
        //                 resolve(null);
        //             }
        //         });
        //     } catch (ex) {
        //         return new Promise((resolve) => {
        //             this.setState({
        //                 feedsState: {
        //                     status: RepeatAsyncProcessStatus.ERROR,
        //                     error: {
        //                         message: ex instanceof Error ? ex.message : 'Unknown Error'
        //                     }
        //                 }
        //             }, () => resolve)
        //         });
        //     }
        // }

        // updateFeed(feedKey) {
        //     return this.feedsApi
        //         .getNotifications({ includeSeen: true })
        //         .then((feed) => {
        //             if (feed[feedKey]) {
        //                 return feed[feedKey];
        //             } else {
        //                 return {};
        //             }
        //         })
        //         .catch((err) => {
        //             console.error(err);
        //         });
        // }

        // async initializeData() {
            
        // }

        /**
         *
         * @param {object} filters
         *  - reverseSort - boolean
         *  - verb - string or int
         *  - level - string or int
         *  - source - string
         *  - includeSeen - boolean
         */
        // refreshFeed() {
        //     this.feedsApi
        //         .getNotifications({ includeSeen: true })
        //         .then((feed) => {
        //             this.feedTabs.refresh(feed);
        //             const unseenSet = {};
        //             for (const f in feed) {
        //                 unseenSet[f] = feed[f].unseen;
        //             }
        //             this.feedTabs.setUnseenCounts(unseenSet);
        //         })
        //         .catch((err) => {
        //             this.renderError(err);
        //         });
        // }

        // renderError(err) {
        //     console.error(err);
        //     // xss safe
        //     this.element.innerHTML = `
        //         <div class="alert alert-danger">
        //             An error occurred while fetching your feed!
        //         </div>
        //     `;
        // }

        // doFilterFeeds(filter: string) {
        //     if (this.state.feedsState.status !== AsyncProcessStatus.SUCCESS) {
        //         return;
        //     }
        //     this.setState({
        //         feedsState: {
        //             ...this.state.feedsState,
        //             value: {
        //                 ...this.state.feedsState.value,
        //                 feedsFilter: filter,
        //                 feeds: this.state.feedsState.value.feeds.filter((value) => {
        //                     // const {show, {id, feed}} = value;
        //                     return true;
        //                 })
        //             }
        //         }
        //     })
        // }

        selectFeed(feed: FeedWithId) {
            // TODO: refactor to select the feed item first, then set the navigation for
            // Europa w/o actual navigation.
            this.queue.addItem(async () => {
                return new Promise((resolve) => {
                    if (this.state.feedsState.status !== RepeatAsyncProcessStatus.SUCCESS) {
                        console.warn('Feeds state not SUCCESS, so cannot select a feed');
                        return;
                    }


                    if (!(feed.id in this.state.feedsState.value.feedsMap)) {
                        this.setState({
                            feedsState: {
                                status: RepeatAsyncProcessStatus.ERROR,
                                error: {
                                    message: `Could not find feed ${feed.id}`
                                }
                            }
                        });
                        return;
                    }

                    // $GlobalMessenger.send('europa', 'navigate', {
                    //     path: 'feeds2', params: {tab: feed.id}
                    // })

                    navigate2({path: 'feeds', params: {tab: feed.id}, type: 'kbaseui', newWindow: false});
        
                    this.setState({
                        feedsState: {
                            ...this.state.feedsState,
                            value: {
                                ...this.state.feedsState.value,
                                selectedFeed: this.state.feedsState.value.feedsMap[feed.id]!.value
                            }
                        }
                    }, () => resolve());
                });

                // navigate2({path: 'feeds2', params: {tab: feed.id}, type: 'kbaseui', newWindow: false});
            });
        }

        // applyFilter(state: FeedData, feedsFilter: FeedsFilter): FeedData {
        //     function filterIt(feed: FeedWithId): Filterable<FeedWithId> {
        //         const show = (() => {
        //             switch (feedsFilter) {
        //                 case 'all': return true;
        //                 case 'unseen': return feed.feed.unseen > 0;
        //             }
        //         })();
        //         return {show, value: feed}
        //     }

        //     const allFeeds =  state.allFeeds.map(({value}) => {
        //         return filterIt(value);
        //     });

        //     const feedsMap = allFeeds.reduce< Record<string, Filterable<FeedWithId>>>((accum, feed) => {
        //         accum[feed.value.id] = feed;
        //         return accum;
        //     },{});


        //     const feeds =  state.feeds.map(({value}) => {
        //         return filterIt(value);
        //     });

        //     const selectedFeed = (() => {
        //         if (state.selectedFeed) {
        //             const selectedFeed = state.selectedFeed;
        //             const filteredFeed = feedsMap[selectedFeed.id];
        //             if (!filteredFeed || !filteredFeed.show) {
        //                 const firstShown = allFeeds.filter(({show}) => show)[0];
        //                 if (firstShown) {
        //                     return firstShown.value;
        //                 }
        //                 return;
        //             }
        //             return filteredFeed.value;
        //         }
        //     })();
            
        //     return  {
        //         ...state,
        //         feedsFilter,
        //         feedsMap,
        //         allFeeds,
        //         global: filterIt(state.global.value),
        //         user: filterIt(state.user.value),
        //         feeds,
        //         selectedFeed
        //     };
        // }

        applyFilter(feeds: Array<FeedWithId>, feedsFilter: FeedsFilter, selectedFeedId?: string): FilterData {
            function filterIt(feed: FeedWithId): Filterable<FeedWithId> {
                const show = (() => {
                    switch (feedsFilter) {
                        case 'all': return true;
                        case 'unseen': return feed.feed.unseen > 0;
                    }
                })();
                return {show, value: feed}
            }

            const allFeeds =  feeds.map((feed) => {
                return filterIt(feed);
            });

            const feedsMap = allFeeds.reduce< Record<string, Filterable<FeedWithId>>>((accum, feed) => {
                accum[feed.value.id] = feed;
                return accum;
            },{});


            allFeeds.sort((a: Filterable<FeedWithId>, b: Filterable<FeedWithId>) => {
                return a.value.feed.name.localeCompare(b.value.feed.name);
            })

            const userFeeds = allFeeds
                .filter((feed) => {
                    return feed.value.id !== "global" && feed.value.id !== "user" && feed.show;
                })
                .map(({value}) => value);
            const global = feedsMap['global'].show? feedsMap['global'].value : undefined;
            const user = feedsMap['user'].show? feedsMap['user'].value : undefined;

            // const selectedFeedId = this.props.match.params.get('tab') || 'global'

            const selectedFeed = (() => {
                const feedId = selectedFeedId || this.props.match.params.get('tab');
                if (feedId) {
                    const selectedFeed = feedsMap[feedId]
                    // const filteredFeed = feedsMap[selectedFeed.id];
                    if (!selectedFeed || !selectedFeed.show) {
                        const firstShown = allFeeds.filter(({show}) => show)[0];
                        if (firstShown) {
                            return firstShown.value;
                        }
                        return;
                    }
                    return selectedFeed.value;
                }
                return global || user || (userFeeds.length > 0 ? userFeeds[0] : undefined);
            })();


            const notifications: Array<FeedNotification> = [];

            for (const feed of feeds) {
                for (const notification of feed.feed.feed) {
                    if (!notification.seen || (notification.seen && feedsFilter === 'all')) {
                        notifications.push(notification)
                    }
                }
            }
            
            return  {
                feedsFilter,
                feedsMap,
                allFeeds,
                global,
                user,
                userFeeds,
                notifications,
                selectedFeed
            };
        }

        doFilterFeed(feedsFilter: FeedsFilter) {
            this.queue.addItem(async () => {
                return new Promise((resolve) => {
                    if (this.state.feedsState.status !== RepeatAsyncProcessStatus.SUCCESS) {
                        console.warn('Feeds state not SUCCESS, so cannot select a feed');
                        return;
                    }
                    const {selectedFeed} = this.state.feedsState.value;
                    this.setState({
                        feedsState: {
                            ...this.state.feedsState,
                            value: {
                                ...this.state.feedsState.value,
                                ...this.applyFilter(this.state.feedsState.value.feeds, feedsFilter, selectedFeed ? selectedFeed.id : undefined)
                            }
                        }
                    }, () => resolve());
                });
            });
        }

        doFilterNotifications(_notificationsFilter: NotificationsFilter) {
            if (this.state.feedsState.status !== RepeatAsyncProcessStatus.SUCCESS) {
                console.warn('Feeds state not SUCCESS, so cannot select a feed');
                return;
            }
        }

        async doToggleSeen(notification: FeedNotification) {
            this.queue.addItem(async () => {
                // But this won't trigger a re-render cascade right now, so
                if (this.state.feedsState.status !== RepeatAsyncProcessStatus.SUCCESS) {
                    return;
                }
                const feedsClient2 = new FeedsClient({
                    url: this.props.config.services.Feeds.url,
                    token: this.props.authState.authInfo.token
                })
                try {
                    if (notification.seen) {
                        await feedsClient2.markUnseen([notification.id])
                    } else {
                        await feedsClient2.markSeen([notification.id])
                    }
                    this.reloadData();
                } catch (ex) {
                    const message = ex instanceof Error ? ex.message : 'Unknown error';
                    //{title, message, autodismiss, variant}
                    notifyError(message)
                }
            })

        }

        doRefresh() {
            this.queue.addItem(async () => {
                return this.reloadData();
            });
        }

        changeFeedsLayout(feedsLayout: FeedsLayout) {
            if (this.state.feedsState.status !== RepeatAsyncProcessStatus.SUCCESS) {
                console.warn('Feeds state not SUCCESS, so cannot select a feed view');
                return;
            }
            this.setState({
                feedsState: {
                    ...this.state.feedsState,
                    value: {
                        ...this.state.feedsState.value,
                        feedsLayout
                    }
                }
            })
        }

        render() {
            switch (this.state.feedsState.status) {
                case RepeatAsyncProcessStatus.NONE:
                case RepeatAsyncProcessStatus.PENDING:
                        return <Loading message="Loading Feeds..." />;
                case RepeatAsyncProcessStatus.ERROR:
                    return <ErrorAlert message={this.state.feedsState.error.message} />
                case RepeatAsyncProcessStatus.SUCCESS_PENDING:
                case RepeatAsyncProcessStatus.SUCCESS:
                    const {isAdmin, global, user, userFeeds, notifications, feedsFilter, notificationsFilter, selectedFeed, feedsLayout} = this.state.feedsState.value;
                    return <FeedsView 
                        isAdmin={isAdmin}
                        global={global}
                        user={user}
                        feeds={userFeeds}
                        notifications={notifications}
                        unseen={this.state.feedsState.value.unseen}
                        totalUnseenCount={this.state.feedsState.value.totalUnseenCount}
                        selectedFeed={selectedFeed}
                        feedsFilter={feedsFilter}
                        notificationsFilter={notificationsFilter}
                        currentUserId={this.props.authState.authInfo.account.user}
                        selectFeed={this.selectFeed.bind(this)}
                        filterFeeds={this.doFilterFeed.bind(this)}
                        filterNotifications={this.doFilterNotifications.bind(this)}
                        toggleSeen={this.doToggleSeen.bind(this)}
                        refresh={this.doRefresh.bind(this)}
                        isReloading={this.state.feedsState.status === RepeatAsyncProcessStatus.SUCCESS_PENDING}
                        feedsLayout={feedsLayout}
                        changeLayout={this.changeFeedsLayout.bind(this)}
                    />
            }
        }
    }

