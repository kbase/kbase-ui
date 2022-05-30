import React, { PropsWithChildren } from 'react';
import { AsyncProcess, AsyncProcessStatus } from '../lib/AsyncProcess';
import { Feeds } from '../lib/clients/Feeds';
import { Monitor } from '../lib/Monitor';

import { Config } from '../types/config';
import {  AuthInfo } from './Auth';

export interface FeedsInfo {
    count: number; 
}

export type FeedsState = AsyncProcess<FeedsInfo, string>;

export const FeedsContext = React.createContext<FeedsState>({
    status: AsyncProcessStatus.NONE
});

export type FeedsWrapperProps = PropsWithChildren<{
    config: Config;
    authInfo: AuthInfo
}>;

export interface FeedsWrapperState {
    feedsState: FeedsState;
}

export class FeedsWrapper extends React.Component<FeedsWrapperProps, FeedsWrapperState> {
    monitor: Monitor;
    constructor(props: FeedsWrapperProps) {
        super(props);
        this.state = {
            feedsState: {
                status: AsyncProcessStatus.NONE
            }
        }
        this.monitor = new Monitor({
            callback: () => {
                return this.fetchFeedsState();
            },
            interval: 10000
        });
    }

    async fetchFeedsState() {
        // if (this.props.authState.status !== AsyncProcessStatus.SUCCESS ||
        //     this.props.authState.value.status !== AuthenticationStatus.AUTHENTICATED) {
        //     return;
        // }
        const feedsClient = new Feeds({
            url: this.props.config.services.Feeds.url,
            token: this.props.authInfo.token
        });
        const unseen = await feedsClient.getUnseenNotificationCount();
        this.setState({
            feedsState: {
                status: AsyncProcessStatus.SUCCESS,
                value: {
                    count: unseen.unseen.global + unseen.unseen.user
                }
            }
        });
    }

    componentDidMount() {
        this.monitor.start();
    }

    componentWillUnmount() {
        this.monitor.stop();
    }

    render() {
        return (
            <FeedsContext.Provider value={this.state.feedsState}>
                {this.props.children}
            </FeedsContext.Provider>
        );
    }
}
