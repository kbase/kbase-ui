// import { Workspace } from "@kbase/ui-lib";
// import { WorkspaceInfo } from "@kbase/ui-lib/lib/comm/coreServices/Workspace";
// import { LinkRecord } from "apps/ORCIDLink/lib/Model";
import {
    Citation, Contributor, ExternalId, LinkRecord, NewWork, ORCIDLinkServiceClient,
    ORCIDProfile, SelfContributor, Work, WorkUpdate
} from "apps/ORCIDLink/lib/ORCIDLinkClient";
import { AuthenticationStateAuthenticated } from "contexts/Auth";
import { StaticNarrative, StaticNarrativeInfo } from "lib/clients/StaticNarrative";
import Workspace, { WorkspaceInfo } from "lib/kb_lib/comm/coreServices/Workspace";
import { Config } from "types/config";

export interface GetStaticNarrativesResult {
    staticNarrativeInfo: StaticNarrativeInfo
    workspaceInfo: WorkspaceInfo
    doi: string | null;
    workRecord: Work | null;

}

export enum ValidationStatus {
    VALID = 'VALID',
    INVALID = 'INVALID',
    REQUIRED_MISSING = 'REQUIRED_MISSING'
}

export interface ValidationStateBase {
    status: ValidationStatus
}

export interface ValidationStateValid extends ValidationStateBase {
    status: ValidationStatus.VALID
}

export interface ValidationStateInvalid extends ValidationStateBase {
    status: ValidationStatus.INVALID,
    message: string
}

export interface ValidationStateRequiredMissing extends ValidationStateBase {
    status: ValidationStatus.REQUIRED_MISSING
}

export type ValidationState = ValidationStateValid | ValidationStateInvalid | ValidationStateRequiredMissing;

export enum EditStatus {
    // NONE = 'NONE',
    INITIAL = 'INITIAL',
    EDITED = 'EDITED'
}

// export enum RemoteStatus {
//     NONE = 'NONE',
//     CLEAN = 'REMOTE',
//     DIRTY = 'DIRTY'
// }

// export interface RemoteStateBase {
//     status: RemoteStatus;
// }

// export interface RemoteStateNone extends RemoteStateBase {
//     status: RemoteStatus.NONE
// }

// export interface RemoteStateClean<TRemote> extends RemoteStateBase {
//     status: RemoteStatus.CLEAN;
//     value: TRemote
// }

// export interface RemoteStateDirty<TRemote> extends RemoteStateBase {
//     status: RemoteStatus.DIRTY;
//     value: TRemote
// }

// export type RemoteState<TRemote> = RemoteStateNone | RemoteStateClean<TRemote> | RemoteStateDirty<TRemote>

export interface EditStateBase {
    status: EditStatus
    validationState: ValidationState
    hasRemote: boolean;
}

export interface EditState<TRaw, TUpstream> extends EditStateBase {
    editValue: TRaw
    value: TUpstream
    // remoteState: RemoteState<TUpstream>
    initialValue: TUpstream
}

// export interface EditStateNoRemote<TRaw, TUpstream> extends EditStateBase<TRaw, TUpstream> {
//     // status: EditStatus.NONE;
//     hasRemote: false;
// }

// export interface EditStateWithRemote<TRaw, TUpstream> extends EditStateBase<TRaw, TUpstream> {
//     // status: EditStatus.INITIAL;
//     hasRemote: true;
//     remoteValue: TUpstream
// }
// // export interface EditStateEdited<TRaw, TUpstream> extends EditStateBase<TRaw, TUpstream> {
// //     status: EditStatus.EDITED;
// //     remoteValue: TUpstream
// // }

// export type EditState<TRaw, TUpstream> = EditStateNoRemote<TRaw, TUpstream> | EditStateWithRemote<TRaw, TUpstream>;


export interface EditableExternalId {
    type: EditState<string, string>,
    value: EditState<string, string>
    url: EditState<string, string>
    relationship: EditState<string, string>
}

export interface EditableCitation {
    type: EditState<string, string>
    value: EditState<string, string>
}

export type EditableContributor = EditState<{
    orcidId: EditState<string, string>
    name: EditState<string, string>
    roles: EditState<Array<string>, Array<string>>
}, Contributor>

export type EditableSelfContributor = EditState<{
    orcidId: EditState<string, string>
    name: EditState<string, string>
    roles: EditState<Array<string>, Array<string>>
}, SelfContributor>

export type EditableContributors = EditState<Array<EditableContributor>, Array<Contributor>>

// export interface EditableContributor {
//     orcidId: EditState<string, string>
//     name: EditState<string, string>
//     roles: EditState<Array<string>, Array<string>>
// }

// TODO: wrap in EditState!
export interface EditableWork {
    putCode: EditState<string, string>
    workType: EditState<string, string>
    title: EditState<string, string>
    date: EditState<string, string>
    journal: EditState<string, string>
    url: EditState<string, string>
    doi: EditState<string, string>
    externalIds: EditState<Array<EditableExternalId>, Array<ExternalId>>
    citation: EditState<EditableCitation, Citation>
    shortDescription: EditState<string, string>
    selfContributor: EditableSelfContributor
    // TODO: Implement
    otherContributors: EditableContributors
}

export function externalIdToEditableExternalId({ type, value, url, relationship }: ExternalId): EditableExternalId {
    return {
        type: {
            status: EditStatus.INITIAL,
            validationState: {
                status: ValidationStatus.VALID,
            },
            editValue: type,
            value: type,
            hasRemote: true,
            initialValue: type
        },
        value: {
            status: EditStatus.INITIAL,
            validationState: {
                status: ValidationStatus.VALID,
            },
            editValue: value,
            value: value,
            hasRemote: true,
            initialValue: value
        },
        url: {
            status: EditStatus.INITIAL,
            validationState: {
                status: ValidationStatus.VALID,
            },
            editValue: url,
            value: url,
            hasRemote: true,
            initialValue: url
        },
        relationship: {
            status: EditStatus.INITIAL,
            validationState: {
                status: ValidationStatus.VALID,
            },
            editValue: relationship,
            value: relationship,
            hasRemote: true,
            initialValue: relationship
        }
    };
}


export function contributorToEditableContributor(contributor: Contributor): EditableContributor {
    return {
        status: EditStatus.INITIAL,
        validationState: {
            status: ValidationStatus.VALID
        },
        editValue: {
            orcidId: {
                status: EditStatus.INITIAL,
                validationState: {
                    status: ValidationStatus.VALID,
                },
                editValue: contributor.orcidId || '',
                value: contributor.orcidId || '',
                hasRemote: true,
                initialValue: contributor.orcidId || ''
            },
            name: {
                status: EditStatus.INITIAL,
                validationState: {
                    status: ValidationStatus.VALID,
                },
                editValue: contributor.name,
                value: contributor.name,
                hasRemote: true,
                initialValue: contributor.name
            },
            roles: {
                status: EditStatus.INITIAL,
                validationState: {
                    status: ValidationStatus.VALID,
                },
                editValue: contributor.roles || [],
                value: contributor.roles || [],
                hasRemote: true,
                initialValue: contributor.roles || []
            }
        },
        value: contributor,
        hasRemote: true,
        initialValue: contributor
    };
}


export function selfContributorToEditableContributor(contributor: SelfContributor): EditableSelfContributor {
    return {
        status: EditStatus.INITIAL,
        validationState: {
            status: ValidationStatus.VALID
        },
        editValue: {
            orcidId: {
                status: EditStatus.INITIAL,
                validationState: {
                    status: ValidationStatus.VALID,
                },
                editValue: contributor.orcidId || '',
                value: contributor.orcidId || '',
                hasRemote: true,
                initialValue: contributor.orcidId || ''
            },
            name: {
                status: EditStatus.INITIAL,
                validationState: {
                    status: ValidationStatus.VALID,
                },
                editValue: contributor.name,
                value: contributor.name,
                hasRemote: true,
                initialValue: contributor.name
            },
            roles: {
                status: EditStatus.INITIAL,
                validationState: {
                    status: ValidationStatus.VALID,
                },
                editValue: contributor.roles || [],
                value: contributor.roles || [],
                hasRemote: true,
                initialValue: contributor.roles || []
            }
        },
        value: contributor,
        hasRemote: true,
        initialValue: contributor
    };
}

export function newEditableContributor(): EditableContributor {
    return {
        status: EditStatus.INITIAL,
        validationState: {
            status: ValidationStatus.VALID
        },
        editValue: {
            orcidId: {
                status: EditStatus.INITIAL,
                validationState: {
                    status: ValidationStatus.VALID,
                },
                editValue: '',
                value: '',
                hasRemote: false,
                initialValue: ''
            },
            name: {
                status: EditStatus.INITIAL,
                validationState: {
                    status: ValidationStatus.VALID,
                },
                editValue: '',
                value: '',
                hasRemote: true,
                initialValue: ''
            },
            roles: {
                status: EditStatus.INITIAL,
                validationState: {
                    status: ValidationStatus.VALID,
                },
                editValue: [],
                value: [],
                hasRemote: true,
                initialValue: []
            }
        },
        value: {
            orcidId: '',
            name: '',
            roles: []
        },
        hasRemote: false,
        initialValue: {
            orcidId: '',
            name: '',
            roles: []
        }
    };
}

export function contributorsToEditableContributors(contributors: Array<Contributor>): EditableContributors {
    return {
        status: EditStatus.INITIAL,
        validationState: {
            status: ValidationStatus.VALID
        },
        editValue: contributors.map((contributor) => {
            return contributorToEditableContributor(contributor);
        }),
        value: contributors,
        hasRemote: true,
        initialValue: contributors
    };
}

export function workToEditableWork(work: Work): EditableWork {
    const { putCode, workType, title, date, journal, url, externalIds, shortDescription,
        citation, selfContributor, otherContributors, doi } = work;
    const editableExternalIds = externalIds.map((externalId) => {
        return externalIdToEditableExternalId(externalId);
    });
    return {
        putCode: {
            status: EditStatus.INITIAL,
            validationState: {
                status: ValidationStatus.VALID,
            },
            editValue: putCode,
            value: putCode,
            hasRemote: true,
            initialValue: putCode
        },
        workType: {
            status: EditStatus.INITIAL,
            validationState: {
                status: ValidationStatus.VALID,
            },
            editValue: workType,
            value: workType,
            hasRemote: true,
            initialValue: workType
        },
        title: {
            status: EditStatus.INITIAL,
            validationState: {
                status: ValidationStatus.VALID,
            },
            editValue: title,
            value: title,
            hasRemote: true,
            initialValue: title
        },
        date: {
            status: EditStatus.INITIAL,
            validationState: {
                status: ValidationStatus.VALID,
            },
            editValue: date,
            value: date,
            hasRemote: true,
            initialValue: date
        },
        journal: {
            status: EditStatus.INITIAL,
            validationState: {
                status: ValidationStatus.VALID,
            },
            editValue: journal,
            value: journal,
            hasRemote: true,
            initialValue: journal
        },
        url: {
            status: EditStatus.INITIAL,
            validationState: {
                status: ValidationStatus.VALID,
            },
            editValue: url,
            value: url,
            hasRemote: true,
            initialValue: url
        },
        doi: {
            status: EditStatus.INITIAL,
            validationState: {
                status: ValidationStatus.VALID,
            },
            editValue: doi,
            value: doi,
            hasRemote: true,
            initialValue: doi
        },
        externalIds: {
            status: EditStatus.INITIAL,
            validationState: {
                status: ValidationStatus.VALID,
            },
            editValue: editableExternalIds,
            value: externalIds,
            hasRemote: true,
            initialValue: externalIds
        },
        citation: {
            status: EditStatus.INITIAL,
            validationState: {
                status: ValidationStatus.VALID,
            },
            editValue: {
                type: {
                    status: EditStatus.INITIAL,
                    validationState: {
                        status: ValidationStatus.VALID,
                    },
                    editValue: citation ? citation.type : '',
                    value: citation ? citation.type : '',
                    hasRemote: true,
                    initialValue: citation ? citation.type : ''
                },
                value: {
                    status: EditStatus.INITIAL,
                    validationState: {
                        status: ValidationStatus.VALID,
                    },
                    editValue: citation ? citation.value : '',
                    value: citation ? citation.value : '',
                    hasRemote: true,
                    initialValue: citation ? citation.value : ''
                },
            },
            value: {
                type: citation === null ? '' : citation.type,
                value: citation === null ? '' : citation.value,
            },
            hasRemote: true,
            initialValue: {
                type: citation === null ? '' : citation.type,
                value: citation === null ? '' : citation.value,
            }
        },
        shortDescription: {
            status: EditStatus.INITIAL,
            validationState: {
                status: ValidationStatus.VALID,
            },
            editValue: shortDescription,
            value: shortDescription,
            hasRemote: true,
            initialValue: shortDescription
        },
        selfContributor: selfContributorToEditableContributor(selfContributor),
        otherContributors: contributorsToEditableContributors(otherContributors || [])
    }
}

// export function initialEditableContributor(): EditableContributor {
//     return contributorToEditableContributor({
//         name: '',
//         orcidId: '',
//         roles: []
//     })
// }

// export function initialEditableWork(orcidProfile: ORCIDProfile): EditableWork {
//     return {
//         putCode: {
//             status: EditStatus.INITIAL,
//             validationState: {
//                 status: ValidationStatus.VALID,
//             },
//             editValue: '',
//             value: ''
//         },
//         workType: {
//             status: EditStatus.INITIAL,
//             validationState: {
//                 status: ValidationStatus.VALID,
//             },
//             editValue: '',
//             value: ''
//         },
//         title: {
//             status: EditStatus.INITIAL,
//             validationState: {
//                 status: ValidationStatus.VALID,
//             },
//             editValue: '',
//             value: ''
//         },
//         date: {
//             status: EditStatus.INITIAL,
//             validationState: {
//                 status: ValidationStatus.VALID,
//             },
//             editValue: '',
//             value: ''
//         },
//         journal: {
//             status: EditStatus.INITIAL,
//             validationState: {
//                 status: ValidationStatus.VALID,
//             },
//             editValue: '',
//             value: ''
//         },
//         url: {
//             status: EditStatus.INITIAL,
//             validationState: {
//                 status: ValidationStatus.VALID,
//             },
//             editValue: '',
//             value: ''
//         },
//         doi: {
//             status: EditStatus.INITIAL,
//             validationState: {
//                 status: ValidationStatus.VALID,
//             },
//             editValue: '',
//             value: ''
//         },
//         externalIds: {
//             status: EditStatus.INITIAL,
//             validationState: {
//                 status: ValidationStatus.VALID,
//             },
//             editValue: [],
//             value: []
//         },
//         citation: {
//             status: EditStatus.INITIAL,
//             validationState: {
//                 status: ValidationStatus.VALID,
//             },
//             editValue: {
//                 type: {
//                     status: EditStatus.INITIAL,
//                     validationState: {
//                         status: ValidationStatus.VALID,
//                     },
//                     editValue: '',
//                     value: ''
//                 },
//                 value: {
//                     status: EditStatus.INITIAL,
//                     validationState: {
//                         status: ValidationStatus.VALID,
//                     },
//                     editValue: '',
//                     value: ''
//                 },
//             },
//             value: {
//                 type: '',
//                 value: ''
//             }
//         },
//         shortDescription: {
//             status: EditStatus.INITIAL,
//             validationState: {
//                 status: ValidationStatus.VALID,
//             },
//             editValue: '',
//             value: ''
//         },
//         // TODO: add profile parameter and initialize with user info.
//         selfContributor: initialEditableContributor(orcidProfile),
//         otherContributors: contributorsToEditableContributors([])
//     }
// }


export function editableExternalIdToExternalId(editableExternalId: EditableExternalId): ExternalId {
    const {
        type: {
            value: type
        },
        relationship: {
            value: relationship
        },
        url: {
            value: url
        },
        value: {
            value: value
        }
    } = editableExternalId;
    return {
        type, relationship, url, value
    };
}

export function editableExternalIdsToExternalIds(editableExternalIds: Array<EditableExternalId>): Array<ExternalId> {
    return editableExternalIds.map((editableExternalId) => {
        return editableExternalIdToExternalId(editableExternalId);
    });
}


// TODO: convert to using editstatus NONE and no remote value!
export function initialEditableExternalId(): EditableExternalId {
    return {
        type: {
            status: EditStatus.INITIAL,
            validationState: {
                status: ValidationStatus.VALID,
            },
            editValue: '',
            value: '',
            hasRemote: true,
            initialValue: ''
        },
        value: {
            status: EditStatus.INITIAL,
            validationState: {
                status: ValidationStatus.VALID,
            },
            editValue: '',
            value: '',
            hasRemote: true,
            initialValue: ''
        },
        url: {
            status: EditStatus.INITIAL,
            validationState: {
                status: ValidationStatus.VALID,
            },
            editValue: '',
            value: '',
            hasRemote: true,
            initialValue: ''
        },
        relationship: {
            status: EditStatus.INITIAL,
            validationState: {
                status: ValidationStatus.VALID,
            },
            editValue: '',
            value: '',
            hasRemote: true,
            initialValue: ''
        }
    };
}


export class Model {
    config: Config;
    auth: AuthenticationStateAuthenticated;
    orcidLinkClient: ORCIDLinkServiceClient;
    constructor({ config, auth }: { config: Config, auth: AuthenticationStateAuthenticated }) {
        this.config = config;
        this.auth = auth;
        this.orcidLinkClient = new ORCIDLinkServiceClient({
            url: this.config.services.ORCIDLink.url,
            timeout: this.config.ui.constants.clientTimeout,
            token: this.auth.authInfo.token
        });
    }

    async getORCIDLink(): Promise<LinkRecord> {
        return this.orcidLinkClient.getLink();
    }

    async hasORCIDLink(): Promise<boolean> {
        return this.orcidLinkClient.isLinked();
    }

    async getORCIDProfile(): Promise<ORCIDProfile> {
        return this.orcidLinkClient.getProfile();
    }


    async getStaticNarratives(): Promise<Array<GetStaticNarrativesResult>> {
        const staticNarrativeClient = new StaticNarrative({
            url: this.config.services.ServiceWizard.url,
            timeout: this.config.ui.constants.clientTimeout,
            token: this.auth.authInfo.token
        })
        const workspaceClient = new Workspace({
            url: this.config.services.Workspace.url,
            timeout: this.config.ui.constants.clientTimeout,
            token: this.auth.authInfo.token
        })
        const staticNarratives = await staticNarrativeClient.list_static_narratives()

        const result: Array<GetStaticNarrativesResult> = []

        for (const [index, [workspaceId, item]] of Object.entries(staticNarratives).entries()) {
            // Get static narrative info
            try {
                const workspaceInfo = await workspaceClient.get_workspace_info({ id: parseInt(workspaceId) })
                if (workspaceInfo.owner !== this.auth.authInfo.account.user) {
                    continue;
                }
                const doi = workspaceInfo.metadata['doi'] || null;
                const staticNarrativeInfo = await staticNarrativeClient.get_static_narrative_info({ ws_id: parseInt(workspaceId) });

                const workRecord = await (async () => {
                    if (doi) {
                        return this.getORCIDWorkRecord(doi);
                    }
                    return null;
                })();

                result.push({
                    staticNarrativeInfo, workspaceInfo,
                    doi,
                    workRecord
                });

            } catch (ex) {
                // TODO: get better about detecting "why" the calls failed.
                console.error('Error fetching static narrative or narrative', ex);
            }
        };


        return result;
    }

    async getORCIDWorkRecord(doi: string): Promise<Work | null> {
        const workRecords = await this.orcidLinkClient.getWorks()

        const matchingWorkRecords = workRecords.filter(({ externalIds }) => {
            return externalIds.some(({ relationship, type, value }) => {
                return (relationship === 'self' && type === 'doi' && value === doi);
            });
        });

        if (matchingWorkRecords.length === 0) {
            return null;
        }
        const workRecord = matchingWorkRecords[0].works[0];
        if (typeof workRecord === 'undefined') {
            return null;
        }

        return this.orcidLinkClient.getWork(workRecord.putCode);
    }


    async createWork(work: EditableWork): Promise<Work> {
        const newWork: NewWork = {
            title: work.title.value,
            date: work.date.value,
            workType: work.workType.value,
            journal: work.journal.value,
            url: work.url.value,
            doi: work.doi.value,
            externalIds: work.externalIds.value,
            citation: work.citation.value,
            shortDescription: work.shortDescription.value,
            selfContributor: work.selfContributor.value,
            otherContributors: work.otherContributors.value
        };

        return this.orcidLinkClient.createWork(newWork);
    }


    async saveWork(work: EditableWork): Promise<Work> {
        const temp: WorkUpdate = {
            putCode: work.putCode.value,
            workType: work.workType.value,
            title: work.title.value,
            date: work.date.value,
            journal: work.journal.value,
            url: work.url.value,
            doi: work.doi.value,
            externalIds: work.externalIds.value,
            citation: work.citation.value,
            shortDescription: work.shortDescription.value,
            selfContributor: work.selfContributor.value,
            otherContributors: work.otherContributors.value.map<Contributor>((c) => {
                return c;
            })
        };

        return this.orcidLinkClient.saveWork(temp);
    }

    async createWork2(newWork: NewWork): Promise<Work> {
        return this.orcidLinkClient.createWork(newWork);
    }

    async saveWork2(workUpdate: WorkUpdate): Promise<Work> {
        return this.orcidLinkClient.saveWork(workUpdate);
    }


    async deleteWork(putCode: string): Promise<void> {
        return this.orcidLinkClient.deleteWork(putCode);
    }

    async getEditableWork(putCode: string): Promise<EditableWork> {
        const work = await this.orcidLinkClient.getWork(putCode);
        // Filter out non-kbase work
        return workToEditableWork(work);
    }

    async getWork(putCode: string): Promise<Work> {
        const work = await this.orcidLinkClient.getWork(putCode);
        return work;
    }
}
