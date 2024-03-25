import Well from "components/Well";
import { LinkChoice } from "lib/kb_lib/Auth2";
import { Component } from "react";
import { Button, ButtonToolbar } from "react-bootstrap";
import { providerLabel } from "../Providers";
import TextSpan from "../TextSpan";
import ContinueHeader from "./ContinueHeader";

export interface LinkContinueViewProps {
    linkChoice: LinkChoice
    serverTimeOffset: number;
    cancelLink: (message: string) => void;
    linkIdentity: () => void;
}

interface LinkContinueViewState {

}

export default class LinkContinueView extends Component<LinkContinueViewProps, LinkContinueViewState> {
    renderContinueDialog() {
        return <div>
            <p>
                You have requested to link the 
                <TextSpan bold>{providerLabel(this.props.linkChoice.provider)}</TextSpan> account 
                <TextSpan bold>{this.props.linkChoice.provusername}</TextSpan> to your KBase account 
                <TextSpan bold>{this.props.linkChoice.user}</TextSpan>
            </p>
            <ButtonToolbar>
                <Button variant="primary" className="me-2"
                    onClick={this.props.linkIdentity}>
                    Link <b>{this.props.linkChoice.provusername}</b>
                </Button>
                <Button variant="outline-danger"
                    onClick={() => { this.props.cancelLink('Canceling linking session'); }}>
                    Cancel &amp; Return to Links Page
                </Button>
            </ButtonToolbar>
        </div>
    }
    render() {
        return <div className="LinkContinue">
            <ContinueHeader
                name="Linking"
                choice={this.props.linkChoice}
                cancelChoiceSession={() => {
                    this.props.cancelLink('Your Linking session has expired');
                }}
                serverTimeOffset={this.props.serverTimeOffset}
            />
            <Well variant="primary">
                <Well.Header>
                    <span>Ready to Link </span>
                </Well.Header>
                <Well.Body>
                    {this.renderContinueDialog()}
                </Well.Body>
            </Well>
        </div>
    }
}
