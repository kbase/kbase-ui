import { Description } from "apps/ORCIDLink/ORCIDLinkClient";
import Empty from "components/Empty";
import { Component } from "react";
import { Stack, Row, Col, Button, Form, FormControl, FormGroup } from "react-bootstrap";

export interface DescriptionFormProps {
    description: Description;
    addKeyword: (keyword: string) => void;
    removeKeyword: (position: number) => void;
    onDone: () => void;
}

interface DescriptionFormState {
    keyword: string;
    abstract: string;
}

export default class DescriptionForm extends Component<DescriptionFormProps, DescriptionFormState> {
    constructor(props: DescriptionFormProps) {
        super(props);
        this.state = {
            keyword: '',
            abstract: ''
        }
    }
    renderKeywords() {
        if (this.props.description.keywords.length === 0) {
            return <Empty message="No keywords yet" />
        }
        const rows = this.props.description.keywords.map((keyword, index) => {
            return <Row key={index}>
                <Col>
                    {keyword}
                </Col>
                <Col md="auto">
                    <Button variant="danger" onClick={(e) => this.props.removeKeyword(index)}>
                        <span className="fa fa-trash" />
                    </Button>
                </Col>
            </Row>
        });
        return <Stack gap={1}>
            {rows}
        </Stack>
    }
    addKeyword() {
        this.props.addKeyword(this.state.keyword);
        this.setState({
            keyword: ''
        });
    }
    onKeywordChanged(value: string) {
        this.setState({ keyword: value });
    }
    onAbstractChanged(value: string) {
        this.setState({ abstract: value });
    }
    render() {
        return <Stack gap={2} style={{ marginBottom: '1em' }
        } >
            <Row>
                <h3>Keywords</h3>
                <p>Enter one or more keywords</p>
            </Row>
            <Row>
                <Col>
                    {this.renderKeywords()}
                </Col>
                <Col>
                    <Form onSubmit={(e) => { e.preventDefault(); this.addKeyword(); }}>
                        <Row>
                            <Col md="auto">
                                <Form.Label>Add a keyword</Form.Label>
                            </Col>
                            <Col>
                                <FormControl type="text"
                                    value={this.state.keyword}
                                    onChange={(e) => this.onKeywordChanged(e.currentTarget.value)} />
                            </Col>
                            <Col md="auto">
                                <Button variant="primary"><span className="fa fa-plus" /></Button>
                            </Col>
                        </Row>

                    </Form>
                </Col>

            </Row>
            <Row>
                <h3>Abstract</h3>
                <Col>
                    <FormControl as="textarea"
                        value={this.state.abstract}
                        onChange={(e) => this.onAbstractChanged(e.currentTarget.value)}
                        rows={10}
                        style={{ maxWidth: '50em' }} />
                </Col>
            </Row>
            <Row>
                <Col>
                    <Row style={{ justifyContent: 'center' }} >
                        <Button variant="primary" className="w-auto" onClick={this.props.onDone}>Next <span className="fa fa-hand-o-down" /></Button>
                    </Row>
                </Col>
            </Row>
        </Stack >;
    }
}
