import { AsyncProcessStatus } from '@kbase/ui-lib';
import AlertMessage from 'components/AlertMessage';
import CountdownClock from 'components/CountdownClock';
import ErrorAlert from 'components/ErrorAlert';
import Well from 'components/Well';
import { LinkingSessionPublicComplete } from 'lib/kb_lib/comm/coreServices/ORCIDLInk';
import { Component } from 'react';
import { Alert, Button, Col, Container, Form, Row, Spinner, Stack } from 'react-bootstrap';
import { CheckLg } from 'react-bootstrap-icons';
import { renderORCIDIcon, renderScope } from '../common';
import { ReturnInstruction } from '../lib/ORCIDLinkClient';
import styles from './Continue.module.css';
import { CreateLinkState } from './ContinueController';

export interface ContinueProps {
    linkingSession: LinkingSessionPublicComplete;
    showInProfile: boolean;
    setShowInProfile: (show: boolean) => void;
    returnInstruction?: ReturnInstruction;
    createLinkState: CreateLinkState;
    orcidSiteURL: string;
    confirmLink: () => Promise<void>;
    cancelLink: () => Promise<void>;
    onExpired: () => void;
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
                            <div className={`flex-col ${styles['-col1']}`} style={{ flex: '0 0 5rem' }}>ORCID® iD</div>
                            <div className="flex-col -col2">
                                <div className="flex-row" style={{ alignItems: 'center' }}>
                                    <a href={`${this.props.orcidSiteURL}/${orcid}`} target="_blank">
                                        {renderORCIDIcon()}
                                        {this.props.orcidSiteURL}/{orcid}
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div className="flex-row">
                            <div className={`flex-col ${styles['-col1']}`} style={{ flex: '0 0 5rem' }}>Name</div>
                            <div className="flex-col">
                                {this.props.linkingSession.orcid_auth.name || <i>not public</i>}
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
                return this.renderCountdownClock();
            case AsyncProcessStatus.PENDING:
                return <Alert variant="info">
                    <div style={{ display: 'flex', flexDirection: 'row', position: 'relative', justifyContent: 'center' }}>
                        <div style={{ position: 'absolute', left: "0", top: "0" }}><Spinner animation="border" size="sm" /></div>
                        Creating KBase ORCID® Link...
                    </div>
                </Alert>
            case AsyncProcessStatus.SUCCESS:
                return <Alert variant="success">KBase ORCID® Link Created, Redirecting...</Alert>
            case AsyncProcessStatus.ERROR:
                return <ErrorAlert message={linkingState.error.message} />
        }
    }

    renderCountdownClock() {
        const { created_at, expires_at } = this.props.linkingSession;
        return <Alert variant="info">
            You have <b><CountdownClock startAt={created_at} endAt={expires_at} onExpired={this.props.onExpired.bind(this)} /></b> to finish linking.
        </Alert>
    }

    renderConfirmDialog() {
        return (
            <Well variant="primary" style={{ marginBottom: "1rem" }}>
                <Well.Header>Confirm Link to ORCID®</Well.Header>
                <Well.Body>
                    {this.renderPendingProgress()}
                    <p>
                        Your ORCID® account <b>{renderORCIDIcon()}{this.props.linkingSession.orcid_auth.orcid}</b> is ready
                        for linking to your KBase account <b>{this.props.linkingSession.username}</b>.
                    </p>
                    <p>
                        By linking the ORCID® account above you will be granting KBase the ability
                        to interact with that account on your behalf. You may revoke this at any
                        time.
                    </p>
                    <p>
                        By default, your ORCID® iD will be displayed in your User Profile and may be displayed
                        in other contexts in which your account is displayed. You may
                        opt out below. After linking, you can change this setting in either the KBase ORCID® Link or
                        User Profile tool.
                    </p>
                    <Form>
                        <Form.Group as={Row} controlId="showInProfileField" className="align-items-center">
                            <Form.Label column>
                                Show ORCID® iD in your User Profile?
                            </Form.Label>
                            <Col style={{ flex: '0 0 6rem' }}>
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
                        {/* <Button variant="primary" onClick={this.props.confirmLink}>
                            <span className="fa fa-lg fa-plus" /> Finish Creating your KBase ORCID® Link
                        </Button> */}
                        <Button variant="primary" onClick={this.props.confirmLink}>
                            Finish Creating your KBase ORCID® Link <CheckLg fontSize="1.5rem" />
                        </Button>
                        <Button variant="danger" onClick={this.props.cancelLink}>
                            <span className="fa fa-lg fa-mail-reply" /> Cancel
                        </Button>
                    </Stack>
                </Well.Footer>
            </Well >
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
                    You may follow the <b>ORCID® iD</b> link below to inspect additional
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
