import { Citation, Contributor, ExternalId, SelfContributor } from "apps/ORCIDLink/lib/ORCIDLinkClient";
import { ConstraintState, Field, Trinary, Value, ValueStatus } from "../fields/Field";
import { StringField, StringFieldUtil } from "../fields/StringField";
import { URLField, URLFieldUtil } from "../fields/URLFIeld";
import { CitationGroup, CitationGroupUtil } from "./CitationGroup";
import { OtherContributorsGroup, OtherContributorsGroupUtil } from "./OtherContributorsGroup";
import { OtherExternalIdsGroup, OtherExternalIdsGroupUtil } from "./OtherExternalIdsGroup";
import { SelfContributorGroup, SelfContributorGroupUtil } from "./SelfContributorGroup";
// A Field Group covering the entire work record.

export interface WorkGroupFields {
    // citation: CitationGroupFields;
    journal: StringField
    date: StringField
    url: URLField
    title: StringField
    shortDescription: StringField;
    citation: CitationGroup
    selfContributor: SelfContributorGroup
    otherContributors: OtherContributorsGroup
    doi: StringField
    otherExternalIds: OtherExternalIdsGroup
}

export interface WorkEditSubset {
    title: string;
    journal: string;
    date: string;
    url: string;
    doi: string;
    externalIds: Array<ExternalId>
    citation: Citation | null;
    shortDescription: string;
    selfContributor: SelfContributor;
    otherContributors: Array<Contributor> | null;
}

export type WorkGroup = Field<WorkGroupFields, null, WorkEditSubset>

// export function evaluateWorkGroup(field: WorkGroup) {
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
//                 // TODO: not quite right.
//                 // What if one is NONE? Should reflect NONE or FALSE?
//                 return (
//                     field.editValue.value.title.isRequiredMet === Trinary.TRUE &&
//                     field.editValue.value.date.isRequiredMet === Trinary.TRUE &&
//                     field.editValue.value.journal.isRequiredMet === Trinary.TRUE &&
//                     field.editValue.value.url.isRequiredMet === Trinary.TRUE &&
//                     field.editValue.value.doi.isRequiredMet === Trinary.TRUE &&
//                     field.editValue.value.otherExternalIds.isRequiredMet === Trinary.TRUE &&
//                     field.editValue.value.citation.isRequiredMet === Trinary.TRUE &&
//                     field.editValue.value.shortDescription.isRequiredMet === Trinary.TRUE &&
//                     field.editValue.value.selfContributor.isRequiredMet === Trinary.TRUE &&
//                     field.editValue.value.otherContributors.isRequiredMet === Trinary.TRUE
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
//                 console.log('HERE',
//                     field.editValue.value.title.constraintState.isConstraintMet,
//                     field.editValue.value.date.constraintState.isConstraintMet,
//                     field.editValue.value.journal.constraintState.isConstraintMet,
//                     field.editValue.value.url.constraintState.isConstraintMet,
//                     field.editValue.value.doi.constraintState.isConstraintMet,
//                     field.editValue.value.citation.constraintState.isConstraintMet,
//                     field.editValue.value.shortDescription.constraintState.isConstraintMet,
//                     field.editValue.value.selfContributor.constraintState.isConstraintMet,
//                     field.editValue.value.otherExternalIds.constraintState.isConstraintMet,
//                     field.editValue.value.otherContributors.constraintState.isConstraintMet,
//                 );
//                 return (
//                     field.editValue.value.title.constraintState.isConstraintMet === Trinary.TRUE &&
//                     field.editValue.value.date.constraintState.isConstraintMet === Trinary.TRUE &&
//                     field.editValue.value.journal.constraintState.isConstraintMet === Trinary.TRUE &&
//                     field.editValue.value.url.constraintState.isConstraintMet === Trinary.TRUE &&
//                     field.editValue.value.doi.constraintState.isConstraintMet === Trinary.TRUE &&
//                     new OtherExternalIdsGroupUtil(field.editValue.value.otherExternalIds).isValid() &&
//                     // field.editValue.value.otherExternalIds.constraintState.isConstraintMet === Trinary.TRUE &&
//                     field.editValue.value.citation.constraintState.isConstraintMet === Trinary.TRUE &&
//                     field.editValue.value.shortDescription.constraintState.isConstraintMet === Trinary.TRUE &&
//                     field.editValue.value.selfContributor.constraintState.isConstraintMet === Trinary.TRUE &&
//                     // field.editValue.value.otherContributors.constraintState.isConstraintMet === Trinary.TRUE
//                     new OtherContributorsGroupUtil(field.editValue.value.otherContributors).isValid()
//                 ) ?
//                     {
//                         isConstraintMet: Trinary.TRUE
//                     }
//                     :
//                     {
//                         isConstraintMet: Trinary.FALSE,
//                         message: 'One or more fields are invalid'
//                     }
//             }
//         }
//     })();

//     const isTouched = ((field: WorkGroup): boolean => {
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
//                         return field.editValue.value.title.isTouched ||
//                             field.editValue.value.date.isTouched ||
//                             field.editValue.value.journal.isTouched ||
//                             field.editValue.value.shortDescription.isTouched ||
//                             field.editValue.value.url.isTouched ||
//                             field.editValue.value.doi.isTouched ||
//                             field.editValue.value.otherExternalIds.isTouched ||
//                             field.editValue.value.citation.isTouched ||
//                             field.editValue.value.selfContributor.isTouched ||
//                             field.editValue.value.otherContributors.isTouched;
//                 }
//         }
//     })(field);

//     const pendingValue: Value<WorkEditSubset> = (() => {
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
//                             title: new StringFieldUtil(field.editValue.value.title).getPendingValue(),
//                             date: new StringFieldUtil(field.editValue.value.date).getPendingValue(),
//                             journal: new StringFieldUtil(field.editValue.value.journal).getPendingValue(),
//                             shortDescription: new StringFieldUtil(field.editValue.value.shortDescription).getPendingValue(),
//                             url: new URLFieldUtil(field.editValue.value.url).getPendingValue(),
//                             doi: new StringFieldUtil(field.editValue.value.doi).getPendingValue(),
//                             externalIds: new OtherExternalIdsGroupUtil(field.editValue.value.otherExternalIds).getPendingValue(),
//                             citation: new CitationGroupUtil(field.editValue.value.citation).getPendingValue(),
//                             selfContributor: new SelfContributorGroupUtil(field.editValue.value.selfContributor).getPendingValue(),
//                             otherContributors: new OtherContributorsGroupUtil(field.editValue.value.otherContributors).getPendingValue()
//                         }
//                     }
//             }
//         }
//         // Return unscathed if we shouldn't update it.
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

// export interface FakeWork {
//     journal: string,
//     date: string,
//     url: string,
//     title: string;
//     shortDescription: string;
//     citation: Citation
//     selfContributor: SelfContributor
//     otherContributors: Array<Contributor>
//     doi: string
//     otherExternalIds: Array<ExternalId>
// }



export class WorkGroupUtil {
    field: WorkGroup;
    constructor(field: WorkGroup) {
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
                        field.editValue.value.title.isRequiredMet === Trinary.TRUE &&
                        field.editValue.value.date.isRequiredMet === Trinary.TRUE &&
                        field.editValue.value.journal.isRequiredMet === Trinary.TRUE &&
                        field.editValue.value.url.isRequiredMet === Trinary.TRUE &&
                        field.editValue.value.doi.isRequiredMet === Trinary.TRUE &&
                        field.editValue.value.otherExternalIds.isRequiredMet === Trinary.TRUE &&
                        field.editValue.value.citation.isRequiredMet === Trinary.TRUE &&
                        field.editValue.value.shortDescription.isRequiredMet === Trinary.TRUE &&
                        field.editValue.value.selfContributor.isRequiredMet === Trinary.TRUE &&
                        field.editValue.value.otherContributors.isRequiredMet === Trinary.TRUE
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
                    // console.log('HERE',
                    //     field.editValue.value.title.constraintState.isConstraintMet,
                    //     field.editValue.value.date.constraintState.isConstraintMet,
                    //     field.editValue.value.journal.constraintState.isConstraintMet,
                    //     field.editValue.value.url.constraintState.isConstraintMet,
                    //     field.editValue.value.doi.constraintState.isConstraintMet,
                    //     field.editValue.value.citation.constraintState.isConstraintMet,
                    //     field.editValue.value.shortDescription.constraintState.isConstraintMet,
                    //     field.editValue.value.selfContributor.constraintState.isConstraintMet,
                    //     field.editValue.value.otherExternalIds.constraintState.isConstraintMet,
                    //     field.editValue.value.otherContributors.constraintState.isConstraintMet,
                    //     "---",
                    //     new OtherExternalIdsGroupUtil(field.editValue.value.otherExternalIds).isValid(),
                    //     new OtherContributorsGroupUtil(field.editValue.value.otherContributors).isValid()
                    // );
                    if (
                        field.editValue.value.title.constraintState.isConstraintMet === Trinary.TRUE &&
                        field.editValue.value.date.constraintState.isConstraintMet === Trinary.TRUE &&
                        field.editValue.value.journal.constraintState.isConstraintMet === Trinary.TRUE &&
                        field.editValue.value.url.constraintState.isConstraintMet === Trinary.TRUE &&
                        field.editValue.value.doi.constraintState.isConstraintMet === Trinary.TRUE &&
                        // field.editValue.value.otherExternalIds.constraintState.isConstraintMet === Trinary.TRUE &&
                        new OtherExternalIdsGroupUtil(field.editValue.value.otherExternalIds).isValid() &&
                        field.editValue.value.citation.constraintState.isConstraintMet === Trinary.TRUE &&
                        field.editValue.value.shortDescription.constraintState.isConstraintMet === Trinary.TRUE &&
                        field.editValue.value.selfContributor.constraintState.isConstraintMet === Trinary.TRUE &&
                        // field.editValue.value.otherContributors.constraintState.isConstraintMet === Trinary.TRUE
                        new OtherContributorsGroupUtil(field.editValue.value.otherContributors).isValid()
                    ) {
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

        const isTouched = ((field: WorkGroup): boolean => {
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
                            return field.editValue.value.title.isTouched ||
                                field.editValue.value.date.isTouched ||
                                field.editValue.value.journal.isTouched ||
                                field.editValue.value.shortDescription.isTouched ||
                                field.editValue.value.url.isTouched ||
                                field.editValue.value.doi.isTouched ||
                                field.editValue.value.otherExternalIds.isTouched ||
                                field.editValue.value.citation.isTouched ||
                                field.editValue.value.selfContributor.isTouched ||
                                field.editValue.value.otherContributors.isTouched;
                    }
            }
        })(field);

        const pendingValue: Value<WorkEditSubset> = (() => {
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
                                title: new StringFieldUtil(field.editValue.value.title).getPendingValue(),
                                date: new StringFieldUtil(field.editValue.value.date).getPendingValue(),
                                journal: new StringFieldUtil(field.editValue.value.journal).getPendingValue(),
                                shortDescription: new StringFieldUtil(field.editValue.value.shortDescription).getPendingValue(),
                                url: new URLFieldUtil(field.editValue.value.url).getPendingValue(),
                                doi: new StringFieldUtil(field.editValue.value.doi).getPendingValue(),
                                externalIds: new OtherExternalIdsGroupUtil(field.editValue.value.otherExternalIds).getPendingValue(),
                                citation: new CitationGroupUtil(field.editValue.value.citation).getPendingValue(),
                                selfContributor: new SelfContributorGroupUtil(field.editValue.value.selfContributor).getPendingValue(),
                                otherContributors: new OtherContributorsGroupUtil(field.editValue.value.otherContributors).getPendingValue()
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

    getPendingValue(): WorkEditSubset {
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