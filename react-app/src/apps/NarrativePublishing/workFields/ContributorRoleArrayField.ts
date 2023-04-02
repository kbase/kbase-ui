import { ContributorRole } from "apps/ORCIDLink/lib/ORCIDLinkClient";
import {
    ConstraintState, Field, NumberRangeLimit,
    NumberRangeType, Trinary, Value, ValueStatus
} from "../fields/Field";

export interface ContributorRoleArrayConstraint {
    minLength: NumberRangeLimit;
    maxLength: NumberRangeLimit;
}

export type ContributorRoleArrayField = Field<Array<ContributorRole>, ContributorRoleArrayConstraint, Array<ContributorRole>>

export function contributorRoleComparator(a: ContributorRole, b: ContributorRole) {
    return a.role.localeCompare(b.role);
}

export function arraysEqual<T>(a: Array<T>, b: Array<T>, comparitor: (a: T, b: T) => number) {
    if (a.length !== b.length) {
        return false;
    }
    const aSorted = a.slice().sort(comparitor);
    const bSorted = b.slice().sort(comparitor);
    return aSorted.every((value, index) => {
        return value === bSorted[index];
    })
}

export function getPendingValue(field: ContributorRoleArrayField): Array<ContributorRole> {
    switch (field.pendingValue.status) {
        case ValueStatus.NONE:
            throw new Error('impossible');
        case ValueStatus.EMPTY:
            return []
        case ValueStatus.SOME:
            return field.pendingValue.value;
    }
}

export class ContributorRoleArrayFieldUtil {
    field: ContributorRoleArrayField;
    constructor(field: ContributorRoleArrayField) {
        this.field = field;
    }

    evaluate() {
        const field = this.field;

        const editValue = ((): Value<Array<ContributorRole>> => {
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

        const constraintState: ConstraintState = ((field: ContributorRoleArrayField) => {
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

                    return {
                        isConstraintMet: Trinary.TRUE
                    }
                }
            }
        })(field);

        const isTouched = ((field: ContributorRoleArrayField): boolean => {
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
                            return !arraysEqual(editValue.value, field.storageValue.value, contributorRoleComparator)
                    }
            }
        })(field);

        const pendingValue: Value<Array<ContributorRole>> = (() => {
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
