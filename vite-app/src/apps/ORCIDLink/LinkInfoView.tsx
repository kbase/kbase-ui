import Well from 'components/Well';
import { Component } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { renderORCIDIcon } from './common';
import { LinkInfo } from './lib/Model';

export interface LinkInfoViewProps {
    link: LinkInfo;
    orcidSiteURL: string
}

export default class LinkInfoView extends Component<LinkInfoViewProps> {
    render() {
        const {
            realname, orcidID
        } = this.props.link;
        return (
            <Well variant="light">
                <Well.Body>
                    <Container fluid>
                        <Row>
                            <Col md={3}>ORCID® iD</Col>
                            <Col md={9}>
                                <div className="flex-row" style={{ alignItems: 'center' }}>
                                    <a href={`${this.props.orcidSiteURL}/${orcidID}`} target="_blank">
                                        {renderORCIDIcon()}
                                        {orcidID}
                                    </a>
                                </div>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={3}>Name on Account</Col>
                            <Col md={9}>
                                {realname}
                            </Col>
                        </Row>
                    </Container>
                </Well.Body>
            </Well>
        );
    }

}
