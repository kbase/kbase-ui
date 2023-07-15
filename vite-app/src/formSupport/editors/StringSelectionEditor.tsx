import { FieldStatus, StringField } from "formSupport/Field";
import { Component } from "react";
import { Col, Form, Row } from "react-bootstrap";

// export interface OptionType {
//     value: string;
//     label: string;
// }

export interface StringOption {
    value: string;
    label: string;
}

export interface StringSelectionEditorProps {
    field: StringField;
    label: string;
    placeholder: string;
    options: Array<StringOption>;
    onEdit: (editValue: string) => void;
}

export class StringSelectionEditor extends Component<StringSelectionEditorProps> {
    onChange(value: string) {
        this.props.onEdit(value);
    }

    getOptionValue(): StringOption | null {
        const currentValue: string = this.props.field.getEditValue();
        return this.props.options.filter(({ value }) => {
            return (value === currentValue)
        })[0] || null;
    }

    renderControl() {
        const classes = [];
        switch (this.props.field.getStatus()) {
            case FieldStatus.NONE:
                return;
            case FieldStatus.INVALID:
                classes.push('is-invalid')
                break;
            case FieldStatus.REQUIRED_EMPTY:
                classes.push('is-invalid')
        }

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

        return <Form.Select
            value={this.props.field.getEditValue()}
            onChange={(ev) => {
                this.onChange(ev.currentTarget.value);
            }}
        >
            {options}
        </Form.Select>

        // return <Select<Option<string>>
        //     // styles={{ menu: (css) => ({ ...css, width: 'max-content', maxWidth: '20em' }) }}
        //     isSearchable={true}
        //     // defaultValue={currentRelationship}
        //     onChange={(newValue) => { this.onChange(newValue!.value) }}
        //     options={OSTI_CONTRIBUTOR_TYPES}
        //     value={this.getOptionValue()}
        //     formatOptionLabel={({ value, label }) => {
        //         return <div>
        //             <b>{value}</b> - {label}
        //         </div>
        //     }}
        // />
    }
    renderLabel() {
        const requiredIcon = (() => {
            if (!(this.props.field.isRequired)) {
                return;
            }
            if (this.props.field.getStatus() === FieldStatus.REQUIRED_EMPTY) {
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
        return <div>{message}</div>;
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