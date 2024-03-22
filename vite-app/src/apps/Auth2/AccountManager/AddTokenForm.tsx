import { Component } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";

export interface AddTokenFormProps {
    createToken: (tokenName: string) => void;
}

interface AddTokenFormState {
    tokenName: string | null;
}

export default class AddTokenForm extends Component<AddTokenFormProps, AddTokenFormState> {
    constructor(props: AddTokenFormProps) {
        super(props);
        // this.ref = createRef();
        this.state = {
            tokenName: null
        };
    }
    onSubmit() {
        // e.preventDefault();
        if (this.state.tokenName === null) {
            return;
        }
        this.props.createToken(this.state.tokenName);
        this.setState({
            tokenName: null
        });
    }
    render() {
        return <Form className="form-inline" onSubmit={(e) => { e.preventDefault(); this.onSubmit() }}>
            <Form.Group as={Row}>
                <Form.Label column sm={2}>Token Name</Form.Label>
                <Col sm={8}>
                <Form.Control 
                    type="text"
                    placeholder="Token Name"
                    autoFocus
                    value={this.state.tokenName || ''}
                    onChange={(e) => {
                        this.setState({ tokenName: e.target.value });
                    }}></Form.Control>
                </Col>
                <Col sm={2}><Button variant="primary" disabled={!this.state.tokenName} type="submit">Create Token</Button></Col>
            </Form.Group>
           
        </Form>
    }
}
