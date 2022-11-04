import { Citation } from 'apps/ORCIDLink/Model';
import { MinimalNarrativeInfo } from 'apps/ORCIDLink/ORCIDLinkClient';
import AlertMessage from 'components/AlertMessage';
import { plural } from 'components/common';
import Empty from 'components/Empty';
import FlexGrid from 'components/FlexGrid';
import Well from 'components/Well';
import { Component, ReactNode } from 'react';
import { Button, Col, Row, Stack } from 'react-bootstrap';
import ManualCitationForm from './ManualCitations/Controller';

export interface CitationsEditorProps {
    citations: Array<Citation>;
    narrativeInfo: MinimalNarrativeInfo;
    addCitation: (citation: Citation) => void;
    deleteCitation: (index: number) => void;
    onDone: () => void;
}

interface CitationsEditorState {
    // citations: Array<Citation>;
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

export default class CitationsEditor extends Component<CitationsEditorProps, CitationsEditorState> {
    constructor(props: CitationsEditorProps) {
        super(props);
        this.state = {
            citations: props.citations
        };
    }

    // Actions

    addCitation(citation: Citation) {
        // this.setState({
        //     citations: this.state.citations.concat([citation])
        // });
        this.props.addCitation(citation);
    }

    renderCitation(citation: Citation) {
        return <div>{citation.citation}</div>;
    }

    renderDeleteButton(citation: Citation, index: number) {
        if (citation.source !== 'manual') {
            return;
        }
        return <Button variant="outline-danger" style={{ border: 'none' }} onClick={() => { this.props.deleteCitation(index) }}>
            <span className="fa fa-trash" />
        </Button>
    }

    // Renderers
    renderCitations() {
        const citations = this.props.citations;
        if (citations.length === 0) {
            return <Empty message="No citations" />
        }
        const rows = citations.map((citation, index) => {
            return <FlexGrid.Row key={index} style={{ borderBottom: '1px solid rgba(200, 200, 200, 0.5)', padding: '0.5em 0' }}>
                <FlexGrid.Col style={{ flex: '0 0 1.5em' }}>{when(citation.doi, <span className="fa fa-check text-success" />, <span className="fa fa-ban text-warning" />)}</FlexGrid.Col>
                <FlexGrid.Col style={{ flex: '1 1 0' }}>{ifEmpty(citation.doi, 'n/a - cannot be sent to OSTI')}</FlexGrid.Col>
                <FlexGrid.Col style={{ flex: '3 1 0' }}>{this.renderCitation(citation)}</FlexGrid.Col>
                <FlexGrid.Col style={{ flex: '0 0 4em' }}>{citation.source}</FlexGrid.Col>
                <FlexGrid.Col style={{ flex: '0 0 3em' }}>{this.renderDeleteButton(citation, index)}</FlexGrid.Col>
            </FlexGrid.Row>
        });
        return <FlexGrid>
            <FlexGrid.Row style={{ borderBottom: '1px dashed rgb(200, 200, 200)' }}>
                <FlexGrid.Col style={{ flex: '0 0 1.5em' }}></FlexGrid.Col>
                <FlexGrid.Col style={{ flex: '1 1 0' }}>Citation</FlexGrid.Col>
                <FlexGrid.Col style={{ flex: '3 1 0' }}>DOI</FlexGrid.Col>
                <FlexGrid.Col style={{ flex: '0 0 4em' }}>Source</FlexGrid.Col>
                <FlexGrid.Col style={{ flex: '0 0 3em' }}></FlexGrid.Col>
            </FlexGrid.Row>
            {rows}
        </FlexGrid>;
    }

    renderWarnings() {
        const missingDOICount = this.props.citations.filter((citation) => {
            return !citation.doi;
        }).length;

        if (missingDOICount > 0) {
            return <Row>
                <Col md={12}>
                    <AlertMessage type="warning">
                        <p style={{ marginBottom: '0' }}>{missingDOICount} {plural(missingDOICount, 'citation', 'citations')} do not have an associated DOI. Citations without a DOI cannot be included in your DOI record.</p>
                    </AlertMessage>
                </Col>
            </Row>
        }
    }

    render() {
        return <Well style={{ padding: '1em', marginBottom: '1em' }}>
            <Stack gap={2}>
                {this.renderWarnings()}

                {/* <Row>
                    <Col md={12}>
                        <AlertMessage type="info">
                            <p style={{ maxWidth: 'none' }}>
                                If you have corrections to citations below, or additional citations, please
                                make the changes in the narrative <a href={`/narrative/${this.props.narrativeInfo.workspaceId}`} target="_blank">{this.props.narrativeInfo.title}</a>
                            </p>
                        </AlertMessage>
                    </Col>
                </Row> */}

                <Row>
                    <Col md={12}>
                        {this.renderCitations()}
                    </Col>
                </Row>
                <Row style={{ paddingTop: '1em' }}>
                    <Col md={12}>
                        <h4>Add Citation</h4>
                    </Col>
                </Row>
                <Row>
                    <Col md={12}>
                        <ManualCitationForm addCitation={this.addCitation.bind(this)} />
                    </Col>
                </Row>
                <Row>
                    <Col md={12}>
                        <Row style={{ justifyContent: 'center' }} >
                            <Button variant="primary" className="w-auto" onClick={this.props.onDone}>Next <span className="fa fa-hand-o-down" /></Button>
                        </Row>
                    </Col>
                </Row>
            </Stack>
        </Well >
    }
}
