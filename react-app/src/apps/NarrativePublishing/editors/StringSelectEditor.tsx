import { Component } from "react";
import Form from "react-bootstrap/esm/Form";
import { Value, ValueStatus } from "../fields/Field";
import { StringField, StringFieldUtil } from "../fields/StringField";
import { OptionType, renderFieldEditStatus, renderFieldValidationIcon, renderFieldValidationMessage } from "./common";

export interface StringSelectEditorProps {
    debug?: boolean;
    field: StringField
    placeholder: string;
    options: Array<OptionType>;
    save: (stringField: StringField) => void;
}

export default class StringSelectEditor extends Component<StringSelectEditorProps> {
    validate(editedValue: string): StringField {
        const editValue: Value<string> = (() => {
            if (editedValue === '') {
                return {
                    status: ValueStatus.EMPTY
                }
            }
            return {
                status: ValueStatus.SOME,
                value: editedValue
            }
        })();

        return new StringFieldUtil({
            ...this.props.field,
            editValue,
        }).evaluate();
    }

    changed(editedValue: string): void {
        this.props.save(this.validate(editedValue));
    }

    render() {
        const field = this.props.field;
        const editStatusBorder = this.props.debug ? renderFieldEditStatus(field) : '';
        const validationIcon = renderFieldValidationIcon(field);
        const validationMessage = renderFieldValidationMessage(field);

        const editValue: string = (() => {
            switch (field.editValue.status) {
                case ValueStatus.NONE:
                    return '';
                case ValueStatus.EMPTY:
                    return '';
                case ValueStatus.SOME:
                    return field.editValue.value;
            }
        })();

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

        return (
            <div>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }} className={editStatusBorder}>
                    {validationIcon}
                    <div style={{ flex: '1 1 0' }}>
                        <Form.Select
                            value={editValue}
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
