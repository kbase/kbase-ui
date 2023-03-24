import { Work } from "apps/ORCIDLink/lib/ORCIDLinkClient";
import { changeHash2 } from "lib/navigation";
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
    onDone() {
        changeHash2("narrativepublishing")
    }
    render() {
        return <div className="well">
            <div className="well-header">
                View Work
            </div>

            <div className="well-body">
                <WorkView work={this.props.work} />
            </div>

            <div className="well-footer" style={{ justifyContent: 'center' }}>
                <Button variant="outline-danger" onClick={() => { this.onDone() }}>
                    <span className="fa fa-mail-reply" /> Return to Narrative Publication Manager
                </Button>
            </div>
        </div>;
    }
}