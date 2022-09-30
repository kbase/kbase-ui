import { NarrativeInfo } from 'apps/ORCIDLink/ORCIDLinkClient';
import AlertMessage from 'components/AlertMessage';
import Well from 'components/Well';
import { Component } from 'react';
import { Accordion, Col, Row, Stack } from 'react-bootstrap';

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

        const { objectInfo: { wsid, version, name }, workspaceInfo: { metadata } } = this.props.selectedNarrative;

        const title = metadata['narrative_nice_name']
        return <Well style={{ padding: '1em' }}>
            <Stack gap={2}>
                <Row>
                    <Col md={1}>Ref</Col>
                    <Col md={11}>{wsid} (v{version})</Col>
                </Row>
                <Row>
                    <Col md={1}>Name</Col>
                    <Col md={11}>{name}</Col>
                </Row>
                <Row>
                    <Col md={1}>Title</Col>
                    <Col md={11}>{title}</Col>
                </Row>
            </Stack>
        </Well>
    }

    renderIt() {
        return <Stack gap={2} style={{ marginBottom: '1em' }}  >
            <Row className="g-0">
                <Col md={2}>
                    Selected Narrative
                </Col>
                <Col md={10}>
                    {this.renderSelectedNarrative()}
                </Col>
            </Row>
        </Stack>;
    }

    render() {
        return <Accordion>
            <Accordion.Item eventKey="0">
                <Accordion.Header>
                    {this.props.selectedNarrative?.workspaceInfo.metadata['narrative_nice_name']}
                </Accordion.Header>
                <Accordion.Body>
                    {this.renderIt()}
                </Accordion.Body>
            </Accordion.Item>
        </Accordion>
    }
}