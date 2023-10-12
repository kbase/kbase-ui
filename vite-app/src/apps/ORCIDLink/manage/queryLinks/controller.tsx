import ErrorMessage from "components/ErrorMessage";
import Loading from "components/Loading";
import { SimpleError } from "components/MainWindow";
import { AuthenticationStateAuthenticated } from "contexts/Auth";
import { Notification, NotificationKind } from "contexts/RuntimeContext";
import { AsyncProcess, AsyncProcessStatus } from "lib/AsyncProcess";
import { InfoResult } from "lib/kb_lib/comm/coreServices/ORCIDLInk";
import { LinkRecordPublic } from "lib/kb_lib/comm/coreServices/orcidLinkCommon";
import Poller, { makePoller } from "lib/poller";
import { Component } from "react";
import { Config } from "types/config";
import { Model } from "../../lib/Model";
import ORCIDLinkManageView from "./view";

export interface QueryLinksControllerProps {
    auth: AuthenticationStateAuthenticated;
    config: Config;
    viewLink: (username: string) => void;
    notify: (n: Notification) => void;
}

export interface QueryLinksState {
    links: Array<LinkRecordPublic>
    serviceInfo: InfoResult
}

interface QueryLinksControllerState {
    manageState: AsyncProcess<QueryLinksState, SimpleError>;
}

export default class QueryLinksController extends Component<QueryLinksControllerProps, QueryLinksControllerState> {
    poller: Poller | null;
    constructor(props: QueryLinksControllerProps) {
        super(props);
        this.state = {
            manageState: {
                status: AsyncProcessStatus.NONE
            }
        }
        this.poller = null;
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

        this.poller = makePoller({
            interval: 10000,
            runInitially: true,
            description: 'Load data for the link manager',
            fun: () => {
                this.loadData()
            }
        })
        this.poller.start()
    }

    async loadData() {
        const model = new Model({ config: this.props.config, auth: this.props.auth });
        const { links } = await model.manageQueryLinks({});
        const serviceInfo = await model.getInfo();
        this.setState({
            manageState: {
                status: AsyncProcessStatus.SUCCESS,
                value: {
                    links, serviceInfo
                }
            }
        });
    }

    async deleteLink(username: string) {
        // On the cheap...
        const model = new Model({ config: this.props.config, auth: this.props.auth });
        try {
            await model.deleteLink(username);
            this.props.notify({
                kind: NotificationKind.AUTODISMISS,
                dismissAfter: 3000,
                id: 'deletedLink',
                message: `Deleted link for user ${username}`,
                startedAt: Date.now(),
                type: 'success',
            });
            this.loadData();
        } catch (ex) {
            console.error('ERROR deleting link for user', ex);
            const message = ex instanceof Error ? ex.message : 'Unknown error';
            this.props.notify({
                kind: NotificationKind.AUTODISMISS,
                dismissAfter: 3000,
                id: 'deletedLink',
                message: `Error deleting link for user ${username}; check console`,
                description: message,
                startedAt: Date.now(),
                type: 'error',
            });
        }
    }

    renderLoading() {
        return <Loading message="Loading links..." />
    }

    render() {
        switch (this.state.manageState.status) {
            case AsyncProcessStatus.NONE:
            case AsyncProcessStatus.PENDING:
                return this.renderLoading();
            case AsyncProcessStatus.ERROR:
                return <ErrorMessage message={this.state.manageState.error.message} />
            case AsyncProcessStatus.SUCCESS:
                return <ORCIDLinkManageView
                    links={this.state.manageState.value.links}
                    viewLink={this.props.viewLink.bind(this)}
                    deleteLink={this.deleteLink.bind(this)}
                    orcidServiceURL={this.state.manageState.value.serviceInfo.runtime_info.orcid_site_url}
                />
        }

    }
}