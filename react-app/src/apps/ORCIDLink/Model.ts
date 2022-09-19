import { AuthenticationStateAuthenticated } from "contexts/Auth";
import { NarrativeService } from "lib/clients/NarrativeService";
import { digJSON, isJSONObject, JSONArray, JSONArrayOf, JSONObject } from "lib/json";
import { ObjectInfo, objectInfoToObject, WorkspaceInfo, workspaceInfoToObject } from "lib/kb_lib/comm/coreServices/Workspace";
import GenericClient from "lib/kb_lib/comm/JSONRPC11/GenericClient";
import { SDKBoolean } from "lib/kb_lib/comm/types";
import { Config } from "types/config";
// import CitationsForm from "./demos/RequestDOI/steps/CitationsForm";


const GET_PROFILE_PATH = 'get_profile';
const IS_LINKED_PATH = 'is_linked';
const GET_LINK_PATH = 'link';
const GET_WORK_PATH = 'get_work';
const SAVE_WORK_PATH = 'save_work';
const CREATE_WORK_PATH = 'create_work';
const DELETE_WORK_PATH = 'elete_work';

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

const USE_DYNAMIC_SERVICE = true;

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

// export interface TempLinkRecord {
//     token: string;
//     created_at: number;
//     expires_at: number;
//     orcid_auth: ORCIDAuth;
// }

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

export interface EditablePublication {
    putCode: string;
    publicationType: string;
    title: string;
    date: string;
    journal: string;
    url: string;
    externalIds: Array<ExternalId>
}

export interface EditableExternalIds {
    externalIds: Array<ExternalId>
}

export interface ReturnLink {
    url: string;
    label: string;
}

/*
{
            "orcid_auth": {
                "access_token": "6882fc5b-1185-434f-a309-e364f21a3f9c",
                "token_type": "bearer",
                "refresh_token": "7cb48f8b-f685-4948-9443-2874b2fb2fd3",
                "expires_in": 631138518,
                "scope": "/read-limited openid /activities/update",
                "name": "Erik Pearson",
                "orcid": "0000-0003-4997-3076",
                "id_token": "eyJraWQiOiJzYW5kYm94LW9yY2lkLW9yZy0zaHBnb3NsM2I2bGFwZW5oMWV3c2dkb2IzZmF3ZXBvaiIsImFsZyI6IlJTMjU2In0.eyJhdF9oYXNoIjoiSlJpVjVZVGNmSUdnV3ZuUkpsQklOQSIsImF1ZCI6IkFQUC1SQzNQTTNLU01NVjNHS1dTIiwic3ViIjoiMDAwMC0wMDAzLTQ5OTctMzA3NiIsImF1dGhfdGltZSI6MTY1OTAzMzMyOSwiYW1yIjoicHdkIiwiaXNzIjoiaHR0cHM6XC9cL3NhbmRib3gub3JjaWQub3JnIiwiZXhwIjoxNjU5MTE5NzMwLCJnaXZlbl9uYW1lIjoiRXJpayIsImlhdCI6MTY1OTAzMzMzMCwiZmFtaWx5X25hbWUiOiJQZWFyc29uIiwianRpIjoiMjJhOWRmOGYtN2E0ZC00N2RmLTk3NjItNzNkZDVjZjhmZWNkIn0.FaH1s2Wl6TV5I7y1AKNgt4w2lpYMXbDild4qd8Vnovg5l20oXc7HhgrwcpJj_nwJUGKe80PWetzD5tQ6Ayq-eUOnLMIEkLreCLCSjg2UiBiI5O0Y2fTu43dFKSBK6zmiYcbOSj6WeFC7-537OpF9d2oNEjqDREU_1eyXJ9GZFXS8apRGPgcqAGHq1nSH2c12MkFbg_IZPwUU0zsmrxLWCo7i_g_wc-GePMA9a2gu-kLaY-1kmQlvOm17GSaDoJR3dOMR2dOLuR6Zn8dcWv28xZi33jsrQcgLpSX6UsyAJyLdYV-JQNBGlbPKSd_7ab9mEMWoOtjYTPmONvDJbMcjPw"
            },
            "created_at": 1659033343893
        }
*/


export interface NarrativeSelectionResult {
    narrativeInfo: MinimalNarrativeInfo
}

export interface MinimalNarrativeInfo {
    ref: string,
    title: string
}

export interface Author {
    firstName: string;
    middleName: string;
    lastName: string;
    emailAddress: string;
    orcidId: string;
    institution: string;
}

// ORCID Link step

export interface ORCIDLinkResult {
    orcidLink: {
        orcidId: string | null
    }
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

// In the end, all we can use for citations are
// the DOI.
export interface CitationResults {
    citations: Array<string>
}

export const ORCID_URL = 'https://sandbox.orcid.org';

export type SCOPE = '/read-limited' | '/activities/update' | 'openid';

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

export interface ContractNumbersResults {
    contractNumbers: ContractNumbers
}

export interface ContractNumbers {
    doe: Array<string>;
    other: Array<string>
}

// GEOLOCATION

export interface GeolocationDataResults {
    geolocationData: GeolocationData;
}

export enum LocationType {
    POINT = 'POINT',
    POLYGON = 'POLYGON',
    BOUNDING_BOX = 'BOUNDING_BOX'
}

export interface LocationBase {
    type: LocationType;
    place: string;
}

export interface LatLong {
    latitude: number;
    longitude: number;
}

export interface LocationPoint extends LocationBase {
    type: LocationType.POINT,
    point: LatLong
}

export interface LocationPolygon extends LocationBase {
    type: LocationType.POLYGON,
    polygon: Array<LatLong>
}

export interface BoundingBox {
    westLongitude: number,
    southLatitude: number
    eastLongitude: number,
    northLatitude: number,
}

export interface LocationBoundingBox extends LocationBase {
    type: LocationType.BOUNDING_BOX,
    boundingBox: BoundingBox
}

export type Location =
    LocationPoint |
    LocationPolygon |
    LocationBoundingBox;

export interface GeolocationData {
    locations: Array<Location>
}

// DESCRIPTION

export interface DescriptionResults {
    description: Description;
}

export interface Description {
    keywords: Array<string>;
    abstract: string
}

export interface ReviewAndSubmitData {

}

// DOI FORM


export enum StepStatus {
    NONE = 'NONE',
    INCOMPLETE = 'INCOMPLETE',
    COMPLETE = 'COMPLETE'
}

export interface StepStateBase {
    status: StepStatus
}

export interface StepStateNone extends StepStateBase {
    status: StepStatus.NONE;
}

export interface StepStateIncomplete<P> extends StepStateBase {
    status: StepStatus.INCOMPLETE;
    params: P;
}

export interface StepStateComplete<R> extends StepStateBase {
    status: StepStatus.COMPLETE;
    value: R;
}

export type StepState<P, R> =
    StepStateNone |
    StepStateIncomplete<P> |
    StepStateComplete<R>;


export type STEPS3 = [
    StepState<null, NarrativeSelectionResult>,
    StepState<null, ORCIDLinkResult>,
    StepState<{ narrativeTitle: string }, { title: string, author: Author }>,
    StepState<null, CitationResults>,
    StepState<null, ContractNumbersResults>,
    StepState<null, GeolocationDataResults>,
    StepState<null, DescriptionResults>,
    StepState<null, ReviewAndSubmitData>
]

export interface DOIForm {
    formId: string;
    steps: STEPS3
}


export interface GetNameResult {
    first_name: string;
    last_name: string;
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

// MODEL

export class Model {
    config: Config;
    auth: AuthenticationStateAuthenticated;

    constructor({ config, auth }: { config: Config, auth: AuthenticationStateAuthenticated }) {
        this.config = config;
        this.auth = auth;
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

    async dsGet(path: string, token: string) {
        const baseURL = await this.serviceURL();
        const url = `${baseURL}/${path}`
        return fetch(url, {
            headers: {
                authorization: token,
                accept: 'application/json'
            }
        });
    }

    async dsDelete(path: string, token: string) {
        const baseURL = await this.serviceURL();
        const url = `${baseURL}/${path}`
        return fetch(url, {
            method: 'DELETE',
            headers: {
                authorization: token
            }
        });
    }

    async dsPut(path: string, token: string, data: JSONObject) {
        const baseURL = await this.serviceURL();
        const url = `${baseURL}/${path}`
        return fetch(url, {
            method: 'PUT',
            headers: {
                authorization: token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
    }

    async dsPost(path: string, token: string, data: JSONObject) {
        const baseURL = await this.serviceURL();
        const url = `${baseURL}/${path}`
        return fetch(url, {
            method: 'POST',
            headers: {
                authorization: token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
    }

    async getProfile(): Promise<ORCIDProfile> {
        const response = await this.dsGet(GET_PROFILE_PATH, this.auth.authInfo.token)
        // const response = await fetch(GET_PROFILE_URL, {
        //     headers: {
        //         authorization: this.auth.authInfo.token
        //     }
        // });

        if (response.status !== 200) {
            throw new Error(`Unexpected response: ${response.status}`);
        }

        const result = JSON.parse(await response.text()) as GetProfileResult;
        return result.result;
    }

    async isLinked(): Promise<boolean> {
        const response = await this.dsGet(IS_LINKED_PATH, this.auth.authInfo.token)

        if (response.status !== 200) {
            throw new Error(`Unexpected response: ${response.status}`);
        }

        const result = JSON.parse(await response.text()) as { result: boolean };
        return result.result;
    }

    async getLink(): Promise<LinkRecord | null> {
        const response = await this.dsGet(GET_LINK_PATH, this.auth.authInfo.token)
        // const response = await fetch(`${GET_LINK_URL}`, {
        //     headers: {
        //         authorization: this.auth.authInfo.token
        //     }
        // });

        if (response.status !== 200) {
            throw new Error(`Unexpected response: ${response.status}`);
        }

        const result = JSON.parse(await response.text()) as { link: LinkRecord | null };
        return result.link;


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
        const response = await this.dsDelete(REVOKE_PATH, this.auth.authInfo.token);
        // const response = await fetch(REVOKE_URL, {
        //     method: 'DELETE',
        //     headers: {
        //         authorization: this.props.auth.authInfo.token
        //     }
        // });

        if (response.status !== 200) {
            throw new Error(`Unexpected response: ${response.status}`);
        }

        // this.setState({
        //     linkState: {
        //         status: AsyncProcessStatus.SUCCESS,
        //         value: { link: null }
        //     }
        // });

        // TODO: notification

        // return null;
    }

    /**
     * Begins the ORCID linking journey by redirecting to the ORCIDLink service "/start" 
     * endpoint, optionally carrying a "return link" and/or "skip prompt" flag.
     * @param returnLink An object containing a link and label property
     * @param skipPrompt A boolean flag indicating whether to prompt to confirm linking afterwards
     */
    async startLink({ returnLink, skipPrompt }: { returnLink?: ReturnLink, skipPrompt?: boolean }) {
        const baseURL = await this.serviceURL();

        // First create a linking session.
        const createURL = new URL(`${baseURL}/${CREATE_LINKING_SESSION_PATH}`);
        const response = await fetch(createURL, {
            method: 'POST',
            headers: {
                Authorization: this.auth.authInfo.token,
                Accept: 'application/json',
                'Content-Type': 'application/json'
            }
        });

        // TODO handle errors.

        const result = await response.json() as unknown as {
            session_id: string
        };

        const sessionId = result.session_id;

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
        const response = await this.dsGet(`${GET_WORK_PATH}/${putCode}`, this.auth.authInfo.token)
        // const response = await fetch(`${GET_WORK_URL}/${putCode}`, {
        //     headers: {
        //         authorization: this.auth.authInfo.token
        //     }
        // });

        if (response.status !== 200) {
            throw new Error(`Unexpected response: ${response.status}`);
        }

        const result = JSON.parse(await response.text()) as { result: Publication };
        return result.result;
    }

    async saveWork(work: EditablePublication): Promise<Publication> {
        const temp = {
            putCode: work.putCode,
            title: work.title,
            date: work.date,
            publicationType: work.publicationType,
            journal: work.journal,
            url: work.url,
            externalIds: work.externalIds
        } as unknown as JSONObject;

        const response = await this.dsPut(SAVE_WORK_PATH, this.auth.authInfo.token, temp)

        // const response = await fetch(SAVE_WORK_URL, {
        //     method: 'PUT',
        //     headers: {
        //         Authorization: this.auth.authInfo.token,
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify(temp)
        // });

        if (response.status !== 200) {
            throw new Error(`Unexpected response: ${response.status}`);
        }

        const result = JSON.parse(await response.text()) as { result: Publication };
        return result.result;
    }

    async createWork(work: EditablePublication): Promise<Publication> {
        const temp = {
            title: work.title,
            date: work.date,
            publicationType: work.publicationType,
            journal: work.journal,
            url: work.url,
            externalIds: work.externalIds
        } as unknown as JSONObject;

        const response = await this.dsPost(CREATE_WORK_PATH, this.auth.authInfo.token, temp)

        // const response = await fetch(CREATE_WORK_URL, {
        //     method: 'POST',
        //     headers: {
        //         Authorization: this.auth.authInfo.token,
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify(temp)
        // });

        if (response.status !== 200) {
            throw new Error(`Unexpected response: ${response.status}`);
        }

        const result = JSON.parse(await response.text()) as { result: Publication };
        return result.result;
    }

    async deleteWork(putCode: string): Promise<void> {
        const response = await this.dsDelete(`${DELETE_WORK_PATH}/${putCode}`, this.auth.authInfo.token)
        // const response = await fetch(`${DELETE_WORK_URL}/${putCode}`, {
        //     method: 'DELETE',
        //     headers: {
        //         Authorization: this.auth.authInfo.token,
        //         'Content-Type': 'application/json'
        //     }
        // });
        if (response.status !== 200) {
            throw new Error(`Unexpected response: ${response.status}`);
        }
        return;
    }

    publicationToEditablePublication(publication: Publication): EditablePublication {
        const { putCode, publicationType, title, date, journal, url, externalIds } = publication;
        return {
            putCode,
            publicationType, title, date, journal: journal || '', url: url || '',
            externalIds: externalIds || []
        }
    }

    async getEditableWork(putCode: string): Promise<EditablePublication> {
        const work = await this.getWork(putCode);
        return this.publicationToEditablePublication(work);
    }

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
        const response = await this.dsGet(GET_NAME_PATH, this.auth.authInfo.token);
        // const response = await fetch(GET_NAME_URL, {
        //     headers: {
        //         authorization: this.props.auth.authInfo.token
        //     }
        // });

        if (response.status !== 200) {
            throw new Error(`Unexpected response: ${response.status}`);
        }

        const result = JSON.parse(await response.text()) as { result: GetNameResult };
        return result.result;
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
        const response = await this.dsPost(SAVE_DOI_APPLICATION_PATH, this.auth.authInfo.token, doiForm as unknown as JSONObject)

        if (response.status !== 200) {
            throw new Error(`Unexpected response: ${response.status}`);
        }

        const result = JSON.parse(await response.text()) as { result: boolean };
        return result.result;
    }

    async getDOIForm(formId: string): Promise<DOIForm> {
        const response = await this.dsGet(`${GET_DOI_APPLICATION_PATH}/${formId}`, this.auth.authInfo.token)

        // const response = await fetch(`${GET_DOI_APPLICATION_URL}/${formId}`, {
        //     headers: {
        //         authorization: this.auth.authInfo.token
        //     }
        // });

        if (response.status !== 200) {
            throw new Error(`Unexpected response: ${response.status}`);
        }

        const result = JSON.parse(await response.text()) as { result: DOIForm };
        return result.result;
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
        const response = await this.dsGet(`${GET_LINKING_SESSION_INFO_PATH}/${sessionId}`, this.auth.authInfo.token)
        if (response.status !== 200) {
            throw new Error(`Unexpected response: ${response.status}`);
        }

        const rawResult = await response.text();
        return JSON.parse(rawResult);
    }

    async confirmLink(token: string) {
        const response = await this.dsGet(`${FINISH_LINKING_SESSION_PATH}/${token}`, this.auth.authInfo.token);
        if (response.status !== 200) {
            throw new Error(`Unexpected response: ${response.status}`);
        }
    }

    async cancelLink(token: string) {
        const response = await this.dsGet(`${CANCEL_LINKING_SESSION_PATH}/${token}`, this.auth.authInfo.token);

        if (response.status !== 200) {
            throw new Error(`Unexpected response: ${response.status}`);
        }
    }


}
