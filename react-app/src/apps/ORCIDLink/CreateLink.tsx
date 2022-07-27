import { Component } from 'react';
import { Button } from 'react-bootstrap';
import styles from './CreateLink.module.css';

export interface CreateLinkProps {
    start: () => void;
}

export default class CreateLink extends Component<CreateLinkProps> {
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
            </div>
            <div className={styles.col2}>

                <h2>Create Link to ORCID®</h2>

                <p>You do not currently have a link from your KBase account to an ORCID® account.</p>

                <p>When clicking the button below, you will be redirected to ORCID®, where you may
                    sign in to your ORCID® account and grant permission to KBase to access certain
                    aspects of your ORCID® account.
                </p>

                <p>
                    <Button variant="primary" onClick={this.props.start}>
                        Create ORCID® Link
                    </Button>
                </p>
            </div>
        </div>;
    }
}