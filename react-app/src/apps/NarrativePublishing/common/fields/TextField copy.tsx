import { EditState, EditStatus, ValidationStatus } from "apps/NarrativePublishing/Model";
import { Component } from "react";
import Form from "react-bootstrap/esm/Form";

import { citationTypes } from '../lookups';
import { renderFieldEditStatus, renderFieldValidationIcon, renderFieldValidationMessage } from "./common";

export interface TextFieldProps {
    editValue: string;
    // editState: EditState<string, string>;
    save: (editedValue: string) => void;
}

interface TextFieldState {
    editState: EditState<string, string>
}

export default class TextField extends Component<TextFieldProps, TextFieldState> {
    constructor(props: TextFieldProps) {
        super(props);
        this.state = {
            editState: this.validate(props.editValue)
        }
    }
    validate(editValue: string): EditState<string, string> {
        const { editState } = this.state;
        if (editValue.length === 0) {
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

    handleCitationTypeChange(citationType: string): void {
        // TODO: need to fold up the validation for the "type" field into "citation",
        // and "citation" into "editableWork". I think?

        // TODO: also, when the change is valid, we need to update the citation's "value"
        // as well as "editValue".
        this.setState({
            ...this.state,
            editState: this.validate(citationType)
        });

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
                - select a citation format -
            </option>
        );
        const field = this.state.editState;
        const editStatusBorder = renderFieldEditStatus(field.status);
        const validationIcon = renderFieldValidationIcon(field.validationState.status);
        const validationMessage = renderFieldValidationMessage(field.validationState);

        return (
            <div>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }} className={editStatusBorder}>
                    {validationIcon}
                    <div style={{ flex: '0 0 auto' }}>
                        <Form.Select
                            value={this.state.editState.editValue}
                            onChange={(ev) => {
                                this.handleCitationTypeChange(ev.currentTarget.value);
                            }}
                        >
                            {options}
                        </Form.Select>
                    </div>
                </div>
                {validationMessage}
            </div>
        );
    }
}