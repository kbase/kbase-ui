import { Component } from 'react';
import ErrorAlert from 'components/ErrorAlert';
import Loading from 'components/Loading';
import { AsyncProcess, AsyncProcessStatus } from 'lib/AsyncProcess';
import View from './View';
import { Model, ORCIDProfile } from 'apps/ORCIDLink/Model';
import { Config } from 'types/config';
import { AuthenticationStateAuthenticated } from 'contexts/Auth';


export interface ORCIDLinkStateBase {
    status: ORCIDLinkStatus
}

export interface ORCIDLinkStateLinked {
    status: ORCIDLinkStatus.LINKED,
    orcidProfile: ORCIDProfile
}

export interface ORCIDLinkStateNotLinked {
    status: ORCIDLinkStatus.NOT_LINKED
}

export type ORCIDLinkState =
    ORCIDLinkStateLinked | ORCIDLinkStateNotLinked;



export interface ControllerProps {
    config: Config;
    auth: AuthenticationStateAuthenticated;
    process?: { [k: string]: string };
    setTitle: (title: string) => void;
}

export interface DataState {
    orcidState: ORCIDLinkState
}

interface ControllerState {
    dataState: AsyncProcess<DataState, { message: string }>
}

export enum ORCIDLinkStatus {
    LINKED = 'LINKED',
    NOT_LINKED = 'NOT_LINKED'
}

export default class Controller extends Component<ControllerProps, ControllerState> {
    model: Model;
    constructor(props: ControllerProps) {
        super(props);
        this.model = new Model({
            config: this.props.config,
            auth: this.props.auth
        })
        this.state = {
            dataState: {
                status: AsyncProcessStatus.NONE
            }
        }
    }

    componentDidMount() {
        this.props.setTitle('ORCID® Link Demo - DOI Form with import from ORCID, Narrative')
        this.loadData();
    }

    // Model interaction

    async loadData() {
        await new Promise((resolve) => {
            this.setState({
                dataState: {
                    status: AsyncProcessStatus.PENDING
                }
            }, () => {
                resolve(null);
            });
        });
        try {
            const isLinked = await this.model.isLinked();
            if (!isLinked) {
                this.setState({
                    dataState: {
                        status: AsyncProcessStatus.SUCCESS,
                        value: {
                            orcidState: {
                                status: ORCIDLinkStatus.NOT_LINKED
                            }
                        }
                    }
                });
            } else {
                const orcidProfile = await this.model.getProfile();
                // const params = this.props.
                this.setState({
                    dataState: {
                        status: AsyncProcessStatus.SUCCESS,
                        value: {
                            orcidState: {
                                status: ORCIDLinkStatus.LINKED,
                                orcidProfile
                            }
                        }
                    }
                });
            }
        } catch (ex) {
            if (ex instanceof Error) {
                this.setState({
                    dataState: {
                        status: AsyncProcessStatus.ERROR,
                        error: {
                            message: ex.message
                        }
                    }
                });
            } else {
                this.setState({
                    dataState: {
                        status: AsyncProcessStatus.ERROR,
                        error: {
                            message: `Unknown error: ${String(ex)}`
                        }
                    }
                });
            }
        }
    }

    // Renderers

    renderLoading() {
        return <Loading message="Loading ORCID Interstitial Page ..." />;
    }

    renderError({ message }: { message: string }) {
        return <ErrorAlert message={message} />
    }

    renderSuccess(dataState: DataState) {
        return <View orcidState={dataState.orcidState} process={this.props.process} model={this.model} />
    }

    render() {
        switch (this.state.dataState.status) {
            case AsyncProcessStatus.NONE:
            case AsyncProcessStatus.PENDING:
                return this.renderLoading();
            case AsyncProcessStatus.ERROR:
                return this.renderError(this.state.dataState.error)
            case AsyncProcessStatus.SUCCESS:
                return this.renderSuccess(this.state.dataState.value);
        }
    }
}