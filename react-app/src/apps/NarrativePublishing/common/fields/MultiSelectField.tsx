import { EditState, EditStatus, ValidationStatus } from "apps/NarrativePublishing/Model";
import { Component } from "react";

import { OptionType } from '../lookups';
import MultiSelect from "../MultiSelect";
import { renderFieldEditStatus, renderFieldValidationIcon, renderFieldValidationMessage } from "./common";

export interface SelectFieldProps {
    editState: EditState<Array<string>, Array<string>>
    noun: string;
    availableItems: Array<OptionType>;
    placeholder: string;
    required: boolean;
    save: (editState: EditState<Array<string>, Array<string>>) => void;
}

export default class SelectField extends Component<SelectFieldProps> {
    validate(editValue: Array<string>): EditState<Array<string>, Array<string>> {
        const { editState } = this.props;

        function arraysEqual(a: Array<string>, b: Array<string>) {
            if (a.length !== b.length) {
                return false;
            }
            const aSorted = a.slice().sort();
            const bSorted = b.slice().sort();
            return aSorted.every((value, index) => {
                return value === bSorted[index];
            })
        }

        if (arraysEqual(editState.initialValue, editValue)) {
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

    changed(editedValue: Array<string>): void {
        this.props.save(this.validate(editedValue));
    }

    render() {
        const options = this.props.availableItems.map(({ value, label }) => {
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
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}
                    className={editStatusBorder}>
                    {validationIcon}
                    <MultiSelect
                        noun={this.props.noun}
                        availableItems={this.props.availableItems}
                        onChange={this.changed.bind(this)}
                        selectedValues={this.props.editState.editValue}
                    />
                </div>
                {validationMessage}
            </div>
        );
    }
}
