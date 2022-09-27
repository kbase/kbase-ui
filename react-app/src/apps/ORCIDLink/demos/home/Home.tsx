import LinkView from 'apps/ORCIDLink/LinkView';
import { Component } from 'react';
import { Accordion, Button, Col, ListGroup, Nav, Row, Stack } from 'react-bootstrap';
import { LinkInfo } from './Controller';

export interface ViewProps {
    link: LinkInfo | null;
}

export default class View extends Component<ViewProps> {
    renderDevInfo() {
        return <div style={{ marginTop: '1em' }}>
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
                        <p>This doc implies that there is something special about linking one's KBase account to an ORCID® account. However, the
                            existing linking capability is just for ORCID® as an identity provider. The link to the ORCID® account is only
                            useful for sign in.
                        </p>
                        <p>
                            KBase only stores the user's ORCID® Id. During sign in, the auth server obtains the user's ORCID® Id, which is looked up in
                            auth system, and if there is a match, a KBase login token is created for the matching KBase account.
                        </p>
                        <p>
                            This process does not store a persistent token for the user's ORCID® account.
                        </p>
                        <p>
                            The new ORCID® Link capability (front end and back end) will store a long-lasting (20 year) ORCID® token which allows us to
                            query and update their ORICD account. We will, of course, have their ORCID® Id no matter how they sign in.
                        </p>
                    </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="1">
                    <Accordion.Header><a href="https://docs.kbase.us/getting-started/narrative/link-doi" target="_blank" rel="noreferrer">Add Works using the DOE / OSTI Search & Link Wizard</a></Accordion.Header>
                    <Accordion.Body>
                        <p>
                            This doc describes how to link one's OSTI account to ORCID, and use the OSTI interface to add one's OSTI works to one's ORCID® works.
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

        const linkData = [{
            url: "#orcidlink/demos/interstitial1",
            label: 'Linking via Interstitial Page',
            requiresLink: false,
            description: [
                <p>Sometimes a user tool either requires or can utilize the ORCID Link. After a quick call to the
                    ORCID Link service to determine if the user does have a link, if it is determined that the user
                    does not have a link, the tool may offer the user the option of creating a link on the fly.
                    The ORCID Link tool will return the browser to wherever the initial tool specifies.</p>
            ]
        }, {
            url: "#orcidlink/demos/doi",
            label: 'Request DOI Form',
            requiresLink: false,
            description: []
        }, {
            url: "#orcidlink/demos/push-publication",
            label: 'Push Publication to ORCID',
            requiresLink: true,
            description: []
        }];
        const items = linkData.map(({ url, label, requiresLink, description }, index) => {
            if (requiresLink && this.props.link === null) {
                return null;
            }
            return <Accordion.Item eventKey="0">
                <Accordion.Header>
                    <a href={url}>{label}</a>
                </Accordion.Header>
                <Accordion.Body>
                    {description.map((content) => {
                        return <p>{content}</p>
                    })}
                </Accordion.Body>
            </Accordion.Item>
        })
        return <div style={{ marginTop: '1em' }}>
            const items =
            <h3>Demos</h3>
            <Accordion>
                <Accordion.Item eventKey="0">
                    <Accordion.Header>
                        <a href="#orcidlink/demos/interstitial1">Linking via Interstitial Page</a>
                    </Accordion.Header>
                    <Accordion.Body>
                        <p>
                            Sometimes a user tool either requires or can utilize the ORCID Link. After a quick call to the
                            ORCID Link service to determine if the user does have a link, if it is determined that the user
                            does not have a link, the tool may offer the user the option of creating a link on the fly.
                            The ORCID Link tool will return the browser to wherever the initial tool specifies.
                        </p>
                    </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="1">
                    <Accordion.Header>
                        <a href="#orcidlink/demos/doi">Request DOI Form</a>
                    </Accordion.Header>
                    <Accordion.Body>
                        <p>
                            This is one approach to creating a DOI request.
                        </p>
                    </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="2">
                    <Accordion.Header>
                        <a href="#orcidlink/demos/push-publication">Push Publication to ORCID</a>
                    </Accordion.Header>
                    <Accordion.Body>
                        <p>
                            This is a demonstration of how to manually add, edit, and delete publications
                            from one's ORCID account.
                        </p>
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>
        </div>
    }

    renderDemoLinksx() {
        const linkData = [{
            url: "#orcidlink/demos/interstitial1",
            label: 'Linking via Interstitial Page',
            requiresLink: false
        }, {
            url: "#orcidlink/demos/doi",
            label: 'Request DOI Form',
            requiresLink: false
        }, {
            url: "#orcidlink/demos/push-publication",
            label: 'Push Publication to ORCID',
            requiresLink: true
        }];
        const menu = linkData.map(({ url, label, requiresLink }, index) => {
            if (requiresLink && this.props.link === null) {
                return null;
            }
            return <li key={index}>
                <a href={url} key={index}>{label}</a>
            </li>
        })
        return <div style={{ marginTop: '1em' }}>
            <h3>Demos</h3>
            <ul>
                {menu}
            </ul>
        </div>
    }

    renderLinkInfo(link: LinkInfo) {
        return <LinkView link={link} />
    }


    renderLinked(link: LinkInfo) {
        return <div>
            {this.renderLinkInfo(link)}
        </div>
    }

    renderUnlinked() {
        return <div className="well">
            <div className="well-header">
                Not linked
            </div>
            <div className="well-body">
                <p>You do not currently have a link from your KBase account to an ORCID® account.</p>

            </div>

        </div>
    }

    renderLinkStatus() {
        if (this.props.link) {
            return this.renderLinked(this.props.link);
        }
        return this.renderUnlinked();
    }

    renderNav() {
        return <div>
            <Nav >
                <Nav.Link href="https://github.com/kbaseIncubator/kbase-credit-engine-docs" target="_blank" rel="noreferrer"><span className="fa fa-file-o" /> Docs</Nav.Link>
                <Nav.Link href="#orcidlink" target="_blank" rel="noreferrer"><span className="fa fa-home" /> ORCID® Link Home</Nav.Link>
            </Nav>
        </div>
    }

    renderNavx() {
        return <div>
            <ListGroup variant="pill">
                <ListGroup.Item action active={false} href="https://github.com/kbaseIncubator/kbase-credit-engine-docs" target="_blank" rel="noreferrer"><span className="fa fa-file-o" /> Docs</ListGroup.Item>
                <ListGroup.Item action active={false} href="#orcidlink" target="_blank" rel="noreferrer"><span className="fa fa-home" /> ORCID® Link Home</ListGroup.Item>
            </ListGroup>
        </div>
    }

    render() {
        return <Stack gap={3}>
            <Row>
                <Col>
                    <p>Demos and help for development of ORCID® Link and friends.</p>
                    {this.renderNav()}
                    {this.renderDemoLinks()}
                    {this.renderDevInfo()}
                </Col>
                <Col>
                    {this.renderLinkStatus()}
                </Col>
            </Row>
        </Stack>
    }
}
