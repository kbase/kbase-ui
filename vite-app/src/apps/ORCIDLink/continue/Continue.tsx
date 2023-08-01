import { AsyncProcessStatus } from '@kbase/ui-lib';
import AlertMessage from 'components/AlertMessage';
import ErrorAlert from 'components/ErrorAlert';
import Well from 'components/Well';
import { Component } from 'react';
import { Alert, Button, Col, Container, Form, Row, Spinner, Stack } from 'react-bootstrap';
import { renderORCIDIcon, renderScope } from '../common';
import { LinkingSessionComplete } from '../lib/Model';
import { ReturnInstruction } from '../lib/ORCIDLinkClient';
import { ORCID_URL } from '../lib/constants';
import styles from './Continue.module.css';
import { CreateLinkState } from './ContinueController';

export interface ContinueProps {
    linkingSession: LinkingSessionComplete;
    showInProfile: boolean;
    setShowInProfile: (show: boolean) => void;
    returnInstruction?: ReturnInstruction;
    createLinkState: CreateLinkState
    confirmLink: () => Promise<void>;
    cancelLink: () => Promise<void>;
}

export default class Continue extends Component<ContinueProps> {
    renderORCIDUserRecord() {
        const {
            orcid_auth: { orcid }
        } = this.props.linkingSession;
        return (
            <Well variant="light">
                <Well.Body>
                    <div className="flex-table">
                        <div className="flex-row">
                            <div className={`flex-col ${styles['-col1']}`}>ORCID® Account ID</div>
                            <div className="flex-col -col2">
                                <div className="flex-row" style={{ alignItems: 'center' }}>
                                    <a href={`${ORCID_URL}/${orcid}`} target="_blank">
                                        {renderORCIDIcon()}
                                        {orcid}
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div className="flex-row">
                            <div className={`flex-col ${styles['-col1']}`}>Name on Account</div>
                            <div className="flex-col">
                                {this.props.linkingSession.orcid_auth.name}
                            </div>
                        </div>
                    </div>
                </Well.Body>
            </Well>
        );
    }

    renderRequestedScopes() {
        const {
            orcid_auth: { scope },
        } = this.props.linkingSession;
        return renderScope(scope);
    }

    renderReturnInstruction() {
        const returnInstruction = this.props.returnInstruction;
        if (typeof returnInstruction === 'undefined') {
            return;
        }
        switch (returnInstruction.type) {
            case 'link':
                return (
                    <AlertMessage variant="info" style={{ marginTop: '1em' }} title="After Linking...">
                        After creating the link, your browser will be returned to{' '}
                        <b>{returnInstruction.label}</b>.
                    </AlertMessage>
                );
            case 'window':
                return (
                    <AlertMessage variant="info" style={{ marginTop: '1em' }} title="After Linking...">
                        After creating the link, this window will be closed, and you should be returned to{' '}
                        <b>{returnInstruction.label}</b>.
                    </AlertMessage>
                );
        }
    }

    renderPendingProgress() {
        const linkingState = this.props.createLinkState;
        switch (linkingState.status) {
            case AsyncProcessStatus.NONE:
                return;
            case AsyncProcessStatus.PENDING:
                return <Alert variant="info">
                    <div style={{ display: 'flex', flexDirection: 'row', position: 'relative', justifyContent: 'center' }}>
                        <div style={{ position: 'absolute', left: "0", top: "0" }}><Spinner animation="border" size="sm" /></div>
                        Creating ORCID Link...
                    </div>
                </Alert>
            case AsyncProcessStatus.SUCCESS:
                return <Alert variant="success">ORCID Link Created, Redirecting...</Alert>
            case AsyncProcessStatus.ERROR:
                return <ErrorAlert message={linkingState.error.message} />
        }
    }

    renderConfirmDialog() {
        return (
            <Well variant="primary" style={{ marginBottom: "1rem" }}>
                <Well.Header>Confirm Link to ORCID®</Well.Header>
                <Well.Body>
                    {this.renderPendingProgress()}
                    <p>
                        By linking the ORCID® account above you will be granting KBase the ability
                        to interact with that account on your behalf. You may revoke this at any
                        time.
                    </p>
                    <p>
                        By default, your ORCID Id will be displayed in your User Profile. You may
                        opt out below. After linking, you can change this setting in either the ORCID Link or
                        User Profile tool.
                    </p>
                    <Form>
                        <Form.Group as={Row} controlId="showInProfileField" className="align-items-center">
                            <Form.Label column>
                                Show ORCID Id in your User Profile?
                            </Form.Label>
                            <Col>
                                <Form.Switch id="show-in-profile"
                                    checked={this.props.showInProfile}
                                    onChange={(ev) => { this.props.setShowInProfile(ev.target.checked) }}
                                    label={this.props.showInProfile ? "Yes" : "No"}
                                />
                            </Col>
                        </Form.Group>
                    </Form>
                    {this.renderReturnInstruction()}
                </Well.Body>
                <Well.Footer>
                    <Stack
                        direction="horizontal"
                        gap={3}
                        className="justify-content-center"
                        style={{ flex: '1 1 0' }}
                    >
                        <Button variant="primary" onClick={this.props.confirmLink}>
                            <span className="fa fa-lg fa-plus" /> Finishing Creating your ORCID® Link
                        </Button>
                        <Button variant="danger" onClick={this.props.cancelLink}>
                            <span className="fa fa-lg fa-mail-reply" /> Cancel
                        </Button>
                    </Stack>
                </Well.Footer>
            </Well>
        );
    }

    renderAccountInfo() {
        return <Well variant="info">
            <Well.Header>
                Your ORCID® Account
            </Well.Header>
            <Well.Body>
                <p>The following ORCID® account will be linked to this KBase account.</p>

                <p>
                    You may follow the <b>ORCID® Account ID</b> link below to inspect additional
                    information about the account.
                </p>

                {this.renderORCIDUserRecord()}
            </Well.Body>
        </Well>
    }

    renderScopeInfo() {
        return <Well variant="info">
            <Well.Header>
                Scopes being granted to KBase
            </Well.Header>
            <Well.Body>
                <p>
                    KBase is requesting the "scopes" below to view or manipulate your ORCID®
                    account. A scope is a set of permissions to access your ORCID® account.
                </p>

                <p>
                    Note that that interaction with your ORCID® account will only be conducted while
                    you are logged in, in response to direct actions you take, and we will always
                    inform you when this is the case.
                </p>

                {this.renderRequestedScopes()}
            </Well.Body>
        </Well>
    }

    render() {
        return <Container fluid>
            <Row>
                <Col lg={6}>
                    {this.renderConfirmDialog()}
                </Col>
                <Col lg={6}>
                    <div className="mb-md-3">
                        {this.renderAccountInfo()}
                    </div>
                    {this.renderScopeInfo()}
                </Col>
            </Row>
        </Container>
    }
}
