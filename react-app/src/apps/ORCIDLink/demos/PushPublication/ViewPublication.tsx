import { Publication } from "apps/ORCIDLink/Model";
import { Component } from "react";
import { Button } from "react-bootstrap";
import PublicationView from "./PublicationView";

export interface ViewPublicationProps {
    publication: Publication;
    onCancel: () => void;
}

interface ViewPublicationState {

}

export default class ViewPublication extends Component<ViewPublicationProps, ViewPublicationState> {
    render() {
        return <div className="well">
            <div className="well-header">
                View Publication
            </div>

            <div className="well-body">
                <PublicationView publication={this.props.publication} />
            </div>

            <div className="well-footer" style={{ justifyContent: 'center' }}>
                <Button variant="outline-danger" onClick={this.props.onCancel}>
                    <span className="fa fa-times-circle" /> Close
                </Button>
            </div>
        </div>;
    }
}