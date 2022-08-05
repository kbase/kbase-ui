import { EditablePublication, Model, ORCIDProfile, Publication } from "apps/ORCIDLink/Model";
import AlertMessage from "components/AlertMessage";
import ErrorAlert from "components/ErrorAlert";
import { isEqual } from "lib/kb_lib/Utils";
import { Component } from "react";
import { Button, } from "react-bootstrap";
import AddNewPublication from "./Add/Controller";
import DeletePublication from "./DeletePublication";
import EditPublication from "./Edit/Controller";
import ViewPublication from "./ViewPublication";
import styles from './PushPublicationForm.module.css';

export interface PushPublicationFormProps {
    profile: ORCIDProfile;
    model: Model;
    syncProfile: () => Promise<void>;
    deletePublication: (putCode: string) => Promise<void>
}

// Deletion State

export enum DeletionStatus {
    PENDING = 'PENDING',
    SUCCESS = 'SUCCESS',
    ERROR = 'ERROR'
}

export interface DeletionStateBase {
    status: DeletionStatus;
}

export interface DeletionStatePending<T> extends DeletionStateBase {
    status: DeletionStatus.PENDING,
    value: T
}

export interface DeletionStateSuccess extends DeletionStateBase {
    status: DeletionStatus.SUCCESS
}

export interface DeletionStateError<E> extends DeletionStateBase {
    status: DeletionStatus.ERROR,
    error: E
}

export type DeletionState<T, E> =
    DeletionStatePending<T> |
    DeletionStateSuccess |
    DeletionStateError<E>;

// Edit Area

export enum EditAreaType {
    NONE = 'NONE',
    NEW = 'NEW',
    UPDATE = 'UPDATE',
    DELETE = 'DELETE',
    VIEW = 'VIEW'
}

export interface NewPublication {
    title: string
}

export interface EditAreaBase {
    type: EditAreaType;
}

export interface EditAreaNone extends EditAreaBase {
    type: EditAreaType.NONE
}

export interface EditAreaNew extends EditAreaBase {
    type: EditAreaType.NEW,
    publication: NewPublication;
}

export interface EditAreaUpdate extends EditAreaBase {
    type: EditAreaType.UPDATE,
    publication: Publication;
}

export interface EditAreaDelete extends EditAreaBase {
    type: EditAreaType.DELETE,
    deletionState: DeletionState<Publication, { message: string }>
    // publication: Publication;
}

export interface EditAreaView extends EditAreaBase {
    type: EditAreaType.VIEW,
    publication: Publication;
}


export type EditArea =
    EditAreaNone |
    EditAreaNew |
    EditAreaUpdate |
    EditAreaDelete |
    EditAreaView;


interface PushPublicationFormState {
    profile: ORCIDProfile;

    // Editing

    editArea: EditArea;

    firstName: string;
    lastName: string;
    name: string;
    bio: string;
    publications: Array<Publication>;
}

export default class PushPublicationForm extends Component<PushPublicationFormProps, PushPublicationFormState> {
    constructor(props: PushPublicationFormProps) {
        super(props);
        const initialState = this.stateFromProps()
        this.state = {
            ...initialState,
            editArea: {
                type: EditAreaType.NONE
            }
        }
    }

    stateFromProps() {
        return {
            profile: this.props.profile,
            firstName: this.props.profile.firstName,
            lastName: this.props.profile.lastName,
            name: this.props.profile.firstName + ' ' + this.props.profile.lastName,
            bio: this.props.profile.bio,
            publications: this.props.profile.publications,
        };
    }

    componentDidUpdate(prevProps: PushPublicationFormProps, prevState: PushPublicationFormState) {
        if (!isEqual(prevState.profile, this.props.profile)) {
            this.setState(this.stateFromProps());
        }

        // if (prevState.firstName === this.props.profile.firstName &&
        //     prevState.lastName === this.props.profile.lastName &&
        //     prevState.bio === this.props.profile.bio) {
        //     return;
        // }

    }

    changeFirstName(firstName: string) {
        this.setState({
            firstName
        });
    }

    changeLastName(lastName: string) {
        this.setState({
            lastName
        });
    }

    changeName(name: string) {
        this.setState({
            name
        });
    }

    changeBio(bio: string) {
        this.setState({
            bio
        });
    }

    onClearForm() {
        this.setState({
            firstName: '',
            lastName: '',
            name: '',
            bio: '',
            publications: []
        })
    }

    onSyncForm() {
        this.props.syncProfile();
    }

    onDelete(publicationIndex: number) {
        console.log('on delete', publicationIndex);
        this.setState({
            editArea: {
                type: EditAreaType.DELETE,
                deletionState: {
                    status: DeletionStatus.PENDING,
                    value: this.props.profile.publications[publicationIndex]
                }
            }
        })
    }

    onEdit(publicationIndex: number) {
        this.setState({
            editArea: {
                type: EditAreaType.UPDATE,
                publication: this.props.profile.publications[publicationIndex]
            }
        })
        // this.setState({
        //     editArea: {
        //         type: EditAreaType.NONE
        //     }
        // }, () => {
        //     this.setState({
        //         editArea: {
        //             type: EditAreaType.UPDATE,
        //             publication: this.props.profile.publications[publicationIndex]
        //         }
        //     })
        // });
    }

    onView(publicationIndex: number) {
        this.setState({
            editArea: {
                type: EditAreaType.VIEW,
                publication: this.props.profile.publications[publicationIndex]
            }
        })
    }

    onAdd() {
        this.setState({
            editArea: {
                type: EditAreaType.NEW,
                publication: {
                    title: ''
                }
            }
        })
    }

    renderPublications() {
        const rows = this.state.publications.map(({ putCode, createdAt, updatedAt, title, date, journal, publicationType, source, url }, index) => {
            const canEdit = (source === 'KBase CI');
            const button = (() => {
                if (source === 'KBase CI') {
                    return <div className="btn-group">
                        <Button variant="primary" onClick={() => { this.onEdit(index); }} ><span className="fa fa-edit" /></Button>
                        <Button variant="danger" onClick={() => { this.onDelete(index); }} ><span className="fa fa-trash" /></Button>
                    </div>;
                }
                return <Button variant="secondary" onClick={() => { this.onView(index); }} ><span className="fa fa-eye" /></Button>
            })();
            //  <td><Button variant="primary" disabled={!canEdit} onClick={() => { console.log('here'); this.onEdit(index); }} ><span className="fa fa-edit" /> Edit</Button></td>
            //     <td><Button variant="danger" disabled={!canEdit} onClick={() => { console.log('here'); this.onDelete(index); }}><span className="fa fa-trash" /> Remove</Button></td>
            return <tr key={index}>
                <td>{title}</td>
                <td>{date}</td>
                <td>{journal}</td>
                <td>{putCode}</td>
                <td>{button}</td>
            </tr>
        });
        return <table className="table table-bordered">
            <thead>
                <tr>
                    <th>Title</th>
                    <th>Date</th>
                    <th>Journal</th>
                    <th>Put Code</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {rows}
            </tbody>
        </table>
    }

    onPublish() {
        alert('Will publish');
    }

    renderIntro() {
        return <div>
            <h2>
                DEMO: Push Publication to ORCID Activity Record
            </h2>
            <p>
                <a href="/#orcidlink">Back</a>
            </p>
            <p>
                This is a demonstration of using form at KBase to push a Narrative publication to ORCID.
            </p>
            <p>
                Here are some things to do:
            </p>
            <ul>
                <li>
                    thing 1
                </li>
                <li>
                    thing 2
                </li>
            </ul>
        </div>
    }

    renderEditAreaNone() {
        return <div>
            <p>
                This area reserved for adding, editing, and deleting a Publication
            </p>
        </div>
    }

    renderEditAreaNew(editArea: EditAreaNew) {
        return <div>
            <h2>Add New Publication Record</h2>
            <AddNewPublication model={this.props.model} onClose={this.onDone.bind(this)} />
        </div>
    }

    async onSave(update: EditablePublication) {

    }

    async onDelete2(putCode: string) {
        this.props.deletePublication(putCode);
    }

    renderEditAreaUpdate(editArea: EditAreaUpdate) {
        return <div>
            <h2>Edit Publication Record</h2>
            <EditPublication model={this.props.model} onClose={this.onDone.bind(this)} putCode={editArea.publication.putCode} />
        </div>
    }

    onConfirmDelete() {

    }

    onCancelDelete() {

    }

    closeEditArea() {
        this.setState({
            editArea: {
                type: EditAreaType.NONE
            }
        })
    }

    // async deletePublication(publication: Publication) {
    //     if (this.state.editArea.type !== EditAreaType.DELETE) {
    //         return;
    //     }
    //     try {

    //         await this.props.deletePublication(publication.putCode);
    //         this.setState({
    //             editArea: {
    //                 ...this.state.editArea,
    //                 deletionState: {
    //                     status: DeletionStatus.SUCCESS
    //                 }
    //             }
    //         })
    //     } catch (ex) {
    //         if (ex instanceof Error) {
    //             this.setState({
    //                 editArea: {
    //                     ...this.state.editArea,
    //                     deletionState: {
    //                         status: DeletionStatus.ERROR,
    //                         error: {
    //                             message: ex.message
    //                         }
    //                     }
    //                 }
    //             })
    //         }
    //     }
    // }

    onDone() {
        this.setState({
            editArea: {
                type: EditAreaType.NONE
            }
        })
    }

    renderEditAreaDelete(editArea: EditAreaDelete) {
        const deletionState = editArea.deletionState;
        switch (deletionState.status) {
            case DeletionStatus.PENDING:
                return <div>
                    <h2>Confirm Publication Removal from ORCID Record</h2>
                    <DeletePublication publication={deletionState.value}
                        onDeleteConfirm={() => this.props.deletePublication(deletionState.value.putCode)}
                        onCancel={() => this.closeEditArea()}
                    />
                </div>;
            case DeletionStatus.SUCCESS:
                return <div>
                    <AlertMessage type="success">Successfully removed this publication from your ORCID record</AlertMessage>
                    <Button variant="primary" onClick={this.onDone.bind(this)}>Done</Button>
                </div>
            case DeletionStatus.ERROR:
                return <ErrorAlert message={`Error removing this publication from your ORCID record: ${deletionState.error.message}`} />
        }
    }

    renderEditAreaView(editArea: EditAreaView) {
        return <ViewPublication publication={editArea.publication} onCancel={this.closeEditArea.bind(this)} />
    }

    renderEditArea() {
        switch (this.state.editArea.type) {
            case EditAreaType.NONE:
                return this.renderEditAreaNone();
            case EditAreaType.NEW:
                return this.renderEditAreaNew(this.state.editArea);
            case EditAreaType.UPDATE:
                return this.renderEditAreaUpdate(this.state.editArea);
            case EditAreaType.DELETE:
                return this.renderEditAreaDelete(this.state.editArea);
            case EditAreaType.VIEW:
                return this.renderEditAreaView(this.state.editArea);
        }
    }

    render() {
        // <h4>Add Publication</h4>
        // { this.renderForm() }
        return <div className={`${styles.main} flex-table`}>
            <div className="flex-row">
                <div className="flex-col">
                    {this.renderIntro()}
                    <h4>New Publication</h4>
                    <div className="button-toolbar">
                        <Button variant="primary" onClick={() => { console.log('here'); this.onAdd(); }} ><span className="fa fa-plus-circle" /> Add Publication</Button>
                    </div>
                    <h4 style={{ marginTop: '2em' }}>Existing Publications</h4>
                    {this.renderPublications()}
                </div>
                <div className="flex-col">
                    {this.renderEditArea()}
                </div>
            </div>
        </div>;
    }
}