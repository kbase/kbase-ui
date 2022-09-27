// import { AuthenticationStateAuthenticated } from "contexts/Auth";
// import { NarrativeService } from "lib/clients/NarrativeService";
// import { digJSON, isJSONObject, JSONArray, JSONArrayOf, JSONObject } from "lib/json";
// import { ObjectInfo, objectInfoToObject, WorkspaceInfo, workspaceInfoToObject } from "lib/kb_lib/comm/coreServices/Workspace";
// import GenericClient from "lib/kb_lib/comm/JSONRPC11/GenericClient";
// import { SDKBoolean } from "lib/kb_lib/comm/types";
// import { Config } from "types/config";

import { Model } from "apps/ORCIDLink/Model";
import { ExternalId, ORCIDLinkServiceClient, Publication, Work, WorkUpdate } from "apps/ORCIDLink/ORCIDLinkClient";
import { AuthenticationStateAuthenticated } from "contexts/Auth";
import { Config } from "types/config";

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
    INITIAL = 'INITIAL',
    EDITED = 'EDITED'
}

export interface EditState<TRaw, TUpstream> {
    status: EditStatus
    validationState: ValidationState
    editValue: TRaw
    value: TUpstream
}

export interface EditableExternalId {
    type: EditState<string, string>,
    value: EditState<string, string>
    url: EditState<string, string>
    relationship: EditState<string, string>
}

// export type EditableExternalIds = EditState<Array<EditableExternalId>, Array<ExternalId>>

export interface EditablePublication {
    putCode: EditState<string, string>
    publicationType: EditState<string, string>
    title: EditState<string, string>
    date: EditState<string, string>
    journal: EditState<string, string>
    url: EditState<string, string>
    externalIds: EditState<Array<EditableExternalId>, Array<ExternalId>>
}


// MODEL

export function externalIdToEditableExternalId({ type, value, url, relationship }: ExternalId): EditableExternalId {
    return {
        type: {
            status: EditStatus.INITIAL,
            validationState: {
                status: ValidationStatus.VALID,
            },
            editValue: type,
            value: type
        },
        value: {
            status: EditStatus.INITIAL,
            validationState: {
                status: ValidationStatus.VALID,
            },
            editValue: value,
            value: value
        },
        url: {
            status: EditStatus.INITIAL,
            validationState: {
                status: ValidationStatus.VALID,
            },
            editValue: url,
            value: url
        },
        relationship: {
            status: EditStatus.INITIAL,
            validationState: {
                status: ValidationStatus.VALID,
            },
            editValue: relationship,
            value: relationship
        }
    };
}

export function initialEditableExternalId(): EditableExternalId {
    return {
        type: {
            status: EditStatus.INITIAL,
            validationState: {
                status: ValidationStatus.VALID,
            },
            editValue: '',
            value: ''
        },
        value: {
            status: EditStatus.INITIAL,
            validationState: {
                status: ValidationStatus.VALID,
            },
            editValue: '',
            value: ''
        },
        url: {
            status: EditStatus.INITIAL,
            validationState: {
                status: ValidationStatus.VALID,
            },
            editValue: '',
            value: ''
        },
        relationship: {
            status: EditStatus.INITIAL,
            validationState: {
                status: ValidationStatus.VALID,
            },
            editValue: '',
            value: ''
        }
    };
}

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

export function editablePublicationToWork(editablePublication: EditablePublication): WorkUpdate {
    const {
        putCode: {
            value: putCode
        },
        publicationType: {
            value: publicationType
        },
        title: {
            value: title
        },
        date: {
            value: date
        },
        journal: {
            value: journal
        },
        url: {
            value: url
        },
        externalIds: {
            value: externalIds
        }

    } = editablePublication;

    return {
        putCode, publicationType, title, date, journal, url,
        externalIds
    }
}

export function publicationToEditablePublication(publication: Publication): EditablePublication {
    const { putCode, publicationType, title, date, journal, url, externalIds } = publication;
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
            value: putCode
        },
        publicationType: {
            status: EditStatus.INITIAL,
            validationState: {
                status: ValidationStatus.VALID,
            },
            editValue: publicationType,
            value: publicationType
        },
        title: {
            status: EditStatus.INITIAL,
            validationState: {
                status: ValidationStatus.VALID,
            },
            editValue: title,
            value: title
        },
        date: {
            status: EditStatus.INITIAL,
            validationState: {
                status: ValidationStatus.VALID,
            },
            editValue: date,
            value: date
        },
        journal: {
            status: EditStatus.INITIAL,
            validationState: {
                status: ValidationStatus.VALID,
            },
            editValue: journal,
            value: journal
        },
        url: {
            status: EditStatus.INITIAL,
            validationState: {
                status: ValidationStatus.VALID,
            },
            editValue: url,
            value: url
        },
        externalIds: {
            status: EditStatus.INITIAL,
            validationState: {
                status: ValidationStatus.VALID,
            },
            editValue: editableExternalIds,
            value: externalIds
        },
        // publicationType,
        // title,
        // date,
        // journal: journal || '',
        // url: url || '',
        // url: externalIds || []
    }
}

export function initialEditablePublication(): EditablePublication {
    return {
        putCode: {
            status: EditStatus.INITIAL,
            validationState: {
                status: ValidationStatus.VALID,
            },
            editValue: '',
            value: ''
        },
        publicationType: {
            status: EditStatus.INITIAL,
            validationState: {
                status: ValidationStatus.VALID,
            },
            editValue: '',
            value: ''
        },
        title: {
            status: EditStatus.INITIAL,
            validationState: {
                status: ValidationStatus.VALID,
            },
            editValue: '',
            value: ''
        },
        date: {
            status: EditStatus.INITIAL,
            validationState: {
                status: ValidationStatus.VALID,
            },
            editValue: '',
            value: ''
        },
        journal: {
            status: EditStatus.INITIAL,
            validationState: {
                status: ValidationStatus.VALID,
            },
            editValue: '',
            value: ''
        },
        url: {
            status: EditStatus.INITIAL,
            validationState: {
                status: ValidationStatus.VALID,
            },
            editValue: '',
            value: ''
        },
        externalIds: {
            status: EditStatus.INITIAL,
            validationState: {
                status: ValidationStatus.VALID,
            },
            editValue: [],
            value: []
        },
        // publicationType,
        // title,
        // date,
        // journal: journal || '',
        // url: url || '',
        // url: externalIds || []
    }
}

export class PushPublicationModel {
    config: Config;
    auth: AuthenticationStateAuthenticated;
    model: Model
    orcidLinkClient: ORCIDLinkServiceClient;

    constructor({ config, auth }: { config: Config, auth: AuthenticationStateAuthenticated }) {
        this.config = config;
        this.auth = auth;
        this.model = new Model({
            config, auth
        });

        this.orcidLinkClient = new ORCIDLinkServiceClient({
            isDynamicService: true,
            url: this.config.services.ServiceWizard.url,
            timeout: 1000,
            token: auth.authInfo.token
        });
    }


    async saveWork(work: EditablePublication): Promise<Publication> {
        const temp: WorkUpdate = {
            putCode: work.putCode.value,
            title: work.title.value,
            date: work.date.value,
            publicationType: work.publicationType.value,
            journal: work.journal.value,
            url: work.url.value,
            externalIds: work.externalIds.value
        };

        // return this.model.saveWork(temp);
        return this.orcidLinkClient.saveWork(temp);
    }

    async createWork(work: EditablePublication): Promise<Publication> {
        const temp: Work = {
            title: work.title.value,
            date: work.date.value,
            publicationType: work.publicationType.value,
            journal: work.journal.value,
            url: work.url.value,
            externalIds: work.externalIds.value
        };

        const result = await this.orcidLinkClient.createWork(temp);

        return this.orcidLinkClient.getWork(result.put_code);
    }

    async deleteWork(putCode: string): Promise<void> {
        return this.orcidLinkClient.deleteWork(putCode);
    }



    async getEditableWork(putCode: string): Promise<EditablePublication> {
        const work = await this.orcidLinkClient.getWork(putCode);
        return publicationToEditablePublication(work);
    }



}
