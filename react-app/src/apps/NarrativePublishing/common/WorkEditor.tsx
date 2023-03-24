import { Contributor } from 'apps/ORCIDLink/lib/ORCIDLinkClient';
import Well from 'components/Well';
import EditExternalIdentifiers from '../common/EditExternalIdentifiers';

import { isEqual } from 'lib/kb_lib/Utils';
import { changeHash2 } from 'lib/navigation';
import { Component } from 'react';
import { Alert, Button, Form, Stack } from 'react-bootstrap';
import {
    EditableContributor,
    EditableExternalId,
    editableExternalIdsToExternalIds,
    EditableSelfContributor,
    EditableWork,
    EditStateBase,
    EditStatus,
    initialEditableExternalId, ValidationState, ValidationStatus
} from '../Model';

import ContributorsEditor from '../common/ContributorsEditor';
import SelfContributorEditor from '../common/SelfContributorEditor';
import { EditState } from '../Model';
import { workExternalIdentifierTypes, workRelationshipIdentifiers } from './data';
import SelectField from './fields/SelectField';
import TextField from './fields/TextField';
import FlexGrid, { FlexCol, FlexRow } from './FlexGrid';
import { citationTypes } from './lookups';
import ScrollingArea from './ScrollingArea';
import styles from './WorkEditor.module.css';

const SECTION_HEADER_STYLE = {
    fontWeight: 'bold',
    color: 'rgba(250,250,250, 1)',
    backgroundColor: 'rgba(125, 125, 125, 1)',
    borderRadius: '0.25em',
    margin: '1em 0',
    padding: '0.25em',
    paddingLeft: '0.5em',
    alignItems: 'center',
};

const SECTION_BODY_STYLE = {
    justifyContent: 'center',
    marginTop: '1em',
    padding: '0.25em',
    paddingLeft: '0.5em',
};

export interface EditWorkProps {
    work: EditableWork;
    // workTypes: WorkTypes2;
    // citationTypes: Array<OptionType>;
    // workExternalIdentifierTypes: WorkExternalIdentifierTypes;
    // workRelationshipIdentifiers: WorkRelationshipIdentifiers;

    // orcidLink: LinkRecord;
    // onClose: () => void;
    onSave: (editableWork: EditableWork) => Promise<void>;
}

interface EditWorkState {
    editableWork: EditableWork;
    canSave: boolean;
}

export default class EditWork extends Component<EditWorkProps, EditWorkState> {
    constructor(props: EditWorkProps) {
        super(props);
        this.state = {
            editableWork: props.work,
            canSave: this.canSave(props.work)
        };
    }

    componentDidUpdate(prevProps: EditWorkProps, prevState: EditWorkState) {
        // const editable = this.publicationToEditableWork(this.props.publication);
        if (!isEqual(prevProps.work, this.props.work)) {
            this.setState({
                editableWork: this.props.work,
                canSave: this.canSave(this.props.work)
            });
        }
    }

    changeTitle(title: string) {
        const { editableWork } = this.state;
        if (editableWork.title.hasRemote) {
            this.setState({
                editableWork: {
                    ...editableWork,
                    title: {
                        ...editableWork.title,
                        status: EditStatus.EDITED,
                        validationState: {
                            status: ValidationStatus.VALID,
                        },
                        editValue: title,
                        value: title,
                    },
                },
            });
        } else {
            this.setState({
                editableWork: {
                    ...editableWork,
                    title: {
                        ...editableWork.title,
                        status: EditStatus.EDITED,
                        validationState: {
                            status: ValidationStatus.VALID,
                        },
                        editValue: title,
                        value: title,
                    },
                },
            });
        }
    }

    changeDate(date: string) {
        this.setState({
            editableWork: {
                ...this.state.editableWork,
                date: {
                    ...this.state.editableWork.date,
                    status: EditStatus.EDITED,
                    validationState: {
                        status: ValidationStatus.VALID,
                    },
                    editValue: date,
                    value: date,
                },
            },
        });
    }

    changeJournal(journal: string) {
        this.setState({
            editableWork: {
                ...this.state.editableWork,
                journal: {
                    ...this.state.editableWork.journal,
                    status: EditStatus.EDITED,
                    validationState: {
                        status: ValidationStatus.VALID,
                    },
                    editValue: journal,
                    value: journal,
                },
            },
        });
    }

    changeWorkType(workType: string) {
        this.setState({
            editableWork: {
                ...this.state.editableWork,
                workType: {
                    ...this.state.editableWork.workType,
                    status: EditStatus.EDITED,
                    validationState: {
                        status: ValidationStatus.VALID,
                    },
                    editValue: workType,
                    value: workType,
                },
            },
        });
    }

    // handleWorkTypeChange(option: SingleValue<Option<string>>): void {
    //     if (option === null) {
    //         // This should not be possible since we do not allow an empty
    //         // option, but if it is, we would use "natural order", I suppose.
    //         return;
    //     }
    //     const workType = option.value;

    //     this.setState({
    //         ...this.state,
    //         editState: {
    //             ...this.state.editState,
    //             workType: {
    //                 status: EditStatus.EDITED,
    //                 validationState: {
    //                     status: ValidationStatus.VALID,
    //                 },
    //                 editValue: workType,
    //                 value: workType
    //             }
    //         }
    //     })
    // }



    // isModified(e: EditState)

    // isChanged()

    canSave(editableWork: EditableWork) {
        function isValid(v: EditStateBase): boolean {
            return v.validationState.status === ValidationStatus.VALID;
        }
        function isEdited(s: EditStateBase): boolean {
            return s.status === EditStatus.EDITED;
        }
        const {
            citation: { editValue: { type: citationType, value: citationValue } },
            shortDescription,
            selfContributor,
            otherContributors
        } = editableWork;
        const allAreValid =
            isValid(citationType) &&
            isValid(citationValue) &&
            isValid(shortDescription) &&
            isValid(selfContributor) &&
            isValid(otherContributors);
        const anyAreChanged =
            isEdited(citationType) ||
            isEdited(citationValue) ||
            isEdited(shortDescription) ||
            isEdited(selfContributor) ||
            isEdited(otherContributors);
        return allAreValid && anyAreChanged
    }

    evaluateForm() {
        this.setState({
            ...this.state,
            canSave: this.canSave(this.state.editableWork)
        })
    }

    handleCitationTypeChange(type: EditState<string, string>): void {
        // TODO: need to fold up the validation for the "type" field into "citation",
        // and "citation" into "editableWork". I think?

        // TODO: also, when the change is valid, we need to update the citation's "value"
        // as well as "editValue".

        this.setState({
            ...this.state,
            editableWork: {
                ...this.state.editableWork,
                citation: {
                    ...this.state.editableWork.citation,
                    status: EditStatus.EDITED,
                    validationState: {
                        status: ValidationStatus.VALID,
                    },
                    editValue: {
                        ...this.state.editableWork.citation.editValue,
                        type
                    },
                    value: {
                        ...this.state.editableWork.citation.value,
                        type: type.value
                    },
                },
            },
        }, () => {
            this.evaluateForm();
        });
    }

    handleCitationCitationChange(value: EditState<string, string>): void {
        this.setState({
            ...this.state,
            editableWork: {
                ...this.state.editableWork,
                citation: {
                    ...this.state.editableWork.citation,
                    status: EditStatus.EDITED,
                    validationState: {
                        status: ValidationStatus.VALID,
                    },
                    editValue: {
                        ...this.state.editableWork.citation.editValue,
                        value
                    },
                    value: {
                        ...this.state.editableWork.citation.value,
                        value: value.value,
                    },
                },
            },
        }, () => {
            this.evaluateForm();
        });
    }

    handleShortDescriptionChange(shortDescription: EditState<string, string>): void {
        this.setState({
            editableWork: {
                ...this.state.editableWork,
                shortDescription
            },
        }, () => {
            this.evaluateForm();
        });
    }

    changeURL(url: string) {
        this.setState({
            editableWork: {
                ...this.state.editableWork,
                url: {
                    ...this.state.editableWork.url,
                    status: EditStatus.EDITED,
                    validationState: {
                        status: ValidationStatus.VALID,
                    },
                    editValue: url,
                    value: url,
                },
            },
        });
    }

    // changeCitationType(citationType: string) {
    //     this.setState({
    //         ...this.state,
    //         editState: {
    //             ...this.state.editState,
    //             citationType
    //         }
    //     })
    // }

    changeExternalIdType(type: string, index: number) {
        const externalIds = this.state.editableWork.externalIds.editValue.slice();
        externalIds[index].type = {
            ...externalIds[index].type,
            status: EditStatus.EDITED,
            validationState: {
                status: ValidationStatus.VALID,
            },
            editValue: type,
            value: type,
        };

        this.setState({
            editableWork: {
                ...this.state.editableWork,
                externalIds: {
                    ...this.state.editableWork.externalIds,
                    status: EditStatus.EDITED,
                    validationState: {
                        status: ValidationStatus.VALID,
                    },
                    editValue: externalIds,
                    value: editableExternalIdsToExternalIds(externalIds),
                },
            },
        });
    }

    changeExternalIdValue(value: string, index: number) {
        const externalIds = this.state.editableWork.externalIds.editValue.slice();
        externalIds[index].value = {
            ...externalIds[index].value,
            status: EditStatus.EDITED,
            validationState: {
                status: ValidationStatus.VALID,
            },
            editValue: value,
            value: value,
        };

        this.setState({
            editableWork: {
                ...this.state.editableWork,
                externalIds: {
                    ...this.state.editableWork.externalIds,
                    status: EditStatus.EDITED,
                    validationState: {
                        status: ValidationStatus.VALID,
                    },
                    editValue: externalIds,
                    value: editableExternalIdsToExternalIds(externalIds),
                },
            },
        });
    }

    changeExternalIdRelationship(relationship: string, index: number) {
        const externalIds = this.state.editableWork.externalIds.editValue.slice();
        externalIds[index].relationship = {
            ...externalIds[index].relationship,
            status: EditStatus.EDITED,
            validationState: {
                status: ValidationStatus.VALID,
            },
            editValue: relationship,
            value: relationship,
        };

        this.setState({
            editableWork: {
                ...this.state.editableWork,
                externalIds: {
                    ...this.state.editableWork.externalIds,
                    status: EditStatus.EDITED,
                    validationState: {
                        status: ValidationStatus.VALID,
                    },
                    editValue: externalIds,
                    value: editableExternalIdsToExternalIds(externalIds),
                },
            },
        });
    }

    changeExternalIdURL(url: string, index: number) {
        const externalIds = this.state.editableWork.externalIds.editValue.slice();
        externalIds[index].url = {
            ...externalIds[index].url,
            status: EditStatus.EDITED,
            validationState: {
                status: ValidationStatus.VALID,
            },
            editValue: url,
            value: url,
        };

        this.setState({
            ...this.state,
            editableWork: {
                ...this.state.editableWork,
                externalIds: {
                    ...this.state.editableWork.externalIds,
                    status: EditStatus.EDITED,
                    validationState: {
                        status: ValidationStatus.VALID,
                    },
                    editValue: externalIds,
                    value: editableExternalIdsToExternalIds(externalIds),
                },
            },
        });
    }

    addExternalIdentifier() {
        const externalIds = this.state.editableWork.externalIds.editValue.slice();
        externalIds.push(initialEditableExternalId());
        this.setState({
            editableWork: {
                ...this.state.editableWork,
                externalIds: {
                    ...this.state.editableWork.externalIds,
                    status: EditStatus.EDITED,
                    validationState: {
                        status: ValidationStatus.VALID,
                    },
                    editValue: externalIds,
                    value: editableExternalIdsToExternalIds(externalIds),
                },
            },
        });
    }

    doSave() {
        this.props.onSave(this.state.editableWork);
    }

    renderExternalIds() {
        return (
            <EditExternalIdentifiers
                externalIds={this.state.editableWork.externalIds.editValue}
                workExternalIdentifierTypes={workExternalIdentifierTypes}
                workRelationshipIdentifiers={workRelationshipIdentifiers}
                onChanged={(externalIds: Array<EditableExternalId>) => {
                    console.log('new external ids?', editableExternalIdsToExternalIds(externalIds));
                    this.setState({
                        editableWork: {
                            ...this.state.editableWork,
                            externalIds: {
                                ...this.state.editableWork.externalIds,
                                status: EditStatus.EDITED,
                                validationState: {
                                    status: ValidationStatus.VALID,
                                },
                                editValue: externalIds,
                                value: editableExternalIdsToExternalIds(externalIds),
                            },
                        },
                    });
                }}
            />
        );
    }

    // getWorkTypeOptions2(): OptionsGroups<string> {
    //     return this.props.workTypes.map(({ category, label, values }) => {
    //         return {
    //             label,
    //             options: values.map(({ value, label }) => {
    //                 return { value, label };
    //             })
    //         };
    //     });
    // }

    renderWorkTypeField() {
        // const editValue = (() => {
        //     for (const { options } of this.getWorkTypeOptions2()) {
        //         for (const { value, label } of options) {
        //             if (value === this.state.editState.workType.editValue) {
        //                 return { value, label }
        //             }
        //         }
        //     }
        // })();

        return 'disabled';

        // const options = this.getWorkTypeOptions2().map(({ value, label }) => {

        // })

        // return <Select
        //     value={this.state.editState.workType.editValue}
        //     onChange={this.handleWorkTypeChange.bind(this)}
        // >
        //     {options}
        // </Select>

        // return <Select<Option<string>>
        //     isSearchable={true}
        //     value={editValue}
        //     onChange={this.handleWorkTypeChange.bind(this)}
        //     options={this.getWorkTypeOptions2()}
        // />;
    }

    /**
     * Renders the citation type field's status
     * 
     * Each field has an "edit status" of either initial or edited, and a
     * validation status, which is either "valid"
     */
    renderFieldEditStatus(editStatus: EditStatus) {
        switch (editStatus) {
            case EditStatus.EDITED:
                return 'border border-warning';
            case EditStatus.INITIAL:
                return 'border border-white';
        }
    }

    renderFieldValidationStatus(validationStatus: ValidationStatus) {
        switch (validationStatus) {
            case ValidationStatus.VALID:
                return 'border border-success';
            case ValidationStatus.INVALID:
                return 'border border-danger';
            case ValidationStatus.REQUIRED_MISSING:
                return 'border border-warning';
        }
    }

    renderFieldValidationIcon(validationStatus: ValidationStatus) {
        switch (validationStatus) {
            case ValidationStatus.VALID:
                return <span className="fa fa-check text-success" style={{ marginRight: '0.5em' }} />
            case ValidationStatus.REQUIRED_MISSING:
                return <span className="fa fa-exclamation-triangle text-warning" style={{ marginRight: '0.5em' }} />
            case ValidationStatus.INVALID:
                return <span className="fa fa-bug text-danger" style={{ marginRight: '0.5em' }} />
        }
    }

    renderFieldValidationMessage(validationState: ValidationState) {
        switch (validationState.status) {
            case ValidationStatus.VALID:
                return '';
            case ValidationStatus.REQUIRED_MISSING:
                return <Alert variant="warning">This field is required</Alert>;
            case ValidationStatus.INVALID:
                return <Alert variant="danger">{validationState.message}</Alert>;
        }
    }

    renderCitationTypeField() {
        return <SelectField editState={this.state.editableWork.citation.editValue.type}
            options={citationTypes} placeholder="- select a citation format -"
            save={(type: EditState<string, string>) => {
                this.handleCitationTypeChange(type);
            }} />
    }

    renderCitationCitationField() {
        return <TextField rows={3} editState={this.state.editableWork.citation.editValue.value}
            placeholder="Please enter the citation in the format selected above"
            required={true}
            save={(type: EditState<string, string>) => {
                this.handleCitationCitationChange(type);
            }} />
    }

    renderCitationDescriptionField() {
        return <TextField rows={3} editState={this.state.editableWork.shortDescription}
            placeholder="enter a short description of this work"
            required={true}
            save={(type: EditState<string, string>) => {
                this.handleShortDescriptionChange(type);
            }} />
    }


    handleOtherContributorsChanged(c: EditState<Array<EditableContributor>, Array<Contributor>>) {
        console.log('**', c);
        this.setState({
            editableWork: {
                ...this.state.editableWork,
                otherContributors: c,
            },
        }, () => {
            this.evaluateForm();
        });
    }

    handleDOIChanged(doi: string) {
        this.setState({
            editableWork: {
                ...this.state.editableWork,
                doi: {
                    ...this.state.editableWork.doi,
                    status: EditStatus.EDITED,
                    validationState: {
                        status: ValidationStatus.VALID,
                    },
                    editValue: doi,
                    value: doi,
                },
            },
        });
    }


    onSelfContributorChanged(selfContributor: EditableSelfContributor) {
        this.setState({
            editableWork: {
                ...this.state.editableWork,
                selfContributor,
            },
        }, () => {
            this.evaluateForm();
        });
    }

    renderForm() {
        return (
            <Form className={`${styles.main}`} style={{ padding: '1em' }}>
                <FlexGrid>
                    <FlexRow>
                        <FlexCol width="auto" title>
                            Publisher
                        </FlexCol>
                        <FlexCol width="10em">
                            <input
                                type="text"
                                className="form-control"
                                value={this.state.editableWork.journal.editValue}
                                readOnly
                                disabled
                                onInput={(e) => {
                                    this.changeJournal(e.currentTarget.value);
                                }}
                            />
                        </FlexCol>
                        <FlexCol width="auto" title>
                            Date
                        </FlexCol>
                        <FlexCol width="10em">
                            <input
                                type="text"
                                className="form-control"
                                readOnly
                                disabled
                                value={this.state.editableWork.date.editValue}
                                onInput={(e) => {
                                    this.changeDate(e.currentTarget.value);
                                }}
                            />
                        </FlexCol>
                        <FlexCol width="auto" title>
                            URL
                        </FlexCol>
                        <FlexCol width="16em">
                            <input
                                type="text"
                                className="form-control"
                                readOnly
                                disabled
                                value={this.state.editableWork.url.editValue}
                                onInput={(e) => {
                                    this.changeURL(e.currentTarget.value);
                                }}
                            />
                        </FlexCol>
                    </FlexRow>
                    <FlexRow header>Citation</FlexRow>
                    <FlexRow>
                        <FlexCol width="8em" title>
                            Format
                        </FlexCol>
                        <FlexCol>{this.renderCitationTypeField()}</FlexCol>
                    </FlexRow>
                    <FlexRow>
                        <FlexCol width="8em" title>
                            Citation
                        </FlexCol>
                        <FlexCol>{this.renderCitationCitationField()}</FlexCol>
                    </FlexRow>
                    <FlexRow>
                        <FlexCol width="8em" title>
                            Description
                        </FlexCol>
                        <FlexCol>{this.renderCitationDescriptionField()}</FlexCol>
                    </FlexRow>

                    <FlexRow header>Your Contribution</FlexRow>
                    <FlexRow>
                        <FlexCol style={{ flex: '1 1 0' }}>
                            <Well variant="secondary" border="2">
                                <Well.Body style={{ padding: '0.5em' }}>
                                    <SelfContributorEditor
                                        contributor={this.state.editableWork.selfContributor}
                                        onChanged={this.onSelfContributorChanged.bind(this)}
                                    />
                                </Well.Body>
                            </Well>
                        </FlexCol>
                    </FlexRow>

                    <FlexRow header>Other Contributors</FlexRow>
                    <FlexRow>
                        {/* <div className="flex-col" style={ROW_HEADER}></div> */}
                        <FlexCol style={{ flex: '1 1 0' }}>
                            <ContributorsEditor
                                contributors={this.state.editableWork.otherContributors}
                                onChange={this.handleOtherContributorsChanged.bind(this)}
                            />
                        </FlexCol>
                    </FlexRow>

                    <FlexRow header>DOI</FlexRow>
                    <FlexRow>
                        <FlexCol width="14em">
                            <Form.Control
                                type="text"
                                value={this.state.editableWork.doi.editValue}
                                onInput={(e) => {
                                    this.handleDOIChanged(e.currentTarget.value);
                                }}
                            />
                        </FlexCol>
                    </FlexRow>

                    <FlexRow header>Other External Identifiers</FlexRow>
                    <FlexRow>
                        <FlexCol style={{ flex: '1 1 0' }}>{this.renderExternalIds()}</FlexCol>
                    </FlexRow>
                </FlexGrid>
            </Form>
        );
    }

    render() {
        return (
            <Well variant="primary" style={{ flex: '1 1 0', marginBottom: '1em' }}>
                <Well.Header>Edit Work Record</Well.Header>
                <Well.Body style={{ padding: 'none' }}>
                    <ScrollingArea>{this.renderForm()}</ScrollingArea>
                </Well.Body>
                <Well.Footer style={{ justifyContent: 'center' }}>
                    <Stack direction="horizontal" gap={3}>
                        <Button variant="primary" onClick={this.doSave.bind(this)}
                            disabled={!this.state.canSave}>
                            <span className="fa fa-floppy-o" /> Save
                        </Button>
                        <Button
                            variant="outline-danger"
                            type="button"
                            onClick={() => {
                                changeHash2('/narrativepublishing');
                            }}
                        >
                            <span className="fa fa-mail-reply" /> Return to Narrative Publishing
                            Manager
                        </Button>
                    </Stack>
                </Well.Footer>
            </Well>
        );
    }
}
