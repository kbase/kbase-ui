import { Component } from 'react';
import { Col, Row, Stack } from 'react-bootstrap';
import { renderORCIDIcon, renderScope } from './common';
import { ORCID_URL } from './constants';
import { LinkInfo } from './home/HomeController';

export interface LinkViewProps {
    link: LinkInfo;
}

const LABEL_COL_STYLE: React.CSSProperties = {
    flex: '0 0 11.5em'
}

export default class LinkView extends Component<LinkViewProps> {
    render() {
        const link = this.props.link;
        return <div className="well" style={{ marginBottom: '1em' }}>
            <div className="well-header">
                ORCID® Link
            </div>
            <div className="well-body">
                <Stack gap={2}>
                    <Row>
                        <Col style={LABEL_COL_STYLE}>
                            ORCID® Account ID
                        </Col>
                        <Col style={{ flex: '3 1 0' }}>
                            <div className="flex-row" style={{ alignItems: 'center' }}>
                                <a href={`${ORCID_URL}/${link.orcidID}`} target="_blank" rel="noreferrer">
                                    {renderORCIDIcon()}
                                    {link.orcidID}
                                </a>
                            </div>
                        </Col>
                    </Row>
                    <Row className="gy-1">
                        <Col style={LABEL_COL_STYLE}>
                            Name on Account
                        </Col>
                        <Col style={{ flex: '3 1 0' }}>
                            {link.realname}
                        </Col>
                    </Row>
                    <Row className="gy-1">
                        <Col style={LABEL_COL_STYLE}>
                            Created on
                        </Col>
                        <Col style={{ flex: '3 1 0' }}>
                            {Intl.DateTimeFormat('en-US').format(link.createdAt)}
                        </Col>
                    </Row>
                    <Row>
                        <Col style={LABEL_COL_STYLE}>
                            Expires on
                        </Col>
                        <Col style={{ flex: '3 1 0' }}>
                            {Intl.DateTimeFormat('en-US').format(link.expiresAt)}
                        </Col>
                    </Row>
                    <Row>
                        <Col style={LABEL_COL_STYLE}>
                            Permissions Granted
                        </Col>
                        <Col style={{ flex: '3 1 0' }}>
                            {renderScope(link.scope)}
                        </Col>
                    </Row>
                </Stack>
            </div>
        </div>
    }
}
