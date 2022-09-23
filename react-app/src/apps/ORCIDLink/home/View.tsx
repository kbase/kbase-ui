import { Component } from 'react';
import { Button } from 'react-bootstrap';
import LinkView from '../LinkView';
import { LinkInfo } from './HomeController';
import styles from './View.module.css';

export interface ViewProps {
    link: LinkInfo | null;
    revoke: () => void
}

export default class View extends Component<ViewProps> {
    renderRevokeMessage() {
        if (this.props.link !== null) {
            return;
        }

        return <div>
            <h3>Revocation</h3>
            <p>You may <b>revoke</b> this link at any time.</p>
            <p>Revoking the link will not alter any of your data stored at KBase or ORCID®. It will simply remove
                the link to your ORCID® account, preventing KBase from accessing your ORCID® Profile thereafter.
            </p>
        </div>
    }

    renderIntro() {
        return <div>
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

            {this.renderRevokeMessage()}

            <h3>More Information</h3>

            <p>
                For further information about KBase and ORCID please consult the following resources:
            </p>
            <ul>
                <li>
                    <a href="https://docs.kbase.us" target="_blank" rel="noreferrer">Linking your KBase account to your ORCID account [does not exist yet]</a>
                </li>

                <li>
                    <a href="https://info.orcid.org/what-is-orcid/" target="_blank" rel="noreferrer"><span className="fa fa-external-link" /> About ORCID</a>
                </li>

            </ul>
        </div>
    }

    renderLinkInfo(link: LinkInfo) {
        return <LinkView link={link} />
    }

    renderLinkRevocation(link: LinkInfo) {
        return <div className="well">
            <div className="well-header">
                Revocation
            </div>
            <div className="well-body">
                <p>You may <b>revoke</b> this link at any time.</p>

                <p>Revoking the link will not alter any of your data stored at KBase or ORCID®. It will simply remove
                    the link to your ORCID® account, preventing KBase from accessing your ORCID® Profile thereafter.
                </p>

                <p>Please note that if you wish to revoke this link at KBase, you may also
                    want to <a href="https://sandbox.orcid.org/trusted-parties" target="_blank" rel="noreferrer">revoke the permissions granted to KBase at ORCID®</a> as well.</p>
            </div>
            <div className="well-footer" style={{ justifyContent: 'center' }}>
                <Button variant="danger" onClick={this.props.revoke}>
                    <span className="fa fa-lg fa-trash" /> Revoke Link to ORCID® …
                </Button>
            </div>
        </div >
    }

    renderLinked(link: LinkInfo) {
        return <div>
            {this.renderLinkInfo(link)}
            {this.renderLinkRevocation(link)}
        </div>
    }

    renderUnlinked() {
        return <div className="well">
            <div className="well-header">
                Create ORCID® Link
            </div>
            <div className="well-body">
                <p>You do not currently have a link from your KBase account to an ORCID® account.</p>

                <p>When clicking the button below, you will be redirected to ORCID®, where you may
                    sign in to your ORCID® account and grant permission to KBase to access certain
                    aspects of your ORCID® account.
                </p>
            </div>
            <div className="well-footer" style={{ justifyContent: 'center' }}>
                <Button variant="primary" href="/#orcidlink/link">
                    <span className="fa fa-lg fa-plus" /> Create ORCID® Link …
                </Button>
            </div>
        </div>
    }

    renderLinkStatus() {
        if (this.props.link) {
            return this.renderLinked(this.props.link);
        }
        return this.renderUnlinked();
    }

    render() {
        return <div className={styles.main}>
            <div className={styles.row}>
                <div className={styles.col1}>
                    {this.renderIntro()}
                </div>
                <div className={styles.col2}>
                    {this.renderLinkStatus()}
                </div>
            </div>
        </div>
    }
}
