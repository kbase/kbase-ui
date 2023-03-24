import { ConstraintState, Field, Trinary, ValueStatus } from "../fields/Field";
import { StringField } from "../fields/StringField";

import { Contributor } from "apps/ORCIDLink/lib/ORCIDLinkClient";
import { StringArrayField } from "../fields/StringArrayField";

export interface ContributorGroupFields {
    orcidId: StringField;
    name: StringField;
    roles: StringArrayField;
}

// export interface SelfContributorGroup<TEditValue, TConstraint, TStorageValue> extends Field <TEditValue, TConstraint, TStorageValue> {

// }

export type SelfContributorGroup = Field<ContributorGroupFields, null, Contributor>

export function evaluateSelfContributorGroup(field: SelfContributorGroup) {
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

    return {
        ...field,
        constraintState,
        isRequiredMet,
        isTouched
    };
}