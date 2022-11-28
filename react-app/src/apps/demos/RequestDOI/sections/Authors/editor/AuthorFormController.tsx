import ErrorAlert from 'components/ErrorAlert';
import Loading from 'components/Loading';
import { AsyncProcess, AsyncProcessStatus } from 'lib/AsyncProcess';
import { Component } from 'react';
import { Row, Stack } from 'react-bootstrap';
import AuthorForm from './AuthorForm';
import { EditableAuthor } from './AuthorsSectionController';


export interface ControllerProps {
    author: EditableAuthor
    onCancel: () => void;
    onUpdate: (author: EditableAuthor) => void;
}

export interface FormState {
    // status: FormStatus;
    // canImportFromORCID: boolean;
    trigger: number;
    author: EditableAuthor;
}

export type DataState = AsyncProcess<FormState, { message: string }>


interface ControllerState {
    dataState: DataState
}

export default class Controller extends Component<ControllerProps, ControllerState> {
    constructor(props: ControllerProps) {
        super(props);

        this.state = {
            dataState: {
                status: AsyncProcessStatus.SUCCESS,
                value: {
                    trigger: Date.now(),
                    author: this.props.author
                }
            }
        }
    }

    // Model interaction

    // Event handlers

    async onCancel() {
        this.props.onCancel();
    }

    async onResetForm() {
        if (this.state.dataState.status !== AsyncProcessStatus.SUCCESS) {
            return;
        }
    }

    async onEditFirstName(value: string) {
        if (this.state.dataState.status !== AsyncProcessStatus.SUCCESS) {
            return;
        }
        this.state.dataState.value.author.firstName.set(value);
        this.setState({
            dataState: {
                ...this.state.dataState,
                value: {
                    ...this.state.dataState.value,
                    trigger: Date.now()
                }
            }
        });
        this.props.onUpdate(this.state.dataState.value.author);
    }

    async onEditMiddleName(value: string) {
        if (this.state.dataState.status !== AsyncProcessStatus.SUCCESS) {
            return;
        }
        this.state.dataState.value.author.middleName.set(value);
        this.setState({
            dataState: {
                ...this.state.dataState,
                value: {
                    ...this.state.dataState.value,
                    trigger: Date.now()
                }
            }
        });
        this.props.onUpdate(this.state.dataState.value.author);
    }

    async onEditLastName(value: string) {
        if (this.state.dataState.status !== AsyncProcessStatus.SUCCESS) {
            return;
        }
        this.state.dataState.value.author.lastName.set(value);
        this.setState({
            dataState: {
                ...this.state.dataState,
                value: {
                    ...this.state.dataState.value,
                    trigger: Date.now()
                }
            }
        });
        this.props.onUpdate(this.state.dataState.value.author);
    }

    async onEditInstitution(value: string) {
        if (this.state.dataState.status !== AsyncProcessStatus.SUCCESS) {
            return;
        }
        this.state.dataState.value.author.institutionField.set(value);
        this.setState({
            dataState: {
                ...this.state.dataState,
                value: {
                    ...this.state.dataState.value,
                    trigger: Date.now()
                }
            }
        });
        this.props.onUpdate(this.state.dataState.value.author);
    }

    async onEditEmailAddress(value: string) {
        if (this.state.dataState.status !== AsyncProcessStatus.SUCCESS) {
            return;
        }
        this.state.dataState.value.author.emailAddressField.set(value);
        this.setState({
            dataState: {
                ...this.state.dataState,
                value: {
                    ...this.state.dataState.value,
                    trigger: Date.now()
                }
            }
        });
        this.props.onUpdate(this.state.dataState.value.author);
    }

    async onEditORCIDId(value: string) {
        if (this.state.dataState.status !== AsyncProcessStatus.SUCCESS) {
            return;
        }
        this.state.dataState.value.author.orcidIdField.set(value);
        this.setState({
            dataState: {
                ...this.state.dataState,
                value: {
                    ...this.state.dataState.value,
                    trigger: Date.now()
                }
            }
        });
        this.props.onUpdate(this.state.dataState.value.author);
    }

    async onEditContributorType(value: string) {
        if (this.state.dataState.status !== AsyncProcessStatus.SUCCESS) {
            return;
        }
        this.state.dataState.value.author.contributorType.set(value);
        this.setState({
            dataState: {
                ...this.state.dataState,
                value: {
                    ...this.state.dataState.value,
                    trigger: Date.now()
                }
            }
        });
        this.props.onUpdate(this.state.dataState.value.author);
    }

    async onImportFromORCID() {
        if (this.state.dataState.status !== AsyncProcessStatus.SUCCESS) {
            return;
        }
        if (!this.state.dataState.value.author.orcidIdField.isValid()) {
            return;
        }

        // TODO: NOw do it!
        // if (this.state.dataState.value.canImportFromORCID) {
        //     await this.importFromORCID();
        // }
        // import from user profile?

        // await this.importFromNarrative();
    }


    // Renderers

    renderLoading() {
        return <Loading message="Loading ..." />;
    }

    renderError({ message }: { message: string }) {
        return <ErrorAlert message={message} />
    }

    renderSuccess(formState: FormState) {
        return <Stack gap={2}>
            <Row className="g-0">
                <AuthorForm
                    author={formState.author}
                    onEditFirstName={this.onEditFirstName.bind(this)}
                    onEditMiddleName={this.onEditMiddleName.bind(this)}
                    onEditLastName={this.onEditLastName.bind(this)}
                    onEditInstitution={this.onEditInstitution.bind(this)}
                    onEditEmailAddress={this.onEditEmailAddress.bind(this)}
                    onEditORCIDId={this.onEditORCIDId.bind(this)}
                    onEditContributorType={this.onEditContributorType.bind(this)}
                    onCancel={this.onCancel.bind(this)}
                    onImportFromORCID={this.onImportFromORCID.bind(this)}
                />
            </Row>
            {/* <Row className="g-0">
                <ButtonToolbar style={{ justifyContent: 'center' }}>
                    <ButtonGroup>
                        <Button variant="outline-primary" onClick={this.onImportToForm.bind(this)}>Import your profile from ORCID</Button>
                        <Button variant="danger" onClick={this.onResetForm.bind(this)}>Erase (empty all form fields)</Button>
                    </ButtonGroup>
                </ButtonToolbar>
            </Row> */}
        </Stack>
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
