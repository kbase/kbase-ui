import { ConstraintState, Field, Trinary, Value, ValueStatus } from "../fields/Field";
import { StringField, StringFieldUtil } from "../fields/StringField";

import { Citation } from "apps/ORCIDLink/lib/ORCIDLinkClient";

export interface CitationGroupFields {
    type: StringField
    value: StringField
}

export type CitationGroup = Field<CitationGroupFields, null, Citation>

export class CitationGroupUtil {
    field: CitationGroup;
    constructor(field: CitationGroup) {
        this.field = field;
    }

    evaluate() {
        const field = this.field;

        const editValue = ((): Value<CitationGroupFields> => {
            switch (field.editValue.status) {
                case ValueStatus.NONE:
                    return field.editValue;
                case ValueStatus.EMPTY:
                    return field.editValue;
                case ValueStatus.SOME:
                    // TODO: refactor so that...
                    // either groups can have values for EMPTY - or change the sematics / term for EMPTY
                    // or all fields can have values for EMPTY - the empty value
                    // of course we need more refactoring to condense the code...
                    // if (field.editValue.value.type.editValue.status === ValueStatus.EMPTY &&
                    //     field.editValue.value.value.editValue.status === ValueStatus.EMPTY) {
                    //     return {
                    //         status: ValueStatus.EMPTY
                    //     }
                    // }
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
                    return (
                        editValue.value.type.isRequiredMet === Trinary.TRUE &&
                        editValue.value.value.isRequiredMet === Trinary.TRUE
                    ) ? Trinary.TRUE : Trinary.FALSE;
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
                    // Rather than evaluate a value directly, as we do for regular fields, we
                    // reflect the values of the sub-fields within this group.

                    if (editValue.value.type.constraintState.isConstraintMet === Trinary.TRUE &&
                        editValue.value.value.constraintState.isConstraintMet === Trinary.TRUE) {
                        return {
                            isConstraintMet: Trinary.TRUE
                        }
                    }
                    return {
                        isConstraintMet: Trinary.FALSE,
                        message: 'One or more fields are invalid'
                    }
                }
            }
        })();

        const isTouched = ((field: CitationGroup): boolean => {
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
                            return editValue.value.type.isTouched || editValue.value.value.isTouched;
                    }
            }
        })(field);

        const pendingValue: Value<Citation> = (() => {
            if (
                constraintState.isConstraintMet === Trinary.TRUE &&
                isRequiredMet === Trinary.TRUE
            ) {
                switch (editValue.status) {
                    case ValueStatus.NONE:
                        return editValue;
                    case ValueStatus.EMPTY:
                        return editValue;
                    case ValueStatus.SOME:
                        // TODO: need a "PARTIAL" status for compound fields
                        // maybe need a field type for ARRAY and OBJECT, or
                        // choose different names like SEQUENCE and COMPOUND
                        // or SEQUENCE and STRUCT
                        // OH, this should never be necessary as the constraintt and required 
                        // settings should ensure this...
                        if (editValue.value.type.pendingValue.status === ValueStatus.SOME &&
                            editValue.value.value.pendingValue.status === ValueStatus.SOME) {
                            return {
                                status: ValueStatus.SOME,
                                value: {
                                    type: new StringFieldUtil(editValue.value.type).getPendingValue(),
                                    value: new StringFieldUtil(editValue.value.value).getPendingValue()
                                }
                            }
                        }
                }
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

    getPendingValue(): Citation {
        const field = this.field;
        switch (field.pendingValue.status) {
            case ValueStatus.NONE:
                throw new Error('impossible');
            case ValueStatus.EMPTY:
                // TODO: resolve
                throw new Error('impossible');
            case ValueStatus.SOME:
                return field.pendingValue.value;
        }
    }
}
