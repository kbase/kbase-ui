import { EditState, EditStatus, ValidationStatus } from "apps/NarrativePublishing/Model";
import { Component } from "react";
import Form from "react-bootstrap/esm/Form";

import { citationTypes } from '../lookups';
import { renderFieldEditStatus, renderFieldValidationIcon, renderFieldValidationMessage } from "./common";

export interface TextFieldProps {
    editState: EditState<string, string>
    placeholder: string;
    rows: number;
    required: boolean;
    save: (editState: EditState<string, string>) => void;
}


export default class TextField extends Component<TextFieldProps> {
    validate(editValue: string): EditState<string, string> {
        const { editState } = this.props;

        if (editState.initialValue === editValue) {
            return {
                ...editState,
                status: EditStatus.INITIAL,
                validationState: {
                    status: ValidationStatus.VALID
                },
                editValue,
                value: editValue
            }
        }

        if (editValue.length === 0 && this.props.required) {
            return {
                ...editState,
                status: EditStatus.EDITED,
                validationState: {
                    status: ValidationStatus.REQUIRED_MISSING
                },
                editValue,
            }
        }
        return {
            ...editState,
            status: EditStatus.EDITED,
            validationState: {
                status: ValidationStatus.VALID
            },
            editValue,
            value: editValue
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

        return (
            <div>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }} className={editStatusBorder}>
                    {validationIcon}
                    <div style={{ flex: '1 1 0' }}>
                        <Form.Control
                            as="textarea"
                            rows={3}
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