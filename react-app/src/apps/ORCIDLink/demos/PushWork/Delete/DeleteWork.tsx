import { Work } from "apps/ORCIDLink/ORCIDLinkClient";
import { Component } from "react";
import { Button, Form } from "react-bootstrap";
import WorkView from "../WorkView";
import styles from './DeleteWorkForm.module.css';
import { HEADER_STYLE } from "../styles";

export interface DeleteWorkProps {
    work: Work;
    onDeleteConfirm: () => Promise<void>;
    onCancel: () => void;
}

interface DeleteWorkState {

}


export default class DeleteWork extends Component<DeleteWorkProps, DeleteWorkState> {
    render() {
        return <Form className={`${styles.main} well`} style={{ padding: '1em' }}>
            <div className="flex-table">
                <div className="flex-row" style={HEADER_STYLE}>
                    Remove Work from ORCID Record
                </div>

                <div className="flex-row">
                    <WorkView work={this.props.work} />
                </div>

                <div className="flex-row" style={{ justifyContent: 'center', marginTop: '1em' }}>
                    <div className="btn-group">
                        <Button variant="danger" onClick={this.props.onDeleteConfirm} >
                            <span className="fa fa-trash" /> Remove this Work
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