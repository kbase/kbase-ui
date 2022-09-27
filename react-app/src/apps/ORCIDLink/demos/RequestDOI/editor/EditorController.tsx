import { Model } from 'apps/ORCIDLink/Model';
import { DOIForm, DOIFormUpdate, ORCIDProfile } from 'apps/ORCIDLink/ORCIDLinkClient';
import ErrorAlert from 'components/ErrorAlert';
import Loading from 'components/Loading';
import { AuthenticationStateAuthenticated } from 'contexts/Auth';
import { AsyncProcess, AsyncProcessStatus } from 'lib/AsyncProcess';
import { JSONObject } from 'lib/json';
import { Component } from 'react';
import { Config } from 'types/config';
import Editor from './Editor';


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

export interface RequestDOIEditorControllerProps {
    config: Config;
    auth: AuthenticationStateAuthenticated;
    formId: string;
    setTitle: (title: string) => void;
    process?: JSONObject;
}

export interface DataState {
    orcidState: ORCIDLinkState,
    doiForm: DOIForm
}

interface RequestDOIEditorControllerState {
    dataState: AsyncProcess<DataState, { message: string }>
}

export enum ORCIDLinkStatus {
    LINKED = 'LINKED',
    NOT_LINKED = 'NOT_LINKED'
}

export default class RequestDOIEditorController extends Component<RequestDOIEditorControllerProps, RequestDOIEditorControllerState> {
    model: Model;
    constructor(props: RequestDOIEditorControllerProps) {
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
        this.props.setTitle('ORCID® Link  - Demos - DOI Form');
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
            const doiForm = await this.model.getDOIForm(this.props.formId);
            // const doiForm = this.props.doiForm;

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

    async saveForm(doiFormUpdate: DOIFormUpdate) {
        if (this.state.dataState.status !== AsyncProcessStatus.SUCCESS) {
            return;
        }
        const doiForm = await this.model.saveDOIForm(doiFormUpdate);

        this.setState({
            dataState: {
                status: AsyncProcessStatus.SUCCESS,
                value: {
                    ...this.state.dataState.value,
                    doiForm
                }
            }
        });
    }


    // Renderers

    renderLoading() {
        return <Loading message="Loading DOI Request Form ..." />;
    }

    renderError({ message }: { message: string }) {
        return <ErrorAlert message={message} />
    }

    renderSuccess(dataState: DataState) {
        return <Editor
            orcidState={dataState.orcidState}
            process={this.props.process}
            doiForm={dataState.doiForm}
            setTitle={this.props.setTitle}
            model={this.model} />
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