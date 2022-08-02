import { Publication } from "apps/ORCIDLink/Model";
import { Component } from "react";
import { Button, Form } from "react-bootstrap";
import styles from './PushPublicationForm.module.css';

export interface AddNewPublicationProps {
    onCancel: () => void;
}

interface AddNewPublicationState {
    editState: {
        publicationType: string;
        title: string;
        date: string;
        journal: string;
    }
}


export default class AddNewPublication extends Component<AddNewPublicationProps, AddNewPublicationState> {

    constructor(props: AddNewPublicationProps) {
        super(props);
        this.state = {
            editState: {
                publicationType: '',
                title: '',
                date: '',
                journal: ''
            }
        }
    }

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
    render() {
        return <Form className={`${styles.main} well`} style={{ padding: '1em' }}>
            <div className="flex-table">
                <div className="flex-row">
                    <div className="flex-col" style={{ flex: '0 0 10em', fontWeight: 'bold', color: 'rgba(150, 150, 150)' }} >
                        Publication Type
                    </div>
                    <div className="flex-col">
                        <input type="text" className="form-control" value={this.state.editState.publicationType}
                            onInput={(e) => { this.changePublicationType(e.currentTarget.value) }} />
                    </div>
                </div>
                <div className="flex-row">
                    <div className="flex-col" style={{ flex: '0 0 10em', fontWeight: 'bold', color: 'rgba(150, 150, 150)' }} >
                        Title
                    </div>
                    <div className="flex-col">
                        <input type="text" className="form-control" value={this.state.editState.title}
                            onInput={(e) => { this.changeTitle(e.currentTarget.value) }} />
                    </div>
                </div>
                <div className="flex-row">
                    <div className="flex-col" style={{ flex: '0 0 10em', fontWeight: 'bold', color: 'rgba(150, 150, 150)' }} >
                        Date
                    </div>
                    <div className="flex-col">
                        <input type="text" className="form-control" value={this.state.editState.date}
                            onInput={(e) => { this.changeDate(e.currentTarget.value) }} />
                    </div>
                </div>
                <div className="flex-row">
                    <div className="flex-col" style={{ flex: '0 0 10em', fontWeight: 'bold', color: 'rgba(150, 150, 150)' }} >
                        Publication (Journal)
                    </div>
                    <div className="flex-col">
                        <input type="text" className="form-control" value={this.state.editState.journal}
                            onInput={(e) => { this.changeJournal(e.currentTarget.value) }} />
                    </div>
                </div>

                <div className="flex-row" style={{ justifyContent: 'center', marginTop: '1em' }}>
                    {/* <Button variant="danger" onClick={this.props.onDeleteConfirm} style={{ marginRight: '0.5em' }}>
                        <span className="fa fa-trash" /> Confirm
                    </Button> */}
                    <Button variant="outline-danger" onClick={this.props.onCancel}>
                        <span className="fa fa-times-circle" /> Cancel
                    </Button>
                </div>
            </div>
        </Form >;
    }
}