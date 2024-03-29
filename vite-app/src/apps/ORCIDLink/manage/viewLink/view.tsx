import { renderORCIDIcon } from "apps/ORCIDLink/common";
import Well from "components/Well";
import { LinkRecordPublic } from "lib/kb_lib/comm/coreServices/orcidLinkCommon";
import { Component } from "react";
import { Button, Col, Container, Row, Stack } from "react-bootstrap";
import { ArrowReturnLeft } from "react-bootstrap-icons";
import styles from './view.module.css';


export interface ORCIDLinkManageProps {
    link: LinkRecordPublic
    orcidSiteURL: string;
}

interface ORCIDLinkManageState {
}

export default class ORCIDLinkManageView extends Component<ORCIDLinkManageProps, ORCIDLinkManageState> {
    renderLink() {
        return <Well variant="primary">
            <Well.Header><div>KBase ORCID® Link for <b>{this.props.link.username}</b></div></Well.Header>
            <Well.Body>
                <div className="flex-table">
                    <div className="flex-row">
                        <div className={`flex-col ${styles['-col1']}`}>
                            ORCID® iD
                        </div>
                        <div className="flex-col -col2">
                            <div className="flex-row" style={{ alignItems: 'center' }}>
                                <a href={`${this.props.orcidSiteURL}/${this.props.link.orcid_auth.orcid}`} target="_blank">
                                    {renderORCIDIcon()}
                                    {this.props.link.orcid_auth.orcid}
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className="flex-row">
                        <div className={`flex-col ${styles['-col1']}`}>
                            Name on Account
                        </div>
                        <div className="flex-col">
                            {this.props.link.orcid_auth.name}
                        </div>
                    </div>
                    <div className="flex-row">
                        <div className={`flex-col ${styles['-col1']}`}>
                            Created on
                        </div>
                        <div className="flex-col -col2">
                            {Intl.DateTimeFormat('en-US', { dateStyle: "long", timeStyle: "long" }).format(this.props.link.created_at)}
                        </div>
                    </div>
                    <div className="flex-row">
                        <div className={`flex-col ${styles['-col1']}`}>
                            Expires at
                        </div>
                        <div className="flex-col -col2">
                            {Intl.DateTimeFormat('en-US', { dateStyle: "long", timeStyle: "long" }).format(this.props.link.expires_at)}
                        </div>
                    </div>

                    <div className="flex-row">
                        <div className={`flex-col ${styles['-col1']}`}>
                            Retires at
                        </div>
                        <div className="flex-col -col2">
                            {Intl.DateTimeFormat('en-US', { dateStyle: "long", timeStyle: "long" }).format(this.props.link.retires_at)}
                        </div>
                    </div>
                    {/* <div className="flex-row">
                            <div className={`flex-col ${styles['-col1']}`}>
                                Scopes
                            </div>
                            <div className="flex-col -col2">
                                {renderScope(this.props.link.scope)}
                            </div>
                        </div> */}
                </div>
            </Well.Body>
        </Well>
    }

    renderTools() {
        return <Well variant="primary">
            <Well.Header>Tools</Well.Header>
            <Well.Body>
                <Stack gap={2}>
                    <Button href={`/#people/${this.props.link.username}`} target="_blank" variant="secondary">View KBase User Profile</Button>
                    <Button href={`${this.props.orcidSiteURL}/${this.props.link.orcid_auth.orcid}`} target="_blank" variant="secondary">View ORCID® Profile</Button>
                </Stack>
            </Well.Body>
        </Well>
    }

    render() {
        return <Container fluid>
            <Stack gap={2}>
                <Row>
                    <Col md={12}>
                        <Button href={`/#orcidlink/manage`} variant="secondary">
                            <Stack direction="horizontal" gap={2}>
                                <ArrowReturnLeft />
                                <span>KBase ORCID® Link - Manager</span>
                            </Stack>
                        </Button>
                    </Col>
                </Row>
                <Row>
                    <Col md={8}>
                        {this.renderLink()}
                    </Col>
                    <Col md={4}>
                        {this.renderTools()}
                    </Col>
                </Row>
            </Stack>
        </Container>
    }
}