import { ConstraintState, Field, Trinary, Value, ValueStatus } from "../fields/Field";
import { StringField } from "../fields/StringField";

import { Contributor } from "apps/ORCIDLink/lib/ORCIDLinkClient";
import { StringArrayField } from "../fields/StringArrayField";
import { ContributorGroup, ContributorGroupUtil } from "./ContributorGroup";

export interface OtherContributorsGroupFields {
    orcidId: StringField;
    name: StringField;
    roles: StringArrayField;
}

export type OtherContributorsGroup = Field<Array<ContributorGroup>, null, Array<Contributor>>

// export function evaluateOtherContributorsGroup(field: OtherContributorsGroup) {
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
//                 if (field.editValue.value.every(({ isRequiredMet }) => {
//                     return isRequiredMet === Trinary.TRUE
//                 })) {
//                     return Trinary.TRUE;
//                 }
//                 return Trinary.FALSE;
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
//                 if (field.editValue.value.every(({ constraintState }) => {
//                     return constraintState.isConstraintMet === Trinary.FALSE
//                 })) {
//                     return {
//                         isConstraintMet: Trinary.FALSE,
//                         message: 'One or more fields are invalid'
//                     }
//                 }
//                 // if (field.editValue.value.orcidId.constraintState.isConstraintMet === Trinary.FALSE ||
//                 //     field.editValue.value.name.constraintState.isConstraintMet === Trinary.FALSE ||
//                 //     field.editValue.value.roles.constraintState.isConstraintMet === Trinary.FALSE) {
//                 //     return {
//                 //         isConstraintMet: Trinary.FALSE,
//                 //         message: 'One or more fields are invalid'
//                 //     }
//                 // }
//                 return {
//                     isConstraintMet: Trinary.TRUE
//                 }

//             }
//         }
//     })();

//     const isTouched = ((field: OtherContributorsGroup): boolean => {
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
//                         return field.editValue.value.some(({ isTouched }) => {
//                             return isTouched;
//                         });
//                 }
//         }
//     })(field);


//     const pendingValue: Value<Array<Contributor>> = (() => {
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
//                         value: field.editValue.value.map((value) => {
//                             return new ContributorGroupUtil(value).getPendingValue()
//                         })
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

export class OtherContributorsGroupUtil {
    field: OtherContributorsGroup;
    constructor(field: OtherContributorsGroup) {
        this.field = field;
    }

    evaluate() {
        const field = this.field;

        const editValue = ((): Value<Array<ContributorGroup>> => {
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
                    return editValue.value.every(({ isRequiredMet }) => {
                        return isRequiredMet === Trinary.TRUE
                    }) ? Trinary.TRUE : Trinary.FALSE;
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
                        isConstraintMet: Trinary.NONE,
                    }
                }
                case ValueStatus.SOME: {
                    // Rather than evaluate a value directly, as we do for regular fields, we
                    // reflect the values of the sub-fields within this group.
                    if (editValue.value.every(({ constraintState }) => {
                        return constraintState.isConstraintMet === Trinary.FALSE
                    })) {
                        return {
                            isConstraintMet: Trinary.FALSE,
                            message: 'One or more fields are invalid'
                        }
                    }
                    // if (field.editValue.value.orcidId.constraintState.isConstraintMet === Trinary.FALSE ||
                    //     field.editValue.value.name.constraintState.isConstraintMet === Trinary.FALSE ||
                    //     field.editValue.value.roles.constraintState.isConstraintMet === Trinary.FALSE) {
                    //     return {
                    //         isConstraintMet: Trinary.FALSE,
                    //         message: 'One or more fields are invalid'
                    //     }
                    // }
                    return {
                        isConstraintMet: Trinary.TRUE
                    }

                }
            }
        })();

        const isTouched = ((field: OtherContributorsGroup): boolean => {
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
                            return editValue.value.some(({ isTouched }) => {
                                return isTouched;
                            });
                    }
            }
        })(field);

        const pendingValue: Value<Array<Contributor>> = (() => {
            if (
                isRequiredMet === Trinary.TRUE &&
                (
                    constraintState.isConstraintMet === Trinary.TRUE ||
                    (
                        constraintState.isConstraintMet === Trinary.NONE &&
                        field.isRequired === false
                    )
                )

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
                            value: editValue.value
                                .filter((value) => {
                                    return value.editValue.status === ValueStatus.SOME;
                                })
                                .map((value) => {
                                    console.log('hmm', value)
                                    return new ContributorGroupUtil(value).getPendingValue()
                                })
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

    evaluatex() {
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
                    if (field.editValue.value.every(({ isRequiredMet }) => {
                        return isRequiredMet === Trinary.TRUE
                    })) {
                        return Trinary.TRUE;
                    }
                    return Trinary.FALSE;
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
                    if (field.editValue.value.every(({ constraintState }) => {
                        return constraintState.isConstraintMet === Trinary.FALSE
                    })) {
                        return {
                            isConstraintMet: Trinary.FALSE,
                            message: 'One or more fields are invalid'
                        }
                    }
                    // if (field.editValue.value.orcidId.constraintState.isConstraintMet === Trinary.FALSE ||
                    //     field.editValue.value.name.constraintState.isConstraintMet === Trinary.FALSE ||
                    //     field.editValue.value.roles.constraintState.isConstraintMet === Trinary.FALSE) {
                    //     return {
                    //         isConstraintMet: Trinary.FALSE,
                    //         message: 'One or more fields are invalid'
                    //     }
                    // }
                    return {
                        isConstraintMet: Trinary.TRUE
                    }

                }
            }
        })();

        const isTouched = ((field: OtherContributorsGroup): boolean => {
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
                            return field.editValue.value.some(({ isTouched }) => {
                                return isTouched;
                            });
                    }
            }
        })(field);


        const pendingValue: Value<Array<Contributor>> = (() => {
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
                        return {
                            status: ValueStatus.SOME,
                            value: field.editValue.value.map((value) => {
                                return new ContributorGroupUtil(value).getPendingValue()
                            })
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
            pendingValue
        };
    }

    isValid() {
        return (
            this.field.isRequiredMet === Trinary.TRUE &&
            (
                this.field.constraintState.isConstraintMet === Trinary.TRUE ||
                (
                    this.field.constraintState.isConstraintMet === Trinary.NONE &&
                    this.field.isRequired === false
                )
            )
        )
    }

    getPendingValue(): Array<Contributor> {
        const field = this.field;
        switch (field.pendingValue.status) {
            case ValueStatus.NONE:
                throw new Error('impossible');
            case ValueStatus.EMPTY:
                // TODO: resolve
                return [];
            case ValueStatus.SOME:
                return field.pendingValue.value;
        }
    }
}

