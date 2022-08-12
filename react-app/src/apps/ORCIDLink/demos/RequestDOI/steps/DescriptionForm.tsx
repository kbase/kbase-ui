import { Component } from "react";
import { Stack, Row, Col, Button } from "react-bootstrap";

export interface DescriptionFormProps {
    onDone: () => void;
}

interface DescriptionFormState {
}

export default class DescriptionForm extends Component<DescriptionFormProps, DescriptionFormState>{
    render() {
        return <Stack gap={2} style={{ marginBottom: '1em' }
        } >
            <Row>

            </Row>
            <Row>
                <Col md={12}>
                    <Row style={{ justifyContent: 'center' }} >
                        <Button variant="primary" className="w-auto" onClick={this.props.onDone}>Next <span className="fa fa-hand-o-down" /></Button>
                    </Row>
                </Col>
            </Row>
        </Stack >;
    }
}
