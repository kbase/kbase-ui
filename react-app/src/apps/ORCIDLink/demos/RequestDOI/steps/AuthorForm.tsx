import { Component } from 'react';
import { Col, Form, Row, Stack } from 'react-bootstrap';
import { FieldStatus } from '../common';
import { Fields } from './AuthorORCIDController';

export interface AuthorFormProps {
    fields: Fields;
    onInputFirstName: (value: string) => Promise<void>;
    onInputMiddleName: (value: string) => Promise<void>;
    onInputLastName: (value: string) => Promise<void>;
    onInputORCIDId: (value: string) => Promise<void>;
    onInputEmailAddress: (value: string) => Promise<void>;
    onInputInstitution: (value: string) => Promise<void>;
    onResetForm: () => Promise<void>;
}

interface AuthorFormState {
}

export default class AuthorForm extends Component<AuthorFormProps, AuthorFormState> {
    renderFirstNameField() {
        switch (this.props.fields.firstName.status) {
            case FieldStatus.NONE:
                return;
            case FieldStatus.INVALID:
            case FieldStatus.INITIAL:
            case FieldStatus.VALID:
                return <Form.Control
                    type="text"
                    name="firstName"
                    value={this.props.fields.firstName.rawValue}
                    onInput={(e) => { this.props.onInputFirstName(e.currentTarget.value); }}
                />
        }
    }

    renderMiddleNameField() {
        switch (this.props.fields.middleName.status) {
            case FieldStatus.NONE:
                return;
            case FieldStatus.INITIAL:
            case FieldStatus.INVALID:
            case FieldStatus.VALID:
                return <Form.Control
                    type="text"
                    name="middleName"
                    value={this.props.fields.middleName.rawValue}
                    onInput={(e) => { this.props.onInputMiddleName(e.currentTarget.value); }}
                />
        }
    }

    renderLastNameField() {
        switch (this.props.fields.lastName.status) {
            case FieldStatus.NONE:
                return;
            case FieldStatus.INITIAL:
            case FieldStatus.INVALID:
            case FieldStatus.VALID:
                return <Form.Control
                    type="text"
                    name="lastName"
                    value={this.props.fields.lastName.rawValue}
                    onInput={(e) => { this.props.onInputLastName(e.currentTarget.value); }}
                />
        }
    }



    renderEmailAddressField() {
        switch (this.props.fields.emailAddress.status) {
            case FieldStatus.NONE:
                return;
            case FieldStatus.INITIAL:
            case FieldStatus.INVALID:
            case FieldStatus.VALID:
                return <Form.Control
                    type="text"
                    name="emailAddress"
                    value={this.props.fields.emailAddress.rawValue}
                    onInput={(e) => { this.props.onInputEmailAddress(e.currentTarget.value); }}
                />
        }
    }

    renderORCIDIdField() {
        switch (this.props.fields.orcidId.status) {
            case FieldStatus.NONE:
                return;
            case FieldStatus.INITIAL:
            case FieldStatus.INVALID:
            case FieldStatus.VALID:
                return <Form.Control
                    type="text"
                    name="orcidId"
                    value={this.props.fields.orcidId.rawValue}
                    onInput={(e) => { this.props.onInputORCIDId(e.currentTarget.value); }}
                />
        }
    }

    renderInstitutionField() {
        switch (this.props.fields.institution.status) {
            case FieldStatus.NONE:
                return;
            case FieldStatus.INITIAL:
            case FieldStatus.INVALID:
            case FieldStatus.VALID:
                return <Form.Control
                    type="text"
                    name="institution"
                    value={this.props.fields.institution.rawValue}
                    onInput={(e) => { this.props.onInputInstitution(e.currentTarget.value); }}
                />
        }
    }

    render() {
        return <Stack gap={2} >
            <Row className="g-0">
                <Col md={2}>
                    First (Given) Name
                </Col>
                <Col md={10}>
                    {this.renderFirstNameField()}
                </Col>
            </Row>
            <Row className="g-0">
                <Col md={2}>
                    Middle Name
                </Col>
                <Col md={10}>
                    {this.renderMiddleNameField()}
                </Col>
            </Row>
            <Row className="g-0">
                <Col md={2}>
                    Last (Family) Name
                </Col>
                <Col md={10}>
                    {this.renderLastNameField()}
                </Col>
            </Row>
            <Row className="g-0">
                <Col md={2}>
                    Email Address
                </Col>
                <Col md={10}>
                    {this.renderEmailAddressField()}
                </Col>
            </Row>
            <Row className="g-0">
                <Col md={2}>
                    ORCID ID
                </Col>
                <Col md={10}>
                    {this.renderORCIDIdField()}
                </Col>
            </Row>
            <Row className="g-0">
                <Col md={2}>
                    Institution(s)
                </Col>
                <Col md={10}>
                    {this.renderInstitutionField()}
                </Col>
            </Row>
        </Stack>;
    }
}