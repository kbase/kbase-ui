import { Component } from 'react';
import ErrorAlert from 'components/ErrorAlert';
import Loading from 'components/Loading';
import { AsyncProcess, AsyncProcessStatus } from 'lib/AsyncProcess';
import EditorController from './EditorController';
import CreateForm from './CreateForm';
import { DOIForm, Model, StepStatus } from 'apps/ORCIDLink/Model';
import { Config } from 'types/config';
import { AuthenticationStateAuthenticated } from 'contexts/Auth';
import { JSONObject } from 'lib/json';
import * as uuid from 'uuid'

export interface ControllerProps {
    config: Config;
    auth: AuthenticationStateAuthenticated;
    process?: JSONObject;
    formId?: string;
    setTitle: (title: string) => void;
}

export interface DataState {
    doiForm: DOIForm | null
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

                return null;
            })();

            this.setState({
                dataState: {
                    status: AsyncProcessStatus.SUCCESS,
                    value: {
                        doiForm
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
        const formId = uuid.v4();
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
        await this.model.saveDOIForm(doiForm);
        this.setState({
            dataState: {
                status: AsyncProcessStatus.SUCCESS,
                value: {
                    doiForm
                }
            }
        });

        const newURL = new URL(document.location.href);
        newURL.searchParams.set('formId', formId);
        window.history.pushState(null, '', newURL);
    }

    // Renderers

    renderLoading() {
        return <Loading message="Loading DOI Request Form ..." />;
    }

    renderError({ message }: { message: string }) {
        return <ErrorAlert message={message} />
    }

    renderCreateDOIForm() {
        return <CreateForm createForm={this.createForm.bind(this)} />
    }

    renderDOIFOrm(doiForm: DOIForm) {
        return <EditorController
            config={this.props.config}
            auth={this.props.auth}
            setTitle={this.props.setTitle}
            process={this.props.process}
            doiForm={doiForm} />
    }

    render() {
        switch (this.state.dataState.status) {
            case AsyncProcessStatus.NONE:
            case AsyncProcessStatus.PENDING:
                return this.renderLoading();
            case AsyncProcessStatus.ERROR:
                return this.renderError(this.state.dataState.error)
            case AsyncProcessStatus.SUCCESS:
                if (this.state.dataState.value.doiForm === null) {
                    return this.renderCreateDOIForm();
                }
                return this.renderDOIFOrm(this.state.dataState.value.doiForm);
        }
    }
}