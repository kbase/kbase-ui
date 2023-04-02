import { ConstraintState, Field, Trinary, Value, ValueStatus } from "../fields/Field";
import { StringField, StringFieldUtil } from "../fields/StringField";

import { Contributor, ContributorRole } from "apps/ORCIDLink/lib/ORCIDLinkClient";
import { StringArrayField, StringArrayFieldUtil } from "../fields/StringArrayField";

export interface ContributorGroupFields {
    orcidId: StringField;
    name: StringField;
    roles: StringArrayField;
}

export type ContributorGroup = Field<ContributorGroupFields, null, Contributor>

export class ContributorGroupUtil {
    field: ContributorGroup;
    constructor(field: ContributorGroup) {
        this.field = field;
    }

    evaluate(): ContributorGroup {
        const field = this.field;

        const editValue = ((): Value<ContributorGroupFields> => {
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

        console.log('edit value', editValue);

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
                        editValue.value.orcidId.isRequiredMet === Trinary.TRUE &&
                        editValue.value.name.isRequiredMet === Trinary.TRUE &&
                        editValue.value.roles.isRequiredMet === Trinary.TRUE
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
                    // console.log('HERE',
                    //     field.editValue.value.type.constraintState.isConstraintMet,
                    //     field.editValue.value.value.constraintState.isConstraintMet);
                    if (editValue.value.orcidId.constraintState.isConstraintMet === Trinary.TRUE &&
                        editValue.value.name.constraintState.isConstraintMet === Trinary.TRUE &&
                        editValue.value.roles.constraintState.isConstraintMet === Trinary.TRUE) {
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

        const isTouched = ((field: ContributorGroup): boolean => {
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
                            return editValue.value.orcidId.isTouched ||
                                editValue.value.name.isTouched ||
                                editValue.value.roles.isTouched;
                    }
            }
        })(field);

        const pendingValue: Value<Contributor> = (() => {
            if (
                constraintState.isConstraintMet === Trinary.TRUE &&
                isRequiredMet === Trinary.TRUE
            ) {
                switch (editValue.status) {
                    case ValueStatus.NONE:
                        return {
                            status: ValueStatus.NONE
                        }
                    case ValueStatus.EMPTY:
                        return {
                            status: ValueStatus.EMPTY
                        }
                    case ValueStatus.SOME:
                        return {
                            status: ValueStatus.SOME,
                            value: {
                                name: new StringFieldUtil(editValue.value.name).getPendingValue(),
                                orcidId: new StringFieldUtil(editValue.value.orcidId).getPendingValue(),
                                roles: new StringArrayFieldUtil(editValue.value.roles).getPendingValue().map((role): ContributorRole => { return { role }; })
                            }
                        }
                }
            }
            return field.pendingValue;
        })();

        console.log('evaluating', pendingValue);

        return {
            ...field,
            constraintState,
            isRequiredMet,
            isTouched,
            editValue,
            pendingValue
        };
    }

    getPendingValue(): Contributor {
        const field = this.field;
        console.log('getPendingValue', field.pendingValue);
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
