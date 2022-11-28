
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

export enum FieldStatus {
    NONE = 'NONE',
    VALID = 'VALID',
    UNTRANSFORMABLE = 'UNTRANFORMABLE',
    INVALID = 'INVALID',
    REQUIRED_EMPTY = 'REQURED_EMPTY'
}


export interface FieldStateBase {
    status: FieldStatus
}

export interface FieldStateNone extends FieldStateBase {
    status: FieldStatus.NONE
}

export interface FieldStateValid<TEdit, TFinal> extends FieldStateBase {
    status: FieldStatus.VALID
    editValue: TEdit
    finalValue: TFinal
}

export interface FieldStateUntransformable<TEdit> extends FieldStateBase {
    status: FieldStatus.UNTRANSFORMABLE
    editValue: TEdit
    message: string
}

export interface FieldStateInvalid<TEdit, TFinal> extends FieldStateBase {
    status: FieldStatus.INVALID
    editValue: TEdit
    message: string
}

export interface FieldStateRequiredEmpty<TEdit> extends FieldStateBase {
    status: FieldStatus.REQUIRED_EMPTY
    editValue: TEdit
}

export type FieldState<TEdit, TFinal> =
    FieldStateNone |
    FieldStateValid<TEdit, TFinal> |
    FieldStateUntransformable<TEdit> |
    FieldStateInvalid<TEdit, TFinal> |
    FieldStateRequiredEmpty<TEdit>;

// Edit State??

// export enum EditStatus {
//     NONE = 'NONE',
//     INITIAL = 'INITIAL',
//     EDITED = 'EDITED'
// }

// export interface EditStateBase {
//     status: EditStatus
// }

// export interface EditStateNone extends EditStateBase {
//     status: EditStatus.NONE
// }

// export interface EditStateInitial<TRaw> extends EditStateBase {
//     status: EditStatus.INITIAL;
//     editValue: TRaw;
// }

// export interface EditStateEdited<TRaw, TUpstream> extends EditStateBase {
//     status: EditStatus.EDITED;
//     editValue: TRaw;
//     finalValue: TUpstream;
// }

// export type EditState<TRaw, TUpstream> = EditStateNone | EditStateInitial<TRaw> | EditStateEdited<TRaw, TUpstream>;

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
    fieldState: FieldState<RawType, FinalType>;
    isRequired: boolean;

    constructor(isRequired: boolean = false) {
        this.isRequired = isRequired;
        this.fieldState = {
            status: FieldStatus.NONE
        };
    }

    getState() {
        return {
            fieldState: this.fieldState,
        }
    }

    getStatus() {
        return this.fieldState.status;
    }

    initializeFromRaw(editValue: RawType) {
        if (this.isEmpty(editValue)) {
            if (this.isRequired) {
                this.fieldState = {
                    status: FieldStatus.REQUIRED_EMPTY,
                    editValue
                }
            } else {
                this.fieldState = {
                    status: FieldStatus.VALID,
                    editValue,
                    finalValue: this.emptyValue()
                }
            }
        } else {
            const transformResult = this.transform(editValue)
            if (transformResult.isValid) {
                const validationResult = this.validate(transformResult.value);
                if (validationResult.isValid) {
                    this.fieldState = {
                        status: FieldStatus.VALID,
                        editValue,
                        finalValue: transformResult.value
                    }
                } else {
                    this.fieldState = {
                        status: FieldStatus.INVALID,
                        editValue,
                        message: validationResult.message
                    }
                }
            } else {
                this.fieldState = {
                    status: FieldStatus.UNTRANSFORMABLE,
                    editValue,
                    message: transformResult.message
                }
            }
        }
        return this;
    }

    abstract isEmpty(rawValue: RawType): boolean;

    abstract emptyValue(): FinalType;

    abstract transform(rawValue: RawType): TransformResult<FinalType>;

    abstract validate(value: FinalType): ValidationResult;

    isValid() {
        return this.fieldState.status === FieldStatus.VALID;
    }

    set(editValue: RawType) {
        if (this.isEmpty(editValue)) {
            if (this.isRequired) {
                this.fieldState = {
                    status: FieldStatus.REQUIRED_EMPTY,
                    editValue
                }
            } else {
                this.fieldState = {
                    status: FieldStatus.VALID,
                    editValue,
                    finalValue: this.emptyValue()

                }
            }
        } else {
            const transformResult = this.transform(editValue);
            if (transformResult.isValid) {
                const validationResult = this.validate(transformResult.value);
                if (validationResult.isValid) {
                    this.fieldState = {
                        status: FieldStatus.VALID,
                        editValue,
                        finalValue: transformResult.value
                    }
                } else {
                    this.fieldState = {
                        status: FieldStatus.INVALID,
                        editValue,
                        message: validationResult.message
                    }
                }
            } else {
                this.fieldState = {
                    status: FieldStatus.UNTRANSFORMABLE,
                    editValue,
                    message: transformResult.message
                }
            }
        }
        return this;
    }

    getEditValue(): RawType {
        if (this.fieldState.status === FieldStatus.NONE) {
            throw new Error('May not get edit value in this state');
        }
        return this.fieldState.editValue;

    }

    getFinalValue(): FinalType {
        if (this.fieldState.status !== FieldStatus.VALID) {
            throw new Error('May not get final value in this state');
        }
        return this.fieldState.finalValue;
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

export abstract class StringArrayField extends Field<Array<string>, Array<string>> {
    isEmpty(editValue: Array<string>) {
        return editValue.length === 0;
    }

    emptyValue() {
        return [];
    }

    add(value: string | Array<string>) {
        const newValue = typeof value === 'string' ? [value] : value;
        switch (this.fieldState.status) {
            case FieldStatus.NONE:
                this.set(newValue);
                break;
            case FieldStatus.REQUIRED_EMPTY:
            case FieldStatus.UNTRANSFORMABLE:
            case FieldStatus.INVALID:
            case FieldStatus.VALID:
                const set = new Set(this.fieldState.editValue);
                for (const oneValue of newValue) {
                    set.add(oneValue);
                }
                const newValues = Array.from(set.values());
                newValues.sort();
                this.set(newValues);
        }
        return this;
    }

    remove(position: number) {
        switch (this.fieldState.status) {
            case FieldStatus.NONE:
                break;
            case FieldStatus.REQUIRED_EMPTY:
            case FieldStatus.UNTRANSFORMABLE:
            case FieldStatus.INVALID:
            case FieldStatus.VALID:
                const newValue = this.fieldState.editValue.slice();
                newValue.splice(position, 1);
                this.set(newValue);
        }
        return this;
    }

    transform(editValue: Array<string>): TransformResult<Array<string>> {
        return { isValid: true, value: editValue.slice().sort() }
    }
}
