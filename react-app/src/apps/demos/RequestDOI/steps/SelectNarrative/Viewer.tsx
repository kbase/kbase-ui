import { NarrativeInfo } from 'apps/ORCIDLink/ORCIDLinkClient';
import AlertMessage from 'components/AlertMessage';
import RotatedTable, { RotatedTableRow } from 'components/RotatedTable';
import Well from 'components/Well';
import { Component } from 'react';
import { Accordion, Col, Row, Stack } from 'react-bootstrap';
import NarrativeInfoViewer from './NarrativeInfoViewer';

export interface SelectNarrativeProps {
    selectedNarrative: NarrativeInfo | null;
}

interface SelectNarrativeState {
    selectedNarrativeRef: string | null;
}

export default class SelectNarrative extends Component<SelectNarrativeProps, SelectNarrativeState> {
    constructor(props: SelectNarrativeProps) {
        super(props);
        this.state = {
            selectedNarrativeRef: props.selectedNarrative ? props.selectedNarrative.objectInfo.ref : null
        }
    }

    renderSelectedNarrative() {
        if (!this.props.selectedNarrative) {
            return <AlertMessage type="info">Please select a public Narrative above</AlertMessage>;
        }

        return <NarrativeInfoViewer narrative={this.props.selectedNarrative} />;
    }

    render() {
        return <Accordion>
            <Accordion.Item eventKey="0">
                <Accordion.Header>
                    {this.props.selectedNarrative?.workspaceInfo.metadata['narrative_nice_name']}
                </Accordion.Header>
                <Accordion.Body>
                    <Stack gap={2} style={{ marginBottom: '1em' }}  >
                        <Row className="g-0">
                            <Col md={2}>
                                Selected Narrative
                            </Col>
                            <Col md={10}>
                                {this.renderSelectedNarrative()}
                            </Col>
                        </Row>
                    </Stack>
                </Accordion.Body>
            </Accordion.Item>
        </Accordion>
    }
}