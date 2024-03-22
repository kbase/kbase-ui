// import { ManageStatsResult } from "apps/ORCIDLink/lib/ORCIDLinkClient";
import ErrorMessage from "components/ErrorMessage";
import { AuthenticationStateAuthenticated } from "contexts/EuropaContext";
import { AsyncProcess, AsyncProcessStatus } from "lib/AsyncProcess";
import { SimpleError } from 'lib/SimpleError';
import { GetStatsResult } from "lib/kb_lib/comm/coreServices/ORCIDLInkManage";
import Poller, { makePoller } from "lib/poller";
import { Component } from "react";
import { Config } from "types/config";
import { Model } from "../../lib/Model";
import ORCIDLinkManageView from "./view";

export interface OverviewControllerProps {
    auth: AuthenticationStateAuthenticated;
    config: Config;
}

export interface OverviewState {
    stats: GetStatsResult
}

interface OverviewControllerState {
    manageState: AsyncProcess<OverviewState, SimpleError>;
}

export default class OverviewController extends Component<OverviewControllerProps, OverviewControllerState> {
    poller: Poller | null;
    constructor(props: OverviewControllerProps) {
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
        const stats = await model.manageGetStats();
        this.setState({
            manageState: {
                status: AsyncProcessStatus.SUCCESS,
                value: {
                    stats
                }
            }
        });
    }

    render() {
        switch (this.state.manageState.status) {
            case AsyncProcessStatus.NONE:
            case AsyncProcessStatus.PENDING:
                return;
            case AsyncProcessStatus.ERROR:
                return <ErrorMessage message={this.state.manageState.error.message} />
            case AsyncProcessStatus.SUCCESS:
                return <ORCIDLinkManageView stats={this.state.manageState.value.stats.stats} />
        }

    }
}