import { Publication } from "apps/ORCIDLink/ORCIDLinkClient";
import { Component } from "react";
import { Button, Form } from "react-bootstrap";
import PublicationView from "./PublicationView";
import styles from './PushPublicationForm.module.css';
import { HEADER_STYLE } from "./styles";

export interface DeletePublicationProps {
    publication: Publication;
    onDeleteConfirm: () => Promise<void>;
    onCancel: () => void;
}

interface DeletePublicationState {

}


export default class DeletePublication extends Component<DeletePublicationProps, DeletePublicationState> {
    render() {
        return <Form className={`${styles.main} well`} style={{ padding: '1em' }}>
            <div className="flex-table">
                <div className="flex-row" style={HEADER_STYLE}>
                    Remove Publication from ORCID Record
                </div>

                <div className="flex-row">
                    <PublicationView publication={this.props.publication} />
                </div>

                <div className="flex-row" style={{ justifyContent: 'center', marginTop: '1em' }}>
                    <div className="btn-group">
                        <Button variant="danger" onClick={this.props.onDeleteConfirm} >
                            <span className="fa fa-trash" /> Remove this Publication
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