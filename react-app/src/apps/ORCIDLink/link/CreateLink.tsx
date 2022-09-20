import AlertMessage from 'components/AlertMessage';
import styles from './CreateLink.module.css';
import { Component } from 'react';
import { Accordion, Button, Col, Row, Stack } from 'react-bootstrap';
import { ReturnLink } from '../Model';
import orcidSignIn from '../images/ORCID-sign-in.png';
import AccordionItem from 'react-bootstrap/esm/AccordionItem';

export interface CreateLinkProps {
    returnLink?: ReturnLink;
    skipPrompt?: boolean;
    start: () => void;
    goBack: () => void;
}

export default class CreateLink extends Component<CreateLinkProps> {
    renderReturnURL() {
        if (!this.props.returnLink) {
            return;
        }
        return <AlertMessage type="info" style={{ marginTop: '1em' }} title="After Linking...">
            After creating the link, your browser will be returned to <b>{this.props.returnLink.label}</b>.
        </AlertMessage>;
    }

    renderLinkStart() {
        return <div className={styles.main}>
            <div className={styles.row}>
                <div className="well" style={{ maxWidth: '60em', margin: '0 auto' }}>
                    <div className="well-header">
                        Create Link to ORCID®
                    </div>

                    <div className="well-body">
                        <p>You do not currently have a link from your KBase account to an ORCID® account.</p>

                        <p>When clicking the button below, you will be redirected to ORCID®, where you may
                            sign in to your ORCID® account and grant permission to KBase to access certain
                            aspects of your ORCID® account.
                        </p>

                        <p>
                            For more information, <a href="https://www.kbase.us/orcidlink" target="_blank'">consult the ORCID Link documentation</a>.
                        </p>

                        {this.renderReturnURL()}
                    </div>
                    <div className="well-footer">
                        <Stack direction="horizontal" gap={3} className="justify-content-center" style={{ flex: '1 1 0' }}>
                            <Button variant="primary" onClick={this.props.start}>
                                <span className="fa fa-lg fa-plus" /> Start ORCID® Link process...
                            </Button>
                            <Button variant="danger" onClick={this.props.goBack}>
                                <span className="fa fa-lg fa-mail-reply" /> Cancel
                            </Button>
                        </Stack>
                    </div>

                </div>
            </div>
        </div >;
    }

    renderFAQ() {
        return <Accordion>
            <Accordion.Item eventKey='0'>
                <Accordion.Header>
                    What if I don't have an ORCID Account?
                </Accordion.Header>
                <Accordion.Body>
                    <p>
                        The next step in linking your ORCID account to your KBase account is to sign in at ORCID.
                    </p>
                    <p>
                        But what if you don't have an ORCID account yet?
                    </p>
                    <p>
                        When you reach the ORCID Sign In page, you may elect to register for a new account.
                    </p>
                    <img src={orcidSignIn} style={{ width: '80%', boxShadow: '4px 4px 4px 4px rgba(100, 100, 100, 1)', marginBottom: '20px' }} />
                    <p>
                        After registering the linking process will be resumed, just as if you had simply signed in with an existing ORCID account.
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