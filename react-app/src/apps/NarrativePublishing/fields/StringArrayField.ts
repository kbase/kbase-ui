import { arraysEqual } from "../utils";
import { ConstraintState, Field, NumberRangeLimit, NumberRangeType, Trinary, Value, ValueStatus } from "./Field";
import { StringConstraint } from "./StringField";

export interface StringArrayConstraint {
    stringConstraint?: StringConstraint;
    minLength?: NumberRangeLimit;
    maxLength?: NumberRangeLimit;
}

export type StringArrayField = Field<Array<string>, StringArrayConstraint, Array<string>>

// export function evaluateStringArrayField(field: StringArrayField) {
//     const isRequiredMet: Trinary = (() => {
//         if (!field.isRequired) {
//             return Trinary.TRUE;
//         }
//         switch (field.editValue.status) {
//             case ValueStatus.NONE:
//                 return Trinary.FALSE;
//             case ValueStatus.EMPTY:
//                 return Trinary.FALSE
//             case ValueStatus.SOME:
//                 return Trinary.TRUE;
//         }
//     })();

//     const constraintState: ConstraintState = ((field: StringArrayField) => {
//         if (typeof field.constraint === 'undefined') {
//             return {
//                 isConstraintMet: Trinary.TRUE
//             }
//         }
//         switch (field.editValue.status) {
//             case ValueStatus.NONE:
//                 // If no value, cannot possibly be satisfied.
//                 // TODO: should be NONE or FALSE?
//                 return {
//                     isConstraintMet: Trinary.FALSE,
//                     message: "No value yet, cannot determine if valid or not"
//                 }
//             case ValueStatus.EMPTY: {
//                 // It is remotely possible that someone would create
//                 // a non-required field but set up constraints so
//                 // that the field may be an empty string.
//                 // const editValue = '';
//                 // TODO: that
//                 return {
//                     isConstraintMet: Trinary.FALSE,
//                     message: 'Empty value must be allowed by setting isRequired to false'
//                 }
//             }
//             case ValueStatus.SOME: {
//                 const { maxLength, minLength, stringConstraint } = field.constraint;
//                 if (typeof maxLength !== 'undefined') {
//                     switch (maxLength.rangeType) {
//                         case NumberRangeType.EXCLUSIVE:
//                             if (field.editValue.value.length >= maxLength.value) {
//                                 return {
//                                     isConstraintMet: Trinary.FALSE,
//                                     message: `must be less than ${maxLength.value}`
//                                 }
//                             }
//                             break;
//                         case NumberRangeType.INCLUSIVE:
//                             if (field.editValue.value.length > maxLength.value) {
//                                 return {
//                                     isConstraintMet: Trinary.FALSE,
//                                     message: `must be less or equal to ${maxLength.value}`
//                                 }
//                             }
//                             break;
//                     }
//                 }
//                 if (typeof minLength !== 'undefined') {
//                     switch (minLength.rangeType) {
//                         case NumberRangeType.EXCLUSIVE:
//                             if (field.editValue.value.length <= minLength.value) {
//                                 return {
//                                     isConstraintMet: Trinary.FALSE,
//                                     message: `must be greater ${minLength.value}`
//                                 }
//                             }
//                             break;
//                         case NumberRangeType.INCLUSIVE:
//                             if (field.editValue.value.length < minLength.value) {
//                                 return {
//                                     isConstraintMet: Trinary.FALSE,
//                                     message: `must be greater than or equal to ${minLength.value}`
//                                 }
//                             }
//                             break;
//                     }
//                 }
//                 if (typeof stringConstraint !== 'undefined') {
//                     // TODO: implement; basically just loop over values, applying the string
//                     // constraint, and return if one of them is not valid?
//                 }
//                 return {
//                     isConstraintMet: Trinary.TRUE
//                 }
//             }
//         }
//     })(field);

//     const isTouched = ((field: StringArrayField): boolean => {
//         switch (field.editValue.status) {
//             case ValueStatus.NONE:
//                 return true;
//             case ValueStatus.EMPTY:
//                 return field.storageValue.status !== ValueStatus.EMPTY;
//             case ValueStatus.SOME:
//                 switch (field.storageValue.status) {
//                     case ValueStatus.NONE:
//                         return true;
//                     case ValueStatus.EMPTY:
//                         return true;
//                     case ValueStatus.SOME:
//                         return !arraysEqual(field.editValue.value, field.storageValue.value)
//                 }
//         }
//     })(field);

//     const pendingValue: Value<Array<string>> = (() => {
//         if (
//             constraintState.isConstraintMet === Trinary.TRUE &&
//             isRequiredMet === Trinary.TRUE
//         ) {
//             return field.editValue;
//         }
//         return field.pendingValue;
//     })();

//     return {
//         ...field,
//         constraintState,
//         isRequiredMet,
//         isTouched,
//         pendingValue
//     };
// }

export function getPendingValue(field: StringArrayField): Array<string> {
    switch (field.pendingValue.status) {
        case ValueStatus.NONE:
            throw new Error('impossible');
        case ValueStatus.EMPTY:
            return []
        case ValueStatus.SOME:
            return field.pendingValue.value;
    }
}

export class StringArrayFieldUtil {
    field: StringArrayField;
    constructor(field: StringArrayField) {
        this.field = field;
    }

    evaluate() {
        const field = this.field;

        const editValue = ((): Value<Array<string>> => {
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

        const constraintState: ConstraintState = ((field: StringArrayField) => {
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
                            isConstraintMet: Trinary.NONE
                        }
                        // return {
                        //     isConstraintMet: Trinary.FALSE,
                        //     message: 'Empty value must be allowed by setting isRequired to false'
                        // }
                    }
                    return {
                        isConstraintMet: Trinary.TRUE
                    }
                }
                case ValueStatus.SOME: {
                    const { maxLength, minLength, stringConstraint } = field.constraint;
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
                                        message: `must be less or equal to ${maxLength.value}`
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
                                        message: `must be greater ${minLength.value}`
                                    }
                                }
                                break;
                            case NumberRangeType.INCLUSIVE:
                                if (editValue.value.length < minLength.value) {
                                    return {
                                        isConstraintMet: Trinary.FALSE,
                                        message: `must be greater than or equal to ${minLength.value}`
                                    }
                                }
                                break;
                        }
                    }
                    if (typeof stringConstraint !== 'undefined') {
                        // TODO: implement; basically just loop over values, applying the string
                        // constraint, and return if one of them is not valid?
                    }
                    return {
                        isConstraintMet: Trinary.TRUE
                    }
                }
            }
        })(field);

        const isTouched = ((field: StringArrayField): boolean => {
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
                            return !arraysEqual(editValue.value, field.storageValue.value)
                    }
            }
        })(field);

        const pendingValue: Value<Array<string>> = (() => {
            if (
                constraintState.isConstraintMet === Trinary.TRUE &&
                isRequiredMet === Trinary.TRUE
            ) {
                console.log('EDIT VALUE', editValue);
                return editValue;
            }
            console.log('PENDING VALUE', constraintState, isRequiredMet, field.pendingValue);
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
                return []
            case ValueStatus.SOME:
                return field.pendingValue.value;
        }
    }
}
