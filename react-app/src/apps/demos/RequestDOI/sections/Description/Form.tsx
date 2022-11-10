import { Description } from "apps/ORCIDLink/ORCIDLinkClient";
import Empty from "components/Empty";
import Well from "components/Well";
import { Component } from "react";
import { Button, Col, Container, Form, FormControl, Row, Stack } from "react-bootstrap";
import styles from './Form.module.css';

export interface DescriptionFormProps {
    description: Description;
    addKeyword: (keyword: string) => void;
    removeKeyword: (position: number) => void;
    setAbstract: (abstract: string) => void;
    onDone: () => void;
}

interface DescriptionFormState {
    keyword: string;
}

export default class DescriptionForm extends Component<DescriptionFormProps, DescriptionFormState> {
    constructor(props: DescriptionFormProps) {
        super(props);
        this.state = {
            keyword: ''
        }
    }
    renderKeywords() {
        if (this.props.description.keywords.length === 0) {
            return <Empty message="No keywords yet" />
        }
        const rows = this.props.description.keywords.map((keyword, index) => {
            return <Row key={index} className={`${styles.bordered} g-0`} >
                <Col>
                    {keyword}
                </Col>
                <Col md="auto">
                    <Button variant="outline-danger" className={styles.borderless} onClick={(e) => this.props.removeKeyword(index)}>
                        <span className="fa fa-trash" />
                    </Button>
                </Col>
            </Row >
        });
        return <Well style={{ padding: '0.5em' }}>
            <Container fluid >
                {rows}
            </Container>
        </Well>;
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
        this.props.setAbstract(value);
    }
    render() {
        return <Stack gap={2} style={{ marginBottom: '1em' }
        } >
            <Row className="g-0">
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
            <Row className="g-0">
                <h3>Abstract</h3>
                <Col md={12}>
                    <FormControl as="textarea"
                        value={this.props.description.abstract}
                        onChange={(e) => this.onAbstractChanged(e.currentTarget.value)}
                        rows={10}
                        style={{ maxWidth: '50em' }} />
                </Col>
            </Row>
            <Row className="g-0">
                <Col md={12}>
                    <Row style={{ justifyContent: 'center' }} className="g-0">
                        <Button variant="primary" className="w-auto" onClick={this.props.onDone}>Next <span className="fa fa-hand-o-down" /></Button>
                    </Row>
                </Col>
            </Row>
        </Stack >;
    }
}
