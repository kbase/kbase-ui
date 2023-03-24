import { ConstraintState, Field, NumberRangeLimit, NumberRangeType, Trinary, Value, ValueStatus } from "./Field"


export enum StringConstraintType {
    LENGTH = "LENGTH",
    PATTERN = "PATTERN",
    DOMAIN = "DOMAIN"
}

export interface StringConstraintBase {
    type: StringConstraintType
}

export interface StringConstraintLength extends StringConstraintBase {
    type: StringConstraintType.LENGTH
    minLength?: NumberRangeLimit
    maxLength?: NumberRangeLimit
}

export interface StringConstraintPattern extends StringConstraintBase {
    type: StringConstraintType.PATTERN
    regexp: RegExp;
}

export interface StringConstraintDomain extends StringConstraintBase {
    type: StringConstraintType.DOMAIN
    values: Array<string>
}

export type StringConstraint =
    StringConstraintLength | StringConstraintPattern | StringConstraintDomain;

export type StringField = Field<string, StringConstraint, string>;

export class StringFieldUtil {
    field: StringField;
    constructor(field: StringField) {
        this.field = field;
    }

    evaluate(debug?: boolean) {
        const field = this.field;

        const editValue = ((): Value<string> => {
            switch (field.editValue.status) {
                case ValueStatus.NONE:
                    return field.editValue;
                case ValueStatus.EMPTY:
                    return field.editValue;
                case ValueStatus.SOME:
                    if (field.editValue.value.length === 0) {
                        return {
                            status: ValueStatus.EMPTY
                        }
                    }
                    return field.editValue;
            }
        })();

        const isRequiredMet: Trinary = (() => {
            if (!field.isRequired) {
                return Trinary.TRUE;
            }
            switch (editValue.status) {
                case ValueStatus.NONE:
                    return Trinary.FALSE;
                case ValueStatus.EMPTY:
                    return Trinary.FALSE
                case ValueStatus.SOME:
                    return Trinary.TRUE;
            }
        })();

        const constraintState: ConstraintState = (() => {
            if (typeof field.constraint === 'undefined') {
                return {
                    isConstraintMet: Trinary.TRUE
                }
            }
            switch (editValue.status) {
                case ValueStatus.NONE:
                    // If no value, cannot possibly be satisfied.
                    // TODO: should be NONE or FALSE?
                    return {
                        isConstraintMet: Trinary.FALSE,
                        message: "No value yet, cannot determine if valid or not"
                    }
                case ValueStatus.EMPTY: {
                    // It is remotely possible that someone would create
                    // a non-required field but set up constraints so
                    // that the field may be an empty string.
                    // const editValue = '';
                    // TODO: that
                    if (field.isRequired) {
                        return {
                            isConstraintMet: Trinary.FALSE,
                            message: 'Empty value must be allowed by setting isRequired to false'
                        }
                    }
                    return {
                        isConstraintMet: Trinary.TRUE
                    }
                }
                case ValueStatus.SOME: {
                    // const editValue = stringField.editValue.value;
                    switch (field.constraint.type) {
                        case StringConstraintType.LENGTH: {
                            const { maxLength, minLength } = field.constraint;
                            if (typeof maxLength !== 'undefined') {
                                switch (maxLength.rangeType) {
                                    case NumberRangeType.EXCLUSIVE:
                                        if (editValue.value.length >= maxLength.value) {
                                            return {
                                                isConstraintMet: Trinary.FALSE,
                                                message: `must be less than ${maxLength.value}`
                                            }
                                        }
                                        break;
                                    case NumberRangeType.INCLUSIVE:
                                        if (editValue.value.length > maxLength.value) {
                                            return {
                                                isConstraintMet: Trinary.FALSE,
                                                message: `must be less or equal to ${maxLength.value} characters`
                                            }
                                        }
                                        break;
                                }
                            }
                            if (typeof minLength !== 'undefined') {
                                switch (minLength.rangeType) {
                                    case NumberRangeType.EXCLUSIVE:
                                        if (editValue.value.length <= minLength.value) {
                                            return {
                                                isConstraintMet: Trinary.FALSE,
                                                message: `must be greater than ${minLength.value} characters long`
                                            }
                                        }
                                        break;
                                    case NumberRangeType.INCLUSIVE:
                                        if (editValue.value.length < minLength.value) {
                                            return {
                                                isConstraintMet: Trinary.FALSE,
                                                message: `must be greater than or equal to ${minLength.value} characters long`
                                            }
                                        }
                                        break;
                                }
                            }
                            return {
                                isConstraintMet: Trinary.TRUE
                            }
                        }
                        case StringConstraintType.PATTERN: {
                            const { regexp } = field.constraint;
                            if (!new RegExp(regexp).test(editValue.value)) {
                                return {
                                    isConstraintMet: Trinary.FALSE,
                                    message: `does not meet the required pattern ${regexp}`
                                }
                            }

                            return {
                                isConstraintMet: Trinary.TRUE
                            }
                        }
                        case StringConstraintType.DOMAIN:
                            const { values } = field.constraint;
                            if (!values.includes(editValue.value)) {
                                return {
                                    isConstraintMet: Trinary.FALSE,
                                    // TODO: present the values better; e.g. must be capped.
                                    message: `value must be in the set ${values.join(', ')}`
                                }
                            }
                            return {
                                isConstraintMet: Trinary.TRUE
                            }
                    }
                }
            }
        })();

        const isTouched = ((field: StringField): boolean => {
            switch (editValue.status) {
                case ValueStatus.NONE:
                    return true;
                case ValueStatus.EMPTY:
                    return field.storageValue.status !== ValueStatus.EMPTY;
                case ValueStatus.SOME:
                    switch (field.storageValue.status) {
                        case ValueStatus.NONE:
                            return true;
                        case ValueStatus.EMPTY:
                            return true;
                        case ValueStatus.SOME:
                            return editValue.value !== field.storageValue.value;
                    }
            }
        })(field);

        const pendingValue: Value<string> = (() => {
            if (
                constraintState.isConstraintMet === Trinary.TRUE &&
                isRequiredMet === Trinary.TRUE
            ) {
                return editValue;
            }
            return field.pendingValue;
        })();

        return {
            ...field,
            constraintState,
            isRequiredMet,
            isTouched,
            editValue,
            pendingValue
        };
    }

    getPendingValue() {
        const field = this.field;
        switch (field.pendingValue.status) {
            case ValueStatus.NONE:
                throw new Error('impossible');
            case ValueStatus.EMPTY:
                return ''
            case ValueStatus.SOME:
                return field.pendingValue.value;
        }
    }
}
