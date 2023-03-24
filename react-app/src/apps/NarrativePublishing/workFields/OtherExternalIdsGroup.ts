import { ConstraintState, Field, Trinary, Value, ValueStatus } from "../fields/Field";

import { ExternalId } from "apps/ORCIDLink/lib/ORCIDLinkClient";
import { ExternalIdGroup, ExternalIdGroupUtil } from "./ExternalIdGroup";


export type OtherExternalIdsGroup = Field<Array<ExternalIdGroup>, null, Array<ExternalId>>

// export interface InitialExternalIds {
//     isRequired: boolean;
//     storageValue: Array<ExternalId>;

// }

export class OtherExternalIdsGroupUtil {
    field: OtherExternalIdsGroup;
    constructor(field: OtherExternalIdsGroup) {
        this.field = field;
    }
    evaluate() {
        const field = this.field;

        const editValue = ((): Value<Array<ExternalIdGroup>> => {
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
                    return (editValue.value.every(({ isRequiredMet }) => {
                        return isRequiredMet === Trinary.TRUE
                    })) ? Trinary.TRUE : Trinary.FALSE;
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

        const isTouched = ((field: OtherExternalIdsGroup): boolean => {
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

        const pendingValue: Value<Array<ExternalId>> = (() => {
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
                            value: editValue.value.map((value) => {
                                return new ExternalIdGroupUtil(value).getPendingValue()
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

    getPendingValue(): Array<ExternalId> {
        const field = this.field;
        switch (field.pendingValue.status) {
            case ValueStatus.NONE:
                throw new Error('impossible');
            case ValueStatus.EMPTY:
                // TODO: need to refactor for emptyValue()
                return [];
            case ValueStatus.SOME:
                return field.pendingValue.value;
        }
    }

    // create(otherExternalIds: Array<ExternalId>): OtherExternalIdsGroup {
    //     return evaluateOtherExternalIdsGroup({
    //         constraintState: {
    //             isConstraintMet: Trinary.NONE,
    //         },
    //         isRequired: false,
    //         isTouched: false,
    //         isRequiredMet: Trinary.NONE,
    //         storageStatus: StorageStatus.NONE,
    //         editValue: {
    //             status: ValueStatus.SOME,
    //             value: otherExternalIds.map((externalId): ExternalIdGroup => {
    //                 return createExternalIdGroup(externalId);
    //             })

    //         },
    //         pendingValue: {
    //             status: ValueStatus.NONE
    //         },
    //         storageValue: {
    //             status: ValueStatus.SOME,
    //             value: otherExternalIds
    //         },
    //     });
    // }
}