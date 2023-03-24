import { ConstraintState, Field, Trinary, Value, ValueStatus } from "./Field";

const urlRegexp = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/

// export enum StringConstraintType {
//     LENGTH = "LENGTH",
//     PATTERN = "PATTERN",
//     DOMAIN = "DOMAIN"
// }

// export interface StringConstraintBase {
//     type: StringConstraintType
// }

// export interface StringConstraintLength extends StringConstraintBase {
//     type: StringConstraintType.LENGTH
//     minLength?: NumberRangeLimit
//     maxLength?: NumberRangeLimit
// }

// export interface StringConstraintPattern extends StringConstraintBase {
//     type: StringConstraintType.PATTERN
//     regexp: RegExp;
// }

// export interface StringConstraintDomain extends StringConstraintBase {
//     type: StringConstraintType.DOMAIN
//     values: Array<string>
// }

// export type StringConstraint =
//     StringConstraintLength | StringConstraintPattern | StringConstraintDomain;


// export interface URLConstraint {
//     regexp: RegExp = urlRegexp
// }


export type URLField = Field<string, null, string>;

// export function evaluateURLField(field: URLField) {



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

//     const constraintState: ConstraintState = (() => {
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
//                 if (!urlRegexp.test(field.editValue.value)) {
//                     return {
//                         isConstraintMet: Trinary.FALSE,
//                         message: `does not meet the required regular expression pattern for a URL`
//                     }
//                 }
//                 return {
//                     isConstraintMet: Trinary.TRUE
//                 }
//             }
//         }
//     })();

//     const isTouched = ((field: URLField): boolean => {
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
//                         return field.editValue.value !== field.storageValue.value;
//                 }
//         }
//     })(field);

//     const pendingValue: Value<string> = (() => {
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

export class URLFieldUtil {
    field: URLField;
    constructor(field: URLField) {
        this.field = field;
    }

    evaluate() {
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
                    return {
                        isConstraintMet: Trinary.FALSE,
                        message: 'Empty value must be allowed by setting isRequired to false'
                    }
                }
                case ValueStatus.SOME: {
                    if (!urlRegexp.test(editValue.value)) {
                        return {
                            isConstraintMet: Trinary.FALSE,
                            message: `does not meet the required regular expression pattern for a URL`
                        }
                    }
                    return {
                        isConstraintMet: Trinary.TRUE
                    }
                }
            }
        })();

        const isTouched = ((field: URLField): boolean => {
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