import ErrorMessage from "components/ErrorMessage";
import { AuthenticationStateAuthenticated } from "contexts/EuropaContext";
import { AsyncProcess, AsyncProcessStatus } from "lib/AsyncProcess";
import { SimpleError } from 'lib/SimpleError';
import { InfoResult } from "lib/kb_lib/comm/coreServices/ORCIDLInk";
import { LinkRecordPublic } from "lib/kb_lib/comm/coreServices/orcidLinkCommon";
import { Component } from "react";
import { Config } from "types/config";
import { Model } from "../../lib/Model";
import ViewLinkView from "./view";

export interface ViewLinkControllerProps {
    auth: AuthenticationStateAuthenticated;
    config: Config;
    setTitle: (title: string) => void;
    username: string;
}

export interface ViewLinkState {
    link: LinkRecordPublic;
    serviceInfo: InfoResult;
}

interface ViewLinkControllerState {
    manageState: AsyncProcess<ViewLinkState, SimpleError>;
}

export default class ViewLinkController extends Component<ViewLinkControllerProps, ViewLinkControllerState> {
    constructor(props: ViewLinkControllerProps) {
        super(props);
        this.state = {
            manageState: {
                status: AsyncProcessStatus.NONE
            }
        }
    }
    componentDidMount() {
        // First ensure that the user is an admin.
        this.props.setTitle(`KBase ORCID® Link - Manager - View Link for ${this.props.username}`)
        this.initialize();
    }

    async initialize() {
        this.setState({
            manageState: {
                status: AsyncProcessStatus.NONE
            }
        });

        const model = new Model({ config: this.props.config, auth: this.props.auth });

        const link = await model.manageGetLink(this.props.username);
        const serviceInfo = await model.getInfo();

        this.setState({
            manageState: {
                status: AsyncProcessStatus.SUCCESS,
                value: {
                    link, serviceInfo
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
                return <ViewLinkView
                    link={this.state.manageState.value.link}
                    orcidSiteURL={this.state.manageState.value.serviceInfo.runtime_info.orcid_site_url} />
        }

    }
}