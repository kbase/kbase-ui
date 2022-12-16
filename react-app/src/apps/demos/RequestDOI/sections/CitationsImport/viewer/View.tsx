import { Citation } from 'apps/ORCIDLink/lib/Model';
import AlertMessage from 'components/AlertMessage';
import { plural } from 'components/common';
import DataBrowser, { ColumnDef } from 'components/DataBrowser';
import Empty from 'components/Empty';
import FlexGrid from 'components/FlexGrid';
import { Component } from 'react';
import { Accordion, Col, OverlayTrigger, Row } from 'react-bootstrap';
import { ifEmpty, when } from '../../../utils';

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
                <FlexGrid.Col style={{ flex: '3 1 0' }}>{citation.citation}</FlexGrid.Col>
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

    renderCitations2() {
        const columns: Array<ColumnDef<Citation>> = [{
            id: 'success',
            label: '',
            style: {
                flex: '0 0 2em'
            },
            render: (citation: Citation) => {
                if (citation.doi) {
                    return <span className="fa fa-check text-success" />;
                }
                return < span className="fa fa-ban text-warning" />;
            }
        }, {
            id: 'doi',
            label: 'DOI',
            style: {
                flex: '1 1 0'
            },
            render: (citation: Citation) => {
                return citation.doi;
            }
        }, {
            id: 'citation',
            label: 'Citation',
            style: {
                flex: '3 1 0'
            },
            render: (citation: Citation) => {
                return <OverlayTrigger
                    placement="top-start"
                    // overlay={
                    //     <Tooltip style={{ width: '30em' }}>
                    //         <div style={{ textAlign: 'left', width: '30em' }}>
                    //             {citation.citation}
                    //         </div>
                    //     </Tooltip>
                    // }>
                    overlay={
                        <div style={{
                            border: '1px solid rgba(200, 200, 200)',
                            backgroundColor: 'rgb(240, 240, 240)',
                            maxWidth: '40em',
                            textAlign: 'left',
                            boxShadow: '4px 4px 4px',
                            marginBottom: '1em',
                            padding: '1em',
                            zIndex: '1000'
                        }}>
                            {citation.citation}
                        </div>
                    }>
                    <span>{citation.citation}</span>
                </OverlayTrigger>
            }
        }, {
            id: 'source',
            label: 'Source',
            style: {
                flex: '0 0 10em'
            },
            render: (citation: Citation) => {
                return citation.source;
            }
        }];

        return <DataBrowser
            columns={columns}
            heights={{ header: 40, row: 40 }}
            dataSource={this.props.citations}
        />;
    }

    renderWarnings() {
        const missingDOICount = this.state.citations.filter((citation) => {
            return !citation.doi;
        }).length;

        if (missingDOICount > 0) {
            return <Row>
                <Col md={12}>
                    <AlertMessage variant="warning">
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
                    {this.renderCitations2()}
                </Accordion.Body>
            </Accordion.Item>
        </Accordion>
    }
}
