import { AppCitations, Citation, Citations } from 'apps/ORCIDLink/Model';
import Well from 'components/Well';
import { Component } from 'react';
import { Form, Stack, Row, Col, Accordion, Button } from 'react-bootstrap';
import styles from './CitationsForm.module.css';
import ManualCitationsController from './ManualCitationsController';

export interface CitationsFormProps {
    citations: Citations;
    onUpdate: (citations: Citations) => void;
    onDone: () => void;
}

function ifEmpty(value: string | null | undefined, defaultValue: string = 'n/a') {
    if (value) {
        return value;
    }
    return <span style={{ fontStyle: 'italic', color: 'rgba(100, 100, 100, 1)' }} >{defaultValue}</span>;
}

export default class CitationsForm extends Component<CitationsFormProps> {

    renderCitations(citations: Array<Citation>) {
        const rows = citations.map(({ citation, url, doi }, index) => {
            return <Row key={index}>
                <Col md={8}>{citation}</Col>
                <Col md={4}>{ifEmpty(doi, 'n/a - cannot be sent to OSTI')}</Col>
            </Row>
        });
        return <Stack gap={2}>
            <Row className={styles.header} style={{ borderBottom: '1px dashed rgb(200, 200, 200)' }}>
                <Col md={8}>Citation</Col>
                <Col md={4}>DOI</Col>
            </Row>
            {rows}
        </Stack>;
    }

    renderAppTagCitations(appCitations: Array<AppCitations>, tagTitle: string) {
        if (appCitations.length === 0) {
            return;
        }

        const app = appCitations.map(({ id, title, citations }) => {
            return <Stack gap={2} key={id} style={{ margin: '0.5em 0' }}>
                <Row >
                    <Row>
                        <h5>{title} ({id})</h5>
                    </Row>
                    <Row>
                        <Col>{this.renderCitations(citations)}</Col>
                    </Row>
                </Row>
            </Stack>
        });
        return <div className="well" style={{ padding: '1em', marginBottom: '1em' }}>
            <h4>{tagTitle}</h4>
            {app}
        </div>
    }

    renderAppCitations() {
        return <Stack>
            {this.renderAppTagCitations(this.props.citations.narrativeAppCitations.release, 'Released Apps')}
            {this.renderAppTagCitations(this.props.citations.narrativeAppCitations.beta, 'Beta Apps')}
            {this.renderAppTagCitations(this.props.citations.narrativeAppCitations.dev, 'Apps in Development')}
        </Stack>;
    }
    renderMarkdownCitations() {
        return this.renderCitations(this.props.citations.markdownCitations);
    }
    renderManualCitations() {
        return <ManualCitationsController />;
    }

    // render() {
    //     return <Form>
    //         <Stack gap={2} >
    //             <Row className="gx-2">
    //                 <Col md={2}>
    //                     <h3>From Apps</h3>
    //                 </Col>
    //                 <Col md={10}>
    //                     {this.renderAppCitations()}
    //                 </Col>
    //             </Row>
    //             <Row>
    //                 <Col md={2}>
    //                     <h3>From Markdown</h3>
    //                 </Col>
    //                 <Col md={10}>
    //                     <div className="well" style={{ padding: '1em', marginBottom: '1em' }}>
    //                         {this.renderMarkdownCitations()}
    //                     </div>
    //                 </Col>
    //             </Row>
    //             <Row>
    //                 <Col md={2}>
    //                     <h3>Manual</h3>
    //                 </Col>
    //                 <Col md={10}>
    //                     {this.renderManualCitations()}
    //                 </Col>
    //             </Row>
    //         </Stack>
    //     </Form>;
    // }

    renderAllCitations() {
        const appCitationCount =
            this.props.citations.narrativeAppCitations.release.reduce((total, app) => {
                return total + app.citations.length;
            }, 0) +
            this.props.citations.narrativeAppCitations.beta.reduce((total, app) => {
                return total + app.citations.length;
            }, 0) +
            this.props.citations.narrativeAppCitations.dev.reduce((total, app) => {
                return total + app.citations.length;
            }, 0);
        return <Accordion defaultActiveKey="app">
            <Accordion.Item eventKey="app">
                <Accordion.Header>
                    From Apps ({appCitationCount})
                </Accordion.Header>
                <Accordion.Body>
                    {this.renderAppCitations()}
                </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="markdown">
                <Accordion.Header>
                    From Markdown ({this.props.citations.markdownCitations.length})
                </Accordion.Header>
                <Accordion.Body>
                    {this.renderMarkdownCitations()}
                </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="manual">
                <Accordion.Header>
                    Manual ({this.props.citations.manualCitations.length})
                </Accordion.Header>
                <Accordion.Body>
                    {this.renderManualCitations()}
                </Accordion.Body>
            </Accordion.Item>
        </Accordion>
    }

    render() {
        return <Well style={{ padding: '1em', marginBottom: '1em' }}>
            <Stack gap={2}>
                <Row>
                    {this.renderAllCitations()}
                </Row>
                <Row>
                    <Col md={12}>
                        <Row style={{ justifyContent: 'center' }} >
                            <Button variant="primary" className="w-auto" onClick={this.props.onDone}>Next <span className="fa fa-hand-o-down" /></Button>
                        </Row>
                    </Col>
                </Row>
            </Stack>
        </Well>
    }
}