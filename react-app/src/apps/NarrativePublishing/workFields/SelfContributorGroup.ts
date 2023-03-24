import { ConstraintState, Field, Trinary, Value, ValueStatus } from "../fields/Field";
import { StringField, StringFieldUtil } from "../fields/StringField";

import { SelfContributor } from "apps/ORCIDLink/lib/ORCIDLinkClient";
import { StringArrayField, StringArrayFieldUtil } from "../fields/StringArrayField";

export interface ContributorGroupFields {
    orcidId: StringField;
    name: StringField;
    roles: StringArrayField;
}

export type SelfContributorGroup = Field<ContributorGroupFields, null, SelfContributor>

// export function evaluateSelfContributorGroup(field: SelfContributorGroup) {
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
//                 return (
//                     field.editValue.value.orcidId.isRequiredMet === Trinary.TRUE &&
//                     field.editValue.value.name.isRequiredMet === Trinary.TRUE &&
//                     field.editValue.value.roles.isRequiredMet === Trinary.TRUE
//                 ) ? Trinary.TRUE : Trinary.FALSE;
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
//                 // Rather than evaluate a value directly, as we do for regular fields, we
//                 // reflect the values of the sub-fields within this group.
//                 // console.log('HERE',
//                 //     field.editValue.value.type.constraintState.isConstraintMet,
//                 //     field.editValue.value.value.constraintState.isConstraintMet);
//                 if (field.editValue.value.orcidId.constraintState.isConstraintMet === Trinary.FALSE ||
//                     field.editValue.value.name.constraintState.isConstraintMet === Trinary.FALSE ||
//                     field.editValue.value.roles.constraintState.isConstraintMet === Trinary.FALSE) {
//                     return {
//                         isConstraintMet: Trinary.FALSE,
//                         message: 'One or more fields are invalid'
//                     }
//                 }
//                 return {
//                     isConstraintMet: Trinary.TRUE
//                 }

//             }
//         }
//     })();

//     const isTouched = ((field: SelfContributorGroup): boolean => {
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
//                         return field.editValue.value.orcidId.isTouched ||
//                             field.editValue.value.name.isTouched ||
//                             field.editValue.value.roles.isTouched;
//                 }
//         }
//     })(field);

//     const pendingValue: Value<SelfContributor> = (() => {
//         if (
//             constraintState.isConstraintMet === Trinary.TRUE &&
//             isRequiredMet === Trinary.TRUE
//         ) {
//             switch (field.editValue.status) {
//                 case ValueStatus.NONE:
//                     return {
//                         status: ValueStatus.NONE
//                     }
//                 case ValueStatus.EMPTY:
//                     return {
//                         status: ValueStatus.EMPTY
//                     }
//                 case ValueStatus.SOME:
//                     return {
//                         status: ValueStatus.SOME,
//                         value: {
//                             name: new StringFieldUtil(field.editValue.value.name).getPendingValue(),
//                             orcidId: new StringFieldUtil(field.editValue.value.orcidId).getPendingValue(),
//                             roles: new StringArrayFieldUtil(field.editValue.value.roles).getPendingValue()
//                         }
//                     }
//             }
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

export class SelfContributorGroupUtil {
    field: SelfContributorGroup;
    constructor(field: SelfContributorGroup) {
        this.field = field;
    }

    evaluate() {
        const field = this.field;

        const isRequiredMet: Trinary = (() => {
            if (!field.isRequired) {
                return Trinary.TRUE;
            }
            switch (field.editValue.status) {
                case ValueStatus.NONE:
                    return Trinary.FALSE;
                case ValueStatus.EMPTY:
                    return Trinary.FALSE
                case ValueStatus.SOME:
                    return (
                        field.editValue.value.orcidId.isRequiredMet === Trinary.TRUE &&
                        field.editValue.value.name.isRequiredMet === Trinary.TRUE &&
                        field.editValue.value.roles.isRequiredMet === Trinary.TRUE
                    ) ? Trinary.TRUE : Trinary.FALSE;
            }
        })();

        const constraintState: ConstraintState = (() => {
            switch (field.editValue.status) {
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
                    if (field.editValue.value.orcidId.constraintState.isConstraintMet === Trinary.FALSE ||
                        field.editValue.value.name.constraintState.isConstraintMet === Trinary.FALSE ||
                        field.editValue.value.roles.constraintState.isConstraintMet === Trinary.FALSE) {
                        return {
                            isConstraintMet: Trinary.FALSE,
                            message: 'One or more fields are invalid'
                        }
                    }
                    return {
                        isConstraintMet: Trinary.TRUE
                    }

                }
            }
        })();

        const isTouched = ((field: SelfContributorGroup): boolean => {
            switch (field.editValue.status) {
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
                            return field.editValue.value.orcidId.isTouched ||
                                field.editValue.value.name.isTouched ||
                                field.editValue.value.roles.isTouched;
                    }
            }
        })(field);

        const pendingValue: Value<SelfContributor> = (() => {
            if (
                constraintState.isConstraintMet === Trinary.TRUE &&
                isRequiredMet === Trinary.TRUE
            ) {
                switch (field.editValue.status) {
                    case ValueStatus.NONE:
                        return {
                            status: ValueStatus.NONE
                        }
                    case ValueStatus.EMPTY:
                        return {
                            status: ValueStatus.EMPTY
                        }
                    case ValueStatus.SOME:
                        const x = {
                            status: ValueStatus.SOME,
                            value: {
                                name: new StringFieldUtil(field.editValue.value.name).getPendingValue(),
                                orcidId: new StringFieldUtil(field.editValue.value.orcidId).getPendingValue(),
                                roles: new StringArrayFieldUtil(field.editValue.value.roles).getPendingValue()
                            }
                        }
                        console.log('GROUP SOME', x);
                        return x;
                }
            }
            console.log('GROUP default', field.pendingValue)
            return field.pendingValue;
        })();

        return {
            ...field,
            constraintState,
            isRequiredMet,
            isTouched,
            pendingValue
        };
    }

    getPendingValue(): SelfContributor {
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