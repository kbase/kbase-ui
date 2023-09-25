import { ManageLinkingSessionsQueryResult, StatusResponse } from "apps/ORCIDLink/lib/ORCIDLinkClient";
import ErrorMessage from "components/ErrorMessage";
import Loading from "components/Loading";
import { SimpleError } from "components/MainWindow";
import { AuthenticationStateAuthenticated } from "contexts/Auth";
import { Notification, NotificationKind } from "contexts/RuntimeContext";
import { AsyncProcess, AsyncProcessStatus } from "lib/AsyncProcess";
import Poller, { makePoller } from "lib/poller";
import { Component } from "react";
import { Config } from "types/config";
import { Model } from "../../lib/Model";
import ORCIDLinkManageView from "./view";

export interface QueryLinkingSessionsControllerProps {
    auth: AuthenticationStateAuthenticated;
    config: Config;
    notify: (n: Notification) => void;
}

export interface QueryLinksState {
    linkingSessions: ManageLinkingSessionsQueryResult
    status: StatusResponse
}

interface QueryLinkingSessionsControllerState {
    manageState: AsyncProcess<QueryLinksState, SimpleError>;
}

// class LoadDataJob extends Job {
//     constructor(props: JobConfig) {
//         super(props)
//     }
//     run () {

//     }
// }

export default class QueryLinkingSessionsController extends Component<QueryLinkingSessionsControllerProps, QueryLinkingSessionsControllerState> {
    poller?: Poller;
    constructor(props: QueryLinkingSessionsControllerProps) {
        super(props);
        this.state = {
            manageState: {
                status: AsyncProcessStatus.NONE
            }
        }

    }
    componentDidMount() {
        // First ensure that the user is an admin.
        this.initialize();
    }
    componentWillUnmount() {
        if (this.poller) {
            this.poller.stop();
        }
    }

    async initialize() {
        this.setState({
            manageState: {
                status: AsyncProcessStatus.NONE
            }
        });

        // await this.loadData();

        this.poller = makePoller({
            interval: 10000,
            runInitially: true,
            description: 'Load data for the linking sessions manager',
            fun: () => {
                this.loadData()
            }
        })
        this.poller.start()

        // const job = new SimpleJob({
        //     description: 'Load data for the linking sessions manager',
        //     runner: () => {
        //         this.loadData()
        //     }
        // })

        // const task = new Task({
        //     interval: 10000,
        //     runInitially: true,
        //     jobs: [job]
        // });
        // this.poller = new Poller({ task })
        // this.poller.start();
    }

    async loadData() {
        const model = new Model({ config: this.props.config, auth: this.props.auth });

        const status = await model.getStatus();

        const linkingSessions = await model.manageQueryLinkingSessions();

        this.setState({
            manageState: {
                status: AsyncProcessStatus.SUCCESS,
                value: {
                    linkingSessions, status
                }
            }
        });
    }

    async pruneExpiredSessions() {
        const model = new Model({ config: this.props.config, auth: this.props.auth });
        // TODO: yeah, need to handle this.
        await model.deleteExpiredSessions()
        this.props.notify({
            kind: NotificationKind.AUTODISMISS,
            dismissAfter: 3000,
            id: 'foo',
            message: 'Expired Sessions, if any, have been deleted',
            startedAt: Date.now(),
            type: 'success',
        });
        return this.loadData();
    }

    async deleteStartedSession(sessionId: string) {
        const model = new Model({ config: this.props.config, auth: this.props.auth });
        await model.deleteLinkingSessionStarted(sessionId);
        this.props.notify({
            kind: NotificationKind.AUTODISMISS,
            dismissAfter: 3000,
            id: 'foo',
            message: 'The session has been deleted',
            startedAt: Date.now(),
            type: 'success',
        });
        return this.loadData();
    }

    async deleteCompletedSession(sessionId: string) {
        const model = new Model({ config: this.props.config, auth: this.props.auth });
        await model.deleteLinkingSessionCompleted(sessionId);
        this.props.notify({
            kind: NotificationKind.AUTODISMISS,
            dismissAfter: 3000,
            id: 'foo',
            message: 'The session has been deleted',
            startedAt: Date.now(),
            type: 'success',
        });
        return this.loadData();
    }

    render() {
        switch (this.state.manageState.status) {
            case AsyncProcessStatus.NONE:
            case AsyncProcessStatus.PENDING:
                return <Loading message="Loading linking sessions..." />
            case AsyncProcessStatus.ERROR:
                return <ErrorMessage message={this.state.manageState.error.message} />
            case AsyncProcessStatus.SUCCESS:
                return <ORCIDLinkManageView
                    linkingSessions={this.state.manageState.value.linkingSessions}
                    orcidlinkStatus={this.state.manageState.value.status}
                    pruneExpiredSessions={this.pruneExpiredSessions.bind(this)}
                    deleteStartedSession={this.deleteStartedSession.bind(this)}
                    deleteCompletedSession={this.deleteCompletedSession.bind(this)}
                />
        }
    }
}
