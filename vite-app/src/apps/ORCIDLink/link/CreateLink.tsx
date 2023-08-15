import AlertMessage from 'components/AlertMessage';
import Well from 'components/Well';
import { Component } from 'react';
import { Accordion, Alert, Button, Col, Row, Spinner, Stack } from 'react-bootstrap';
import { renderORCIDLabel } from '../common';
import orcidSignIn from '../images/ORCID-sign-in.png';
import { ReturnInstruction } from '../lib/ORCIDLinkClient';

import ErrorAlert from 'components/ErrorAlert';
import { AsyncProcessStatus } from 'lib/AsyncProcess';
import { ArrowRight } from 'react-bootstrap-icons';
import styles from './CreateLink.module.css';
import { StartLinkState } from './LinkController';

export interface CreateLinkProps {
    returnInstruction?: ReturnInstruction;
    skipPrompt?: boolean;
    startLinkState: StartLinkState
    start: () => void;
    goBack: () => void;
}

export default class CreateLink extends Component<CreateLinkProps> {
    renderReturnURL() {
        const returnInstruction = this.props.returnInstruction;
        if (typeof returnInstruction === 'undefined' || returnInstruction.type !== 'link') {
            return;
        }
        return <AlertMessage variant="info" style={{ marginTop: '1em' }} title="After Linking...">
            After creating the link, your browser will be returned to <b>{returnInstruction.label}</b>.
        </AlertMessage>;
    }

    renderReturnFromWindow() {
        const returnInstruction = this.props.returnInstruction;
        if (typeof returnInstruction === 'undefined' || returnInstruction.type !== 'window') {
            return;
        }
        return <AlertMessage variant="info" style={{ marginTop: '1em' }} title="After Linking...">
            After creating the link, this window will be closed, and you should be returned to <b>{returnInstruction.label}</b>.
        </AlertMessage>;
    }

    renderPendingProgress() {
        const linkingState = this.props.startLinkState;
        switch (linkingState.status) {
            case AsyncProcessStatus.NONE:
                return;
            case AsyncProcessStatus.PENDING:
                return <Alert variant="info">
                    <div style={{ display: 'flex', flexDirection: 'row', position: 'relative', justifyContent: 'center' }}>
                        <div style={{ position: 'absolute', left: "0", top: "0" }}><Spinner animation="border" size="sm" /></div>
                        Creating Linking Session...
                    </div>
                </Alert>
            case AsyncProcessStatus.SUCCESS:
                return <Alert variant="success">Linking Session Created, Redirecting...</Alert>
            case AsyncProcessStatus.ERROR:
                return <ErrorAlert message={linkingState.error.message} />
        }
    }

    renderLinkStart() {
        return <div className={styles.main}>
            <div className={styles.row}>
                <Well variant="primary">
                    <Well.Header>
                        Link to your {renderORCIDLabel()} Account
                    </Well.Header>

                    <Well.Body>
                        {this.renderPendingProgress()}

                        <p>You do not currently have a link from your KBase account to an {renderORCIDLabel()} account.</p>

                        <p>
                            After clicking the button below, you will be redirected to {renderORCIDLabel()}, where you may
                            sign in to your {renderORCIDLabel()} account and grant permission to KBase to access certain
                            aspects of your {renderORCIDLabel()} account.
                        </p>

                        <p><i>What if you don't have an {renderORCIDLabel()} Account?</i> Check out the FAQs to the right for an answer.</p>

                        <p>
                            After finishing at {renderORCIDLabel()}, you will be returned to KBase and asked to confirm the link. Once confirmed, the {renderORCIDLabel()} Link
                            will be added to your account.
                        </p>

                        <p>
                            For security purposes, once you start a linking session, you will have <b>10 minutes to complete</b> the process.
                        </p>

                        <p>
                            For more information, <a href="https://www.kbase.us/orcidlink" target="_blank'">consult the {renderORCIDLabel()} Link documentation</a>.
                        </p>

                        {this.renderReturnURL()}
                        {this.renderReturnFromWindow()}
                    </Well.Body>
                    <Well.Footer>

                        <Stack direction="horizontal" gap={3} className="justify-content-center" style={{ flex: '1 1 0' }}>
                            {/* <Button variant="primary" onClick={this.props.start} disabled={this.props.startLinkState.status !== AsyncProcessStatus.NONE}>
                                <span className="fa fa-lg fa-plus" /> Start {renderORCIDLabel()} Link process...
                            </Button> */}
                            <Button variant="primary" onClick={this.props.start} disabled={this.props.startLinkState.status !== AsyncProcessStatus.NONE}>
                                Continue <ArrowRight fontSize="1.5rem" fontWeight="bold" />
                            </Button>
                            <Button variant="danger"
                                onClick={(e) => { e.preventDefault(); this.props.goBack(); }}
                                disabled={this.props.startLinkState.status !== AsyncProcessStatus.NONE}>
                                <span className="fa fa-lg fa-mail-reply" /> Cancel
                            </Button>
                        </Stack>
                    </Well.Footer>
                </Well>
            </div>
        </div >;
    }

    renderFAQ() {
        return <Accordion>
            <Accordion.Item eventKey='0'>
                <Accordion.Header>
                    What if I don't have an {renderORCIDLabel()} Account?
                </Accordion.Header>
                <Accordion.Body>
                    <p>
                        In order to link your {renderORCIDLabel()} account to your KBase account, you will need to sign in at {renderORCIDLabel()}.
                    </p>
                    <p>
                        But what if you don't have an {renderORCIDLabel()} account?
                    </p>
                    <p>
                        When you reach the {renderORCIDLabel()} Sign In page, you may elect to register for a new account.
                    </p>
                    <img
                        src={orcidSignIn}
                        alt="ORCID Sign In"
                        style={{ width: '80%', boxShadow: '4px 4px 4px 4px rgba(100, 100, 100, 1)', marginBottom: '20px' }} />
                    <p>
                        After registering, the linking process will be resumed, just as if you had simply signed in with an existing {renderORCIDLabel()} account.
                    </p>
                </Accordion.Body>

            </Accordion.Item>
            <Accordion.Item eventKey='1'>
                <Accordion.Header>
                    But I already log in with {renderORCIDLabel()}
                </Accordion.Header>
                <Accordion.Body>
                    <p>
                        If you already log in with {renderORCIDLabel()}, it may seem odd to need to create a separate {renderORCIDLabel()} Link.
                    </p>
                    <p>
                        Your {renderORCIDLabel()} sign-in link is only used to obtain your {renderORCIDLabel()} Id during sign-in. This is, in turn, used to
                        look up the associated KBase account and, if successful, assign an authentication token to your browser. All that KBase knows about
                        your {renderORCIDLabel()} account during sign-in is the {renderORCIDLabel()} Id.
                    </p>
                    <p>
                        In contrast, {renderORCIDLabel()} Link provides a long-term "access token", which allows KBase to provide tools for you that
                        that can access limited aspects of your {renderORCIDLabel()} account. The {renderORCIDLabel()} Link can be added or removed
                        at any time without affecting your ability to sign in to KBase through {renderORCIDLabel()}.
                    </p>
                </Accordion.Body>

            </Accordion.Item>
        </Accordion>
    }

    render() {
        return <Stack>
            <Row>
                <Col>
                    {this.renderLinkStart()}
                </Col>
                <Col>
                    <Well variant="info">
                        <Well.Header style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}
                            icon="question-circle-o"
                        >
                            FAQs
                        </Well.Header>
                        <Well.Body>
                            {this.renderFAQ()}
                        </Well.Body>
                    </Well>
                </Col>
            </Row>
        </Stack>
    }
}
