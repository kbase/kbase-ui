import AlertMessage from 'components/AlertMessage';
import Well from 'components/Well';
import { Component } from 'react';
import { Button, Col, Form, Row, Stack } from 'react-bootstrap';
import { StaticNarrativeSummary } from '../../../Model';
import NarrativeInfoViewer from '../NarrativeInfoViewer';

export interface SelectNarrativeProps {
    narratives: Array<StaticNarrativeSummary>;
    selectedNarrative: StaticNarrativeSummary | null;
    selectNarrative: (narrativeRef: string) => void;
    onDone: () => void;
}

interface SelectNarrativeState {
    selectedNarrativeRef: string | null;
}

export default class SelectNarrative extends Component<SelectNarrativeProps, SelectNarrativeState> {
    constructor(props: SelectNarrativeProps) {
        super(props);
        this.state = {
            selectedNarrativeRef: props.selectedNarrative ? props.selectedNarrative.ref : null,
        };
    }
    selectNarrative(selectedNarrativeRef: string) {
        this.setState({
            selectedNarrativeRef,
        });
        this.props.selectNarrative(selectedNarrativeRef);
    }
    renderNarrativeSelect() {
        const options = this.props.narratives.map(({ ref, title, version }) => {
            // const title = metadata['narrative_nice_name'];
            return (
                <option value={ref} key={ref}>
                    {title} (v {version})
                </option>
            );
        });
        options.unshift(
            <option value="" key="none">
                - Please select a static narrative -
            </option>
        );
        return (
            <Form.Select
                value={this.state.selectedNarrativeRef || undefined}
                onChange={(e) => {
                    this.selectNarrative(e.currentTarget.value);
                }}
            >
                {options}
            </Form.Select>
        );
    }

    renderSelectedNarrative() {
        if (!this.props.selectedNarrative) {
            return (
                <AlertMessage variant="info">Please select a public Narrative above</AlertMessage>
            );
        }

        return (
            <Well style={{ padding: '1em' }} variant="primary">
                <Stack gap={2}>
                    <NarrativeInfoViewer narrative={this.props.selectedNarrative} />
                </Stack>
            </Well>
        );
    }

    render() {
        return (
            <Stack gap={2} style={{ marginBottom: '1em' }}>
                <Row className="g-0">
                    <Col md={2}>Narratives</Col>
                    <Col md={10}>{this.renderNarrativeSelect()}</Col>
                </Row>
                <Row className="g-0">
                    <Col md={2}>Selected Narrative</Col>
                    <Col md={10}>{this.renderSelectedNarrative()}</Col>
                </Row>
                <Row className="g-0">
                    <Col md={12}>
                        <Row style={{ justifyContent: 'center' }} className="g-0">
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
        );
    }
}
