import { EditablePublication, ExternalId, Publication } from "apps/ORCIDLink/Model";
import { isEqual } from "lib/kb_lib/Utils";
import { Component } from "react";
import { Button, Form } from "react-bootstrap";
import { ROW_HEADER } from "../styles";
import styles from './EditPublication.module.css';
import { WorkExternalIdentifierTypes, WorkRelationshipIdentifiers } from "apps/ORCIDLink/data";
import EditExternalIdentifiers from "../EditExternalIdentifiers";

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
    workExternalIdentifierTypes: WorkExternalIdentifierTypes;
    workRelationshipIdentifiers: WorkRelationshipIdentifiers;
    onClose: () => void;
    onSave: (update: EditablePublication) => Promise<void>;
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
            ...this.state,
            editState: {
                ...this.state.editState,
                title
            }
        })
    }

    changeDate(date: string) {
        this.setState({
            ...this.state,
            editState: {
                ...this.state.editState,
                date
            }
        })
    }

    changeJournal(journal: string) {
        this.setState({
            ...this.state,
            editState: {
                ...this.state.editState,
                journal
            }
        })
    }

    changePublicationType(publicationType: string) {
        this.setState({
            ...this.state,
            editState: {
                ...this.state.editState,
                publicationType
            }
        })
    }

    changeURL(url: string) {
        this.setState({
            ...this.state,
            editState: {
                ...this.state.editState,
                url
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
        const externalIds = this.state.editState.externalIds.slice();
        externalIds[index].type = type;

        this.setState({
            ...this.state,
            editState: {
                ...this.state.editState,
                externalIds
            }
        })
    }

    changeExternalIdValue(value: string, index: number) {
        const externalIds = this.state.editState.externalIds.slice();
        externalIds[index].value = value;

        this.setState({
            ...this.state,
            editState: {
                ...this.state.editState,
                externalIds
            }
        })
    }

    changeExternalIdRelationship(value: string, index: number) {
        const externalIds = this.state.editState.externalIds.slice();
        externalIds[index].relationship = value;

        this.setState({
            ...this.state,
            editState: {
                ...this.state.editState,
                externalIds
            }
        })
    }

    changeExternalIdURL(url: string, index: number) {
        const externalIds = this.state.editState.externalIds.slice();
        externalIds[index].url = url;

        this.setState({
            ...this.state,
            editState: {
                ...this.state.editState,
                externalIds
            }
        })
    }

    addExternalIdentifier() {
        const externalIds = this.state.editState.externalIds.slice();
        externalIds.push({
            type: '',
            relationship: '',
            url: '',
            value: ''
        });
        this.setState({
            ...this.state,
            editState: {
                ...this.state.editState,
                externalIds
            }
        })
    }

    doSave() {
        // Gather the record
        const update = this.state.editState;

        // Call the props function
        this.props.onSave(update);
    }

    renderExternalIds() {
        return <EditExternalIdentifiers
            externalIds={this.state.editState.externalIds}
            workExternalIdentifierTypes={this.props.workExternalIdentifierTypes}
            workRelationshipIdentifiers={this.props.workRelationshipIdentifiers}
            onChanged={(externalIds: Array<ExternalId>) => {
                this.setState({
                    editState: {
                        ...this.state.editState,
                        externalIds
                    }
                });
            }}
        />
    }

    render() {
        return <Form className={`${styles.main} well`} style={{ padding: '1em' }}>
            <div className="flex-table">
                <div className="flex-row">
                    <div className="flex-col" style={ROW_HEADER} >
                        Publication Type
                    </div>
                    <div className="flex-col">
                        <input type="text" className="form-control" value={this.state.editState.publicationType}
                            onInput={(e) => { this.changePublicationType(e.currentTarget.value) }} />
                    </div>
                </div>
                <div className="flex-row">
                    <div className="flex-col" style={ROW_HEADER} >
                        Title
                    </div>
                    <div className="flex-col">
                        <input type="text" className="form-control" value={this.state.editState.title}
                            onInput={(e) => { this.changeTitle(e.currentTarget.value) }} />
                    </div>
                </div>
                <div className="flex-row">
                    <div className="flex-col" style={ROW_HEADER} >
                        Publisher
                    </div>
                    <div className="flex-col">
                        <input type="text" className="form-control" value={this.state.editState.journal}
                            onInput={(e) => { this.changeJournal(e.currentTarget.value) }} />
                    </div>
                </div>
                <div className="flex-row">
                    <div className="flex-col" style={ROW_HEADER} >
                        Date
                    </div>
                    <div className="flex-col">
                        <input type="text" className="form-control" value={this.state.editState.date}
                            onInput={(e) => { this.changeDate(e.currentTarget.value) }} />
                    </div>
                </div>
                <div className="flex-row">
                    <div className="flex-col" style={ROW_HEADER} >
                        URL
                    </div>
                    <div className="flex-col">
                        <input type="text" className="form-control" value={this.state.editState.url}
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
                <div className="flex-row" style={{ justifyContent: 'center', marginTop: '2em' }}>
                    {/* <Button variant="danger" onClick={this.props.onDeleteConfirm} style={{ marginRight: '0.5em' }}>
                        <span className="fa fa-trash" /> Confirm
                    </Button> */}
                    <div className="btn-group">
                        <Button variant="primary" onClick={this.doSave.bind(this)}>
                            <span className="fa fa-pencil" /> Save
                        </Button>
                        <Button variant="outline-danger" onClick={this.props.onClose}>
                            <span className="fa fa-times-circle" /> Close
                        </Button>
                    </div>
                </div>
            </div>
        </Form >;
    }
}