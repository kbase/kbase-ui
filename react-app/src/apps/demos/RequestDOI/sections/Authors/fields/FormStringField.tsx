import { Component } from "react";
import { Col, Form, Row } from "react-bootstrap";
import { EditStatus, StringField, ValidationStatus } from "../Field";

export interface FormStringFieldProps {
    field: StringField;
    label: string;
    onEdit: (editValue: string) => void;
}

export class FormStringField extends Component<FormStringFieldProps> {
    renderControl() {
        switch (this.props.field.editState.status) {
            case EditStatus.NONE:
                return;
            case EditStatus.INITIAL:
            case EditStatus.EDITED: {
                const classes = [];
                switch (this.props.field.validationState.status) {
                    case ValidationStatus.REQUIRED_EMPTY:
                        classes.push('is-invalid')
                        break;
                    case ValidationStatus.INVALID:
                        classes.push('is-invalid')
                        break;
                }
                return <Form.Control
                    type="text"
                    name="firstName"
                    value={this.props.field.editState.editValue}
                    className={classes.join(' ')}
                    onInput={(e) => { this.props.onEdit(e.currentTarget.value); }}
                />
            }
        }
    }
    renderLabel() {
        const requiredIcon = (() => {
            if (!(this.props.field.isRequired)) {
                return;
            }
            if (this.props.field.validationState.status === ValidationStatus.REQUIRED_EMPTY) {
                return <span className="fa fa-asterisk text-danger ms-1" />;
            } else {
                return <span className="fa fa-asterisk text-secondary ms-1" />;
            }
        })();
        return <>
            <span>{this.props.label}</span>
            {requiredIcon}
        </>;
    }

    renderMessage() {
        const message = (() => {
            switch (this.props.field.validationState.status) {
                case ValidationStatus.REQUIRED_EMPTY:
                    return 'This field is required';
                case ValidationStatus.INVALID:
                    return this.props.field.validationState.message;
            }
        })();
        return <div>{message}</div>;
    }
    render() {

        return <Row className="g-0">
            <Col md={2}>
                {this.renderLabel()}
            </Col>
            <Col md={10}>
                {this.renderControl()}
                {this.renderMessage()}
            </Col>
        </Row>
    }
}