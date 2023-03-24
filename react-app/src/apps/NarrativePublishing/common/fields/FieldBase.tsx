import { EditStatus, ValidationState, ValidationStatus } from "apps/NarrativePublishing/Model";
import { Component } from "react";
import Alert from "react-bootstrap/esm/Alert";


export interface FieldBaseProps {
}

interface FieldBaseState {
}

export default class FieldBase extends Component<FieldBaseProps, FieldBaseState> {

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
                    return <span className="fa fa-check text-success"  style={{marginRight: '0.5em'}}/>
                case ValidationStatus.REQUIRED_MISSING:
                    return <span className="fa fa-exclamation-triangle text-warning"  style={{marginRight: '0.5em'}}/>
                case ValidationStatus.INVALID:
                    return <span className="fa fa-bug text-danger"  style={{marginRight: '0.5em'}}/>
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
        return 'nothing';
    }
}