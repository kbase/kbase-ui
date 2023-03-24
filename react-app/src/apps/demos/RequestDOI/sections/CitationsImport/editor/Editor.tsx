import { Citation } from 'apps/ORCIDLink/lib/Model';
import AlertMessage from 'components/AlertMessage';
import { plural } from 'components/common';
import Empty from 'components/Empty';
import FlexGrid from 'components/FlexGrid';
import Well from 'components/Well';
import { Component } from 'react';
import { Button, Col, Row, Stack } from 'react-bootstrap';
import { StaticNarrativeSummary } from '../../../Model';
import { ifEmpty, when } from '../../../utils';

export interface CitationsImportEditorProps {
    citations: Array<Citation>;
    staticNarrative: StaticNarrativeSummary;
    // addCitation: (citation: Citation) => void;
    deleteCitation: (index: number) => void;
    onDone: () => void;
}

interface CitationsImportEditorState {
    // citations: Array<Citation>;
}

export default class CitationsImportEditor extends Component<
    CitationsImportEditorProps,
    CitationsImportEditorState
> {
    constructor(props: CitationsImportEditorProps) {
        super(props);
        this.state = {
            citations: props.citations,
        };
    }

    // Actions

    renderCitation(citation: Citation) {
        return <div>{citation.citation}</div>;
    }

    renderDeleteButton(citation: Citation, index: number) {
        if (citation.source !== 'manual') {
            return;
        }
        return (
            <Button
                variant="outline-danger"
                style={{ border: 'none' }}
                onClick={() => {
                    this.props.deleteCitation(index);
                }}
            >
                <span className="fa fa-trash" />
            </Button>
        );
    }

    // Renderers
    renderCitations() {
        const citations = this.props.citations;
        if (citations.length === 0) {
            return <Empty message="No citations" />;
        }
        const rows = citations.map((citation, index) => {
            return (
                <FlexGrid.Row
                    key={index}
                    style={{
                        borderBottom: '1px solid rgba(200, 200, 200, 0.5)',
                        padding: '0.5em 0',
                    }}
                >
                    <FlexGrid.Col style={{ flex: '0 0 1.5em' }}>
                        {when(
                            citation.doi,
                            <span className="fa fa-check text-success" />,
                            <span className="fa fa-ban text-warning" />
                        )}
                    </FlexGrid.Col>
                    <FlexGrid.Col style={{ flex: '1 1 0' }}>
                        {ifEmpty(citation.doi, 'n/a - cannot be sent to OSTI')}
                    </FlexGrid.Col>
                    <FlexGrid.Col style={{ flex: '3 1 0' }}>
                        {this.renderCitation(citation)}
                    </FlexGrid.Col>
                    <FlexGrid.Col style={{ flex: '0 0 4em' }}>{citation.source}</FlexGrid.Col>
                    <FlexGrid.Col style={{ flex: '0 0 3em' }}>
                        {this.renderDeleteButton(citation, index)}
                    </FlexGrid.Col>
                </FlexGrid.Row>
            );
        });
        return (
            <FlexGrid>
                <FlexGrid.Row style={{ borderBottom: '1px dashed rgb(200, 200, 200)' }}>
                    <FlexGrid.Col style={{ flex: '0 0 1.5em' }}></FlexGrid.Col>
                    <FlexGrid.Col style={{ flex: '1 1 0' }}>Citation</FlexGrid.Col>
                    <FlexGrid.Col style={{ flex: '3 1 0' }}>DOI</FlexGrid.Col>
                    <FlexGrid.Col style={{ flex: '0 0 4em' }}>Source</FlexGrid.Col>
                    <FlexGrid.Col style={{ flex: '0 0 3em' }}></FlexGrid.Col>
                </FlexGrid.Row>
                {rows}
            </FlexGrid>
        );
    }

    renderWarnings() {
        const missingDOICount = this.props.citations.filter((citation) => {
            return !citation.doi;
        }).length;

        if (missingDOICount > 0) {
            return (
                <Row>
                    <Col md={12}>
                        <AlertMessage variant="warning">
                            <p>
                                {missingDOICount} {plural(missingDOICount, 'citation', 'citations')}{' '}
                                do not have an associated DOI. Citations without a DOI cannot be
                                included in your DOI record.
                            </p>
                            <p>
                                If the citations are in a markdown cell of the source Narrative{' '}
                                <a
                                    href={`/narrative/${this.props.staticNarrative.workspaceId}`}
                                    target="_blank"
                                >
                                    {this.props.staticNarrative.title}
                                </a>{' '}
                                you may edit the Narrative to correct the citations, regenerate a
                                Static Narrative, and create a new DOI request.{' '}
                            </p>
                            <p>
                                If the citations are in an app, you may contact the app author to
                                request a correction to it's citations.
                            </p>
                            <p className="mb-0">
                                You may also elect to add a manual citation to replicate the
                                citations by searching at a popular citation lookup service such as{' '}
                                <a href="https://crossref.org" target="_blank">
                                    CrossRef
                                </a>
                                .
                            </p>
                        </AlertMessage>
                    </Col>
                </Row>
            );
        }
    }

    render() {
        return (
            <Well style={{ marginBottom: '1em' }} variant="secondary">
                <Well.Header>Import Citations</Well.Header>
                <Well.Body>
                    <Stack gap={2} style={{ padding: '1em' }}>
                        {this.renderWarnings()}

                        {/* <Row>
                    <Col md={12}>
                        <AlertMessage variant="info">
                            <p style={{ maxWidth: 'none' }}>
                                If you have corrections to citations below, or additional citations, please
                                make the changes in the narrative <a href={`/narrative/${this.props.narrativeInfo.workspaceId}`} target="_blank">{this.props.narrativeInfo.title}</a>
                            </p>
                        </AlertMessage>
                    </Col>
                </Row> */}

                        <Row>
                            <Col md={12}>{this.renderCitations()}</Col>
                        </Row>
                    </Stack>
                </Well.Body>
                <Well.Footer>
                    <Stack>
                        <Row>
                            <Col md={12}>
                                <Row style={{ justifyContent: 'center' }}>
                                    <Button
                                        variant="primary"
                                        className="w-auto"
                                        onClick={this.props.onDone}
                                    >
                                        Done
                                    </Button>
                                </Row>
                            </Col>
                        </Row>
                    </Stack>
                </Well.Footer>
            </Well>
        );
    }
}
