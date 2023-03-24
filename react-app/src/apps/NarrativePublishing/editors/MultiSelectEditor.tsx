import { Component } from "react";
import { Value, ValueStatus } from "../fields/Field";
import { StringArrayField, StringArrayFieldUtil } from "../fields/StringArrayField";

import MultiSelect from "apps/NarrativePublishing/common/MultiSelect";
import { OptionType, renderFieldEditStatus, renderFieldValidationIcon, renderFieldValidationMessage } from "./common";

export interface MultiSelectEditorProps {
    debug?: boolean;
    field: StringArrayField
    placeholder: string;
    noun: string;
    availableItems: Array<OptionType>;
    save: (field: StringArrayField) => void;
}

export default class MultiSelectEditor extends Component<MultiSelectEditorProps> {
    validate(editedValue: Array<string>): StringArrayField {
        const editValue: Value<Array<string>> = (() => {
            if (editedValue.length === 0) {
                return {
                    status: ValueStatus.EMPTY
                }
            }
            return {
                status: ValueStatus.SOME,
                value: editedValue
            }
        })();

        return new StringArrayFieldUtil({
            ...this.props.field,
            editValue,
        }).evaluate();
    }

    changed(editedValue: Array<string>): void {
        this.props.save(this.validate(editedValue));
    }

    render() {
        const field = this.props.field;
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
        const editValue: Array<string> = (() => {
            switch (field.editValue.status) {
                case ValueStatus.NONE:
                    return [];
                case ValueStatus.EMPTY:
                    return [];
                case ValueStatus.SOME:
                    return field.editValue.value;
            }
        })();

        const editStatusBorder = this.props.debug ? renderFieldEditStatus(field) : '';
        const validationIcon = renderFieldValidationIcon(field);
        const validationMessage = renderFieldValidationMessage(field);

        return (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}
                    className={editStatusBorder}>
                    {validationIcon}
                    <MultiSelect
                        noun={this.props.noun}
                        availableItems={this.props.availableItems}
                        onChange={this.changed.bind(this)}
                        selectedValues={editValue}
                    />
                </div>
                {validationMessage}
            </div>
        );
    }
}
