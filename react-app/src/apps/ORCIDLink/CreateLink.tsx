import AlertMessage from 'components/AlertMessage';
import { Component } from 'react';
import { Accordion, Alert, Button } from 'react-bootstrap';
import styles from './CreateLink.module.css';
import { ReturnLink } from './Model';

export interface CreateLinkProps {
    returnLink?: ReturnLink;
    skipPrompt?: boolean;
    start: () => void;
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

    render() {
        return <div className={styles.main}>

            <div className={styles.col1}>
                <h2>About</h2>

                <p>The Link to ORCID® gives KBase tools access to your ORCID® account.</p>

                <p>Examples include:</p>
                <ul>
                    <li>Pre-filling form fields from your ORCID® profile</li>
                    <li>Automatically creating publication records in your ORCID® profile when you publish a KBase Narrative</li>
                </ul>

                <p>Note that this link will only be used when you are signed in to KBase. In addition,
                    any tool which uses the link to ORCID® will inform you that it is using it, and will explain
                    how it will use it.
                </p>

                <p>You may <b>revoke</b> this link at any time.</p>

                <p>Revoking the link will not alter any of your data at KBase, nor anything at ORCID®.</p>

                <h3>More Information</h3>
                <p>
                    For further information about KBase and ORCID please consult the following resources:
                </p>
                <ul>
                    <li>
                        <a href="https://docs.kbase.us" target="_blank">Linking your KBase account to your ORCID account [does not exist yet]</a>
                    </li>

                    <li>
                        <a href="https://info.orcid.org/what-is-orcid/" target="_blank">About ORCID</a>
                    </li>

                </ul>

                <hr />
                <p style={{ fontStyle: 'italic' }}>Development stuff below</p>

                <h3>Extant links</h3>
                <p>
                    These are existing KBase docs related to ORCID
                </p>
                <Accordion>
                    <Accordion.Item eventKey="0">
                        <Accordion.Header>
                            <a href="https://docs.kbase.us/getting-started/sign-up/linking-orcid" target="_blank">Linking KBase to ORCiD</a>
                        </Accordion.Header>
                        <Accordion.Body>
                            <p>This doc implies that there is something special about linking one's KBase account to an ORCID account. However, the
                                existing linking capability is just for ORCID as an identity provider. The link to the ORCID account is only
                                useful for sign in.
                            </p>
                            <p>
                                KBase only stores the user's ORCID Id. During sign in, the auth server obtains the user's ORCID Id, which is looked up in
                                auth system, and if there is a match, a KBase login token is created for the matching KBase account.
                            </p>
                            <p>
                                This process does not store a persistent token for the user's ORCID account.
                            </p>
                            <p>
                                The new ORCID Link capability (front end and back end) will store a long-lasting (20 year) ORCID token which allows us to
                                query and update their ORICD account. We will, of course, have their ORCID Id no matter how they sign in.
                            </p>
                        </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="1">
                        <Accordion.Header><a href="https://docs.kbase.us/getting-started/narrative/link-doi" target="_blank">Add Works using the DOE / OSTI Search & Link Wizard</a></Accordion.Header>
                        <Accordion.Body>
                            <p>
                                This doc describes how to link one's OSTI account to ORCID, and use the OSTI interface to add one's OSTI works to one's ORCID works.
                            </p>
                            <p>
                                We can also do this from KBase (one of the demos does this). Whether we want to duplicate this effort or not could be an open question?
                            </p>
                        </Accordion.Body>
                    </Accordion.Item>
                </Accordion>


                <h3>Demos</h3>
                <ul>
                    <li>
                        <a href="/#orcidlink/demos/interstitial1">Linking via Interstitial Page</a>
                    </li>

                    <li>
                        <a href="/#orcidlink/demos/doi">Request DOI Form</a>
                    </li>
                </ul>
            </div>
            <div className={styles.col2}>

                <h2>Create Link to ORCID®</h2>

                <p>You do not currently have a link from your KBase account to an ORCID® account.</p>

                <p>When clicking the button below, you will be redirected to ORCID®, where you may
                    sign in to your ORCID® account and grant permission to KBase to access certain
                    aspects of your ORCID® account.
                </p>

                {this.renderReturnURL()}

                <p>
                    <Button variant="primary" onClick={this.props.start}>
                        Create ORCID® Link
                    </Button>
                </p>
            </div>
        </div>;
    }
}