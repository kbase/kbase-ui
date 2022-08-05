import { Publication } from "apps/ORCIDLink/Model";
import { Component } from "react";
import { Button, Form } from "react-bootstrap";
import styles from './PushPublicationForm.module.css';

export interface DeletePublicationProps {
    publication: Publication;
    onDeleteConfirm: () => Promise<void>;
    onCancel: () => void;
}

interface DeletePublicationState {

}


export default class DeletePublication extends Component<DeletePublicationProps, DeletePublicationState> {

    constructor(props: DeletePublicationProps) {
        super(props);
        this.state = {
        }
    }

    render() {
        return <Form className={`${styles.main} well`} style={{ padding: '1em' }}>
            <div className="flex-table">
                <div className="flex-row">
                    <div className="flex-col" style={{ flex: '0 0 10em', fontWeight: 'bold', color: 'rgba(150, 150, 150)' }} >
                        Title
                    </div>
                    <div className="flex-col">
                        {this.props.publication.title}
                    </div>
                </div>
                <div className="flex-row">
                    <div className="flex-col" style={{ flex: '0 0 10em', fontWeight: 'bold', color: 'rgba(150, 150, 150)' }} >
                        Date
                    </div>
                    <div className="flex-col">
                        {this.props.publication.date}
                    </div>
                </div>
                <div className="flex-row">
                    <div className="flex-col" style={{ flex: '0 0 10em', fontWeight: 'bold', color: 'rgba(150, 150, 150)' }} >
                        Publication
                    </div>
                    <div className="flex-col">
                        {this.props.publication.journal}
                    </div>
                </div>

                <div className="flex-row" style={{ justifyContent: 'center', marginTop: '1em' }}>
                    <div className="btn-group">
                        <Button variant="danger" onClick={this.props.onDeleteConfirm} >
                            <span className="fa fa-trash" /> Confirm
                        </Button>
                        <Button variant="outline-danger" onClick={this.props.onCancel}>
                            <span className="fa fa-times-circle" /> Cancel
                        </Button>
                    </div>
                </div>
            </div>
        </Form >;
    }
}