import { Component } from 'react';
import ErrorAlert from 'components/ErrorAlert';
import Loading from 'components/Loading';
import { AsyncProcess, AsyncProcessStatus } from 'lib/AsyncProcess';
import Author from './Author';
import { Model, ORCIDProfile } from 'apps/ORCIDLink/Model';
import { FieldState, FieldStatus } from '../common';
import { Stack, Row, Col, ButtonToolbar, ButtonGroup, Button } from 'react-bootstrap';



export interface ControllerProps {
    model: Model;
    firstName?: string;
    middleName?: string;
    lastName?: string;
    emailAddress?: string;
    orcidId?: string;
    institution?: string;
}


export enum FormStatus {
    INITIAL = 'INITIAL',
    VALIDATING = 'VALIDATING',
    SAVING = 'SAVING',
    EDITABLE = 'EDITABLE',
    MODIFIED = 'MODIFIED',
    ERROR = 'ERROR',
    IMPORTING = 'IMPORTING'
}

export interface Fields {
    firstName: FieldState<string>;
    middleName: FieldState<string>;
    lastName: FieldState<string>;
    emailAddress: FieldState<string>;
    orcidId: FieldState<string>;
    institution: FieldState<string>;
}

export interface FormState {
    status: FormStatus;
    canImportFromORCID: boolean;
    fields: Fields
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
                status: AsyncProcessStatus.NONE
            }
        }
    }

    componentDidMount() {
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
            const initialFields: Fields = {
                firstName: {
                    status: FieldStatus.INITIAL,
                    value: this.props.firstName || ''
                },
                middleName: {
                    status: FieldStatus.INITIAL,
                    value: this.props.middleName || ''
                },
                lastName: {
                    status: FieldStatus.INITIAL,
                    value: this.props.lastName || ''
                },
                emailAddress: {
                    status: FieldStatus.INITIAL,
                    value: this.props.emailAddress || ''
                },
                orcidId: {
                    status: FieldStatus.INITIAL,
                    value: this.props.orcidId || ''
                },
                institution: {
                    status: FieldStatus.INITIAL,
                    value: this.props.institution || ''
                }
            }
            const isLinked = await this.props.model.isLinked();
            if (!isLinked) {
                this.setState({
                    dataState: {
                        status: AsyncProcessStatus.SUCCESS,
                        value: {
                            status: FormStatus.INITIAL,
                            canImportFromORCID: false,
                            fields: initialFields
                        }
                    }
                });
            } else {
                const orcidProfile = await this.props.model.getProfile();
                const { firstName, lastName, orcidId } = orcidProfile;
                initialFields.firstName.value = firstName;
                initialFields.lastName.value = lastName;
                initialFields.orcidId.value = orcidId;

                this.setState({
                    dataState: {
                        status: AsyncProcessStatus.SUCCESS,
                        value: {
                            status: FormStatus.INITIAL,
                            canImportFromORCID: true,
                            fields: initialFields
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

    async importFromORCID() {
        if (this.state.dataState.status !== AsyncProcessStatus.SUCCESS) {
            return;
        }

        const fields = this.state.dataState.value.fields;

        const orcidProfile = await this.props.model.getProfile();
        const { firstName, lastName, orcidId } = orcidProfile;
        fields.firstName.value = firstName;
        fields.lastName.value = lastName;
        fields.orcidId.value = orcidId;

        this.setState({
            dataState: {
                status: AsyncProcessStatus.SUCCESS,
                value: {
                    ...this.state.dataState.value,
                    status: FormStatus.INITIAL,
                    fields
                }
            }
        });
    }

    async importFromNarrative() {
        if (this.state.dataState.status !== AsyncProcessStatus.SUCCESS) {
            return;
        }

        const fields = this.state.dataState.value.fields;

        const orcidProfile = await this.props.model.getProfile();
        const { firstName, lastName, orcidId } = orcidProfile;
        fields.firstName.value = firstName;
        fields.lastName.value = lastName;
        fields.orcidId.value = orcidId;

        this.setState({
            dataState: {
                status: AsyncProcessStatus.SUCCESS,
                value: {
                    ...this.state.dataState.value,
                    status: FormStatus.INITIAL,
                    fields
                }
            }
        });
    }

    // Event handlers

    async onResetForm() {
        if (this.state.dataState.status !== AsyncProcessStatus.SUCCESS) {
            return;
        }
        const fields: Fields = {
            firstName: {
                status: FieldStatus.INITIAL,
                value: this.props.firstName || ''
            },
            middleName: {
                status: FieldStatus.INITIAL,
                value: this.props.middleName || ''
            },
            lastName: {
                status: FieldStatus.INITIAL,
                value: this.props.lastName || ''
            },
            emailAddress: {
                status: FieldStatus.INITIAL,
                value: this.props.emailAddress || ''
            },
            orcidId: {
                status: FieldStatus.INITIAL,
                value: this.props.orcidId || ''
            },
            institution: {
                status: FieldStatus.INITIAL,
                value: this.props.institution || ''
            }
        }
        this.setState({
            ...this.state,
            dataState: {
                ...this.state.dataState,
                value: {
                    ...this.state.dataState.value,
                    fields
                }
            }
        })
    }

    async onInputFirstName(value: string) {
        // validate.
        if (this.state.dataState.status !== AsyncProcessStatus.SUCCESS) {
            return;
        }
        this.setState({
            ...this.state,
            dataState: {
                ...this.state.dataState,
                value: {
                    ...this.state.dataState.value,
                    fields: {
                        ...this.state.dataState.value.fields,
                        firstName: {
                            status: FieldStatus.VALID,
                            value
                        }
                    }
                }
            }
        })
    }

    async onInputMiddleName(value: string) {
        // validate.
        if (this.state.dataState.status !== AsyncProcessStatus.SUCCESS) {
            return;
        }
        this.setState({
            ...this.state,
            dataState: {
                ...this.state.dataState,
                value: {
                    ...this.state.dataState.value,
                    fields: {
                        ...this.state.dataState.value.fields,
                        middleName: {
                            status: FieldStatus.VALID,
                            value
                        }
                    }
                }
            }
        })
    }

    async onInputLastName(value: string) {
        // validate.
        if (this.state.dataState.status !== AsyncProcessStatus.SUCCESS) {
            return;
        }
        this.setState({
            ...this.state,
            dataState: {
                ...this.state.dataState,
                value: {
                    ...this.state.dataState.value,
                    fields: {
                        ...this.state.dataState.value.fields,
                        lastName: {
                            status: FieldStatus.VALID,
                            value
                        }
                    }
                }
            }
        })
    }

    async onInputEmailAddress(value: string) {
        // validate.
        if (this.state.dataState.status !== AsyncProcessStatus.SUCCESS) {
            return;
        }
        this.setState({
            ...this.state,
            dataState: {
                ...this.state.dataState,
                value: {
                    ...this.state.dataState.value,
                    fields: {
                        ...this.state.dataState.value.fields,
                        emailAddress: {
                            status: FieldStatus.VALID,
                            value
                        }
                    }
                }
            }
        })
    }

    async onInputORCIDId(value: string) {
        // validate.
        if (this.state.dataState.status !== AsyncProcessStatus.SUCCESS) {
            return;
        }
        this.setState({
            ...this.state,
            dataState: {
                ...this.state.dataState,
                value: {
                    ...this.state.dataState.value,
                    fields: {
                        ...this.state.dataState.value.fields,
                        orcidId: {
                            status: FieldStatus.VALID,
                            value
                        }
                    }
                }
            }
        })
    }

    async onInputInstitution(value: string) {
        // validate.
        if (this.state.dataState.status !== AsyncProcessStatus.SUCCESS) {
            return;
        }
        this.setState({
            ...this.state,
            dataState: {
                ...this.state.dataState,
                value: {
                    ...this.state.dataState.value,
                    fields: {
                        ...this.state.dataState.value.fields,
                        institution: {
                            status: FieldStatus.VALID,
                            value
                        }
                    }
                }
            }
        })
    }


    async onImportToForm() {
        if (this.state.dataState.status !== AsyncProcessStatus.SUCCESS) {
            return;
        }
        if (this.state.dataState.value.canImportFromORCID) {
            await this.importFromORCID();
        }
        await this.importFromNarrative();
    }


    // Renderers

    renderLoading() {
        return <Loading message="Loading ORCID Interstitial Page ..." />;
    }

    renderError({ message }: { message: string }) {
        return <ErrorAlert message={message} />
    }

    renderSuccess(formState: FormState) {
        return <Stack gap={2}>
            <Row>
                <Author
                    fields={formState.fields}
                    onInputFirstName={this.onInputFirstName.bind(this)}
                    onInputMiddleName={this.onInputMiddleName.bind(this)}
                    onInputLastName={this.onInputLastName.bind(this)}
                    onInputORCIDId={this.onInputORCIDId.bind(this)}
                    onInputEmailAddress={this.onInputEmailAddress.bind(this)}
                    onInputInstitution={this.onInputInstitution.bind(this)}
                    onResetForm={this.onResetForm.bind(this)}
                />
            </Row>
            <Row>
                <ButtonToolbar style={{ justifyContent: 'center' }}>
                    <ButtonGroup>
                        <Button variant="outline-primary" onClick={this.onImportToForm.bind(this)}>Import to Form</Button>
                        <Button variant="danger" onClick={this.onResetForm.bind(this)}>Reset (undo all changes)</Button>
                    </ButtonGroup>
                </ButtonToolbar>
            </Row>
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