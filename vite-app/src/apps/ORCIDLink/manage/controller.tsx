import ErrorMessage from "components/ErrorMessage";
import { AuthenticationStateAuthenticated } from "contexts/EuropaContext";
import { AsyncProcess, AsyncProcessStatus } from "lib/AsyncProcess";
import { SimpleError } from 'lib/SimpleError';
import { Component } from "react";
import { Config } from "types/config";
import { Model } from "../lib/Model";
import ORCIDLinkManageView from "./view";

export interface ORCIDLinkManageControllerProps {
    auth: AuthenticationStateAuthenticated;
    config: Config;
    setTitle: (title: string) => void;
}

export interface ManageState {
    isManager: true;
}

interface ORCIDLinkManageControllerState {
    manageState: AsyncProcess<ManageState, SimpleError>;
    viewedLinks: Array<string>
}

export default class ORCIDLinkManageController extends Component<ORCIDLinkManageControllerProps, ORCIDLinkManageControllerState> {
    constructor(props: ORCIDLinkManageControllerProps) {
        super(props);
        this.state = {
            manageState: {
                status: AsyncProcessStatus.NONE
            },
            viewedLinks: []
        }
    }
    componentDidMount() {
        // First ensure that the user is an admin.
        this.props.setTitle('KBase ORCID® Link - Manager');
        this.initialize();
    }

    async initialize() {
        this.setState({
            manageState: {
                status: AsyncProcessStatus.NONE
            }
        });

        const model = new Model({ config: this.props.config, auth: this.props.auth });

        try {
            const isManager = await model.isManager();
            if (!isManager) {
                this.setState({
                    manageState: {
                        status: AsyncProcessStatus.ERROR,
                        error: {
                            message: 'Management tools only available to KBase ORCID® managers'
                        }
                    }
                });
            } else {
                this.setState({
                    manageState: {
                        status: AsyncProcessStatus.SUCCESS,
                        value: {
                            isManager: true
                        }
                    }
                });
            }
        } catch (ex) {
            if (ex instanceof Error) {
                this.setState({
                    manageState: {
                        status: AsyncProcessStatus.ERROR,
                        error: {
                            message: ex.message
                        }
                    }
                });
            } else {
                this.setState({
                    manageState: {
                        status: AsyncProcessStatus.ERROR,
                        error: {
                            message: 'Unknown error'
                        }
                    }
                });
            }
        }
    }

    addViewedLink(username: string) {
        this.setState({
            viewedLinks: [...this.state.viewedLinks, username]
        })
    }

    removeViewedLink(usernameToRemove: string) {
        this.setState({
            viewedLinks: this.state.viewedLinks.filter(username => username !== usernameToRemove)
        })
    }

    render() {
        switch (this.state.manageState.status) {
            case AsyncProcessStatus.NONE:
            case AsyncProcessStatus.PENDING:
                return;
            case AsyncProcessStatus.ERROR:
                return <ErrorMessage message={this.state.manageState.error.message} />
            case AsyncProcessStatus.SUCCESS:
                return <ORCIDLinkManageView
                    viewedLinks={this.state.viewedLinks}
                    addViewedLink={this.addViewedLink.bind(this)}
                    removeViewedLink={this.removeViewedLink.bind(this)}
                />
        }
    }
}