import LinkView from 'apps/ORCIDLink/LinkView';
import { Component } from 'react';
import { Accordion, Button, Col, Row, Stack } from 'react-bootstrap';
import { LinkInfo } from './Controller';

export interface ViewProps {
    link: LinkInfo | null;
}

export default class View extends Component<ViewProps> {
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
            requiresLink: false
        }, {
            url: "#orcidlink/demos/doi",
            label: 'Request DOI Form',
            requiresLink: false
        }, {
            url: "#orcidlink/demos/push-publication",
            label: 'Push DOI Publication to ORCID',
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
        return <Stack gap={3}>
            <Row>
                <Col>
                    <div className="well-body">
                        <p>Demos and help for development of ORCID® Link and friends.</p>
                        <ul>
                            <li><a href="https://github.com/kbaseIncubator/kbase-credit-engine-docs" target="_blank" rel="noreferrer">Docs</a></li>
                            <li><a href="#orcidlink" target="_blank" rel="noreferrer">ORCID® Link Home</a></li>
                        </ul>
                        {this.renderDevInfo()}
                        {this.renderDemoLinks()}
                    </div>
                </Col>
                <Col>
                    {this.renderLinkStatus()}
                </Col>
            </Row>
        </Stack>
    }
}
