import { Component } from 'react';
import { Accordion, Button } from 'react-bootstrap';
import { renderORCIDIcon, renderScope } from '../common';
import { ORCID_URL } from '../Model';
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
                the link to your ORCID account, preventing KBase from accessing your ORCID Profile thereafter.
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
                    <a href="https://info.orcid.org/what-is-orcid/" target="_blank" rel="noreferrer">About ORCID</a>
                </li>

            </ul>
        </div>
    }

    renderDevInfo() {
        return <div>
            <h3>Extant links</h3>
            <p>
                These are existing KBase docs related to ORCID
            </p>
            <Accordion>
                <Accordion.Item eventKey="0">
                    <Accordion.Header>
                        <a href="https://docs.kbase.us/getting-started/sign-up/linking-orcid" target="_blank" rel="noreferrer">Linking KBase to ORCiD</a>
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
                    <Accordion.Header><a href="https://docs.kbase.us/getting-started/narrative/link-doi" target="_blank" rel="noreferrer">Add Works using the DOE / OSTI Search & Link Wizard</a></Accordion.Header>
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
        </div>
    }

    renderDemoLinks() {
        return <div style={{ marginTop: '1em' }}>
            <h3>Demos</h3>
            <ul>
                <li>
                    <a href="#orcidlink/demos/interstitial1">Linking via Interstitial Page</a>
                </li>

                <li>
                    <a href="#orcidlink/demos/doi">Request DOI Form</a>
                </li>
            </ul>
        </div>
    }

    renderLinkInfo(link: LinkInfo) {
        return <div className="well" style={{ marginBottom: '1em' }}>
            <div className="well-header">
                ORCID® Link
            </div>
            <div className="well-body">
                <div className="flex-table">
                    <div className="flex-row">
                        <div className={`flex-col ${styles['-col1']}`}>
                            ORCID® Account ID
                        </div>
                        <div className="flex-col -col2" style={{ flex: '3 1 0' }}>
                            <div className="flex-row" style={{ alignItems: 'center' }}>
                                <a href={`${ORCID_URL}/${link.orcidID}`} target="_blank" rel="noreferrer">
                                    {renderORCIDIcon()}
                                    {link.orcidID}
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className="flex-row">
                        <div className={`flex-col ${styles['-col1']}`}>
                            Name on Account
                        </div>
                        <div className="flex-col" style={{ flex: '3 1 0' }}>
                            {link.realname}
                        </div>
                    </div>
                    <div className="flex-row">
                        <div className={`flex-col ${styles['-col1']}`}>
                            Created on
                        </div>
                        <div className="flex-col -col2" style={{ flex: '3 1 0' }}>
                            {Intl.DateTimeFormat('en-US').format(link.createdAt)}
                        </div>
                    </div>
                    <div className="flex-row">
                        <div className={`flex-col ${styles['-col1']}`}>
                            Expires on
                        </div>
                        <div className="flex-col -col2" style={{ flex: '3 1 0' }}>
                            {Intl.DateTimeFormat('en-US').format(link.expiresAt)}
                        </div>
                    </div>
                    <div className="flex-row">
                        <div className={`flex-col ${styles['-col1']}`}>
                            Scopes
                        </div>
                        <div className="flex-col -col2" style={{ flex: '3 1 0' }}>
                            {renderScope(link.scope)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    }

    renderLinkRevocation(link: LinkInfo) {
        return <div className="well">
            <div className="well-header">
                Revocation
            </div>
            <div className="well-body">
                <p>You may <b>revoke</b> this link at any time.</p>

                <p>Revoking the link will not alter any of your data stored at KBase or ORCID®. It will simply remove
                    the link to your ORCID account, preventing KBase from accessing your ORCID Profile thereafter.
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
                    <div className="well" style={{ backgroundColor: 'rgba(252, 192, 189, 0.5)' }}>
                        <div className="well-header">
                            Development
                        </div>
                        <div className="well-body">
                            <p>This little section only exists temporarily during the development phase.</p>
                            <p><a href="https://github.com/kbaseIncubator/kbase-credit-engine-docs" target="_blank" rel="noreferrer">Docs</a></p>
                            {this.renderDevInfo()}
                            {this.renderDemoLinks()}
                        </div>
                    </div>

                </div>
                <div className={styles.col2}>
                    {this.renderLinkStatus()}
                </div>
            </div>
        </div>
    }
}
