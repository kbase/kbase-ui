import { Component } from 'react';
import ErrorAlert from 'components/ErrorAlert';
import Loading from 'components/Loading';
import { AsyncProcess, AsyncProcessStatus } from 'lib/AsyncProcess';
import Editor from './Editor';
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

export interface EditorControllerProps {
    config: Config;
    auth: AuthenticationStateAuthenticated;
    process?: JSONObject;
    doiForm: DOIForm;
    setTitle: (title: string) => void;
}

export interface DataState {
    orcidState: ORCIDLinkState,
    doiForm: DOIForm
}

interface EditorControllerState {
    dataState: AsyncProcess<DataState, { message: string }>
}

export enum ORCIDLinkStatus {
    LINKED = 'LINKED',
    NOT_LINKED = 'NOT_LINKED'
}

export default class EditorController extends Component<EditorControllerProps, EditorControllerState> {
    model: Model;
    constructor(props: EditorControllerProps) {
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
            const doiForm = this.props.doiForm;

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

    // async createForm() {
    //     const formId = uuid.v4();
    //     const doiForm: DOIForm = {
    //         formId,
    //         steps: [
    //             {
    //                 status: StepStatus.INCOMPLETE,
    //                 params: null
    //             },
    //             {
    //                 status: StepStatus.NONE,
    //             },
    //             {
    //                 status: StepStatus.NONE,
    //             },
    //             {
    //                 status: StepStatus.NONE,
    //             },
    //             {
    //                 status: StepStatus.NONE,
    //             },
    //             {
    //                 status: StepStatus.NONE,
    //             },
    //             {
    //                 status: StepStatus.NONE,
    //             },
    //             {
    //                 status: StepStatus.NONE,
    //             }
    //         ]
    //     };
    //     await this.model.saveDOIForm(doiForm);
    //     this.setState({
    //         dataState: {
    //             status: AsyncProcessStatus.SUCCESS,
    //             value: {
    //                 orcidState: {
    //                     status: ORCIDLinkStatus.NOT_LINKED
    //                 },
    //                 doiForm
    //             }
    //         }
    //     });

    //     const newURL = new URL(document.location.href);
    //     newURL.searchParams.set('formId', formId);
    //     // document.location.href = newURL.toString();
    //     window.history.pushState(null, '', newURL);
    // }

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