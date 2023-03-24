import { Component } from "react";
import Form from "react-bootstrap/esm/Form";
import { Value, ValueStatus } from "../fields/Field";
import { URLField, URLFieldUtil } from "../fields/URLFIeld";
import { renderFieldEditStatus, renderFieldValidationIcon, renderFieldValidationMessage } from "./common";

export interface URLEditorProps {
    debug?: boolean;
    field: URLField
    placeholder: string;
    readonly?: boolean;
    save: (stringField: URLField) => void;
}

export default class URLEditor extends Component<URLEditorProps> {
    validate(editedValue: string): URLField {
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

        return new URLFieldUtil({
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
                            as="input"
                            value={editValue}
                            readOnly={this.props.readonly}
                            disabled={this.props.readonly}
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