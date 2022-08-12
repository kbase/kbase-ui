import { NarrativeInfo } from 'apps/ORCIDLink/Model';
import AlertMessage from 'components/AlertMessage';
import Well from 'components/Well';
import { Component } from 'react';
import { Button, ButtonGroup, Col, Form, Row, Stack } from 'react-bootstrap';

export interface SelectNarrativeProps {
    narratives: Array<NarrativeInfo>;
    selectedNarrative: NarrativeInfo | null;
    selectNarrative: (narrativeRef: string) => void;
    onDone: () => void;
}

interface SelectNarrativeState {
}

export default class SelectNarrative extends Component<SelectNarrativeProps, SelectNarrativeState> {

    renderNarrativeSelect() {
        const options = this.props.narratives.map(({ objectInfo: { version }, workspaceInfo: { id, metadata } }) => {
            const title = metadata['narrative_nice_name'];
            const narrativeRef = `${id}/${version}`;
            return <option value={narrativeRef} key={narrativeRef}>{title}</option>;
        });
        options.unshift(<option value='' key='none'>- Please select a narrative -</option>)
        return <Form.Select onChange={(e) => {
            this.props.selectNarrative(e.currentTarget.value)
        }}>
            {options}
        </Form.Select>
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

    render() {
        return <Stack gap={2} style={{ marginBottom: '1em' }} >
            <Row className="gx-2">
                <Col md={2}>
                    Narratives
                </Col>
                <Col md={10}>
                    {this.renderNarrativeSelect()}
                </Col>
            </Row>
            <Row>
                <Col md={2}>
                    Selected Narrative
                </Col>
                <Col md={10}>
                    {this.renderSelectedNarrative()}
                </Col>
            </Row>
            <Row>
                <Col md={12}>
                    <Row style={{ justifyContent: 'center' }} >
                        <Button variant="primary" className="w-auto" onClick={this.props.onDone}>Next <span className="fa fa-hand-o-down" /></Button>
                    </Row>
                </Col>
            </Row>
        </Stack>;
    }
}