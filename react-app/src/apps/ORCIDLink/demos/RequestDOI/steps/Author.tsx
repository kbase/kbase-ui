import { Component } from 'react';
import { Col, Form, Row, Stack } from 'react-bootstrap';
import { Fields } from './AuthorORCIDController';

export interface AuthorProps {
    fields: Fields;
    onInputFirstName: (value: string) => Promise<void>;
    onInputMiddleName: (value: string) => Promise<void>;
    onInputLastName: (value: string) => Promise<void>;
    onInputORCIDId: (value: string) => Promise<void>;
    onInputEmailAddress: (value: string) => Promise<void>;
    onInputInstitution: (value: string) => Promise<void>;
    onResetForm: () => Promise<void>;
}

interface AuthorState {
}

export default class Authors extends Component<AuthorProps, AuthorState> {


    render() {
        return <Form>
            <Stack gap={2} >
                <Row className="gx-2">
                    <Col md={2}>
                        First (Given) Name
                    </Col>
                    <Col md={10}>
                        <Form.Control
                            type="text"
                            name="title"
                            value={this.props.fields.firstName.value}
                            onInput={(e) => { this.props.onInputFirstName(e.currentTarget.value); }}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col md={2}>
                        Middle Name
                    </Col>
                    <Col md={10}>
                        <Form.Control
                            type="text"
                            name="title"
                            value={this.props.fields.middleName.value}
                            onInput={(e) => { this.props.onInputMiddleName(e.currentTarget.value); }}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col md={2}>
                        Last (Family) Name
                    </Col>
                    <Col md={10}>
                        <Form.Control
                            type="text"
                            name="title"
                            value={this.props.fields.lastName.value}
                            onInput={(e) => { this.props.onInputLastName(e.currentTarget.value); }}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col md={2}>
                        Email Address
                    </Col>
                    <Col md={10}>
                        <Form.Control
                            type="text"
                            name="title"
                            value={this.props.fields.emailAddress.value}
                            onInput={(e) => { this.props.onInputEmailAddress(e.currentTarget.value); }}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col md={2}>
                        ORCID ID
                    </Col>
                    <Col md={10}>
                        <Form.Control
                            type="text"
                            name="title"
                            value={this.props.fields.orcidId.value}
                            onInput={(e) => { this.props.onInputORCIDId(e.currentTarget.value); }}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col md={2}>
                        Institution(s)
                    </Col>
                    <Col md={10}>
                        <Form.Control
                            type="text"
                            name="title"
                            value={this.props.fields.institution.value}
                            onInput={(e) => { this.props.onInputInstitution(e.currentTarget.value); }}
                        />
                    </Col>
                </Row>
            </Stack>
        </Form>;
    }
}