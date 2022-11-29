import AlertMessage from 'components/AlertMessage';
import ErrorMessage from 'components/ErrorMessage';
import Loading from 'components/Loading';
import Well from 'components/Well';
import { AsyncProcessStatus } from 'lib/AsyncProcess';
import { Component } from 'react';
import { Button, Col, Form, Row, Stack } from 'react-bootstrap';
import { Citation } from "../../../../DOIRequestClient";
import { GetCitationProcess } from './Controller';

export interface CitationFormProps {
    getCitation: (doi: string) => Promise<void>
    onSelect: (citation: Citation) => void;
    citationProcess: GetCitationProcess;
}

interface CitationFormState {
    doi: string;
}

export default class CitationForm extends Component<CitationFormProps, CitationFormState> {
    constructor(props: CitationFormProps) {
        super(props);
        this.state = {
            doi: ''
        };
    }

    handleDOIInput(doi: string) {
        this.setState({
            doi
        });
    }

    renderForm() {
        return <Form onSubmit={(e) => { e.preventDefault(); this.props.getCitation(this.state.doi) }}>
            <Stack>
                <Row>
                    <Col style={{ flex: '0 0 4em' }} className="d-flex align-items-center">
                        <span style={{ fontWeight: 'bold', color: 'rgb(150, 150, 150)' }}>DOI</span>
                    </Col>
                    <Col>
                        <Form.Control
                            type="text"
                            placeholder="Enter a DOI"
                            value={this.state.doi}
                            onInput={(e) => { this.handleDOIInput(e.currentTarget.value) }}
                        />
                    </Col>
                    <Col>
                        <Button
                            variant="outline-primary"
                            type="submit" >
                            <span className="fa fa-search" /> Look Up Citation
                        </Button>
                    </Col>
                </Row>
            </Stack>
        </Form>
    }

    renderSuccess({ citation }: { citation: string }) {
        return <div>
            {citation}
            <Col className="justify-content-center mt-2" >
                <Button variant="primary" onClick={this.handleSelect.bind(this)}><span className="fa fa-plus" /> Add Citation</Button>
            </Col>
        </div>
    }

    renderCitation() {
        switch (this.props.citationProcess.status) {
            case AsyncProcessStatus.NONE:
                return <AlertMessage variant="info">Please enter a DOI above to look up the corresponding citation</AlertMessage>
            case AsyncProcessStatus.PENDING:
                return <Loading message="Looking up citation..." />
            case AsyncProcessStatus.ERROR:
                return <ErrorMessage message={this.props.citationProcess.error.message} />
            case AsyncProcessStatus.SUCCESS:
                return this.renderSuccess(this.props.citationProcess.value)
        }
    }

    handleSelect() {
        if (this.props.citationProcess.status === AsyncProcessStatus.SUCCESS) {
            const citation: Citation = {
                citation: this.props.citationProcess.value.citation,
                source: 'manual',
                doi: this.state.doi
            }
            this.props.onSelect(citation);
            this.setState({
                doi: ''
            });
        }
    }

    render() {
        return <Stack>
            <Row>
                <Col>
                    {this.renderForm()}
                </Col>
            </Row>
            <Row>
                <Col md={12}>
                    <Well style={{ marginTop: '1em' }}>
                        <Well.Body>
                            {this.renderCitation()}
                        </Well.Body>
                    </Well>
                </Col>
            </Row>
        </Stack>
    }
}
