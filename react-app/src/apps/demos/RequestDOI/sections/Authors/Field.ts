
/**
 * The editable field design hinges on two states - interation with the field (edit state) and validity of the field (validation state).
 * Informing that state are some facts:
 * - is it required?
 * - we have a functon which can validate a raw value, and return either the possibly transformed value in case it is valid, and an error
 *   message otherwise
 * - we have a function which determines if a raw or final value is empty
 * - we have a raw type, which represents the value provided by the native editing controls, and a final value, which represents the
 *   actual value we are after.
 * 
 * A field may be freshly minted, without value - NONE
 * Or it may be freshly initialized, say from some stored value - INITIALIZED
 * Or it may be edited - EDITED
 * 
 * These are pragmatic states. NONE is used when creating a field which is not yet associated with any external source.
 * An INITIALIZED state is often useful when we have a field which is required and yet empty. And finally we have an
 * EDITED state, in which the raw value, at least, has been modified since it was initialized
 * 
 * A field has a lifecycle:
 * - created, but not yet initialized
 * - initialized from either a raw value, which supports a "new field" use case in which a field exists but there is 
 *   no backing value yet, or from a final value, which supports an "edit vield" use case in which a field is created
 *   to edit an existing backing value.
 * - edited, in which the raw value has been updated, which may result in a new backing value.
 * - whenever the raw value is updated and evaluated, the same process occurs:
 *      - an attempt is made to transform the raw value into the final value (transformation)
 *      - the final value is validated against constraints like length, format, numeric range, etc.
 *      - if the final value is valid, it is stored
 *      - when stored, it may also update a backing store
 * 
 * 
 * 
 */
// Validation State

export enum ValidationStatus {
    NONE = 'NONE',
    VALID = 'VALID',
    UNTRANSFORMABLE = 'UNTRANFORMABLE',
    INVALID = 'INVALID',
    INITIAL_EMPTY = 'INITIAL_EMPTY',
    REQUIRED_EMPTY = 'REQURED_EMPTY'
}


export interface ValidationStateBase {
    status: ValidationStatus
}

export interface ValidationStateNone extends ValidationStateBase {
    status: ValidationStatus.NONE
}

export interface ValidationStateValid extends ValidationStateBase {
    status: ValidationStatus.VALID
}

export interface ValidationStateUntransformable extends ValidationStateBase {
    status: ValidationStatus.UNTRANSFORMABLE,
    message: string
}

export interface ValidationStateInvalid extends ValidationStateBase {
    status: ValidationStatus.INVALID,
    message: string
}

export interface ValidationStateInitialEmpty extends ValidationStateBase {
    status: ValidationStatus.INITIAL_EMPTY
}

export interface ValidationStateRequiredEmpty extends ValidationStateBase {
    status: ValidationStatus.REQUIRED_EMPTY
}

export type ValidationState = ValidationStateNone | ValidationStateValid | ValidationStateUntransformable | ValidationStateInvalid | ValidationStateInitialEmpty | ValidationStateRequiredEmpty;

// Edit State??

export enum EditStatus {
    NONE = 'NONE',
    INITIAL = 'INITIAL',
    EDITED = 'EDITED'
}

export interface EditStateBase {
    status: EditStatus
}

export interface EditStateNone extends EditStateBase {
    status: EditStatus.NONE
}

export interface EditStateInitial<TRaw> extends EditStateBase {
    status: EditStatus.INITIAL;
    editValue: TRaw;
}

export interface EditStateEdited<TRaw, TUpstream> extends EditStateBase {
    status: EditStatus.EDITED;
    editValue: TRaw;
    finalValue: TUpstream;
}

export type EditState<TRaw, TUpstream> = EditStateNone | EditStateInitial<TRaw> | EditStateEdited<TRaw, TUpstream>;

// Field State

// export enum FieldStatus {
//     NONE = 'NONE',
//     INITIAL = 'INITIAL',
//     EDITD = 'EDITED'
// }


// export interface FieldStateBase {
//     status: FieldStatus
// }

// export interface FieldStateNone extends FieldStateBase {
//     status: FieldStatus.NONE
// }

// export interface FieldStateInitial<R, T> extends FieldStateBase {
//     status: FieldStatus.INITIAL,
//     rawValue: R,
// }

// export interface FieldStateInvalid<R> extends FieldStateBase {
//     status: FieldStatus.INVALID,
//     rawValue: R,
//     error: {
//         message: string
//     }
// }

// export interface FieldStateValid<R, T> extends FieldStateBase {
//     status: FieldStatus.VALID,
//     rawValue: R,
//     value: T
// }

// export type FieldState<R, T> =
//     FieldStateNone |
//     FieldStateInitial<R, T> |
//     FieldStateValid<R, T> |
//     FieldStateInvalid<R>;

// export enum FormStatus {
//     INITIAL = 'INITIAL',
//     VALIDATING = 'VALIDATING',
//     SAVING = 'SAVING',
//     EDITABLE = 'EDITABLE',
//     MODIFIED = 'MODIFIED',
//     ERROR = 'ERROR',
//     IMPORTING = 'IMPORTING'
// }

// export interface EditableAuthor {
//     firstName: FieldState<string, string>;
//     middleName: FieldState<string, string>;
//     lastName: FieldState<string, string>;
//     emailAddress: FieldState<string, string>;
//     orcidId: FieldState<string, string>;
//     institution: FieldState<string, string>;
//     contributorType: FieldState<string, string>;
// }

export interface ValidationResultBase {
    isValid: boolean;
}

export interface ValidationResultValid extends ValidationResultBase {
    isValid: true;
}

export interface ValidationResultInvalid extends ValidationResultBase {
    isValid: false;
    message: string;
}

export type ValidationResult = ValidationResultValid | ValidationResultInvalid;



export interface TransformResultBase {
    isValid: boolean;
}

export interface TransformResultValid<T> extends TransformResultBase {
    isValid: true;
    value: T;
}

export interface TransformResultInvalid extends TransformResultBase {
    isValid: false;
    message: string;
}

export type TransformResult<T> = TransformResultValid<T> | TransformResultInvalid;

export abstract class Field<RawType, FinalType> {
    validationState: ValidationState;
    editState: EditState<RawType, FinalType>;
    isRequired: boolean;

    constructor(isRequired: boolean = false) {
        this.isRequired = isRequired;
        this.validationState = {
            status: ValidationStatus.NONE
        };
        this.editState = {
            status: EditStatus.NONE
        }
    }

    getState() {
        return {
            editState: this.editState,
            validationState: this.validationState
        }
    }

    initializeFromRaw(editValue: RawType) {
        if (this.isEmpty(editValue)) {
            if (this.isRequired) {
                this.validationState = {
                    status: ValidationStatus.REQUIRED_EMPTY
                }
            } else {
                this.validationState = {
                    status: ValidationStatus.INITIAL_EMPTY
                }
            }
            this.editState = {
                status: EditStatus.INITIAL,
                editValue

            }
        } else {
            const transformResult = this.transform(editValue);
            if (transformResult.isValid) {
                const validationResult = this.validate(transformResult.value);
                if (validationResult.isValid) {
                    this.validationState = {
                        status: ValidationStatus.VALID
                    }
                    this.editState = {
                        status: EditStatus.EDITED,
                        editValue, finalValue: transformResult.value
                    }
                }
            } else {
                this.validationState = {
                    status: ValidationStatus.UNTRANSFORMABLE,
                    message: transformResult.message
                }
            }
        }
        return this;
    }

    //     const value = this.transform(editValue);
    //     const[isValid, result] = this.validate(editValue);
    // if (isValid) {
    //     this.fieldState = {
    //         status: EditStatus.INITIAL,
    //         editValue
    //     }
    // }
    // }

    abstract isEmpty(rawValue: RawType): boolean;

    abstract emptyValue(): FinalType;

    abstract transform(rawValue: RawType): TransformResult<FinalType>;

    abstract validate(value: FinalType): ValidationResult;

    set(editValue: RawType) {
        if (this.isEmpty(editValue)) {
            if (this.isRequired) {
                this.validationState = {
                    status: ValidationStatus.REQUIRED_EMPTY
                }
            }
            this.editState = {
                status: EditStatus.EDITED,
                editValue,
                finalValue: this.emptyValue()

            }
        } else {
            const transformResult = this.transform(editValue);
            if (transformResult.isValid) {
                const validationResult = this.validate(transformResult.value);
                if (validationResult.isValid) {
                    this.validationState = {
                        status: ValidationStatus.VALID
                    }
                    this.editState = {
                        status: EditStatus.EDITED,
                        editValue, finalValue: transformResult.value
                    }
                }
            } else {
                this.validationState = {
                    status: ValidationStatus.UNTRANSFORMABLE,
                    message: transformResult.message
                }
            }
        }
    }

    getEditValue(): RawType {
        if (this.editState.status === EditStatus.NONE) {
            throw new Error('May not get raw value in this state');
        }
        return this.editState.editValue;

    }

    getFinalValue(): FinalType {
        if (this.editState.status !== EditStatus.EDITED) {
            throw new Error('May not get final value in this state');
        }
        return this.editState.finalValue;
    }

}

export abstract class StringField extends Field<string, string> {
    isEmpty(editValue: string) {
        return editValue.length === 0;
    }
    emptyValue() {
        return '';
    }
    transform(editValue: string): TransformResult<string> {
        return {
            isValid: true, value: editValue
        }
    }
}
