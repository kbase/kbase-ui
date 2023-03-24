import { EditState, EditStatus, ValidationState, ValidationStatus } from "apps/NarrativePublishing/Model";
import { Component } from "react";
import Form from "react-bootstrap/esm/Form";

import { citationTypes } from '../lookups';
import { renderFieldEditStatus, renderFieldValidationIcon, renderFieldValidationMessage } from "./common";

export interface StringFieldProps {
    editState: EditState<string, string>
    placeholder: string;
    required: boolean;
    minLength?: number;
    maxLength?: number;
    save: (editState: EditState<string, string>) => void;
}


export default class StringField extends Component<StringFieldProps> {

    componentDidMount() {
        console.log('validate??', this.validate(this.props.editState.editValue));
        // We force a validation and update upon mounting so that we can properly 
        // reflect the initial status.
        this.props.save(this.validate(this.props.editState.editValue));
    }

    validate(editValue: string): EditState<string, string> {
        const { editState } = this.props;

        const status = (() => {
            if (editState.initialValue === editValue) {
                return EditStatus.INITIAL;
            }
            return EditStatus.EDITED;
        })();

        const validationState = ((): ValidationState => {
            if (editValue.length === 0 && this.props.required) {
                return {
                    status: ValidationStatus.REQUIRED_MISSING
                }
            }

            if (this.props.minLength && editValue.length < this.props.minLength) {
                return {
                    status: ValidationStatus.INVALID,
                    message: `length must be no less than ${this.props.minLength} characters long`
                }
            }

            if (this.props.maxLength && editValue.length > this.props.maxLength) {
                return {
                    status: ValidationStatus.INVALID,
                    message: `length must be no greater than ${this.props.minLength} characters long`
                }
            }

            return {
                status: ValidationStatus.VALID
            }
        })();

        console.log('ok', status, validationState);

        return {
            ...editState,
            status,
            validationState,
            editValue,
            value: validationState.status === ValidationStatus.VALID ? editValue : this.props.editState.value
        }
    }

    changed(editedValue: string): void {
        this.props.save(this.validate(editedValue));
    }

    render() {
        const options = citationTypes.map(({ value, label }) => {
            return (
                <option value={value} key={value}>
                    {label}
                </option>
            );
        });
        options.unshift(
            <option value="" key="noop">
                {this.props.placeholder}
            </option>
        );
        const field = this.props.editState;
        const editStatusBorder = renderFieldEditStatus(field.status);
        const validationIcon = renderFieldValidationIcon(field.validationState.status);
        const validationMessage = renderFieldValidationMessage(field.validationState);

        console.log('OKAY', field.validationState, field);

        return (
            <div>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }} className={editStatusBorder}>
                    {validationIcon}
                    <div style={{ flex: '1 1 0' }}>
                        <Form.Control
                            as="input"
                            value={field.editValue}
                            onChange={(ev) => {
                                this.changed(ev.currentTarget.value);
                            }}
                        />
                    </div>
                </div>
                {validationMessage}
            </div>
        );
    }
}