import { UserRunSummaryQuery, UserRunSummaryStat } from 'apps/JobBrowser/store/UserRunSummary';
import ErrorAlert from 'components/ErrorAlert';
import Loading from 'components/Loading';
import { AuthenticationStateAuthenticated } from 'contexts/EuropaContext';
import { AsyncProcess, AsyncProcessStatus } from 'lib/AsyncProcess';
import { SimpleError } from 'lib/SimpleError';
import CatalogClient from 'lib/kb_lib/comm/coreServices/Catalog';
import React from 'react';
import { Config } from 'types/config';
import UserRunSummary from './view';

export interface UserRunSummaryControllerProps {
    config: Config;
    auth: AuthenticationStateAuthenticated
}
export interface Filtered<T> {
    show: boolean;
    value: T;
}
interface UserRunSummaryControllerData {
    userRunSummary: Array<Filtered<UserRunSummaryStat>>;
    query: UserRunSummaryQuery
}

export type UserRunSummaryControllerState = AsyncProcess<UserRunSummaryControllerData, SimpleError>

export default class UserRunSummaryController extends React.Component<UserRunSummaryControllerProps, UserRunSummaryControllerState> {
    constructor(props: UserRunSummaryControllerProps) {
        super(props);
        this.state = {
            status: AsyncProcessStatus.NONE
        }
    }

    componentDidMount() {
        this.initialize();
    }

    async initialize() {
        this.fetchData();
    }

    async fetchData() {
        this.setState({
            status: AsyncProcessStatus.PENDING
        })
    
        try {
            const catalogClient = new CatalogClient({
                token: this.props.auth.authInfo.token,
                url: this.props.config.services.Catalog.url,
                timeout: this.props.config.ui.constants.clientTimeout
            });
            const params = {
                begin: 0,
                end: Date.now()
            };
            const rawStats = await catalogClient.get_exec_aggr_table(params);
            const userRunSummary: Array<Filtered<UserRunSummaryStat>> = rawStats.map<Filtered<UserRunSummaryStat>>((stat) => {
                let appId: string | null = stat.app;
                if (!appId) {
                    appId = null;
                }

                return {
                    show: true,
                    value: {
                        username: stat.user,
                        isApp: stat.app ? true : false,
                        appId: stat.app || null,
                        moduleName: stat.func_mod,
                        functionName: stat.func,
                        runCount: stat.n
                    }
                };
            });

            this.setState({
                status: AsyncProcessStatus.SUCCESS, 
                value: {
                    userRunSummary,
                    query: {query: ''}
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

    search(query: UserRunSummaryQuery) {
        if (this.state.status !== AsyncProcessStatus.SUCCESS) {
            return;
        }
    
        const expression = query.query.split(/\s+/).map((term) => {
            return new RegExp(term, 'i');
        });
        const userRunSummary = this.state.value.userRunSummary.map(({value}) => {
            const show = expression.length === 0 || (expression.every((term) => {
                return (value.appId && term.test(value.appId)) ||
                    term.test(value.moduleName) ||
                    term.test(value.functionName) ||
                    term.test(value.username);
            }));
            return {show, value};
        });

        this.setState({
            status: AsyncProcessStatus.SUCCESS, 
            value: {
                userRunSummary,
                query
            }
        })
    }

    renderSuccess({userRunSummary}: UserRunSummaryControllerData) {
        return <UserRunSummary 
            userRunSummary={userRunSummary.filter(({show}) => show).map(({value}) => value)}
            search={this.search.bind(this)}
        />
    }

    render() {
        switch (this.state.status) {
            case AsyncProcessStatus.NONE:
            case AsyncProcessStatus.PENDING:
                return <Loading message="Loading User Run Summary Data ..." />;
            case AsyncProcessStatus.SUCCESS:
                return this.renderSuccess(this.state.value);
            case AsyncProcessStatus.ERROR:
                return<ErrorAlert message={this.state.error.message} />
        }
    }
}
