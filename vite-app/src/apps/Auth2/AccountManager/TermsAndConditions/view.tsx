import { PolicyAgreement } from "apps/Auth2/SignInContinue/PolicyAndAgreement";
import Well from "components/Well";
import { niceTime } from "lib/time";
import { Component } from "react";
import { Button, Col, Container, Form, Row } from "react-bootstrap";

export interface TermsAndConditionsViewProps {
    agreement: PolicyAgreement;
}

interface TermsAndConditionsViewState {

}

export default class TermsAndConditionsView extends Component<TermsAndConditionsViewProps, TermsAndConditionsViewState> {
    renderInfo() {
        return <Container fluid>
            <Row className="mb-2">
                <Col md={4}>
                    <Form.Label htmlFor="viewer" role="label" style={{marginBottom: '0'}}>
                        View the Terms and Conditions
                    </Form.Label>
                    <div id="viewer">
                        <Button href={this.props.agreement.currentPolicy.url.toString()} variant="outline-primary" target="_blank">View current Terms and Conditions ({this.props.agreement.currentPolicy.version})</Button>
                    </div>
                </Col>
                <Col md={8}>
                    <Row>
                        View the current Terms and Conditions on the KBase website.
                    </Row>
                </Col>
            </Row>
            <Row className="mb-2">
                <Col md={4}>
                    <Form.Label htmlFor="version" role="label" style={{marginBottom: '0'}}>
                        Version
                    </Form.Label>
                    <div id="version">{this.props.agreement.currentPolicy.version}</div>
                </Col>
                <Col md={8}>
                    <Row>
                        The KBase Terms and Conditions is updated from time to time; each updated
                        has a new version.
                    </Row>
                </Col>
            </Row>
            <Row className="mb-2">
                <Col md={4}>
                    <Form.Label htmlFor="publishedAt" role="label" style={{marginBottom: '0'}}>
                        Published At
                    </Form.Label>
                    <div id="publishedAt">{niceTime(this.props.agreement.currentPolicy.publishedAt)}</div>
                </Col>
                <Col md={8}>
                    <Row >
                     The KBase Terms and Conditions is updated from time to time; each updated
                        has a new publication date.
                    </Row>
                </Col>
            </Row>
            <Row className="mb-2">
                <Col md={4}>
                    <Form.Label htmlFor="agreedAt" role="label" style={{marginBottom: '0'}}>
                        Agreed At
                    </Form.Label>
                    <div id="agreedAt">{niceTime(this.props.agreement.agreement!.agreedAt)}</div>
                </Col>
                <Col md={8}>
                    <Row>
                        When you sign up for KBase, and the first time you sign in after a new
                        Terms and Conditions has been published, you will need to agree to the 
                        new T&amp;C. We record this agreement date and time in your KBase account.
                    </Row>
                </Col>
            </Row>
            {/* <Row className="mb-2">
                <Col md={4}>
                    <div>
                        <label htmlFor="lastSignedIn" role="label">Last Sign In</label>
                    </div>
                    <div id="lastSignedIn">{niceRelativeTime(new Date(lastlogin))} ({niceTime(new Date(lastlogin))})</div>
                </Col>
                <Col md={8}>
                    <Row>
                        When you last signed in to KBase
                    </Row>
                </Col>
            </Row> */}
        </Container>
    }
    render() {
        return <div>
            <Well variant="secondary">
                <Well.Header>
                    Terms and Conditions
                </Well.Header>
                <Well.Body>
                    {this.renderInfo()}
                </Well.Body>
            </Well>

        </div>
    }
}