import { AuthenticationStateAuthenticated } from "contexts/Auth";
import GenericClient from "lib/kb_lib/comm/JSONRPC11/GenericClient";
import { SDKBoolean } from "lib/kb_lib/comm/types";
import { Config } from "types/config";
import { EditableWork } from "../demos/PushWork/PushWorksModel";
// import { CSLMetadata } from "../demos/RequestDOI/steps/Citations/DOIOrgClient";
import { SCOPE } from "./constants";
import {
    DeleteWorkResult, GetNameResult, NewWork,
    ORCIDLinkServiceClient, ORCIDProfile, Work
} from "./ORCIDLinkClient";
// import CitationsForm from "./demos/RequestDOI/steps/CitationsForm";


const START_LINKING_SESSION_PATH = 'start-linking-session';

// const GET_TEMP_LINK_RECORD_PATH = 'get-temp-link';

export interface ORCIDAuth {
    scope: string
    orcid: string;
    name: string;
    expires_in: number;
}

export interface LinkRecord {
    created_at: number,
    orcid_auth: ORCIDAuth
}

export interface LinkResult {
    link: LinkRecord | null;
}

export interface LinkingSessionInfo {
    session_id: string;
    created_at: number;
    expires_at: number;
    orcid_auth: ORCIDAuth;
}


export interface ReturnLink {
    url: string;
    label: string;
}

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
            ${SCOPE_USER} have added, but will not be able to edit information added by you or \
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
            isDynamicService: true,
            url: this.config.services.ServiceWizard.url,
            timeout: 1000,
            token: auth.authInfo.token
        });
    }


    async serviceURL(): Promise<string> {
        const serviceWizard = new GenericClient({
            module: 'ServiceWizard',
            timeout: 1000,
            url: this.config.services.ServiceWizard.url
        });
        const [result] = await serviceWizard.callFunc('get_service_status', [{
            module_name: 'ORCIDLink',
            version: 'dev'
        }]) as unknown as [GetServiceStatusResult];
        return result.url;
    }

    async getProfile(): Promise<ORCIDProfile> {
        return this.orcidLinkClient.getProfile();
    }

    async isLinked(): Promise<boolean> {
        return this.orcidLinkClient.isLinked();
    }

    async getLink(): Promise<LinkRecord | null> {
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
    async startLink({ returnLink, skipPrompt }: { returnLink?: ReturnLink, skipPrompt?: boolean }) {
        const baseURL = await this.serviceURL();

        const { session_id: sessionId } = await this.orcidLinkClient.createLinkingSession();

        // Then redirect the browser to start the oauth process
        const startURL = new URL(`${baseURL}/${START_LINKING_SESSION_PATH}`);
        startURL.searchParams.set('session_id', sessionId);
        if (returnLink) {
            startURL.searchParams.set('return_link', JSON.stringify(returnLink));
        }
        if (skipPrompt) {
            startURL.searchParams.set('skip_prompt', 'true');
        }
        window.open(startURL, '_parent');
    }


    async getWork(putCode: string): Promise<Work> {
        return this.orcidLinkClient.getWork(putCode);
    }

    async createWork(work: EditableWork): Promise<Work> {
        const temp: NewWork = {
            title: work.title.value,
            date: work.date.value,
            workType: work.workType.value,
            journal: work.journal.value,
            url: work.url.value,
            externalIds: work.externalIds.value
        };
        return this.orcidLinkClient.createWork(temp);
    }

    async deleteWork(putCode: string): Promise<DeleteWorkResult> {
        return this.orcidLinkClient.deleteWork(putCode);
    }


    async getName(): Promise<GetNameResult> {
        const { lastName, firstName } = await this.orcidLinkClient.getProfile();
        return { lastName, firstName };
    }


    async fetchLinkingSessionInfo(sessionId: string) {
        return this.orcidLinkClient.getLinkingSession(sessionId);
    }

    async confirmLink(token: string) {
        return this.orcidLinkClient.finishLink(token);
    }

    async cancelLink(token: string) {
        return this.orcidLinkClient.deletelLinkingSession(token);
    }

    // async getDOICitation(doi: string) {
    //     return this.orcidLinkClient.getDOICitation(doi);
    // }
}
