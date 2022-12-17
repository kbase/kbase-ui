import { WorkExternalIdentifierTypes, WorkRelationshipIdentifiers } from "apps/ORCIDLink/data";
import { isEqual } from "lib/kb_lib/Utils";
import { Component } from "react";
import { Button, Form, Stack } from "react-bootstrap";
import Select, { SingleValue } from 'react-select';
import { Option, Options, OptionsGroups } from "../../../../lib/reactSelectTypes";
import EditExternalIdentifiers from "../EditExternalIdentifiers";
import {
    EditableExternalId, editableExternalIdsToExternalIds,
    EditableWork, EditStatus, ValidationStatus
} from "../PushWorksModel";
import { ROW_HEADER, SECTION_BODY_STYLE, SECTION_HEADER_STYLE } from "../styles";
import { WorkTypes2 } from "./Controller";
import styles from './Editor.module.css';

export interface EditWorkProps {
    work: EditableWork;
    workTypes: WorkTypes2;
    workExternalIdentifierTypes: WorkExternalIdentifierTypes;
    workRelationshipIdentifiers: WorkRelationshipIdentifiers;
    onClose: () => void;
    onSave: (update: EditableWork) => Promise<void>;
}

interface EditWorkState {
    editState: EditableWork
}

export default class EditWork extends Component<EditWorkProps, EditWorkState> {

    constructor(props: EditWorkProps) {
        super(props);
        this.state = {
            editState: props.work
        }
    }

    componentDidUpdate(prevProps: EditWorkProps, prevState: EditWorkState) {
        // const editable = this.publicationToEditableWork(this.props.publication);
        if (!isEqual(prevProps.work, this.props.work)) {
            this.setState({
                editState: this.props.work
            })
        }
    }

    // publicationToEditableWork(publication: Work): EditableWork {
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
            ...this.state,
            editState: {
                ...this.state.editState,
                title: {
                    status: EditStatus.EDITED,
                    validationState: {
                        status: ValidationStatus.VALID,
                    },
                    editValue: title,
                    value: title
                }
            }
        })
    }

    changeDate(date: string) {
        this.setState({
            ...this.state,
            editState: {
                ...this.state.editState,
                date: {
                    status: EditStatus.EDITED,
                    validationState: {
                        status: ValidationStatus.VALID,
                    },
                    editValue: date,
                    value: date
                }
            }
        })
    }

    changeJournal(journal: string) {
        this.setState({
            ...this.state,
            editState: {
                ...this.state.editState,
                journal: {
                    status: EditStatus.EDITED,
                    validationState: {
                        status: ValidationStatus.VALID,
                    },
                    editValue: journal,
                    value: journal
                }
            }
        })
    }

    changeWorkType(workType: string) {
        this.setState({
            ...this.state,
            editState: {
                ...this.state.editState,
                workType: {
                    status: EditStatus.EDITED,
                    validationState: {
                        status: ValidationStatus.VALID,
                    },
                    editValue: workType,
                    value: workType
                }
            }
        })
    }

    changeURL(url: string) {
        this.setState({
            ...this.state,
            editState: {
                ...this.state.editState,
                url: {
                    status: EditStatus.EDITED,
                    validationState: {
                        status: ValidationStatus.VALID,
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

    // changeExternalIdType(type: string, index: number) {
    //     const externalIds = this.state.editState.externalIds.slice();
    //     externalIds[index].type = type;

    //     this.setState({
    //         ...this.state,
    //         editState: {
    //             ...this.state.editState,
    //             externalIds
    //         }
    //     })
    // }

    // handleChangeExternalIdType(type: string, index: number) {
    //     const externalIds = this.state.editState.externalIds.slice();
    //     externalIds[index].type = type;

    //     this.setState({
    //         ...this.state,
    //         editState: {
    //             ...this.state.editState,
    //             externalIds
    //         }
    //     })
    // }

    // changeExternalIdValue(value: string, index: number) {
    //     const externalIds = this.state.editState.externalIds.slice();
    //     externalIds[index].value = value;

    //     this.setState({
    //         ...this.state,
    //         editState: {
    //             ...this.state.editState,
    //             externalIds
    //         }
    //     })
    // }

    // changeExternalIdRelationship(value: string, index: number) {
    //     const externalIds = this.state.editState.externalIds.slice();
    //     externalIds[index].relationship = value;

    //     this.setState({
    //         ...this.state,
    //         editState: {
    //             ...this.state.editState,
    //             externalIds
    //         }
    //     })
    // }

    // changeExternalIdURL(url: string, index: number) {
    //     const externalIds = this.state.editState.externalIds.slice();
    //     externalIds[index].url = url;

    //     this.setState({
    //         ...this.state,
    //         editState: {
    //             ...this.state.editState,
    //             externalIds
    //         }
    //     })
    // }

    // addExternalIdentifier() {
    //     const externalIds = this.state.editState.externalIds.slice();
    //     externalIds.push({
    //         type: '',
    //         relationship: '',
    //         url: '',
    //         value: ''
    //     });
    //     this.setState({
    //         ...this.state,
    //         editState: {
    //             ...this.state.editState,
    //             externalIds
    //         }
    //     })
    // }

    doSave() {
        // Gather the record
        const update = this.state.editState;

        // Call the props function
        this.props.onSave(update);
    }

    // handleRemoveExternalIdentifier(indexToRemove: number) {
    //     const externalIds = this.state.editState.externalIds.filter((identifier, index) => {
    //         return (index !== indexToRemove);
    //     });
    //     this.setState({
    //         editState: {
    //             ...this.state.editState,
    //             externalIds
    //         }
    //     });
    // }

    // renderExternalIdsTable() {
    //     return <EditExternalIdentifiers
    //         externalIds={this.state.editState.externalIds}
    //         workExternalIdentifierTypes={this.props.workExternalIdentifierTypes}
    //         workRelationshipIdentifiers={this.props.workRelationshipIdentifiers}
    //         onChanged={(externalIds: Array<ExternalId>) => {
    //             this.setState({
    //                 editState: {
    //                     ...this.state.editState,
    //                     externalIds
    //                 }
    //             });
    //         }}



    // if (this.state.editState.externalIds.length === 0) {
    //     return <Empty message="No external identifiers ... yet" />
    // }
    // const rows = this.state.editState.externalIds.map(({ type, url, value, relationship }, index) => {
    //     return <div className="flex-row" key={index}>
    //         <div className="flex-col">
    //             <Select<Option<string>>
    //                 styles={{ menu: (css) => ({ ...css, width: 'max-content', maxWidth: '20em' }) }}
    //                 isSearchable={false}
    //                 onChange={(newValue) => { this.handleChangeExternalIdType(newValue!.value, index) }}
    //                 options={this.getExternalIdentifierTypes()}
    //             />
    //         </div>
    //         <div className="flex-col">
    //             <input type="text" className="form-control"
    //                 value={value}
    //                 style={{ margin: '0' }}
    //                 onInput={(e) => { this.changeExternalIdValue(e.currentTarget.value, index) }} />
    //         </div>
    //         <div className="flex-col">
    //             <Select<Option<string>>
    //                 styles={{ menu: (css) => ({ ...css, width: 'max-content', maxWidth: '20em' }) }}
    //                 isSearchable={false}
    //                 onChange={(newValue) => { this.changeExternalIdRelationship(newValue!.value, index) }}
    //                 options={this.getExternalRelationshipIdentifiers()}
    //             />
    //             {/* <input type="text" className="form-control"
    //                 value={relationship}
    //                 style={{ margin: '0' }}
    //                 onInput={(e) => { this.changeExternalIdRelationship(e.currentTarget.value, index) }} /> */}
    //         </div>
    //         <div className="flex-col">
    //             <input type="text" className="form-control"
    //                 value={url}
    //                 style={{ margin: '0' }}
    //                 onInput={(e) => { this.changeExternalIdURL(e.currentTarget.value, index) }} />
    //         </div>
    //         <div className="flex-col" style={{ alignItems: 'center', flex: '0 0 auto' }}>
    //             <Button variant="danger">
    //                 <span className="fa fa-trash" onClick={() => { this.handleRemoveExternalIdentifier(index); }} />
    //             </Button>
    //         </div>
    //     </div>
    // });
    // return <div className="flex-table">
    //     <div className="flex-row -header">
    //         <div className="flex-col">
    //             Type
    //         </div>
    //         <div className="flex-col">
    //             Value
    //         </div>
    //         <div className="flex-col">
    //             Relationship
    //         </div>
    //         <div className="flex-col">
    //             URL
    //         </div>
    //     </div>
    //     {rows}
    // </div>
    // }

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
                                status: ValidationStatus.VALID,
                            },
                            editValue: externalIds,
                            value: editableExternalIdsToExternalIds(externalIds)
                        }
                    }
                });
            }}
        />
    }

    handleWorkTypeChange(option: SingleValue<Option<string>>): void {
        if (option === null) {
            // This should not be possible since we do not allow an empty
            // option, but if it is, we would use "natural order", I suppose.
            return;
        }
        const workType = option.value;

        this.setState({
            ...this.state,
            editState: {
                ...this.state.editState,
                workType: {
                    status: EditStatus.EDITED,
                    validationState: {
                        status: ValidationStatus.VALID,
                    },
                    editValue: workType,
                    value: workType
                }
            }
        })
    }

    getWorkTypeOptions(): Options<string> {
        const options: Options<string> = [];

        this.props.workTypes.forEach(({ category, label, values }) => {
            options.push({
                value: category,
                label
            });
            values.forEach(({ value, label }) => {
                options.push({
                    value, label
                });
            })
        })

        return options;
    }

    getWorkTypeOptions2(): OptionsGroups<string> {
        return this.props.workTypes.map(({ category, label, values }) => {
            return {
                label,
                options: values.map(({ value, label }) => {
                    return { value, label };
                })
            };
        });
    }

    // getExternalIdentifierTypes(): Options<string> {
    //     return this.props.workExternalIdentifierTypes.map(({ value, description }) => {
    //         return {
    //             value,
    //             label: description
    //         };
    //     });
    // }

    // getExternalRelationshipIdentifiers(): Options<string> {
    //     return this.props.workRelationshipIdentifiers.map(({ value, label }) => {
    //         return {
    //             value,
    //             label
    //         };
    //     });
    // }

    renderWorkTypeField() {
        return <Select<Option<string>>
            isSearchable={true}
            onChange={this.handleWorkTypeChange.bind(this)}
            options={this.getWorkTypeOptions2()}
        />;
    }

    // renderWorkTypeField() {
    //     const x = [1, 2].map((x) => {
    //         return <div>{x}</div>;
    //     })
    //     const options: Array<JSX.Element> = [];
    //     // const options = this.props.workTypes.values.map(({ value, label }) => {
    //     //     return <option value={value}>{label}</option>;
    //     // })
    //     this.props.workTypes.forEach(({ category, label, values }) => {
    //         options.push(<option>{label.toUpperCase()}</option>);
    //         values.forEach(({ value, label }) => {
    //             options.push(<option value={value}>{label}</option>);
    //         })
    //     })
    //     options.unshift(<option>Select a work type</option>);
    //     return <Form.Select
    //         aria-label="Work Type"
    //         onChange={(e) => { this.changeWorkType(e.target.value); }}
    //     >
    //         {options}
    //     </Form.Select>
    // }


    // <input type="text" className="form-control" value={this.state.editState.publicationType}
    // onInput = {(e) => { this.changeWorkType(e.currentTarget.value) }} />

    renderForm() {
        return <Form className={`${styles.main}`} style={{ padding: '1em' }}>
            <div className="flex-table">
                <div className="flex-row">
                    <div className="flex-col" style={ROW_HEADER} >
                        Work Type
                    </div>
                    <div className="flex-col">
                        {this.renderWorkTypeField()}
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
                    EXTERNAL IDENTIFIERS
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
                Add New Work Record
            </div>
            <div className="well-body">
                {this.renderForm()}
            </div>
            <div className="well-footer" style={{ justifyContent: 'center' }}>
                <Stack direction="horizontal" gap={3}>
                    <Button variant="primary" type="button" onClick={this.doSave.bind(this)}>
                        <span className="fa fa-pencil" /> Save
                    </Button>
                    <Button variant="outline-danger" type="button" onClick={this.props.onClose}>
                        <span className="fa fa-times-circle" /> Close
                    </Button>
                </Stack>
            </div>
        </div>
    }
}