import { FieldBase, Trinary } from "../fields/Field";
// import { EditState, EditStatus, ValidationState, ValidationStatus } from "apps/NarrativePublishing/Model";
import { Alert } from "react-bootstrap";



export interface OptionType {
    value: string;
    label: string;
}

export function renderFieldEditStatus(field: FieldBase): string {
    if (field.isTouched) {
        return 'border border-info';
    }
    return 'border border-white';
}

export interface EditStatusClasses {
    borderClasses: string;
    backgroundColorClasses: string
}

export function renderFieldEditStatusClasses(field: FieldBase): EditStatusClasses {
    const borderClasses = (() => {
        if (field.isTouched) {
            return 'border border-info';
        }
        return 'border border-white';
    })();

    const backgroundColorClasses = (() => {
        if (field.isTouched) {
            return 'bg-info text-black';
        }
        return '';
    })();

    return {
        borderClasses, backgroundColorClasses
    }
}

export function renderFieldValidationStatusBorder(field: FieldBase) {
    switch (field.isRequiredMet) {
        case Trinary.NONE:
            switch (field.constraintState.isConstraintMet) {
                case Trinary.NONE:
                    return 'border border-success';
                case Trinary.TRUE:
                    return 'border border-success';
                case Trinary.FALSE:
                    return 'border border-danger';
            }
        case Trinary.TRUE:
            switch (field.constraintState.isConstraintMet) {
                case Trinary.NONE:
                    return 'border border-success';
                case Trinary.TRUE:
                    return 'border border-success';
                case Trinary.FALSE:
                    return 'border border-danger';
            }
        case Trinary.FALSE:
            return 'border border-warning';
    }

}

export function renderFieldValidationIcon(field: FieldBase) {
    const successIcon = <span className="fa fa-check text-success" />

    const warningIcon = <span className="fa fa-arrow-right text-warning" />

    const errorIcon = <span className="fa fa-exclamation-circle text-danger" />

    const icon = (() => {
        switch (field.isRequiredMet) {
            case Trinary.NONE:
                switch (field.constraintState.isConstraintMet) {
                    case Trinary.NONE:
                        return successIcon
                    case Trinary.TRUE:
                        return successIcon
                    case Trinary.FALSE:
                        return errorIcon
                }
                break;
            case Trinary.TRUE:
                switch (field.constraintState.isConstraintMet) {
                    case Trinary.NONE:
                        return successIcon
                    case Trinary.TRUE:
                        return successIcon
                    case Trinary.FALSE:
                        return errorIcon
                }
                break;
            case Trinary.FALSE:
                return warningIcon;
        }
    })();
    return <span style={{ width: '2em' }}>
        {icon}
    </span>
}

export function renderHeaderValidationIcon(field: FieldBase) {
    // <span className="fa fa-check-circle fa-lg text-success" />

    // const successIcon = <span className="fa-stack fa-lg text-white" style={{ fontSize: '75%' }}>
    //     <i className="fa fa-square fa-stack-2x text-transparent"></i>
    //     <i className="fa fa-check fa-stack-1x text-success" ></i>
    // </span>;

    const successIcon = <span className="fa fa-check fa-lg text-success" />

    const warningIcon = <span className="fa fa-exclamation-triangle fa-lg text-warning" />;

    // const errorIcon = <span className="fa-stack fa-lg text-white" style={{ fontSize: '75%' }}>
    //     <i className="fa fa-circle fa-stack-2x"></i>
    //     <i className="fa fa-exclamation fa-stack-1x  text-danger" ></i>
    // </span>;

    const errorIcon = <span className="fa fa-exclamation fa-lg text-danger" />

    const icon = (() => {
        switch (field.isRequiredMet) {
            case Trinary.NONE:
                switch (field.constraintState.isConstraintMet) {
                    case Trinary.NONE:
                        return successIcon;
                    case Trinary.TRUE:
                        return successIcon;
                    case Trinary.FALSE:
                        return errorIcon;
                }
                break;
            case Trinary.TRUE:
                switch (field.constraintState.isConstraintMet) {
                    case Trinary.NONE:
                        return successIcon;
                    case Trinary.TRUE:
                        return successIcon;
                    case Trinary.FALSE:
                        return errorIcon;
                    // return <span className="fa fa-bug text-danger fa-lg" style={{ marginRight: '0.5em' }} />
                }
                break;
            case Trinary.FALSE:
                return warningIcon;
        }
    })();
    return <span style={{ marginRight: '0.5em' }}>
        {icon}
    </span>
}

export function renderFieldValidationMessage(field: FieldBase) {
    switch (field.isRequiredMet) {
        case Trinary.NONE:
            switch (field.constraintState.isConstraintMet) {
                case Trinary.NONE:
                    return '';
                case Trinary.TRUE:
                    return '';
                case Trinary.FALSE:
                    return <Alert variant="danger">{field.constraintState.message}</Alert>;
            }
            break;
        case Trinary.TRUE:
            switch (field.constraintState.isConstraintMet) {
                case Trinary.NONE:
                    return '';
                case Trinary.TRUE:
                    return '';
                case Trinary.FALSE:
                    return <Alert variant="danger">{field.constraintState.message}</Alert>;
            }
            break;
        case Trinary.FALSE:
            // return <Alert variant="warning">This field is required</Alert>;
            return '';
    }
}

export interface OptionType {
    value: string;
    label: string;
}