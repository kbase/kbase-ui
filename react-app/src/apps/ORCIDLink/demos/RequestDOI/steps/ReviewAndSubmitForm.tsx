import { Component } from "react";
import { Stack, Row, Col, Button } from "react-bootstrap";

export interface ReviewAndSubmitFormProps {
    onDone: () => void;
}

interface ReviewAndSubmitFormState {
}

export default class ReviewAndSubmitForm extends Component<ReviewAndSubmitFormProps, ReviewAndSubmitFormState>{
    render() {
        return <Stack gap={2} style={{ marginBottom: '1em' }
        } >
            <Row>

            </Row>
            <Row>
                <Col md={12}>
                    <Row style={{ justifyContent: 'center' }} >
                        <Button variant="primary" className="w-auto" onClick={this.props.onDone}>Send <span className="fa fa-paper-plane" /></Button>
                    </Row>
                </Col>
            </Row>
        </Stack >;
    }
}
