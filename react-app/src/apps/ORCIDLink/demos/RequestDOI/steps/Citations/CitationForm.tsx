import { Citation } from 'apps/ORCIDLink/Model';
import AlertMessage from 'components/AlertMessage';
import Empty from 'components/Empty';
import ErrorMessage from 'components/ErrorMessage';
import Loading from 'components/Loading';
import Well from 'components/Well';
import { AsyncProcessStatus } from 'lib/AsyncProcess';
import { Component } from 'react';
import { Button, Col, Form, Row, Stack } from 'react-bootstrap';
import { GetCitationProcess } from './CitationFormController';
import CrossRefCitationView from './CrossRefCitationView/View';
import { CrossRefCitation } from './CrossRefClient';

export interface CitationFormProps {
    getCitation: (doi: string) => Promise<void>
    onSelect: (citation: Citation) => void;
    // citation: CrossRefCitation | null;
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
        }
    }

    handleDOIInput(doi: string) {
        this.setState({
            doi
        })
    }

    renderForm() {
        return <Stack>
            <Row>
                <Col style={{ flex: '0 0 4em' }} className="d-flex align-items-center">
                    <span style={{ fontWeight: 'bold', color: 'rgb(150, 150, 150)' }}>DOI</span>
                </Col>
                <Col>
                    <Form.Control type="text" placeholder="Enter a DOI" onInput={(e) => { this.handleDOIInput(e.currentTarget.value) }} />
                </Col>
                <Col>
                    <Button variant="primary" onClick={() => { this.props.getCitation(this.state.doi) }}><span className="fa fa-search" /> Look Up Citation</Button>
                </Col>
            </Row>

        </Stack>
    }

    renderCitation() {
        switch (this.props.citationProcess.status) {
            case AsyncProcessStatus.NONE:
                return <AlertMessage type="info">Please enter a DOI above to look up the corresponding citation</AlertMessage>
            case AsyncProcessStatus.PENDING:
                return <Loading message="Looking up citation..." />
            case AsyncProcessStatus.ERROR:
                return <ErrorMessage message={this.props.citationProcess.error.message} />
            case AsyncProcessStatus.SUCCESS:
                return <CrossRefCitationView citation={this.props.citationProcess.value} />
        }

        // if (this.props.citation === null) {
        //     return <Empty message="Search for a citation by DOI..." />
        // }
        // return <CrossRefCitationView citation={this.props.citation} />
    }

    createCitation() {
        return 'citation here';
    }

    handleSelect() {
        const citation: Citation = {
            citation: 'citation here',
            source: 'manual',
            doi: this.state.doi
        }
        console.log('adding...', citation);
        this.props.onSelect(citation);
    }

    render() {
        return <Stack>
            <Row>
                <Col>
                    {this.renderForm()}
                </Col>
            </Row>
            <Row>
                <Col md={10}>
                    <Well style={{ marginTop: '1em' }}>
                        <Well.Body>
                            {this.renderCitation()}
                        </Well.Body>
                    </Well>
                </Col>
                <Col md={2} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <Button variant="primary" onClick={this.handleSelect.bind(this)}><span className="fa fa-plus" /> Add Citation</Button>
                </Col>
            </Row>
        </Stack>
    }
}
