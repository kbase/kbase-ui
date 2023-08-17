import Well from 'components/Well';
import { AuthenticationStatus } from 'contexts/Auth';
import { RuntimeContext } from 'contexts/RuntimeContext';
import { Component } from 'react';
import { Button, Col, Container, Nav, Row, Tab } from 'react-bootstrap';
import LinkView from '../common/LinkView';

import { LinkInfo } from '../lib/Model';
import LinkPermissions from './LinkPermissions';
import styles from './View.module.css';

export interface ViewProps {
    link: LinkInfo | null;
    isDeveloper: boolean;
    docURL: string;
    repoURL: string;
    revoke: () => void
}

export default class View extends Component<ViewProps> {

    // OVERVIEW

    renderRevokeMessage() {
        if (this.props.link === null) {
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

    renderUsefulNote() {
        return <Well variant="info" className="mb-3">
            <Well.Header icon="sticky-note-o">
                Note
            </Well.Header>
            <Well.Body>
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
                {/* {this.renderRevokeMessage()} */}
            </Well.Body>
        </Well>
    }

    renderMoreInfo() {
        return <Well variant="info">
            <Well.Header icon="info-circle">More Information</Well.Header>
            <Well.Body>
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
            </Well.Body>
        </Well>
    }

    renderOverview() {
        // NOTE: for some reason mb-lg-3 does not work  within a lg col
        const renderLinkPromo = () => {
            if (!this.props.link) {
                return <div className="mb-md-3">
                    {this.renderUnlinked()}
                </div>
            }
            return this.renderLinked(this.props.link);
        }
        return <Container fluid className="p-0">
            <Row>
                <Col lg={6} className="mb-md-3">
                    {renderLinkPromo()}
                </Col>
                <Col lg={6}>
                    {this.renderUsefulNote()}

                    {this.renderDev()}
                    {this.renderMoreInfo()}
                </Col>
            </Row>
        </Container>
    }

    renderDev() {
        if (!this.props.isDeveloper) {
            return;
        }
        return < Well variant="warning" style={{ marginBottom: '1rem' }}>
            <Well.Header icon="code">For Developers</Well.Header>
            <Well.Body>
                <p>Here are some resources that may be useful if you are developing against the ORCIDLink API, or are simply curious:</p>
                <ul>
                    <li><a href={this.props.docURL} target="_blank" rel="noreferrer">ORCIDLink API Documentation</a></li>
                    <li><a href={this.props.repoURL} target="_blank" rel="noreferrer"><code>orcidlink</code> service GitHub repo</a></li>
                </ul>
            </Well.Body>
        </Well>;
    }

    // INFO

    renderLinked(link: LinkInfo) {
        return <LinkView link={link} />
    }

    renderUnlinked() {
        return <Well variant="primary" className="mb-3">
            <Well.Header>
                Create Your ORCID® Link!
            </Well.Header>
            <Well.Body>
                <p>You do not currently have a link from your KBase account to an ORCID® account.</p>
                <p>
                    Click the button below to begin the ORCID® Link process.
                </p>
            </Well.Body>
            <Well.Footer style={{ justifyContent: 'center' }}>
                <Button variant="primary" href="/#orcidlink/link">
                    <span className="fa fa-lg fa-plus" /> Create your ORCID® Link …
                </Button>
            </Well.Footer>
        </Well>
    }

    // PREFERENCES

    renderPreferences() {
        return <Container fluid >
            <Row>
                <Col lg={6} className="mb-md-3">
                    {this.renderLinkRevocation()}
                </Col>
                <Col lg={6}>
                    {this.renderLinkPermissions()}
                </Col>
            </Row>
        </Container>
    }

    renderLinkRevocation() {
        return <Well variant="primary">
            <Well.Header>
                Remove link to your ORCID Account
            </Well.Header>
            <Well.Body>
                <p>You may <b>remove</b> your ORCID Link at any time.</p>

                <p>Removing the link will not alter any of your data stored at KBase or ORCID®. It will simply delete
                    the link to your ORCID® account, preventing KBase from accessing your ORCID® profile thereafter.
                </p>

                <p>Please note that after you remove the link at KBase, you may also
                    want to <a href="https://sandbox.orcid.org/trusted-parties" target="_blank" rel="noreferrer">revoke the permissions granted to KBase at ORCID®</a> as well.</p>
            </Well.Body>
            <Well.Footer style={{ justifyContent: 'center' }}>
                <Button variant="outline-danger" onClick={this.props.revoke}>
                    <span className="fa fa-lg fa-trash" /> Remove ORCID® Link …
                </Button>
            </Well.Footer>
        </Well>
    }

    renderLinkPermissions() {
        return <RuntimeContext.Consumer>
            {(value) => {
                if (value) {
                    if (value.authState.status === AuthenticationStatus.AUTHENTICATED) {
                        return <LinkPermissions config={value.config} auth={value.authState} />
                    }
                }
            }}
        </RuntimeContext.Consumer>
    }

    render() {
        const [manageTab, managePane] = (() => {
            if (this.props.link === null) {
                return [null, null];
            }
            const tab = <Nav.Item>
                <Nav.Link eventKey="manage" disabled={this.props.link === null}>Manage</Nav.Link>
            </Nav.Item>
            const pane = <Tab.Pane eventKey="manage">{this.renderPreferences()}</Tab.Pane>
            return [tab, pane]
        })();

        return <div className={styles.main} data-foo="bar" >
            <Tab.Container defaultActiveKey="overview" mountOnEnter={true} unmountOnExit={true} >
                <Nav variant="tabs">
                    <Nav.Item>
                        <Nav.Link eventKey="overview">Overview</Nav.Link>
                    </Nav.Item>
                    {manageTab}
                </Nav>
                <Tab.Content style={{ paddingTop: '1rem' }} className="d-flex flex-column flex-grow-1 flex-shrink-1 overflow-auto">
                    <Tab.Pane eventKey="overview">{this.renderOverview()}</Tab.Pane>
                    {managePane}
                </Tab.Content>
            </Tab.Container>
        </div>;
    }
}
