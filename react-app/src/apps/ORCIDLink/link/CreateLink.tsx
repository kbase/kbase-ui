import AlertMessage from 'components/AlertMessage';
import Well from 'components/Well';
import { Component } from 'react';
import { Accordion, Button, Col, Row, Stack } from 'react-bootstrap';
import { renderORCIDLabel } from '../common';
import orcidSignIn from '../images/ORCID-sign-in.png';
import { ReturnLink } from '../lib/ORCIDLinkClient';

import styles from './CreateLink.module.css';

export interface CreateLinkProps {
    returnLink?: ReturnLink;
    skipPrompt?: boolean;
    started: boolean;
    start: () => void;
    goBack: () => void;
}

export default class CreateLink extends Component<CreateLinkProps> {
    renderReturnURL() {
        if (!this.props.returnLink) {
            return;
        }
        return <AlertMessage variant="info" style={{ marginTop: '1em' }} title="After Linking...">
            After creating the link, your browser will be returned to <b>{this.props.returnLink.label}</b>.
        </AlertMessage>;
    }

    renderLinkStart() {
        return <div className={styles.main}>
            <div className={styles.row}>
                <Well variant="primary">
                    <Well.Header>
                        Create Link to {renderORCIDLabel()}
                    </Well.Header>

                    <Well.Body>
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
                            For more information, <a href="https://www.kbase.us/orcidlink" target="_blank'">consult the {renderORCIDLabel()} Link documentation</a>.
                        </p>

                        {this.renderReturnURL()}
                    </Well.Body>
                    <Well.Footer>
                        <Stack direction="horizontal" gap={3} className="justify-content-center" style={{ flex: '1 1 0' }}>
                            <Button variant="primary" onClick={this.props.start} disabled={this.props.started}>
                                <span className="fa fa-lg fa-plus" /> Start {renderORCIDLabel()} Link process...
                            </Button>
                            <Button variant="danger" onClick={this.props.goBack} disabled={this.props.started}>
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
                    <img src={orcidSignIn} style={{ width: '80%', boxShadow: '4px 4px 4px 4px rgba(100, 100, 100, 1)', marginBottom: '20px' }} />
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
                    <h3>FAQs</h3>
                    {this.renderFAQ()}
                </Col>
            </Row>
        </Stack>
    }
}