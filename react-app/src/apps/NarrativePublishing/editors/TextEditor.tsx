import { Component } from "react";
import Form from "react-bootstrap/esm/Form";
import { Value, ValueStatus } from "../fields/Field";
import { renderFieldEditStatus, renderFieldValidationIcon, renderFieldValidationMessage } from "./common";

import { StringField, StringFieldUtil } from "../fields/StringField";

export interface TextEditorProps {
    debug?: boolean;
    field: StringField
    placeholder: string;
    rows: number;
    save: (field: StringField) => void;
}

export default class TextEditor extends Component<TextEditorProps> {
    validate(editedValue: string): StringField {
        const { field } = this.props;

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

        return (
            <div>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }} className={editStatusBorder}>
                    {validationIcon}
                    <div style={{ flex: '1 1 0' }}>
                        <Form.Control
                            as="textarea"
                            placeholder={this.props.placeholder}
                            rows={this.props.rows}
                            value={editValue}
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