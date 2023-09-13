import { LinkRecord } from "apps/ORCIDLink/lib/ORCIDLinkClient";
import ErrorMessage from "components/ErrorMessage";
import { SimpleError } from "components/MainWindow";
import { AuthenticationStateAuthenticated } from "contexts/Auth";
import { AsyncProcess, AsyncProcessStatus } from "lib/AsyncProcess";
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
    link: LinkRecord
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
        this.props.setTitle(`ORCID Link Manager - View Link for ${this.props.username}`)
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

        this.setState({
            manageState: {
                status: AsyncProcessStatus.SUCCESS,
                value: {
                    link
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
                return <ViewLinkView link={this.state.manageState.value.link} />
        }

    }
}