import ErrorMessage from "components/ErrorMessage";
import Loading from "components/Loading";
import { SimpleError } from "components/MainWindow";
import { AuthenticationStateAuthenticated } from "contexts/Auth";
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
                    viewLink={this.props.viewLink}
                    orcidServiceURL={this.state.manageState.value.serviceInfo.runtime_info.orcid_site_url}
                />
        }

    }
}