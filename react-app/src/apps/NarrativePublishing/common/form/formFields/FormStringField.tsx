import { Component } from "react";
import { Col, Form, Row } from "react-bootstrap";
import { FieldStatus, StringField } from "../Field";

export interface FormStringFieldProps {
    field: StringField;
    label: string;
    onEdit: (editValue: string) => void;
}

export class FormStringField extends Component<FormStringFieldProps> {
    renderControl() {
        const classes = [];
        switch (this.props.field.fieldState.status) {
            case FieldStatus.NONE:
                return;
            case FieldStatus.INVALID:
                classes.push('is-invalid')
                break;
            case FieldStatus.REQUIRED_EMPTY:
                classes.push('is-invalid')
        }
        return <Form.Control
            type="text"
            name="firstName"
            value={this.props.field.fieldState.editValue}
            className={classes.join(' ')}
            onInput={(e) => { this.props.onEdit(e.currentTarget.value); }}
        />
    }

    renderLabel() {
        const requiredIcon = (() => {
            if (!(this.props.field.isRequired)) {
                return;
            }
            if (this.props.field.fieldState.status === FieldStatus.REQUIRED_EMPTY) {
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
            switch (this.props.field.fieldState.status) {
                case FieldStatus.REQUIRED_EMPTY:
                    return 'This field is required';
                case FieldStatus.INVALID:
                    return this.props.field.fieldState.message;
            }
        })();
        return <div className="text-danger">{message}</div>;
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
