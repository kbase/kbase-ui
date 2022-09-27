import { Model } from 'apps/ORCIDLink/Model';
import { DOIForm, InitialDOIForm, StepStatus } from 'apps/ORCIDLink/ORCIDLinkClient';
import ErrorAlert from 'components/ErrorAlert';
import Loading from 'components/Loading';
import { AuthenticationStateAuthenticated } from 'contexts/Auth';
import { AsyncProcess, AsyncProcessStatus } from 'lib/AsyncProcess';
import { JSONObject } from 'lib/json';
import { Component } from 'react';
import { Config } from 'types/config';
import CreateForm from './Home';
// import EditorController from './EditorController';

export interface ControllerProps {
    config: Config;
    auth: AuthenticationStateAuthenticated;
    process?: JSONObject;
    formId?: string;
    setTitle: (title: string) => void;
}

export interface DataState {
    doiForm: DOIForm | null
    doiForms: Array<DOIForm>
}

interface ControllerState {
    dataState: AsyncProcess<DataState, { message: string }>
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
        this.props.setTitle('ORCID® Link - Demos - DOI Request')
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

                return null;
            })();

            const doiForms = await this.model.getDOIForms();

            this.setState({
                dataState: {
                    status: AsyncProcessStatus.SUCCESS,
                    value: {
                        doiForm,
                        doiForms
                    }
                }
            });
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

    async createForm() {
        const initialDOIForm: InitialDOIForm = {
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
        const doiForm = await this.model.createDOIForm(initialDOIForm);
        const doiForms = await this.model.getDOIForms();
        this.setState({
            dataState: {
                status: AsyncProcessStatus.SUCCESS,
                value: {
                    doiForm,
                    doiForms
                }
            }
        });

        const newURL = new URL(document.location.href);
        newURL.hash = `${newURL.hash}/${doiForm.form_id}`;
        document.location.href = newURL.toString();
    }

    async deleteForm(formId: string) {
        await this.model.deleteDOIForm(formId);
        return this.loadData();
    }

    editForm(formId: string) {
        const url = new URL(document.location.href);
        url.hash = `#orcidlink/demos/doi/${formId}`;
        document.location.href = url.toString();
    }

    // Renderers

    renderLoading() {
        return <Loading message="Loading DOI Request Form ..." />;
    }

    renderError({ message }: { message: string }) {
        return <ErrorAlert message={message} />
    }

    renderCreateDOIForm({ doiForms }: DataState) {
        return <CreateForm
            createForm={this.createForm.bind(this)}
            editForm={this.editForm.bind(this)}
            doiForms={doiForms}
            deleteForm={this.deleteForm.bind(this)} />
    }

    render() {
        switch (this.state.dataState.status) {
            case AsyncProcessStatus.NONE:
            case AsyncProcessStatus.PENDING:
                return this.renderLoading();
            case AsyncProcessStatus.ERROR:
                return this.renderError(this.state.dataState.error)
            case AsyncProcessStatus.SUCCESS:
                return this.renderCreateDOIForm(this.state.dataState.value);
        }
    }
}