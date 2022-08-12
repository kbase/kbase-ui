import { Component } from 'react';
import ErrorAlert from 'components/ErrorAlert';
import Loading from 'components/Loading';
import { AsyncProcess, AsyncProcessStatus } from 'lib/AsyncProcess';
import View from './View';
import { DOIForm, Model, ORCIDProfile, StepStatus } from 'apps/ORCIDLink/Model';
import { Config } from 'types/config';
import { AuthenticationStateAuthenticated } from 'contexts/Auth';
import { JSONObject } from 'lib/json';
import * as uuid from 'uuid'


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
    process?: JSONObject;
    formId?: string;
    setTitle: (title: string) => void;
}

export interface DataState {
    orcidState: ORCIDLinkState,
    doiForm: DOIForm
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

            const doiForm = await (async () => {
                if (this.props.formId) {
                    return this.model.getDOIForm(this.props.formId);
                }

                const formId = uuid.v4();
                const newURL = new URL(document.location.href);
                newURL.searchParams.set('formId', formId);
                // document.location.href = newURL.toString();
                window.history.pushState(null, '', newURL);
                const doiForm: DOIForm = {
                    formId,
                    steps: [
                        {
                            status: StepStatus.INCOMPLETE,
                            params: null
                        },
                        {
                            status: StepStatus.NONE,
                        },
                        {
                            status: StepStatus.NONE,
                        },
                        {
                            status: StepStatus.NONE,
                        },
                        {
                            status: StepStatus.NONE,
                        },
                        {
                            status: StepStatus.NONE,
                        },
                        {
                            status: StepStatus.NONE,
                        },
                        {
                            status: StepStatus.NONE,
                        }
                    ]
                }
                return doiForm;
            })();

            const isLinked = await this.model.isLinked();
            if (!isLinked) {
                this.setState({
                    dataState: {
                        status: AsyncProcessStatus.SUCCESS,
                        value: {
                            orcidState: {
                                status: ORCIDLinkStatus.NOT_LINKED
                            },
                            doiForm
                        }
                    }
                });
            } else {
                const orcidProfile = await this.model.getProfile();
                this.setState({
                    dataState: {
                        status: AsyncProcessStatus.SUCCESS,
                        value: {
                            orcidState: {
                                status: ORCIDLinkStatus.LINKED,
                                orcidProfile
                            },
                            doiForm
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
        return <Loading message="Loading DOI Request Form ..." />;
    }

    renderError({ message }: { message: string }) {
        return <ErrorAlert message={message} />
    }

    renderSuccess(dataState: DataState) {
        return <View orcidState={dataState.orcidState} process={this.props.process} doiForm={dataState.doiForm} model={this.model} />
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