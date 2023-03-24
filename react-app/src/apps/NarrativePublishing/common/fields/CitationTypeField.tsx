import { EditState, EditStatus, ValidationState, ValidationStatus } from "apps/NarrativePublishing/Model";
import { Component } from "react";
import Alert from "react-bootstrap/esm/Alert";
import Form from "react-bootstrap/esm/Form";

import { citationTypes } from '../lookups';

export interface CitationTypeFieldProps {
    editValue: string;
    // editState: EditState<string, string>;
    save: (fieldState: EditState<string, string>) => void;
}

interface CitationTypeFieldState {
    editState: EditState<string, string>
}

export default class CitationTypeField extends Component<CitationTypeFieldProps, CitationTypeFieldState> {
    constructor(props: CitationTypeFieldProps) {
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

    /**
     * Renders the citation type field's status
     * 
     * Each field has an "edit status" of either initial or edited, and a
     * validation status, which is either "valid"
     */
    renderFieldEditStatus(editStatus: EditStatus) {
        switch (editStatus) {
            case EditStatus.EDITED:
                return 'border border-warning';
            case EditStatus.INITIAL:
                return 'border border-white';
        }
    }

    renderFieldValidationStatus(validationStatus: ValidationStatus) {
        switch (validationStatus) {
            case ValidationStatus.VALID:
                return 'border border-success';
            case ValidationStatus.INVALID:
                return 'border border-danger';
            case ValidationStatus.REQUIRED_MISSING:
                return 'border border-warning';
        }
    }

    renderFieldValidationIcon(validationStatus: ValidationStatus) {
        switch (validationStatus) {
            case ValidationStatus.VALID:
                return <span className="fa fa-check text-success" style={{ marginRight: '0.5em' }} />
            case ValidationStatus.REQUIRED_MISSING:
                return <span className="fa fa-exclamation-triangle text-warning" style={{ marginRight: '0.5em' }} />
            case ValidationStatus.INVALID:
                return <span className="fa fa-bug text-danger" style={{ marginRight: '0.5em' }} />
        }
    }

    renderFieldValidationMessage(validationState: ValidationState) {
        switch (validationState.status) {
            case ValidationStatus.VALID:
                return '';
            case ValidationStatus.REQUIRED_MISSING:
                return <Alert variant="warning">This field is required</Alert>;
            case ValidationStatus.INVALID:
                return <Alert variant="danger">{validationState.message}</Alert>;
        }
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
        const editStatusBorder = this.renderFieldEditStatus(field.status);
        const validationIcon = this.renderFieldValidationIcon(field.validationState.status);
        const validationMessage = this.renderFieldValidationMessage(field.validationState);

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