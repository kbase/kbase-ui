import { Component } from 'react';
import { Button, Col, Row } from 'react-bootstrap';
import LinkView from '../LinkView';
import { LinkInfo } from './HomeController';
import styles from './View.module.css';

export interface ViewProps {
    link: LinkInfo | null;
    isDeveloper: boolean;
    docURL: string;
    repoURL: string;
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
                the link to your ORCID® account, preventing KBase from accessing your ORCID® profile thereafter.
            </p>
        </div>
    }

    renderIntro() {
        return <div>
            <h2>About</h2>
            <p>An ORCID® Link gives KBase tools access to your ORCID® account while you are logged into KBase.</p>
            <p>You can only create an ORCID® Link from this page. It will be stored at KBase until you remove it.
                (It expires after 20 years, but this is essentially "forever".)
            </p>
            <p>Here are some examples of how KBase can use your ORCID® Link:</p>
            <ul>
                <li>Pre-filling form fields from your ORCID® profile</li>
                <li>Automatically creating publication records in your ORCID® profile when you publish a KBase Narrative</li>
            </ul>
            <p>The link will only be used when you are signed in to KBase. In addition,
                any tool that uses the link will alert you before using it, and will explain
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
            {this.renderDev()}
        </div>
    }

    renderDev() {
        if (!this.props.isDeveloper) {
            return;
        }
        return <div>
            <h3>For Developers</h3>
            <ul>
                <li><a href={this.props.docURL} target="_blank" rel="noreferrer">ORCIDLink API Documentation</a></li>
                <li><a href={this.props.repoURL} target="_blank" rel="noreferrer"><code>orcidlink</code> service GitHub repo</a></li>
            </ul>
        </div>;
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
                    the link to your ORCID® account, preventing KBase from accessing your ORCID® profile thereafter.
                </p>

                <p>Please note that if you wish to revoke this link at KBase, you may also
                    want to <a href="https://sandbox.orcid.org/trusted-parties" target="_blank" rel="noreferrer">revoke the permissions granted to KBase at ORCID®</a> as well.</p>
            </div>
            <div className="well-footer" style={{ justifyContent: 'center' }}>
                <Button variant="outline-danger" onClick={this.props.revoke}>
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
                Get Your ORCID® Link!
            </div>
            <div className="well-body">
                <p>You do not currently have a link from your KBase account to an ORCID® account.</p>

                <p>
                    Click the button below to begin the ORCID® Link process.
                </p>
            </div>
            <div className="well-footer" style={{ justifyContent: 'center' }}>
                <Button variant="primary" href="/#orcidlink/link">
                    <span className="fa fa-lg fa-plus" /> Get ORCID® Link …
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
            <Row>
                <Col>
                    {this.renderIntro()}
                </Col>
                <Col>
                    {this.renderLinkStatus()}
                </Col>
            </Row>
        </div>
    }
}
