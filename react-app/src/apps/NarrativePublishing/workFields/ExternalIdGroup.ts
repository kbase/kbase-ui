import { ExternalId } from "apps/ORCIDLink/lib/ORCIDLinkClient";
import { ConstraintState, Field, Trinary, Value, ValueStatus } from "../fields/Field";
import { StringField, StringFieldUtil } from "../fields/StringField";
import { URLField, URLFieldUtil } from "../fields/URLFIeld";

export interface ExternalIdGroupFields {
    type: StringField;
    value: StringField;
    url: URLField;
    relationship: StringField;
}

export type ExternalIdGroup = Field<ExternalIdGroupFields, null, ExternalId>

// export function evaluateExternalIdGroup(field: ExternalIdGroup) {
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
//                     field.editValue.value.type.isRequiredMet &&
//                     field.editValue.value.value.isRequiredMet &&
//                     field.editValue.value.url.isRequiredMet &&
//                     field.editValue.value.relationship.isRequiredMet
//                 );
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
//                 if (field.editValue.value.type.constraintState.isConstraintMet === Trinary.FALSE ||
//                     field.editValue.value.value.constraintState.isConstraintMet === Trinary.FALSE ||
//                     field.editValue.value.url.constraintState.isConstraintMet === Trinary.FALSE ||
//                     field.editValue.value.relationship.constraintState.isConstraintMet === Trinary.FALSE) {
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

//     const isTouched = ((field: ExternalIdGroup): boolean => {
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
//                         return field.editValue.value.type.isTouched ||
//                             field.editValue.value.value.isTouched ||
//                             field.editValue.value.url.isTouched ||
//                             field.editValue.value.relationship.isTouched;
//                 }
//         }
//     })(field);

//     const pendingValue: Value<ExternalId> = (() => {
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
//                             type: new StringFieldUtil(field.editValue.value.type).getPendingValue(),
//                             relationship: new StringFieldUtil(field.editValue.value.relationship).getPendingValue(),
//                             url: new URLFieldUtil(field.editValue.value.url).getPendingValue(),
//                             value: new StringFieldUtil(field.editValue.value.value).getPendingValue(),

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
//         isTouched
//     };
// }


export class ExternalIdGroupUtil {
    field: ExternalIdGroup;
    constructor(field: ExternalIdGroup) {
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
                        field.editValue.value.type.isRequiredMet === Trinary.TRUE &&
                        field.editValue.value.value.isRequiredMet === Trinary.TRUE &&
                        field.editValue.value.url.isRequiredMet === Trinary.TRUE &&
                        field.editValue.value.relationship.isRequiredMet === Trinary.TRUE
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
                    if (field.editValue.value.type.constraintState.isConstraintMet === Trinary.FALSE ||
                        field.editValue.value.value.constraintState.isConstraintMet === Trinary.FALSE ||
                        field.editValue.value.url.constraintState.isConstraintMet === Trinary.FALSE ||
                        field.editValue.value.relationship.constraintState.isConstraintMet === Trinary.FALSE) {
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

        const isTouched = ((field: ExternalIdGroup): boolean => {
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
                            return field.editValue.value.type.isTouched ||
                                field.editValue.value.value.isTouched ||
                                field.editValue.value.url.isTouched ||
                                field.editValue.value.relationship.isTouched;
                    }
            }
        })(field);

        const pendingValue: Value<ExternalId> = (() => {
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
                            value: {
                                type: new StringFieldUtil(field.editValue.value.type).getPendingValue(),
                                relationship: new StringFieldUtil(field.editValue.value.relationship).getPendingValue(),
                                url: new URLFieldUtil(field.editValue.value.url).getPendingValue(),
                                value: new StringFieldUtil(field.editValue.value.value).getPendingValue(),

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
            pendingValue
        };
    }

    getPendingValue(): ExternalId {
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


    // create({ type, value, url, relationship }: ExternalId): ExternalIdGroup {
    //     return evaluateExternalIdGroup({
    //         constraintState: {
    //             isConstraintMet: Trinary.NONE,
    //         },
    //         isRequired: true,
    //         isTouched: false,
    //         isRequiredMet: Trinary.NONE,
    //         storageStatus: StorageStatus.NONE,
    //         editValue: {
    //             status: ValueStatus.SOME,
    //             value: {
    //                 type: createExternalIdTypeField(type),
    //                 value: createExternalIdValueField(value),
    //                 url: createExternalIdURLField(url),
    //                 relationship: createExternalIdRelationshipField(relationship)
    //             }
    //         },
    //         pendingValue: {
    //             status: ValueStatus.NONE
    //         },
    //         storageValue: {
    //             status: ValueStatus.SOME,
    //             value: {
    //                 type, value, url, relationship
    //             }
    //         },
    //     });
    // }

}