import { toJSON } from "lib/kb_lib/jsonLike";
import { MultiServiceClient } from "./DynamicServiceClient";
import { LinkingSessionInfo, LinkRecord } from "./Model";


const WORKS_PATH = 'works';


const GET_PROFILE_PATH = 'profile';
const IS_LINKED_PATH = 'is_linked';
const GET_LINK_PATH = 'link';

const LINKING_SESSIONS_PATH = 'linking-sessions';
const START_LINKING_SESSION_PATH = 'start-linking-session';
const FINISH_LINKING_SESSION_PATH = 'finish-linking-session';

const LINK_PATH = 'link';

// ORCID User Profile (our version)


export interface Affiliation {
    name: string;
    role: string;
    startYear: string;
    endYear: string | null;
}


export interface ORCIDProfile {
    // TODO: split into profile and info? E.g. id in info, profile info in profile...
    orcidId: string;
    firstName: string;
    lastName: string;
    bio: string;
    affiliations: Array<Affiliation>
    works: Array<Work>
    emailAddresses: Array<string>
}

// 

export interface CreateLinkingSessionResult {
    session_id: string
}

// ORCID User Profile (our version)
export interface ExternalId {
    type: string;
    value: string;
    url: string;
    relationship: string;
}

export interface NewWork {
    title: string;
    journal: string;
    date: string;
    workType: string;
    url: string;
    externalIds: Array<ExternalId>
}

export interface Work extends NewWork {
    putCode: string;
    createdAt: number;
    updatedAt: number;
    source: string;
}

export interface WorkUpdate extends NewWork {
    putCode: string;
}

export interface Work extends NewWork {
    putCode: string;
    createdAt: number;
    updatedAt: number;
    source: string;
}

export interface WorkUpdate extends NewWork {
    putCode: string;
}

export interface GetNameResult {
    firstName: string;
    lastName: string;
}


export interface ORCIDLinkResult {
    orcidLink: {
        orcidId: string | null
    }
}


export interface DeleteWorkResult {
    ok: true
}

export interface JournalAbbreviation {
    title: string;
    abbreviation: string
}

export interface GetDOICitationResult {
    citation: string;
}

// export interface GetDOIMetadata {
//     metadata: CSLMetadata
// }

export class ORCIDLinkServiceClient extends MultiServiceClient {
    module = 'ORCIDLink';

    async getProfile(): Promise<ORCIDProfile> {
        return await this.get<ORCIDProfile>(`${GET_PROFILE_PATH}`)
    }

    async isLinked(): Promise<boolean> {
        return this.get<boolean>(`${GET_LINK_PATH}`)
    }

    async getLink(): Promise<LinkRecord | null> {
        return await this.get<LinkRecord | null>(`${GET_LINK_PATH}`)
    }

    async deleteLink(): Promise<LinkRecord | null> {
        return await this.delete<LinkRecord | null>(`${LINK_PATH}`)
    }

    // ORICD Account works

    async getWork(putCode: string): Promise<Work> {
        return await this.get<Work>(`${WORKS_PATH}/${putCode}`)
    }

    async saveWork(work: WorkUpdate): Promise<Work> {
        return await this.put<Work>(`${WORKS_PATH}`, toJSON(work))
    }

    async createWork(work: NewWork): Promise<Work> {
        return await this.post<Work>(`${WORKS_PATH}`, toJSON(work))
    }

    async deleteWork(putCode: string): Promise<DeleteWorkResult> {
        return await this.delete<DeleteWorkResult>(`${WORKS_PATH}/${putCode}`);
    }


    // Linking Sessions

    async createLinkingSession(): Promise<CreateLinkingSessionResult> {
        return await this.post<CreateLinkingSessionResult>(`${LINKING_SESSIONS_PATH}`)
    }

    async getLinkingSession(sessionId: string): Promise<LinkingSessionInfo> {
        return await this.get<LinkingSessionInfo>(`${LINKING_SESSIONS_PATH}/${sessionId}`)
    }

    async deletelLinkingSession(token: string): Promise<void> {
        return await this.delete<void>(`${LINKING_SESSIONS_PATH}/${token}`);
    }

    // Not REST?

    async finishLink(sessionId: string): Promise<void> {
        return await this.post<void>(FINISH_LINKING_SESSION_PATH, {
            session_id: sessionId
        });
    }


}

