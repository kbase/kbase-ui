import { Work } from "apps/ORCIDLink/ORCIDLinkClient";
import { Component } from "react";
import { Button } from "react-bootstrap";
import WorkView from "./WorkView";

export interface ViewWorkProps {
    work: Work;
    onCancel: () => void;
}

interface ViewWorkState {

}

export default class ViewWork extends Component<ViewWorkProps, ViewWorkState> {
    render() {
        return <div className="well">
            <div className="well-header">
                View Work
            </div>

            <div className="well-body">
                <WorkView work={this.props.work} />
            </div>

            <div className="well-footer" style={{ justifyContent: 'center' }}>
                <Button variant="outline-danger" onClick={this.props.onCancel}>
                    <span className="fa fa-times-circle" /> Close
                </Button>
            </div>
        </div>;
    }
}