import { ORCIDProfile } from "apps/ORCIDLink/ORCIDLinkClient";
import Well from "components/Well";
import { Component } from "react";
import { Button, Col, Row } from "react-bootstrap";

export interface ORCIDLinkProps {
    orcidProfile: ORCIDProfile | null;
    onDone: () => void;
    onStartLink: () => void;
}


interface ORCIDLinkState {

}

export default class ORCIDLink extends Component<ORCIDLinkProps, ORCIDLinkState>{
    renderIsLinked({ orcidId, firstName, lastName }: ORCIDProfile) {
        return <div>
            <h3>Linked</h3>
            <p>
                Your KBase account is linked to ORCID account <b>{orcidId}</b> for <b>{firstName} {lastName}</b>.
            </p>
            <p>
                Thanks to this link, parts of your DOI Request form will be auto-populated from
                your ORCID profile.
            </p>
        </div>
    }

    renderIsNotLinked() {
        return <div>
            <h3>Not Linked</h3>
            <p>
                Your KBase account is not linked to an ORCID account.
            </p>
            <p>
                If you have an ORCID account, linking your KBase account gives you some modest benefits
                when usinge KBase:
                <ul>
                    <li>Auto-fill forms from your ORCID Profile</li>
                    <li>Auto-submission of your KBase Narrative Publication to your ORCID Profile's work activity.</li>
                </ul>
            </p>
            <p>
                You may use the button below to start the linking process, or simply
                press the "Next" button to proceed without it.
            </p>
            <p>
                <Button variant="primary" onClick={this.props.onStartLink}>Link</Button>
            </p>
        </div>
    }

    renderState() {
        console.log('linked?', this.props.orcidProfile);
        if (this.props.orcidProfile) {
            return this.renderIsLinked(this.props.orcidProfile);
        }
        return this.renderIsNotLinked();
    }

    render() {
        return <Well style={{ padding: '1em', marginBottom: '1em' }}>
            {this.renderState()}
            <Row>
                <Col md={12}>
                    <Row style={{ justifyContent: 'center' }} >
                        <Button variant="primary" className="w-auto" onClick={this.props.onDone}>Next <span className="fa fa-hand-o-down" /></Button>
                    </Row>
                </Col>
            </Row>
        </Well>
    }
}
