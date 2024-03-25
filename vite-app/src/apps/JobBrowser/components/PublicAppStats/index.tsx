import { PublicAppStatsQuery } from 'apps/JobBrowser/store/PublicAppStats';
import { AppStat } from 'apps/JobBrowser/store/base';
import { calcAverage, calcRate } from 'apps/JobBrowser/utils';
import ErrorAlert from 'components/ErrorAlert';
import Loading from 'components/Loading';
import { AuthenticationStateAuthenticated } from 'contexts/EuropaContext';
import { AsyncProcess, AsyncProcessStatus } from 'lib/AsyncProcess';
import { SimpleError } from 'lib/SimpleError';
import CatalogClient from 'lib/kb_lib/comm/coreServices/Catalog';
import React from 'react';
import { Config } from 'types/config';
import PublicAppStats from './view';

export interface ControllerProps {
    config: Config;
    auth: AuthenticationStateAuthenticated
}

export interface Filtered<T> {
    show: boolean;
    value: T;
}

export interface PublicAppStatsState {
    stats: Array<Filtered<AppStat>>
}

export type ControllerState = AsyncProcess<PublicAppStatsState, SimpleError>

export default class Controller extends React.Component<ControllerProps, ControllerState> {
    constructor(props: ControllerProps) {
        super(props);
        this.state = {
            status: AsyncProcessStatus.NONE
        }
    }

    componentDidMount() {
        this.initialize();
    }

    async initialize() {
        // Start off by getting everything.
        // Note that this was optimistic, in that I had hoped that ee2 would eventually
        // support fully search semantics (offset, limit, sort, query), but for now I
        // believe we still just have to get everything and perform it all client-side.
        this.setState({
            status: AsyncProcessStatus.PENDING
        })
        try {
            const stats = await this.loadInitialData()
            this.setState({
                status: AsyncProcessStatus.SUCCESS,
                value: {
                    stats
                }
            })
        } catch (ex) {
            this.setState({
                status: AsyncProcessStatus.ERROR,
                error: {
                    message: ex instanceof Error ? ex.message : 'Unknown Error'
                }
            })
        }
    }

    async loadInitialData() {
        const catalogClient = new CatalogClient({
            token: this.props.auth.authInfo.token,
            url: this.props.config.services.Catalog.url,
            timeout: this.props.config.ui.constants.clientTimeout
        });

        const rawStats = await catalogClient.get_exec_aggr_stats({});
        return rawStats.map<Filtered<AppStat>>((stat) => {
            const [moduleId, functionId] = stat.full_app_id.split('/');
            if (!moduleId || !functionId) {
                console.warn('bad app!', stat);
            }
            const successRate = calcRate(stat.number_of_calls - stat.number_of_errors, stat.number_of_calls);
            const averageRunTime = calcAverage(stat.total_exec_time, stat.number_of_calls);
            const averageQueueTime = calcAverage(stat.total_queue_time, stat.number_of_calls);
            return {
                show: true,
                    value: {
                    appId: stat.full_app_id,
                    moduleId,
                    functionId: functionId || '',
                    moduleTitle: moduleId,
                    functionTitle: functionId || '',
                    runCount: stat.number_of_calls,
                    errorCount: stat.number_of_errors,
                    successRate,
                    averageRunTime,
                    averageQueueTime,
                    totalRunTime: stat.total_queue_time
                }
            }
        });
    }

    async search(query: PublicAppStatsQuery) {
        if (this.state.status !== AsyncProcessStatus.SUCCESS) {
            return;
        }
        try {
            const terms = query.query.split(/\s+/);

            const expression = terms.map((term) => {
                return new RegExp(term, 'i');
            });

            const stats = this.state.value.stats.map(({value}) => {
                const show = expression.length === 0 || expression.every((term) => {
                    return (
                        term.test(value.moduleTitle) ||
                        term.test(value.moduleId) ||
                        term.test(value.functionTitle) ||
                        term.test(value.functionId)
                    );
                });
                return {show, value};
            });

    
            this.setState({
                status: AsyncProcessStatus.SUCCESS,
                value: {
                    stats
                }
            })
        } catch (ex) {
            this.setState({
                status: AsyncProcessStatus.ERROR,
                error: {
                    message: ex instanceof Error ? ex.message : 'Unknown Error'
                }
            })
        }
    }

    renderLoading() {
        return <Loading message="Loading Public App Stats..." />;
    }

    onSearch(query: PublicAppStatsQuery): void {
        this.search(query);
    }

    renderSuccess({stats}: PublicAppStatsState) {
        const filteredStats = stats
            .filter(({show}) => {
                return show;
            })
            .map(({value}) => {
                return value;
            });
        return <PublicAppStats stats={filteredStats} onSearch={this.onSearch.bind(this)} />;
    }

    renderError(error: SimpleError) {
        return <ErrorAlert message={error.message} />;
    }

    render() {
        switch (this.state.status) {
            case AsyncProcessStatus.NONE:
            case AsyncProcessStatus.PENDING:
                return this.renderLoading();
            case AsyncProcessStatus.SUCCESS:
                return this.renderSuccess(this.state.value);
            case AsyncProcessStatus.ERROR:
                return this.renderError(this.state.error);
        }
    }
}
