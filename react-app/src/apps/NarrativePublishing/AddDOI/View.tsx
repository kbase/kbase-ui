import ErrorAlert from 'components/ErrorAlert';
import Loading from 'components/Loading';
import RotatedTable, { RotatedTableRow } from 'components/RotatedTable';
import { AsyncProcessStatus } from 'lib/AsyncProcess';
import { Component } from 'react';
import { Button, Col, Container, FormControl, Row } from 'react-bootstrap';
import { DOISaveState, NarrativeInfo, NarrativeState } from './Controller';
import DOIForm from './DOIForm';

export interface ViewProps {
    narrativeState: NarrativeState;
    doiSaveState: DOISaveState;
    saveDOI: (doi: string | null, narrativeId: number, narrativeVersion: number) => Promise<void>
}

interface ViewState {
    doi: string | null;
}

export default class View extends Component<ViewProps, ViewState> {
    constructor(props: ViewProps) {
        super(props);
        this.state = {
            doi: null
        }
    }

    renderNarrative(narrativeInfo: NarrativeInfo) {
        const rows: Array<RotatedTableRow> = [
            ['Id', narrativeInfo.id],
            ['Title', narrativeInfo.title],
            ['Created', Intl.DateTimeFormat('en-US', {}).format(narrativeInfo.createdAt)],
            ['Last Saved', Intl.DateTimeFormat('en-US', {}).format(narrativeInfo.lastSavedAt)],
            ['DOI', narrativeInfo.doi],
            ['Published', Intl.DateTimeFormat('en-US', {}).format(narrativeInfo.publishedAt)],
            ['Published Version', narrativeInfo.publishedVersion],
            ['Abstract', narrativeInfo.abstract || 'n/a']
        ];
        return <RotatedTable rows={rows} styles={{
            col1: { flex: '0 0 10em' }
        }} />
    }

    renderNarrativeState() {
        const narrativeState = this.props.narrativeState;
        switch (narrativeState.status) {
            case AsyncProcessStatus.NONE:
            case AsyncProcessStatus.PENDING:
                return <Loading message="Loading Narrative..." />
            case AsyncProcessStatus.SUCCESS:
                return this.renderNarrative(narrativeState.value);
            case AsyncProcessStatus.ERROR:
                return <ErrorAlert message={narrativeState.error.message} />
        }
    }  

    renderDOIField() {
        const narrativeState = this.props.narrativeState;
        switch (narrativeState.status) {
            case AsyncProcessStatus.NONE:
            case AsyncProcessStatus.PENDING:
                return <Loading message="Loading Narrative..." />
            case AsyncProcessStatus.SUCCESS:
                return <FormControl type="text" value={narrativeState.value.doi || ''} onInput={(ev) => { this.setState({ doi: ev.currentTarget.value }) }} />
            case AsyncProcessStatus.ERROR:
                return <ErrorAlert message={narrativeState.error.message} />
        }
    }

    saveDOI(doi: string) {
        if (this.props.narrativeState.status === AsyncProcessStatus.SUCCESS) {
            this.props.saveDOI(doi, this.props.narrativeState.value.id, this.props.narrativeState.value.publishedVersion);
        }
    }

    renderDOIForm() {
        const narrativeState = this.props.narrativeState;
        switch (narrativeState.status) {
            case AsyncProcessStatus.NONE:
            case AsyncProcessStatus.PENDING:
                return <Loading message="Loading Narrative..." />
            case AsyncProcessStatus.SUCCESS:
                const saving = this.props.doiSaveState.status in [AsyncProcessStatus.NONE, AsyncProcessStatus.PENDING];
                return <DOIForm doi={narrativeState.value.doi} saving={false} save={this.saveDOI.bind(this)} />
            case AsyncProcessStatus.ERROR:
                return <ErrorAlert message={narrativeState.error.message} />
        }
    }
    render() {
        return <Container fluid={true} className="px-5">
            <Row className="gx-5">
                <Col md={4}>
                    <h3>DOI</h3>
                    {this.renderDOIForm()}
                </Col>
                <Col>
                    <h3>Narrative</h3>
                    {this.renderNarrativeState()}
                </Col>
            </Row>
            <Row className="gx-5">
                <Col style={{ textAlign: 'center' }} >
                    <Button variant="outline-primary" href="/#narrativepublishing"><span className="fa fa-mail-reply" /> Back to Narrative Publisher</Button>
                </Col>
            </Row>
        </Container>
    }
}
