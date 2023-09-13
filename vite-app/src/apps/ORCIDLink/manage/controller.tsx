import ErrorMessage from "components/ErrorMessage";
import { SimpleError } from "components/MainWindow";
import { AuthenticationStateAuthenticated } from "contexts/Auth";
import { AsyncProcess, AsyncProcessStatus } from "lib/AsyncProcess";
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
    isAdmin: true;
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
        this.props.setTitle('ORCID Link Management');
        this.initialize();
    }

    async initialize() {
        this.setState({
            manageState: {
                status: AsyncProcessStatus.NONE
            }
        });

        if (!this.props.auth.authInfo.account.customroles.includes('orcidlink_admin')) {
            this.setState({
                manageState: {
                    status: AsyncProcessStatus.ERROR,
                    error: {
                        message: 'Management tools only available to ORCIDLink administrators'
                    }
                }
            });
            return;
        }

        const model = new Model({ config: this.props.config, auth: this.props.auth });

        const isManager = await model.isManager();

        if (!isManager) {
            this.setState({
                manageState: {
                    status: AsyncProcessStatus.ERROR,
                    error: {
                        message: 'Management tools only available to ORCIDLink managers'
                    }
                }
            });
            return;
        }

        this.setState({
            manageState: {
                status: AsyncProcessStatus.SUCCESS,
                value: {
                    isAdmin: true
                }
            }
        });
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