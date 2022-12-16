import { toJSON } from "lib/kb_lib/jsonLike";
import { MultiServiceClient } from "./DynamicServiceClient";
import { LinkingSessionInfo, LinkRecord } from "./Model";


const WORKS_PATH = 'works';


const GET_PROFILE_PATH = 'orcid/profile';
const GET_LINK_PATH = 'link';

const LINKING_SESSIONS_PATH = 'linking-sessions';
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

export interface ReturnLink {
    url: string;
    label: string;
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
        return this.get<boolean>(`${GET_LINK_PATH}/is_linked`)
    }

    async getDocURL(): Promise<string> {
        const url = await this.getURL();
        return `${url}/docs`;
    }

    async getLink(): Promise<LinkRecord> {
        return await this.get<LinkRecord>(`${GET_LINK_PATH}`)
    }

    async deleteLink(): Promise<void> {
        return await this.delete(`${LINK_PATH}`)
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

    async deleteWork(putCode: string): Promise<void> {
        return await this.delete(`${WORKS_PATH}/${putCode}`);
    }

    // Linking Sessions

    async createLinkingSession(): Promise<CreateLinkingSessionResult> {
        return await this.post<CreateLinkingSessionResult>(`${LINKING_SESSIONS_PATH}`)
    }

    async startLinkingSession(sessionId: string, returnLink?: ReturnLink, skipPrompt?: boolean): Promise<void> {
        const baseURL = await this.getURL();
        const startURL = new URL(`${baseURL}/${LINKING_SESSIONS_PATH}/${sessionId}/start`);
        // startURL.searchParams.set('session_id', sessionId);
        if (returnLink) {
            startURL.searchParams.set('return_link', JSON.stringify(returnLink));
        }
        if (skipPrompt) {
            startURL.searchParams.set('skip_prompt', 'true');
        }
        window.open(startURL, '_parent');
    }

    async getLinkingSession(sessionId: string): Promise<LinkingSessionInfo> {
        return await this.get<LinkingSessionInfo>(`${LINKING_SESSIONS_PATH}/${sessionId}`)
    }

    async deletelLinkingSession(token: string): Promise<void> {
        return await this.delete(`${LINKING_SESSIONS_PATH}/${token}`);
    }

    // Not REST?

    async finishLink(sessionId: string): Promise<void> {
        return await this.put<void>(`${LINKING_SESSIONS_PATH}/${sessionId}/finish`);
    }


}

