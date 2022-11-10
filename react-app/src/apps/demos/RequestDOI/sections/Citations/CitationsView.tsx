import { Citation } from 'apps/ORCIDLink/Model';
import AlertMessage from 'components/AlertMessage';
import { plural } from 'components/common';
import Empty from 'components/Empty';
import FlexGrid from 'components/FlexGrid';
import { Component } from 'react';
import { Accordion, Col, Row } from 'react-bootstrap';
import { ifEmpty, when } from '../../utils';
import CitationView from './CitationView';

export interface CitationsViewProps {
    citations: Array<Citation>;
}

interface CitationsViewState {
    citations: Array<Citation>;
}

export default class CitationsView extends Component<CitationsViewProps, CitationsViewState> {
    constructor(props: CitationsViewProps) {
        super(props);
        this.state = {
            citations: props.citations
        };
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
                <FlexGrid.Col style={{ flex: '3 1 0' }}><CitationView citation={citation} /></FlexGrid.Col>
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
