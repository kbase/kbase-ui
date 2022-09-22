import { WorkExternalIdentifierTypes, WorkRelationshipIdentifiers } from "apps/ORCIDLink/data";
import { isEqual } from "lib/kb_lib/Utils";
import { Component } from "react";
import { Button, Form, Stack } from "react-bootstrap";
import Select, { SingleValue } from 'react-select';
import EditExternalIdentifiers from "../EditExternalIdentifiers";
import { EditableExternalId, editableExternalIdsToExternalIds, EditablePublication, EditStatus, initialEditableExternalId, ValidationStatus } from "../PushPublicationModel";
import { Option, OptionsGroups } from "../reactSelectTypes";
import { ROW_HEADER } from "../styles";
import { WorkTypes2 } from "./Controller";
import styles from './EditPublication.module.css';

const SECTION_HEADER_STYLE = {
    fontWeight: 'bold',
    color: "rgba(250,250,250, 1)",
    backgroundColor: "rgba(125, 125, 125, 1)",
    borderRadius: '0.25em',
    marginTop: '1em',
    padding: '0.25em',
    paddingLeft: '0.5em',
    alignItems: 'center'
};

const SECTION_BODY_STYLE = {
    justifyContent: 'center',
    marginTop: '1em',
    padding: '0.25em',
    paddingLeft: '0.5em'
};

export interface EditPublicationProps {
    publication: EditablePublication;
    // onSave: (publication: Publication) => Promise<void>;

    workTypes: WorkTypes2;
    workExternalIdentifierTypes: WorkExternalIdentifierTypes;
    workRelationshipIdentifiers: WorkRelationshipIdentifiers;
    onClose: () => void;
    updatePublication: (update: EditablePublication) => Promise<void>;
}

interface EditPublicationState {
    editState: EditablePublication
}

export default class EditPublication extends Component<EditPublicationProps, EditPublicationState> {

    constructor(props: EditPublicationProps) {
        super(props);
        this.state = {
            editState: props.publication
        }
    }

    componentDidUpdate(prevProps: EditPublicationProps, prevState: EditPublicationState) {
        // const editable = this.publicationToEditablePublication(this.props.publication);
        if (!isEqual(prevProps.publication, this.props.publication)) {
            this.setState({
                editState: this.props.publication
            })
        }
    }

    // publicationToEditablePublication(publication: Publication): EditablePublication {
    //     const { putCode, publicationType, title, date, journal, url, citationType, externalIds } = publication;
    //     return {
    //         putCode,
    //         publicationType, title, date, journal: journal || '', url: url || '',
    //         citationType: citationType || '',
    //         externalIds: externalIds || []
    //     }
    // }

    changeTitle(title: string) {
        this.setState({
            editState: {
                ...this.state.editState,
                title: {
                    status: EditStatus.EDITED,
                    validationState: {
                        status: ValidationStatus.VALID
                    },
                    editValue: title,
                    value: title
                }
            }
        })
    }

    changeDate(date: string) {
        this.setState({
            editState: {
                ...this.state.editState,
                date: {
                    status: EditStatus.EDITED,
                    validationState: {
                        status: ValidationStatus.VALID
                    },
                    editValue: date,
                    value: date
                }
            }
        })
    }

    changeJournal(journal: string) {
        this.setState({
            editState: {
                ...this.state.editState,
                journal: {
                    status: EditStatus.EDITED,
                    validationState: {
                        status: ValidationStatus.VALID
                    },
                    editValue: journal,
                    value: journal
                }
            }
        })
    }

    changePublicationType(publicationType: string) {
        this.setState({
            editState: {
                ...this.state.editState,
                publicationType: {
                    status: EditStatus.EDITED,
                    validationState: {
                        status: ValidationStatus.VALID
                    },
                    editValue: publicationType,
                    value: publicationType
                }
            }
        })
    }

    handlePublicationTypeChange(option: SingleValue<Option<string>>): void {
        if (option === null) {
            // This should not be possible since we do not allow an empty
            // option, but if it is, we would use "natural order", I suppose.
            return;
        }
        const publicationType = option.value;

        this.setState({
            ...this.state,
            editState: {
                ...this.state.editState,
                publicationType: {
                    status: EditStatus.EDITED,
                    validationState: {
                        status: ValidationStatus.VALID,
                    },
                    editValue: publicationType,
                    value: publicationType
                }
            }
        })
    }

    changeURL(url: string) {
        this.setState({
            editState: {
                ...this.state.editState,
                url: {
                    status: EditStatus.EDITED,
                    validationState: {
                        status: ValidationStatus.VALID
                    },
                    editValue: url,
                    value: url
                }
            }
        })
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
        const externalIds = this.state.editState.externalIds.editValue.slice();
        externalIds[index].type = {
            status: EditStatus.EDITED,
            validationState: {
                status: ValidationStatus.VALID
            },
            editValue: type,
            value: type
        }

        this.setState({
            editState: {
                ...this.state.editState,
                externalIds: {
                    status: EditStatus.EDITED,
                    validationState: {
                        status: ValidationStatus.VALID
                    },
                    editValue: externalIds,
                    value: editableExternalIdsToExternalIds(externalIds)
                }
            }
        })
    }

    changeExternalIdValue(value: string, index: number) {
        const externalIds = this.state.editState.externalIds.editValue.slice();
        externalIds[index].value = {
            status: EditStatus.EDITED,
            validationState: {
                status: ValidationStatus.VALID
            },
            editValue: value,
            value: value
        }

        this.setState({
            editState: {
                ...this.state.editState,
                externalIds: {
                    status: EditStatus.EDITED,
                    validationState: {
                        status: ValidationStatus.VALID
                    },
                    editValue: externalIds,
                    value: editableExternalIdsToExternalIds(externalIds)
                }
            }
        })
    }

    changeExternalIdRelationship(relationship: string, index: number) {
        const externalIds = this.state.editState.externalIds.editValue.slice();
        externalIds[index].relationship = {
            status: EditStatus.EDITED,
            validationState: {
                status: ValidationStatus.VALID
            },
            editValue: relationship,
            value: relationship
        }

        this.setState({
            editState: {
                ...this.state.editState,
                externalIds: {
                    status: EditStatus.EDITED,
                    validationState: {
                        status: ValidationStatus.VALID
                    },
                    editValue: externalIds,
                    value: editableExternalIdsToExternalIds(externalIds)
                }
            }
        })
    }

    changeExternalIdURL(url: string, index: number) {
        const externalIds = this.state.editState.externalIds.editValue.slice();
        externalIds[index].url = {
            status: EditStatus.EDITED,
            validationState: {
                status: ValidationStatus.VALID
            },
            editValue: url,
            value: url
        }

        this.setState({
            ...this.state,
            editState: {
                ...this.state.editState,
                externalIds: {
                    status: EditStatus.EDITED,
                    validationState: {
                        status: ValidationStatus.VALID
                    },
                    editValue: externalIds,
                    value: editableExternalIdsToExternalIds(externalIds)
                }
            }
        })
    }

    addExternalIdentifier() {
        const externalIds = this.state.editState.externalIds.editValue.slice();
        externalIds.push(initialEditableExternalId());
        this.setState({
            editState: {
                ...this.state.editState,
                externalIds: {
                    status: EditStatus.EDITED,
                    validationState: {
                        status: ValidationStatus.VALID
                    },
                    editValue: externalIds,
                    value: editableExternalIdsToExternalIds(externalIds)
                }
            }
        })
    }

    doSave() {
        // Gather the record
        const update = this.state.editState;

        // Call the props function
        this.props.updatePublication(update);
    }

    renderExternalIds() {
        return <EditExternalIdentifiers
            externalIds={this.state.editState.externalIds.editValue}
            workExternalIdentifierTypes={this.props.workExternalIdentifierTypes}
            workRelationshipIdentifiers={this.props.workRelationshipIdentifiers}
            onChanged={(externalIds: Array<EditableExternalId>) => {
                this.setState({
                    editState: {
                        ...this.state.editState,
                        externalIds: {
                            status: EditStatus.EDITED,
                            validationState: {
                                status: ValidationStatus.VALID
                            },
                            editValue: externalIds,
                            value: editableExternalIdsToExternalIds(externalIds)
                        }
                    }
                });
            }}
        />
    }

    getPublicationTypeOptions2(): OptionsGroups<string> {
        return this.props.workTypes.map(({ category, label, values }) => {
            return {
                label,
                options: values.map(({ value, label }) => {
                    return { value, label };
                })
            };
        });
    }

    renderPublicationTypeField() {
        const editValue = (() => {
            for (const { options } of this.getPublicationTypeOptions2()) {
                for (const { value, label } of options) {
                    if (value === this.state.editState.publicationType.editValue) {
                        return { value, label }
                    }
                }
            }

        })();
        return <Select<Option<string>>
            isSearchable={true}
            value={editValue}
            onChange={this.handlePublicationTypeChange.bind(this)}
            options={this.getPublicationTypeOptions2()}
        />;
    }

    renderForm() {
        return <Form className={`${styles.main}`} style={{ padding: '1em' }}>
            <div className="flex-table">
                <div className="flex-row">
                    <div className="flex-col" style={ROW_HEADER} >
                        Publication Type
                    </div>
                    <div className="flex-col">
                        {this.renderPublicationTypeField()}

                    </div>
                </div>
                <div className="flex-row">
                    <div className="flex-col" style={ROW_HEADER} >
                        Title
                    </div>
                    <div className="flex-col">
                        <input type="text" className="form-control" value={this.state.editState.title.editValue}
                            onInput={(e) => { this.changeTitle(e.currentTarget.value) }} />
                    </div>
                </div>
                <div className="flex-row">
                    <div className="flex-col" style={ROW_HEADER} >
                        Publisher
                    </div>
                    <div className="flex-col">
                        <input type="text" className="form-control" value={this.state.editState.journal.editValue}
                            onInput={(e) => { this.changeJournal(e.currentTarget.value) }} />
                    </div>
                </div>
                <div className="flex-row">
                    <div className="flex-col" style={ROW_HEADER} >
                        Date
                    </div>
                    <div className="flex-col">
                        <input type="text" className="form-control" value={this.state.editState.date.editValue}
                            onInput={(e) => { this.changeDate(e.currentTarget.value) }} />
                    </div>
                </div>
                <div className="flex-row">
                    <div className="flex-col" style={ROW_HEADER} >
                        URL
                    </div>
                    <div className="flex-col">
                        <input type="text" className="form-control" value={this.state.editState.url.editValue}
                            onInput={(e) => { this.changeURL(e.currentTarget.value) }} />
                    </div>
                </div>
                <div className="flex-row" style={SECTION_HEADER_STYLE}>
                    CITATION
                </div>
                <div className="flex-row" style={SECTION_BODY_STYLE}>
                    <i>Citation information not provided by ORCID API???</i>
                </div>


                <div className="flex-row" style={SECTION_HEADER_STYLE}>
                    EXTERNAL IDENTIFIERS  <Button variant="secondary" size="sm" onClick={this.addExternalIdentifier.bind(this)} style={{ marginLeft: '1em' }}>
                        <span className="fa fa-plus-circle" />
                    </Button>
                </div>
                <div className="flex-row" style={SECTION_BODY_STYLE}>
                    {this.renderExternalIds()}
                </div>

            </div>
        </Form >;
    }

    render() {
        return <div className="well">
            <div className="well-header">
                Edit Publication Record
            </div>
            <div className="well-body">
                {this.renderForm()}
            </div>
            <div className="well-footer" style={{ justifyContent: 'center' }}>
                <Stack direction="horizontal" gap={3}>
                    <Button variant="primary" onClick={this.doSave.bind(this)}>
                        <span className="fa fa-pencil" /> Save
                    </Button>
                    <Button variant="outline-danger" onClick={this.props.onClose}>
                        <span className="fa fa-times-circle" /> Close
                    </Button>
                </Stack>
            </div>
        </div>
    }
}