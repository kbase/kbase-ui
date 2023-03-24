import Well from 'components/Well';
import { Component } from 'react';
import { Button, Stack } from 'react-bootstrap';
import { FormStringArrayField } from '../../formFields/FormStringArrayField';
import { FormStringField } from '../../formFields/FormStringField';
import { FormTextField } from '../../formFields/FormTextField';
import { EditableDescription } from './Controller';

export interface DescriptionFormProps {
    description: EditableDescription;
    onEditTitle: (value: string) => Promise<void>;
    onEditReaserchOrganization: (value: string) => Promise<void>;
    onEditAbstract: (value: string) => Promise<void>;
    // onEditKeywords:f (value: Array<string>) => Promise<void>;
    onAddKeywords: (value: Array<string>) => Promise<void>;
    onRemoveKeyword: (index: number) => Promise<void>;
    // addKeyword: (keyword: string) => void;
    // removeKeyword: (position: number) => void;
    // setAbstract: (abstract: string) => void;
    // setResearchOrganization: (researchOrganization: string) => void;
    canComplete: boolean;
    onDone: () => void;
}

interface DescriptionFormState {
    keyword: string;
}

export default class DescriptionForm extends Component<DescriptionFormProps, DescriptionFormState> {
    constructor(props: DescriptionFormProps) {
        super(props);
        this.state = {
            keyword: '',
        };
    }
    // renderKeywords() {
    //     if (this.props.description.keywords.length === 0) {
    //         return <Empty message="No keywords yet" />
    //     }
    //     const rows = this.props.description.keywords.map((keyword, index) => {
    //         return <Row key={index} className={`${styles.bordered} g-0`} >
    //             <Col>
    //                 {keyword}
    //             </Col>
    //             <Col md="auto">
    //                 <Button variant="outline-danger" className={styles.borderless} onClick={(e) => this.props.removeKeyword(index)}>
    //                     <span className="fa fa-trash" />
    //                 </Button>
    //             </Col>
    //         </Row >
    //     });
    //     return <Well style={{ padding: '0.5em' }}>
    //         <Container fluid >
    //             {rows}
    //         </Container>
    //     </Well>;
    // }
    // addKeyword() {
    //     this.props.addKeyword(this.state.keyword);
    //     this.setState({
    //         keyword: ''
    //     });
    // }
    // onKeywordChanged(value: string) {
    //     this.setState({ keyword: value });
    // }
    // onAbstractChanged(value: string) {
    //     this.props.setAbstract(value);
    // }
    // onTitleChanged(value: string) {
    //     this.props.setTitle(value);
    // }
    // onResearchOrganizationChanged(value: string) {
    //     this.props.setResearchOrganization(value);
    // }
    // render() {
    //     return <Stack gap={2} style={{ marginBottom: '1em' }
    //     } >

    //         <Row className="g-0">
    //             <h3>Title</h3>
    //             <Col md={12}>
    //                 <StringField field={this.props.description.title} />
    //                 {/* <FormControl
    //                     value={this.props.description.title}
    //                     onChange={(e) => this.onTitleChanged(e.currentTarget.value)}
    //                     style={{ maxWidth: '50em' }} /> */}
    //             </Col>
    //         </Row><Row className="g-0">
    //             <h3>Research Organization</h3>
    //             <Col md={12}>
    //                 <FormControl
    //                     value={this.props.description.researchOrganization}
    //                     onChange={(e) => this.onResearchOrganizationChanged(e.currentTarget.value)}
    //                     style={{ maxWidth: '50em' }} />
    //             </Col>
    //         </Row>
    //         <Row className="g-0 mt-3" >
    //             <h3>Keywords</h3>
    //             <p>Enter one or more keywords</p>
    //         </Row>
    //         <Container fluid>
    //             <Row>
    //                 <Col style={{ paddingLeft: '0' }}>
    //                     {this.renderKeywords()}
    //                 </Col>
    //                 <Col style={{ paddingRight: '0' }}>
    //                     <Form onSubmit={(e) => { e.preventDefault(); this.addKeyword(); }}>
    //                         <Row style={{ marginLeft: '0', marginRight: '0' }}>
    //                             <Col md="auto" style={{ marginLeft: '0' }}>
    //                                 <Form.Label>Add a keyword</Form.Label>
    //                             </Col>
    //                             <Col>
    //                                 <FormControl type="text"
    //                                     value={this.state.keyword}
    //                                     onChange={(e) => this.onKeywordChanged(e.currentTarget.value)} />
    //                             </Col>
    //                             <Col md="auto" style={{ marginRight: '0' }}>
    //                                 <Button variant="primary" onClick={this.addKeyword.bind(this)}><span className="fa fa-plus" /></Button>
    //                             </Col>
    //                         </Row>
    //                     </Form>
    //                 </Col>
    //             </Row>
    //         </Container>
    //         <Row className="g-0 mt-3">
    //             <h3>Abstract</h3>
    //             <Col md={12}>
    //                 <FormControl as="textarea"
    //                     value={this.props.description.abstract}
    //                     onChange={(e) => this.onAbstractChanged(e.currentTarget.value)}
    //                     rows={10}
    //                     style={{ maxWidth: '50em' }} />
    //             </Col>
    //         </Row>
    //         <Row className="g-0">
    //             <Col md={12}>
    //                 <Row style={{ justifyContent: 'center' }} className="g-0">
    //                     <Button variant="primary" className="w-auto" onClick={this.props.onDone}>Next <span className="fa fa-hand-o-down" /></Button>
    //                 </Row>
    //             </Col>
    //         </Row>
    //     </Stack >;
    // }

    render() {
        return (
            <Well variant="secondary">
                <Well.Header>Edit Description</Well.Header>
                <Well.Body>
                    <Stack gap={2} style={{ marginBottom: '1em' }}>
                        <FormStringField
                            field={this.props.description.title}
                            label="Title"
                            onEdit={this.props.onEditTitle}
                        />
                        <FormStringField
                            field={this.props.description.researchOrganization}
                            label="Research Organization"
                            onEdit={this.props.onEditReaserchOrganization}
                        />
                        <FormTextField
                            field={this.props.description.abstract}
                            name="abstract"
                            label="Abstract"
                            onEdit={this.props.onEditAbstract}
                        />
                        <FormStringArrayField
                            field={this.props.description.keywords}
                            names={{ singular: 'keyword', plural: 'keywords' }}
                            label="Keywords"
                            onAdd={this.props.onAddKeywords}
                            onRemove={this.props.onRemoveKeyword}
                        />
                    </Stack>
                </Well.Body>
                <Well.Footer style={{ justifyContent: 'center' }}>
                    <Button
                        variant="primary"
                        className="w-auto"
                        disabled={!this.props.canComplete}
                        onClick={this.props.onDone}
                    >
                        Done
                    </Button>
                </Well.Footer>
            </Well>
        );

        {
            /* <Row className="g-0">
                <h3>Title</h3>
                <Col md={12}>
                    <FormControl
                        value={this.props.description.title}
                        onChange={(e) => this.onTitleChanged(e.currentTarget.value)}
                        style={{ maxWidth: '50em' }} />
                </Col>
            </Row><Row className="g-0">
                <h3>Research Organization</h3>
                <Col md={12}>
                    <FormControl
                        value={this.props.description.researchOrganization}
                        onChange={(e) => this.onResearchOrganizationChanged(e.currentTarget.value)}
                        style={{ maxWidth: '50em' }} />
                </Col>
            </Row>
            <Row className="g-0 mt-3" >
                <h3>Keywords</h3>
                <p>Enter one or more keywords</p>
            </Row>
            <Container fluid>
                <Row>
                    <Col style={{ paddingLeft: '0' }}>
                        {this.renderKeywords()}
                    </Col>
                    <Col style={{ paddingRight: '0' }}>
                        <Form onSubmit={(e) => { e.preventDefault(); this.addKeyword(); }}>
                            <Row style={{ marginLeft: '0', marginRight: '0' }}>
                                <Col md="auto" style={{ marginLeft: '0' }}>
                                    <Form.Label>Add a keyword</Form.Label>
                                </Col>
                                <Col>
                                    <FormControl type="text"
                                        value={this.state.keyword}
                                        onChange={(e) => this.onKeywordChanged(e.currentTarget.value)} />
                                </Col>
                                <Col md="auto" style={{ marginRight: '0' }}>
                                    <Button variant="primary" onClick={this.addKeyword.bind(this)}><span className="fa fa-plus" /></Button>
                                </Col>
                            </Row>
                        </Form>
                    </Col>
                </Row>
            </Container>
            <Row className="g-0 mt-3">
                <h3>Abstract</h3>
                <Col md={12}>
                    <FormControl as="textarea"
                        value={this.props.description.abstract}
                        onChange={(e) => this.onAbstractChanged(e.currentTarget.value)}
                        rows={10}
                        style={{ maxWidth: '50em' }} />
                </Col>
            </Row> */
        }
    }
}
