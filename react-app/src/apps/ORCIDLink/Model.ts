import { AuthenticationStateAuthenticated } from "contexts/Auth";
import { NarrativeService } from "lib/clients/NarrativeService";
import { digJSON, isJSONObject, JSONArray, JSONArrayOf, JSONObject } from "lib/json";
import { ObjectInfo, objectInfoToObject, WorkspaceInfo, workspaceInfoToObject } from "lib/kb_lib/comm/coreServices/Workspace";
import GenericClient from "lib/kb_lib/comm/JSONRPC11/GenericClient";
import { SDKBoolean } from "lib/kb_lib/comm/types";
import { Config } from "types/config";
import { SCOPE } from "./constants";
import { EditablePublication } from "./demos/PushPublication/PushPublicationModel";
import { DynamicServiceClient } from "./DynamicServiceClient";
import { DOIForm, GetNameResult, ORCIDLinkServiceClient, Work, WorkUpdate } from "./ORCIDLinkClient";
// import CitationsForm from "./demos/RequestDOI/steps/CitationsForm";


const GET_PROFILE_PATH = 'get_profile';
const IS_LINKED_PATH = 'is_linked';
const GET_LINK_PATH = 'link';

const CREATE_LINKING_SESSION_PATH = 'create-linking-session';
const START_LINKING_SESSION_PATH = 'start-linking-session';
const FINISH_LINKING_SESSION_PATH = 'finish-linking-session';
const CANCEL_LINKING_SESSION_PATH = 'cancel-linking-session';
const GET_LINKING_SESSION_INFO_PATH = 'get-linking-session-info';


const LINK_PATH = 'link';
const REVOKE_PATH = 'revoke';
const GET_NAME_PATH = 'get_name';


const SAVE_DOI_APPLICATION_PATH = 'demos/save_doi_application';
const GET_DOI_APPLICATION_PATH = 'demos/get_doi_application';

const USE_DYNAMIC_SERVICE = false;

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

export interface Affiliation {
    name: string;
    role: string;
    startYear: string;
    endYear: string | null;
}

export interface ExternalId {
    type: string;
    value: string;
    url: string;
    relationship: string;
}

export interface Publication {
    putCode: string;
    createdAt: number;
    updatedAt: number;
    source: string;
    title: string;
    journal: string;
    date: string;
    publicationType: string;
    url: string;
    // citation
    citationType: string;
    citation: string;
    citationDescription: string;
    externalIds: Array<ExternalId>
}

export interface ORCIDProfile {
    // TODO: split into profile and info? E.g. id in info, profile info in profile...
    orcidId: string;
    firstName: string;
    lastName: string;
    bio: string;
    affiliations: Array<Affiliation>
    publications: Array<Publication>
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

export interface NarrativeInfo {
    objectInfo: ObjectInfo
    workspaceInfo: WorkspaceInfo
}

export interface CellBase {
    type: 'markdown' | 'app'
}

export interface CellMarkdown {
    type: 'markdown',
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
    CellApp;

export interface AppPublications {
    id: string;
    title: string;
    publications: Array<{
        text: string,
        link: string,
        doi: string | null
    }>
}




export type Citation = {
    citation: string,
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


// MODEL

export class Model {
    config: Config;
    auth: AuthenticationStateAuthenticated;
    orcidLinkClient: ORCIDLinkServiceClient;

    constructor({ config, auth }: { config: Config, auth: AuthenticationStateAuthenticated }) {
        this.config = config;
        this.auth = auth;
        this.orcidLinkClient = new ORCIDLinkServiceClient({
            url: 'https://ci.kbase.us/services/orcidlink',
            timeout: 1000,
            token: auth.authInfo.token
        });
    }


    async serviceURL(): Promise<string> {
        if (USE_DYNAMIC_SERVICE) {
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
        return `https://${this.config.deploy.services.urlBase}/services/orcidlink`;
    }

    // async dsGet(path: string, token: string) {
    //     const baseURL = await this.serviceURL();
    //     const url = `${baseURL}/${path}`
    //     return fetch(url, {
    //         headers: {
    //             authorization: token,
    //             accept: 'application/json'
    //         }
    //     });
    // }

    // async dsDelete(path: string, token: string) {
    //     const baseURL = await this.serviceURL();
    //     const url = `${baseURL}/${path}`
    //     return fetch(url, {
    //         method: 'DELETE',
    //         headers: {
    //             authorization: token
    //         }
    //     });
    // }

    // async dsPut(path: string, token: string, data: JSONObject) {
    //     const baseURL = await this.serviceURL();
    //     const url = `${baseURL}/${path}`
    //     return fetch(url, {
    //         method: 'PUT',
    //         headers: {
    //             authorization: token,
    //             'Content-Type': 'application/json'
    //         },
    //         body: JSON.stringify(data)
    //     });
    // }

    // async dsPost(path: string, token: string, data: JSONObject) {
    //     const baseURL = await this.serviceURL();
    //     const url = `${baseURL}/${path}`
    //     return fetch(url, {
    //         method: 'POST',
    //         headers: {
    //             authorization: token,
    //             'Content-Type': 'application/json'
    //         },
    //         body: JSON.stringify(data)
    //     });
    // }

    async getProfile(): Promise<ORCIDProfile> {
        return this.orcidLinkClient.getProfile();
        // const response = await this.dsGet(GET_PROFILE_PATH, this.auth.authInfo.token)
        // const response = await fetch(GET_PROFILE_URL, {
        //     headers: {
        //         authorization: this.auth.authInfo.token
        //     }
        // });

        // if (response.status !== 200) {
        //     throw new Error(`Unexpected response: ${response.status}`);
        // }

        // const result = JSON.parse(await response.text()) as GetProfileResult;
        // return result.result;
    }

    async isLinked(): Promise<boolean> {
        return this.orcidLinkClient.isLinked();
        // const response = await this.dsGet(IS_LINKED_PATH, this.auth.authInfo.token)

        // if (response.status !== 200) {
        //     throw new Error(`Unexpected response: ${response.status}`);
        // }

        // const result = JSON.parse(await response.text()) as { result: boolean };
        // return result.result;
    }

    async getLink(): Promise<LinkRecord | null> {
        return this.orcidLinkClient.getLink();
        // const response = await this.dsGet(GET_LINK_PATH, this.auth.authInfo.token)
        // const response = await fetch(`${GET_LINK_URL}`, {
        //     headers: {
        //         authorization: this.auth.authInfo.token
        //     }
        // });

        // if (response.status !== 200) {
        //     throw new Error(`Unexpected response: ${response.status}`);
        // }

        // const result = JSON.parse(await response.text()) as { link: LinkRecord | null };
        // return result.link;


        // const response = await fetch(LINK_URL, {
        //     headers: {
        //         authorization: this.props.auth.authInfo.token
        //     }
        // });

        // if (response.status !== 200) {
        //     throw new Error(`Unexpected response: ${response.status}`);
        // }

        // const { link } = JSON.parse(await response.text()) as LinkResult;
    }

    async deleteLink() {
        return this.orcidLinkClient.deleteLink();
        // const response = await this.dsDelete(REVOKE_PATH, this.auth.authInfo.token);
        // // const response = await fetch(REVOKE_URL, {
        // //     method: 'DELETE',
        // //     headers: {
        // //         authorization: this.props.auth.authInfo.token
        // //     }
        // // });

        // if (response.status !== 200) {
        //     throw new Error(`Unexpected response: ${response.status}`);
        // }

        // // this.setState({
        // //     linkState: {
        // //         status: AsyncProcessStatus.SUCCESS,
        // //         value: { link: null }
        // //     }
        // // });

        // // TODO: notification

        // // return null;
    }

    /**
     * Begins the ORCID linking journey by redirecting to the ORCIDLink service "/start" 
     * endpoint, optionally carrying a "return link" and/or "skip prompt" flag.
     * @param returnLink An object containing a link and label property
     * @param skipPrompt A boolean flag indicating whether to prompt to confirm linking afterwards
     */
    async startLink({ returnLink, skipPrompt }: { returnLink?: ReturnLink, skipPrompt?: boolean }) {
        const baseURL = await this.serviceURL();

        // // First create a linking session.
        // const createURL = new URL(`${baseURL}/${CREATE_LINKING_SESSION_PATH}`);
        // const response = await fetch(createURL, {
        //     method: 'POST',
        //     headers: {
        //         Authorization: this.auth.authInfo.token,
        //         Accept: 'application/json',
        //         'Content-Type': 'application/json'
        //     }
        // });

        // // TODO handle errors.

        // const result = await response.json() as unknown as {
        //     session_id: string
        // };

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


    async getWork(putCode: string): Promise<Publication> {
        return this.orcidLinkClient.getWork(putCode);
        // const response = await this.dsGet(`${GET_WORK_PATH}/${putCode}`, this.auth.authInfo.token)
        // // const response = await fetch(`${GET_WORK_URL}/${putCode}`, {
        // //     headers: {
        // //         authorization: this.auth.authInfo.token
        // //     }
        // // });

        // if (response.status !== 200) {
        //     throw new Error(`Unexpected response: ${response.status}`);
        // }

        // const result = JSON.parse(await response.text()) as { result: Publication };
        // return result.result;
    }

    // async saveWork(work: EditablePublication): Promise<Publication> {
    //     const temp: WorkUpdate = {
    //         putCode: work.putCode.value,
    //         title: work.title.value,
    //         date: work.date.value,
    //         publicationType: work.publicationType.value,
    //         journal: work.journal.value,
    //         url: work.url.value,
    //         externalIds: work.externalIds.value
    //     };

    //     return this.orcidLinkClient.saveWork(temp);

    //     // const response = await this.dsPut(SAVE_WORK_PATH, this.auth.authInfo.token, temp)

    //     // // const response = await fetch(SAVE_WORK_URL, {
    //     // //     method: 'PUT',
    //     // //     headers: {
    //     // //         Authorization: this.auth.authInfo.token,
    //     // //         'Content-Type': 'application/json'
    //     // //     },
    //     // //     body: JSON.stringify(temp)
    //     // // });

    //     // if (response.status !== 200) {
    //     //     throw new Error(`Unexpected response: ${response.status}`);
    //     // }

    //     // const result = JSON.parse(await response.text()) as { result: Publication };
    //     // return result.result;
    // }

    async createWork(work: EditablePublication): Promise<Publication> {
        const temp: Work = {
            title: work.title.value,
            date: work.date.value,
            publicationType: work.publicationType.value,
            journal: work.journal.value,
            url: work.url.value,
            externalIds: work.externalIds.value
        };

        return this.orcidLinkClient.createWork(temp);

        // const response = await fetch(CREATE_WORK_URL, {
        //     method: 'POST',
        //     headers: {
        //         Authorization: this.auth.authInfo.token,
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify(temp)
        // });

        // if (response.status !== 200) {
        //     throw new Error(`Unexpected response: ${response.status}`);
        // }

        // const result = JSON.parse(await response.text()) as { result: Publication };
        // return result.result;
    }

    async deleteWork(putCode: string): Promise<void> {
        return this.orcidLinkClient.deleteWork(putCode);
        // const response = await this.dsDelete(`${DELETE_WORK_PATH}/${putCode}`, this.auth.authInfo.token)
        // const response = await fetch(`${DELETE_WORK_URL}/${putCode}`, {
        //     method: 'DELETE',
        //     headers: {
        //         Authorization: this.auth.authInfo.token,
        //         'Content-Type': 'application/json'
        //     }
        // });
        // if (response.status !== 200) {
        //     throw new Error(`Unexpected response: ${response.status}`);
        // }
        // return;
    }

    // publicationToEditablePublication(publication: Publication): EditablePublication {
    //     const { putCode, publicationType, title, date, journal, url, externalIds } = publication;
    //     return {
    //         putCode,
    //         publicationType, title, date, journal: journal || '', url: url || '',
    //         externalIds: externalIds || []
    //     }
    // }

    // async getEditableWork(putCode: string): Promise<EditablePublication> {
    //     const work = await this.getWork(putCode);
    //     return this.publicationToEditablePublication(work);
    // }

    async fetchNarratives({ from, to }: { from: number, to: number }): Promise<Array<NarrativeInfo>> {
        const client = new NarrativeService({
            url: this.config.services.ServiceWizard.url,
            timeout: 1000,
            token: this.auth.authInfo.token
        });
        const result = await client.list_narratives({ type: 'mine' })

        return result.narratives
            .map(({ nar, ws }) => {
                const objectInfo = objectInfoToObject(nar);
                const workspaceInfo = workspaceInfoToObject(ws);
                return { objectInfo, workspaceInfo };
            })
            .filter(({ objectInfo, workspaceInfo }) => {
                return (workspaceInfo.globalread === 'r');
            })
            .sort((a, b) => {
                return -(a.objectInfo.saveDate.localeCompare(b.objectInfo.saveDate));
            });
        // .map(({ objectInfo, workspaceInfo }) => {
        //     const { id: workspaceId, version } = objectInfo;
        //     const { metadata } = workspaceInfo;
        //     return {
        //         workspaceId,
        //         version,
        //         title: metadata['narrative_nice_name']!
        //     }
        // });


        // const narratives: Array<NarrativeInfo> = [];
        // return narratives;
    }

    async getName(): Promise<GetNameResult> {
        return this.orcidLinkClient.getName();
        // const response = await this.dsGet(GET_NAME_PATH, this.auth.authInfo.token);
        // // const response = await fetch(GET_NAME_URL, {
        // //     headers: {
        // //         authorization: this.props.auth.authInfo.token
        // //     }
        // // });

        // if (response.status !== 200) {
        //     throw new Error(`Unexpected response: ${response.status}`);
        // }

        // const result = JSON.parse(await response.text()) as { result: GetNameResult };
        // return result.result;
    }

    async getNarrativeCitations(narrativeObjectRef: string): Promise<{
        narrativeAppCitations: NarrativeAppCitations,
        markdownCitations: Array<Citation>
    }> {
        // get apps from narrative
        const client = new GenericClient({
            module: 'Workspace',
            url: this.config.services.Workspace.url,
            timeout: 1000,
            token: this.auth.authInfo.token
        });

        // Sorry, untyped for now...
        const [result] = await client.callFunc<JSONArrayOf<JSONObject>, JSONArrayOf<JSONObject>>('get_objects2', [
            {
                "objects": [
                    {
                        "ref": narrativeObjectRef,
                        "included": [
                            "cells/[*]/cell_type",
                            "cells/[*]/metadata/kbase/appCell/app/id",
                            "cells/[*]/metadata/kbase/appCell/app/tag",
                            "cells/[*]/metadata/kbase/appCell/app/version",
                            "cells/[*]/metadata/kbase/appCell/app/gitCommitHash",
                            "cells/[*]/source"
                        ]
                    }
                ]

            }
        ]);

        const cells = (digJSON(result, ['data', 0, 'data', 'cells']) as Array<any>).map((cell) => {
            switch (cell['cell_type']) {
                case 'code':
                    if ('appCell' in cell['metadata']['kbase']) {
                        return {
                            type: 'app',
                            id: cell['metadata']['kbase']['appCell']['app']['id'],
                            tag: cell['metadata']['kbase']['appCell']['app']['tag'],
                            version: cell['metadata']['kbase']['appCell']['app']['version'],
                            gitCommitHash: cell['metadata']['kbase']['appCell']['app']['gitCommitHash']
                        }
                    }
                    break;
                case 'markdown':
                    return {
                        type: 'markdown',
                        content: cell['source']
                    }
            }
            return null;
        })
            .filter((cell) => {
                return cell !== null;
            }) as Array<Cell>;


        // Get app citations.


        /*
            Not sure this is worth it, but mirror the static narrative behavior.
            By the time the narrative is published, it is possible that a release or beta
            app will have been updated, so there is not a great reason to be precise about
            fetching by the tag, rather than the most released.
            Much better would be to be able to get method info via the git commit hash,
            or the actual version (if version bumps are really enforced, not sure about that)
        */
        // Get all the tags in all the app cells.
        // collect unique app ids across all app cells.

        const apps: Array<CellApp> = [];
        for (const cell of cells) {
            if (cell.type === 'app') {
                apps.push(cell);
            }
        }

        const tags = apps.reduce<{ [k: string]: Set<string> }>((tags, cell) => {
            if (cell.tag in tags) {
                tags[cell.tag].add(cell.id);
            } else {
                tags[cell.tag] = new Set();
                tags[cell.tag].add(cell.id);
            }
            return tags;
        }, {});

        const nms = new GenericClient({
            module: 'NarrativeMethodStore',
            url: this.config.services.NarrativeMethodStore.url,
            timeout: 1000,
            token: this.auth.authInfo.token
        });

        const narrativeAppCitations: NarrativeAppCitations = {
            release: [],
            beta: [],
            dev: []
        };

        const appTags: Array<keyof NarrativeAppCitations> = ['release', 'beta', 'dev']
        for (const tag of appTags) {
            if (tag in tags) {

                const ids = Array.from(tags[tag]);
                const appsInfo = await nms.callFunc('get_method_full_info', [{
                    ids,
                    tag
                }]);
                const appPublications = (appsInfo[0] as unknown as JSONArray).map((appInfo) => {
                    if (!isJSONObject(appInfo)) {
                        throw new Error('Not an object');
                    }
                    const citations = (() => {
                        const publications = appInfo['publications'];
                        if (publications instanceof Array) {
                            return publications.map<Citation>((publication) => {
                                if (!isJSONObject(publication)) {
                                    throw new Error('Publication not object!')
                                }
                                const { display_text: text, link } = publication;
                                const m = /doi:([\S]+)/.exec(text as string);
                                const doi = m ? m[1] : null;
                                return {
                                    citation: (text as unknown as string).trim() as string,
                                    link: link as string,
                                    doi: doi as string | null
                                }
                            });
                        } else {
                            return [];
                        }
                    })();
                    return {
                        id: appInfo['id'] as string,
                        title: appInfo['name'] as string,
                        citations
                    };
                });
                narrativeAppCitations[tag] = appPublications;
            }
        }

        // extract dois from markdown cells

        // extract dois from app publications
        const markdownCitations: Array<Citation> = [];
        for (const cell of cells) {
            if (cell.type === 'markdown') {
                const mardownLines = (cell.content as string).split(/(?:(?:\n\n)|(?:  \n)|(?:\n\s*[-*]\s*))/)
                    .filter((line) => {
                        return (line.trim().length > 0);
                    });
                if (mardownLines[0].match(/references/i)) {
                    const citations = mardownLines.slice(1).forEach((line) => {
                        // remove any leading - or * if a list.
                        const citation = (() => {
                            const m = line.match(/^\s*[-*]*\s*(.*)$/);
                            if (m) {
                                return m[m.length - 1]
                            }
                            return line;
                        })();
                        const doi = (() => {
                            const m = citation.match(/doi:\s*(\S+)/)
                            if (m) {
                                return m[1];
                            }
                            return null;
                        })();
                        markdownCitations.push({
                            citation,
                            doi
                        });
                    });
                }
            }
        }

        return { narrativeAppCitations, markdownCitations };
    }

    async saveDOIForm(doiForm: DOIForm): Promise<boolean> {
        return this.orcidLinkClient.saveDOIApplication(doiForm);
        // const response = await this.dsPost(SAVE_DOI_APPLICATION_PATH, this.auth.authInfo.token, doiForm as unknown as JSONObject)

        // if (response.status !== 200) {
        //     throw new Error(`Unexpected response: ${response.status}`);
        // }

        // const result = JSON.parse(await response.text()) as { result: boolean };
        // return result.result;
    }

    async getDOIForm(formId: string): Promise<DOIForm> {
        return this.orcidLinkClient.getDOIApplication(formId);
        // const response = await this.dsGet(`${GET_DOI_APPLICATION_PATH}/${formId}`, this.auth.authInfo.token)

        // // const response = await fetch(`${GET_DOI_APPLICATION_URL}/${formId}`, {
        // //     headers: {
        // //         authorization: this.auth.authInfo.token
        // //     }
        // // });

        // if (response.status !== 200) {
        //     throw new Error(`Unexpected response: ${response.status}`);
        // }

        // const result = JSON.parse(await response.text()) as { result: DOIForm };
        // return result.result;
    }

    // async extractCitationsFromNarrativeApps(objectInfo: ObjectInfo) {
    //     // get apps from narrative
    //     const client = new GenericClient({
    //         module: 'Workspace',
    //         url: this.config.services.Workspace.url,
    //         timeout: 1000,
    //         token: this.auth.authInfo.token
    //     });
    //     const [result] = await client.callFunc('get_objects2', [
    //         {
    //             "objects": [
    //                 {
    //                     "ref": objectInfo.ref,
    //                     "included": [
    //                         "cells"
    //                     ]
    //                 }
    //             ]

    //         }
    //     ]);



    //     // done.

    // }

    // async extractCitationsFromNarrativeMarkdown() {

    // }

    // async getStaticNarrative(staticNarrativeId: string) {
    //     const client = new StaticNarrative({
    //         url: this.config.services.ServiceWizard.url,
    //         timeout: 10000,
    //         token: this.auth.authInfo.token
    //     });
    //     return client.get_static_narrative_info(static)
    // }


    async fetchLinkingSessionInfo(sessionId: string) {
        return this.orcidLinkClient.getLinkingSessionInfo(sessionId);
        // const response = await this.dsGet(`${GET_LINKING_SESSION_INFO_PATH}/${sessionId}`, this.auth.authInfo.token)
        // if (response.status !== 200) {
        //     throw new Error(`Unexpected response: ${response.status}`);
        // }

        // const rawResult = await response.text();
        // return JSON.parse(rawResult);
    }

    async confirmLink(token: string) {
        return this.orcidLinkClient.finishLink(token);
        // const response = await this.dsGet(`${FINISH_LINKING_SESSION_PATH}/${token}`, this.auth.authInfo.token);
        // if (response.status !== 200) {
        //     throw new Error(`Unexpected response: ${response.status}`);
        // }
    }

    async cancelLink(token: string) {
        return this.orcidLinkClient.cancelLink(token);
        // const response = await this.dsGet(`${CANCEL_LINKING_SESSION_PATH}/${token}`, this.auth.authInfo.token);

        // if (response.status !== 200) {
        //     throw new Error(`Unexpected response: ${response.status}`);
        // }
    }


}
