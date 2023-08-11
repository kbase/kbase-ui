import { AuthenticationStateAuthenticated } from "contexts/Auth";
import { SDKBoolean } from "lib/kb_lib/comm/types";
import { Config } from "types/config";
// import { CSLMetadata } from "../demos/RequestDOI/steps/Citations/DOIOrgClient";
import UserProfileClient from "lib/kb_lib/comm/coreServices/UserProfile2";
import { hasOwnProperty } from "lib/utils";
import {
    GetNameResult,
    InfoResponse, LinkRecord, ORCIDAuth,
    ORCIDLinkServiceClient, ORCIDProfile, ReturnInstruction, Work
} from "./ORCIDLinkClient";
import { SCOPE } from "./constants";
// import CitationsForm from "./demos/RequestDOI/steps/CitationsForm";


// const START_LINKING_SESSION_PATH = 'start-linking-session';

// const GET_TEMP_LINK_RECORD_PATH = 'get-temp-link';

/*
{
    "kind": "complete",
    "session_id": "cc40bfdb-de2c-44ef-a449-35292b2d4a90",
    "username": "eapearson",
    "created_at": 1675900173092,
    "expires_at": 1675900773092,
    "return_link": null,
    "skip_prompt": "false",
    "orcid_auth": {
        "name": "Erik Pearson",
        "scope": "/read-limited openid /activities/update",
        "expires_in": 631138518,
        "orcid": "0000-0003-4997-3076"
    }
}
*/


export interface LinkResult {
    link: LinkRecord | null;
}

export type LinkingSesssionType = 'initial' | 'started' | 'complete';

export interface LinkingSessionBase {
    kind: LinkingSesssionType;
    session_id: string;
    username: string;
    created_at: number;
    expires_at: number;
}


// TODO: this is not correct - there are three types of linking session info, with "kind" for discrimination
export interface LinkingSessionInitial extends LinkingSessionBase {
    // kind: 'initial'
}

// TODO: this is not correct - there are three types of linking session info, with "kind" for discrimination
export interface LinkingSessionStarted extends LinkingSessionBase {
    // kind: 'started';
    return_link: string;
    skip_prompt: boolean;
}

// TODO: this is not correct - there are three types of linking session info, with "kind" for discrimination
export interface LinkingSessionComplete extends LinkingSessionBase {
    // kind: 'complete'
    return_link: string;
    skip_prompt: boolean;
    orcid_auth: ORCIDAuth;
}

// export type LinkingSession = LinkingSessionInitial | LinkingSessionStarted | LinkingSessionComplete

// ORCID Link step

const SCOPE_USER = 'KBase';

export const SCOPE_HELP: { [K in SCOPE]: { label: string, orcid: { label: string, tooltip: string }, help: Array<string> } } = {
    'openid': {
        label: 'Open ID',
        orcid: {
            label: `Allow ${SCOPE_USER} to get your ORCID® iD.`,
            tooltip: `Allow ${SCOPE_USER} to get your 16-character ORCID® ID and read information on your ORCID® record you have marked as public.`
        },
        help: [
            'KBase uses this when you sign in to KBase via ORCID®'
        ]
    },
    '/read-limited': {
        label: 'Read Limited',
        orcid: {
            label: `Allow ${SCOPE_USER} to read your information with visibility set to Trusted Organizations.`,
            tooltip: `Allow ${SCOPE_USER} to read any information from your record you have marked as \
            limited access. ${SCOPE_USER} cannot read information you have marked as private.`
        },
        help: [
            'KBase uses this to pre-fill certain forms with information in your ORCID® profile'
        ]
    },
    '/activities/update': {
        label: 'Update Activities',
        orcid: {
            label: `Allow ${SCOPE_USER} to add/update your research activities (works, affiliations, etc).`,
            tooltip: `Allow ${SCOPE_USER} to add information about your research activites \
            (for example, works, affiliations) that is stored in the ${SCOPE_USER} system(s) to your \
            ORCID record. ${SCOPE_USER} will also be able to update this and any other information \
            ${SCOPE_USER} has added, but will not be able to edit information added by you or \
            any other trusted organization.`
        },
        help: [
            'KBase uses this to assist you in linking published Narratives to your ORCID® account.'
        ]
    }
}

export type GetProfileResult = {
    result: ORCIDProfile
};


export interface CellBase {
    type: 'markdown' | 'app' | 'code'
}

export interface CellMarkdown {
    type: 'markdown',
    content: string
}

export interface CellCode {
    type: 'code',
    content: string
}

export interface CellApp {
    type: 'app',
    id: string,
    tag: string,
    version: string,
    gitCommitHash: string
}

export type Cell =
    CellMarkdown |
    CellApp |
    CellCode;

export interface AppPublications {
    id: string;
    title: string;
    publications: Array<{
        text: string,
        link: string,
        doi: string | null
    }>
}


export type CitationSource = 'app' | 'markdown' | 'manual';

export type Citation = {
    citation: string,
    source: CitationSource,
    url?: string,
    doi?: string | null
}

export interface AppCitations {
    id: string;
    title: string;
    citations: Array<Citation>;
}

export interface NarrativeAppCitations {
    release: Array<AppCitations>;
    beta: Array<AppCitations>;
    dev: Array<AppCitations>;
}

export interface Citations {
    narrativeAppCitations: NarrativeAppCitations
    markdownCitations: Array<Citation>
    manualCitations: Array<Citation>
}



// This is why having canned clients, even if relatively simply wrappers around
// GenericClient, is so nice:
export type AppTag = 'dev' | 'beta' | 'release';
export interface GetServiceStatusResult {
    git_commit_hash: string;
    status: string;
    version: string;
    hash: string;
    release_tags: Array<AppTag>
    url: string;
    module_name: string;
    health: string;
    up: SDKBoolean;
}

export interface ORCIDLinkInfo {
    createdAt: number;
    expiresAt: number;
    realname: string;
    orcidID: string;
    scope: string;
}


export interface JournalAbbreviationsMap {
    [title: string]: Array<string>
}

// MODEL

export class Model {
    config: Config;
    auth: AuthenticationStateAuthenticated;
    orcidLinkClient: ORCIDLinkServiceClient;

    constructor({ config, auth }: { config: Config, auth: AuthenticationStateAuthenticated }) {
        this.config = config;
        this.auth = auth;
        this.orcidLinkClient = new ORCIDLinkServiceClient({
            url: this.config.services.ORCIDLink.url,
            timeout: 1000,
            token: auth.authInfo.token
        });
    }

    async getInfo(): Promise<InfoResponse> {
        return this.orcidLinkClient.getInfo();
    }

    async getProfile(): Promise<ORCIDProfile> {
        return this.orcidLinkClient.getProfile();
    }

    async isLinked(): Promise<boolean> {
        return this.orcidLinkClient.isLinked();
    }

    async getDocURL(): Promise<string> {
        return this.orcidLinkClient.getDocURL();
    }

    async getLink(): Promise<LinkRecord> {
        return this.orcidLinkClient.getLink();
    }

    async deleteLink() {
        return this.orcidLinkClient.deleteLink();
    }

    /**
     * Begins the ORCID linking journey by redirecting to the ORCIDLink service "/start" 
     * endpoint, optionally carrying a "return link" and/or "skip prompt" flag.
     * @param returnLink An object containing a link and label property
     * @param skipPrompt A boolean flag indicating whether to prompt to confirm linking afterwards
     */
    async startLink({ returnInstruction, skipPrompt, uiOptions }: { returnInstruction?: ReturnInstruction, skipPrompt?: boolean, uiOptions?: string }) {
        const { session_id: sessionId } = await this.orcidLinkClient.createLinkingSession();

        // Then redirect the browser to start the oauth process
        this.orcidLinkClient.startLinkingSession(sessionId, returnInstruction, skipPrompt, uiOptions)
    }


    async getWork(putCode: string): Promise<Work> {
        return this.orcidLinkClient.getWork(putCode);
    }

    // async createWork(work: EditableWork): Promise<Work> {
    //     const temp: NewWork = {
    //         title: work.title.value,
    //         date: work.date.value,
    //         workType: work.workType.value,
    //         journal: work.journal.value,
    //         url: work.url.value,
    //         doi: work.doi.value,
    //         externalIds: work.externalIds.value,
    //         citation: work.citation.value,
    //         shortDescription: work.shortDescription.value,
    //         selfContributor: work.selfContributor.value,
    //         otherContributors: work.contributors.value
    //     };
    //     return this.orcidLinkClient.createWork(temp);
    // }

    // async deleteWork(putCode: string): Promise<void> {
    //     return this.orcidLinkClient.deleteWork(putCode);
    // }

    async getName(): Promise<GetNameResult> {
        const { lastName, firstName } = await this.orcidLinkClient.getProfile();
        return { lastName, firstName };
    }

    async fetchLinkingSession(sessionId: string) {
        return this.orcidLinkClient.getLinkingSession(sessionId);
    }

    async confirmLink(token: string) {
        return this.orcidLinkClient.finishLink(token);
    }

    async cancelLink(token: string) {
        return this.orcidLinkClient.deletelLinkingSession(token);
    }

    async removeShowORCIDIdPreference() {
        const { services: { UserProfile: { url } }, ui: { constants: { clientTimeout: timeout } } } = this.config;
        const { authInfo: { token, tokenInfo: { user: username } } } = this.auth;

        const client = new UserProfileClient({
            url, token, timeout
        });

        const [{ user, profile: { preferences } }] = await client.get_user_profile([username]);

        if (!preferences) {
            return;
        }

        if (!hasOwnProperty(preferences, 'showORCIDId')) {
            return;
        }

        delete preferences.showORCIDId;

        const profileUpdate = {
            user,
            profile: {
                preferences
            }
        }

        await client.update_user_profile({ profile: profileUpdate });
    }

    async setShowORCIDIdPreference(showInProfile: boolean) {
        const { services: { UserProfile: { url } }, ui: { constants: { clientTimeout: timeout } } } = this.config;
        const { authInfo: { token, tokenInfo: { user: username } } } = this.auth;

        const client = new UserProfileClient({
            url, token, timeout
        });

        const [{ user, profile: { preferences: rawPreferences } }] = await client.get_user_profile([username]);

        const preferences = rawPreferences || {};

        if (hasOwnProperty(preferences, 'showORCIDId')) {
            preferences.showORCIDId = {
                ...preferences.showORCIDId,
                value: showInProfile,
                updatedAt: Date.now()
            }
        } else {
            preferences.showORCIDId = {
                value: showInProfile,
                createdAt: Date.now(),
                updatedAt: Date.now()
            }
        }

        const profileUpdate = {
            user,
            profile: {
                preferences
            }
        }

        await client.update_user_profile({ profile: profileUpdate });
    }

    // async getDOICitation(doi: string) {
    //     return this.orcidLinkClient.getDOICitation(doi);
    // }
}
