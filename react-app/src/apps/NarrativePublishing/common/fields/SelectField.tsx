import { EditState, EditStatus, ValidationStatus } from "apps/NarrativePublishing/Model";
import { Component } from "react";
import Form from "react-bootstrap/esm/Form";

import { OptionType } from '../lookups';
import { renderFieldEditStatus, renderFieldValidationIcon, renderFieldValidationMessage } from "./common";

export interface SelectFieldProps {
    editState: EditState<string, string>
    options: Array<OptionType>;
    placeholder: string;
    // editState: EditState<string, string>;
    save: (editState: EditState<string, string>) => void;
}

interface SelectFieldState {
    // editState: EditState<string, string>
}

// export function renderFieldEditStatus(editState: EditState<string, string>) {
//     if (editState.status === EditStatus.INITIAL)
//     switch (editStatus) {
//         case EditStatus.EDITED:
//             return 'border border-warning';
//         case EditStatus.INITIAL:
//             return 'border border-white';
//     }
// }

export default class SelectField extends Component<SelectFieldProps, SelectFieldState> {
    // constructor(props: SelectFieldProps) {
    //     super(props);
    //     this.state = {
    //         editState: this.validate(props.editValue)
    //     }
    // }
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

    changed(editedValue: string): void {
        this.props.save(this.validate(editedValue));
    }


    render() {
        const options = this.props.options.map(({ value, label }) => {
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
                    <div style={{ flex: '0 0 auto' }}>
                        <Form.Select
                            value={this.props.editState.editValue}
                            onChange={(ev) => {
                                this.changed(ev.currentTarget.value);
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