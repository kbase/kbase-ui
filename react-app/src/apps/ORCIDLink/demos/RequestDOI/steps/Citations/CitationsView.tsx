import { Citation } from 'apps/ORCIDLink/Model';
import AlertMessage from 'components/AlertMessage';
import { plural } from 'components/common';
import Empty from 'components/Empty';
import FlexGrid from 'components/FlexGrid';
import Well from 'components/Well';
import { Component, ReactNode } from 'react';
import { Stack, Row, Col, Button, Tabs, Tab, Nav, Accordion } from 'react-bootstrap';
import CitationForm from './CitationFormController';
import styles from './CitationsEditor.module.css';
import CrossRefCitationView from './CrossRefCitationView/Controller';

export interface CitationsViewProps {
    citations: Array<Citation>;
}

interface CitationsViewState {
    citations: Array<Citation>;
}

function ifEmpty(value: string | null | undefined, defaultValue: string = 'n/a') {
    if (value) {
        return value;
    }
    return <span style={{ fontStyle: 'italic', color: 'rgba(100, 100, 100, 1)' }} >{defaultValue}</span>;
}

function when(value: string | null | undefined, trueValue: ReactNode, falseValue: ReactNode) {
    if (value) {
        return trueValue;
    }
    return falseValue;
}

export default class CitationsView extends Component<CitationsViewProps, CitationsViewState> {
    constructor(props: CitationsViewProps) {
        super(props);
        this.state = {
            citations: props.citations
        };
    }

    renderCitation(citation: Citation) {
        if (!citation.doi) {
            return citation.citation;
        }

        return <Tab.Container defaultActiveKey="citation">
            <Row>
                <Col sm={3}>
                    <Nav variant="pills" className="flex-column">
                        <Nav.Item>
                            <Nav.Link eventKey="citation">Citation</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="crossRef">Cross Ref</Nav.Link>
                        </Nav.Item>
                    </Nav>
                </Col>
                <Col sm={0}>
                    <Tab.Content>
                        <Tab.Pane eventKey="citation" mountOnEnter={true}>
                            {citation.citation}
                        </Tab.Pane>
                        <Tab.Pane eventKey="crossRef" mountOnEnter={true} >
                            <CrossRefCitationView doi={citation.doi} />
                        </Tab.Pane>
                    </Tab.Content>
                </Col>
            </Row>
        </Tab.Container>
    }

    // Renderers
    renderCitations() {
        const citations = this.state.citations;
        if (citations.length === 0) {
            return <Empty message="No citations" />
        }
        const rows = citations.map((citation, index) => {
            return <FlexGrid.Row key={index} style={{ borderBottom: '1px solid rgba(200, 200, 200, 0.5)', padding: '0.5em 0' }}>
                <FlexGrid.Col style={{ flex: '0 0 1.5em' }}>{when(citation.doi, <span className="fa fa-check text-success" />, <span className="fa fa-ban text-warning" />)}</FlexGrid.Col>
                <FlexGrid.Col style={{ flex: '1 1 0' }}>{ifEmpty(citation.doi, 'n/a - cannot be sent to OSTI')}</FlexGrid.Col>
                <FlexGrid.Col style={{ flex: '3 1 0' }}>{this.renderCitation(citation)}</FlexGrid.Col>
                <FlexGrid.Col style={{ flex: '0 0 4em' }}>{citation.source}</FlexGrid.Col>
            </FlexGrid.Row>
        });
        return <FlexGrid>
            <FlexGrid.Row style={{ borderBottom: '1px dashed rgb(200, 200, 200)' }}>
                <FlexGrid.Col style={{ flex: '0 0 1.5em' }}></FlexGrid.Col>
                <FlexGrid.Col style={{ flex: '1 1 0' }}>Citation</FlexGrid.Col>
                <FlexGrid.Col style={{ flex: '3 1 0' }}>DOI</FlexGrid.Col>
                <FlexGrid.Col style={{ flex: '0 0 4em' }}>Source</FlexGrid.Col>
            </FlexGrid.Row>
            {rows}
        </FlexGrid>;
    }

    renderWarnings() {
        const missingDOICount = this.state.citations.filter((citation) => {
            return !citation.doi;
        }).length;

        if (missingDOICount > 0) {
            return <Row>
                <Col md={12}>
                    <AlertMessage type="warning">
                        <p>{missingDOICount} {plural(missingDOICount, 'citation', 'citations')} do not have an associated DOI.</p>
                        <p style={{ marginBottom: '0' }}>Citations without a DOI cannot be included in your DOI record.</p>
                    </AlertMessage>
                </Col>
            </Row>
        }
    }

    render() {
        return <Accordion>
            <Accordion.Item eventKey="0">
                <Accordion.Header>
                    {this.props.citations.length} {plural(this.props.citations.length, 'citation', 'citations')}
                </Accordion.Header>
                <Accordion.Body>
                    {this.renderCitations()}
                </Accordion.Body>
            </Accordion.Item>
        </Accordion>
    }
}
