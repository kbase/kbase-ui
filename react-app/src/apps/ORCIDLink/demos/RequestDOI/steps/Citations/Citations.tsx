import { Citation } from 'apps/ORCIDLink/Model';
import AlertMessage from 'components/AlertMessage';
import { plural } from 'components/common';
import Empty from 'components/Empty';
import Well from 'components/Well';
import { Component, ReactNode } from 'react';
import { Stack, Row, Col, Button, Tabs, Tab, Nav, Alert } from 'react-bootstrap';
import CitationForm from './CitationFormController';
import styles from './Citations.module.css';
import CrossRefCitationView from './CrossRefCitationView/Controller';

export interface NarrativeCitationsProps {
    citations: Array<Citation>;
    // onUpdate: (citations: Array<Citation>) => void;
    onDone: () => void;
}

interface NarrativeCitationsState {
    citations: Array<Citation>;
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

export default class NarrativeCitations extends Component<NarrativeCitationsProps, NarrativeCitationsState> {
    constructor(props: NarrativeCitationsProps) {
        super(props);
        this.state = {
            citations: props.citations
        };
    }

    // Actions

    addCitation(citation: Citation) {
        this.setState({
            citations: this.state.citations.concat([citation])
        });
    }

    renderCitationx(citation: Citation) {
        if (!citation.doi) {
            return citation.citation;
        }
        return <Tabs defaultActiveKey="citation" variant="tabs">
            <Tab title="Citation" eventKey="citation">{citation.citation}</Tab>
            <Tab title="Cross Ref" eventKey="fancy"><CrossRefCitationView doi={citation.doi} /></Tab>
        </Tabs>
    }

    renderCitation(citation: Citation) {
        if (!citation.doi) {
            return citation.citation;
        }

        return <Tab.Container defaultActiveKey="citation">
            <Row>
                <Col sm={3}>
                    <Nav variant="pills" className="flex-column">
                        <Nav.Item>
                            <Nav.Link eventKey="citation">Citation</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="crossRef">Cross Ref</Nav.Link>
                        </Nav.Item>
                    </Nav>
                </Col>
                <Col sm={0}>
                    <Tab.Content>
                        <Tab.Pane eventKey="citation" mountOnEnter={true}>
                            {citation.citation}
                        </Tab.Pane>
                        <Tab.Pane eventKey="crossRef" mountOnEnter={true} >
                            <CrossRefCitationView doi={citation.doi} />
                        </Tab.Pane>
                    </Tab.Content>
                </Col>
            </Row>
        </Tab.Container>
    }

    // Renderers
    renderCitations() {
        const citations = this.state.citations;
        if (citations.length === 0) {
            return <Empty message="No citations" />
        }
        const rows = citations.map((citation, index) => {
            return <Row key={index} style={{ borderBottom: '1px solid rgba(200, 200, 200, 0.5)' }}>
                <Col style={{ flex: '0 0 1.5em' }}>{when(citation.doi, <span className="fa fa-check text-success" />, <span className="fa fa-ban text-warning" />)}</Col>
                <Col md={3}>{ifEmpty(citation.doi, 'n/a - cannot be sent to OSTI')}</Col>
                <Col md={7}>{this.renderCitation(citation)}</Col>
                <Col md={1}>{citation.source}</Col>
            </Row>
        });
        return <Stack gap={2}>
            <Row className={styles.header} style={{ borderBottom: '1px dashed rgb(200, 200, 200)' }}>
                <Col style={{ flex: '0 0 1.5em' }}></Col>
                <Col md={7}>Citation</Col>
                <Col md={3}>DOI</Col>
                <Col md={1}>Source</Col>
            </Row>
            {rows}
        </Stack>;
    }

    // renderAppTagCitations(appCitations: Array<AppCitations>, tagTitle: string) {
    //     const citations = (() => {
    //         if (appCitations.length === 0) {
    //             return <Empty message={`No ${tagTitle} citations`} />
    //         }
    //         return appCitations.map(({ id, title, citations }) => {
    //             return <Stack gap={2} key={id} style={{ margin: '0.5em 0' }}>
    //                 <Row >
    //                     <Row>
    //                         <h5>{title} ({id})</h5>
    //                     </Row>
    //                     <Row>
    //                         <Col>{this.renderCitations(citations)}</Col>
    //                     </Row>
    //                 </Row>
    //             </Stack>
    //         });
    //     })();
    //     return <div style={{ padding: '1em', marginBottom: '1em' }}>
    //         <h4>{tagTitle}</h4>
    //         {citations}
    //     </div>
    // }

    // renderAppCitations() {
    //     return this.renderCitations(this.props.appCitations);
    // }
    // renderMarkdownCitations() {
    //     return this.renderCitations(this.props.markdownCitations);
    // }
    // renderManualCitations() {
    //     return <ManualCitationsController />;
    // }

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

    // renderAllCitations() {
    //     // const appCitationCount =
    //     // this.props.appCitations.reduce((total, app) => {
    //     //     return total + app.citations.length;
    //     // }, 0) +
    //     // this.props.citations.narrativeAppCitations.beta.reduce((total, app) => {
    //     //     return total + app.citations.length;
    //     // }, 0) +
    //     // this.props.citations.narrativeAppCitations.dev.reduce((total, app) => {
    //     //     return total + app.citations.length;
    //     // }, 0);
    //     return <Accordion defaultActiveKey="app">
    //         <Accordion.Item eventKey="app">
    //             <Accordion.Header>
    //                 From Apps ({this.props.appCitations.length})
    //             </Accordion.Header>
    //             <Accordion.Body>
    //                 {this.renderAppCitations()}
    //             </Accordion.Body>
    //         </Accordion.Item>
    //         <Accordion.Item eventKey="markdown">
    //             <Accordion.Header>
    //                 From Markdown ({this.props.markdownCitations.length})
    //             </Accordion.Header>
    //             <Accordion.Body>
    //                 {this.renderMarkdownCitations()}
    //             </Accordion.Body>
    //         </Accordion.Item>
    //         {/* <Accordion.Item eventKey="manual">
    //             <Accordion.Header>
    //                 Manual ({this.state.manualCitations.length})
    //             </Accordion.Header>
    //             <Accordion.Body>
    //                 {this.renderManualCitations()}
    //             </Accordion.Body>
    //         </Accordion.Item> */}
    //     </Accordion>
    // }

    renderWarnings() {
        const missingDOICount = this.state.citations.filter((citation) => {
            return !citation.doi;
        }).length;

        if (missingDOICount > 0) {
            return <Row>
                <Col md={12}>
                    <AlertMessage type="warning">
                        <p>{missingDOICount} {plural(missingDOICount, 'citation', 'citations')} do not have an associated DOI.</p>
                        <p style={{ marginBottom: '0' }}>Citations without a DOI cannot be included in your DOI record.</p>
                    </AlertMessage>
                </Col>
            </Row>
        }
    }


    render() {
        return <Well style={{ padding: '1em', marginBottom: '1em' }}>
            <Stack gap={2}>
                {this.renderWarnings()}

                <Row>
                    {this.renderCitations()}
                </Row>
                <Row style={{ paddingTop: '1em' }}>
                    <Col md={12}>
                        <h4>Add Citation</h4>
                    </Col>
                </Row>
                <Row>
                    <Col md={12}>
                        <CitationForm addCitation={this.addCitation.bind(this)} />
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
        </Well>
    }
}