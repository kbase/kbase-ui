import { renderORCIDIcon } from "apps/ORCIDLink/common";
import { ORCID_URL } from "apps/ORCIDLink/constants";
import { ORCIDProfile, Work } from "apps/ORCIDLink/ORCIDLinkClient";
import AlertMessage from "components/AlertMessage";
import ErrorAlert from "components/ErrorAlert";
import { isEqual } from "lib/kb_lib/Utils";
import { Component } from "react";
import { Accordion, Alert, Button } from "react-bootstrap";
import AddNewWork from "./Add/Controller";
import DeleteWork from "./Delete/Controller";
import EditWork from "./Edit/Controller";
import styles from './PushWorkForm.module.css';
import { EditableWork, PushWorksModel } from "./PushWorksModel";
import ViewWork from "./ViewWork";

export interface PushWorkFormProps {
    profile: ORCIDProfile;
    model: PushWorksModel;
    syncProfile: () => Promise<void>;
    deleteWork: (putCode: string) => Promise<void>
    setTitle: (title: string) => void;
    createWork: (work: EditableWork) => Promise<void>;
    updateWork: (work: EditableWork) => Promise<void>;
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

export interface NewWork {
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
    work: NewWork;
}

export interface EditAreaUpdate extends EditAreaBase {
    type: EditAreaType.UPDATE,
    work: Work;
}

export interface EditAreaDelete extends EditAreaBase {
    type: EditAreaType.DELETE,
    deletionState: DeletionState<Work, { message: string }>
}

export interface EditAreaView extends EditAreaBase {
    type: EditAreaType.VIEW,
    work: Work;
}

export type EditArea =
    EditAreaNone |
    EditAreaNew |
    EditAreaUpdate |
    EditAreaDelete |
    EditAreaView;

interface PushWorkFormState {
    profile: ORCIDProfile;

    // Editing

    editArea: EditArea;

    firstName: string;
    lastName: string;
    name: string;
    bio: string;
    works: Array<Work>;
}

export default class PushWorkForm extends Component<PushWorkFormProps, PushWorkFormState> {
    constructor(props: PushWorkFormProps) {
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
            works: this.props.profile.works,
        };
    }

    componentDidUpdate(prevProps: PushWorkFormProps, prevState: PushWorkFormState) {
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
            works: []
        })
    }

    onSyncForm() {
        this.props.syncProfile();
    }

    onDelete(workIndex: number) {
        this.setState({
            editArea: {
                type: EditAreaType.DELETE,
                deletionState: {
                    status: DeletionStatus.PENDING,
                    value: this.props.profile.works[workIndex]
                }
            }
        })
    }

    onEdit(workIndex: number) {
        this.setState({
            editArea: {
                type: EditAreaType.UPDATE,
                work: this.props.profile.works[workIndex]
            }
        })
    }

    onView(workIndex: number) {
        this.setState({
            editArea: {
                type: EditAreaType.VIEW,
                work: this.props.profile.works[workIndex]
            }
        })
    }

    onAdd() {
        this.setState({
            editArea: {
                type: EditAreaType.NEW,
                work: {
                    title: ''
                }
            }
        })
    }

    renderWorks() {
        const rows = this.state.works.map(({ putCode, title, date, journal, workType, url, source }, index) => {
            const canEdit = (source === 'KBase CI');
            const button = (() => {
                if (source === 'KBase CI') {
                    return <div className="btn-group">
                        <Button variant="primary" onClick={() => { this.onEdit(index); }} ><span className="fa fa-edit" /></Button>
                        <Button variant="danger" onClick={() => { this.onDelete(index); }} ><span className="fa fa-trash" /></Button>
                    </div>;
                }
                return <Button variant="secondary" onClick={() => { this.onView(index); }} title="This work may only be viewed at KBase, since it was not created through KBase."><span className="fa fa-eye" /></Button>
            })();
            return <tr key={index}>
                <td>{title}</td>
                <td>{date}</td>
                <td>{journal}</td>
                <td>{button}</td>
            </tr>
        });
        return <table className="table table-bordered mt-3">
            <thead>
                <tr>
                    <th>Title</th>
                    <th>Date</th>
                    <th>Journal</th>
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

    renderORCIDLink(label: string) {
        return <a href={`${ORCID_URL}/${this.props.profile.orcidId}`} target="_blank">
            {renderORCIDIcon()}
            {label}
        </a>
    }

    renderIntro() {
        return <div>
            <h2>
                DEMO: Push Work to ORCID Activity Record
            </h2>
            <p>
                <Button variant="secondary" href="/#orcidlink/demos"><span className="fa fa-mail-reply" /> Back</Button>
            </p>
            <p>
                This is a demonstration of using form at KBase to push a Narrative publication to ORCID.
            </p>

            <Accordion>
                <Accordion.Item eventKey="0">
                    <Accordion.Header>
                        Things to Do
                    </Accordion.Header>
                    <Accordion.Body>
                        <ul>
                            <li>
                                Click the <b>Add Work</b> button to add a work to your ORCID profile
                            </li>
                            <li>
                                Click the <b>Edit</b> button to edit the given work
                            </li>
                            <li>
                                Click the <b>View</b> button to view the given work
                            </li>
                            <li>
                                View {this.renderORCIDLink("your profile")} to confirm that works are the same as here
                            </li>
                        </ul>
                    </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="1">
                    <Accordion.Header>
                        Why are some view only?
                    </Accordion.Header>
                    <Accordion.Body>
                        <p>
                            Only workds created by this app are editable by it. Those created
                            by other means, such as directly on the ORCID site, are not.
                        </p>
                        <p>
                            Conversely, those created by this app are not editable on the ORCID site!
                        </p>
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>
        </div>
    }

    renderEditAreaNone() {
        return <Alert variant="info">
            This area reserved for adding, editing, and deleting a Work
        </Alert>
    }

    renderEditAreaNew(editArea: EditAreaNew) {
        return <AddNewWork
            setTitle={this.props.setTitle}
            createWork={this.props.createWork}
            onClose={this.onDone.bind(this)} />
    }

    async onSave(update: EditableWork) {

    }

    async onDelete2(putCode: string) {
        this.props.deleteWork(putCode);
    }

    renderEditAreaUpdate(editArea: EditAreaUpdate) {
        return <EditWork
            model={this.props.model}
            onClose={this.onDone.bind(this)}
            setTitle={this.props.setTitle}
            updateWork={this.props.updateWork}
            putCode={editArea.work.putCode} />
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

    onDone() {
        this.setState({
            editArea: {
                type: EditAreaType.NONE
            }
        })
    }

    onDeleted() {
        // refresh...
        this.props.syncProfile();
    }

    renderEditAreaDelete(editArea: EditAreaDelete) {
        const deletionState = editArea.deletionState;
        switch (deletionState.status) {
            case DeletionStatus.PENDING:
                return <DeleteWork
                    work={deletionState.value}
                    model={this.props.model}
                    // onDeleteConfirm={() => this.props.deleteWork(deletionState.value.putCode)}
                    onDeleted={this.onDeleted.bind(this)}
                    onCanceled={() => this.closeEditArea()}
                />
            case DeletionStatus.SUCCESS:
                return <div>
                    <AlertMessage type="success">Successfully removed this work from your ORCID record</AlertMessage>
                    <Button variant="primary" onClick={this.onDone.bind(this)}>Done</Button>
                </div>
            case DeletionStatus.ERROR:
                return <ErrorAlert message={`Error removing this work from your ORCID record: ${deletionState.error.message}`} />
        }
    }

    renderEditAreaView(editArea: EditAreaView) {
        return <ViewWork work={editArea.work} onCancel={this.closeEditArea.bind(this)} />
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
        // <h4>Add Work</h4>
        // { this.renderForm() }
        return <div className={`${styles.main} flex-table`}>
            <div className="flex-row">
                <div className="flex-col">
                    {this.renderIntro()}
                    <h4 style={{ marginTop: '2em' }}>Works</h4>
                    <div className="button-toolbar">
                        <Button variant="primary" onClick={() => { this.onAdd(); }} ><span className="fa fa-plus-circle" /> Add Work</Button>
                    </div>
                    {this.renderWorks()}
                </div>
                <div className="flex-col">
                    {this.renderEditArea()}
                </div>
            </div>
        </div>;
    }
}
