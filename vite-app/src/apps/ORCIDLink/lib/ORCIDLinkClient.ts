import { JSONLikeObject, toJSON } from "lib/jsonLike";
import { ServiceClient } from "./ServiceClient";
// import { MultiServiceClient } from "./DynamicServiceClient";
import { JSONObject } from "lib/json";


const WORKS_PATH = 'orcid/works';
const GET_PROFILE_PATH = 'orcid/profile';
const GET_LINK_PATH = 'link';
const GET_LINK_SHARE_PATH = 'link/share';
const LINKING_SESSIONS_PATH = 'linking-sessions';
const MANAGE_PATH = 'manage';
const LINK_PATH = 'link';


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

// Errors

export enum ErrorCode {
    unknown = 0,       // unknown or unclassified error
    already_linked = 1000,
    authorization_required = 1010,
    not_authorized = 1011,
    not_found = 1020,  // something was not found
    internal_server_error = 1030,
    json_decode_error = 1040,
    content_type_error = 1041,
    upstream_error = 1050,
    upstream_jsonrpc_error = 1051,
    upstream_orcid_error = 1052,
    fastapi_error = 1060,
    request_validation_error = 1070,
    linking_session_continue_invalid_param = 1080,
    linking_session_error = 1081,
    linking_session_already_linked_orcid = 1082,
    impossible_error = 10099

}

// ORCID User Profile (our version)

export interface Affiliation {
    name: string;
    role: string;
    startYear: string;
    endYear: string | null;
}

export interface ORCIDFieldGroupBase {
    private: boolean;
}

export interface ORCIDFieldGroupPrivate extends ORCIDFieldGroupBase {
    private: true;
}

export interface ORCIDFieldGroupAccessible<T> extends ORCIDFieldGroupBase {
    private: false;
    fields: T
}

export type ORCIDFieldGroup<T> = ORCIDFieldGroupPrivate | ORCIDFieldGroupAccessible<T>;

export interface ORCIDNameFieldGroup {
    firstName: string;
    lastName: string | null;
    creditName: string | null;
}

export interface ORCIDBiographyFieldGroup {
    bio: string;
}

// export interface ORCIDActivitiesFieldGroup {
//     employments: Array<Affiliation>
//     // works: Array<Work>
//     // huh? missing some fields, and what is works doing here?
// }

export interface ORCIDEmailFieldGroup {
    emailAddresses: Array<string>
}

export interface ORCIDProfile {
    // TODO: split into profile and info? E.g. id in info, profile info in profile...
    orcidId: string;
    nameGroup: ORCIDFieldGroup<ORCIDNameFieldGroup>
    biographyGroup: ORCIDFieldGroup<ORCIDBiographyFieldGroup>;
    // activitiesGroup: ORCIDFieldGroup<ORCIDActivitiesFieldGroup>;
    emailGroup: ORCIDFieldGroup<ORCIDEmailFieldGroup>;
    employments: Array<Affiliation>
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

export interface Citation {
    type: string;
    value: string;
}

export interface ContributorORCIDInfo {
    uri: string;
    path: string;
    // host: string | null;
}

// export interface ContributorAttributes {
//     'contributor-sequence': string | null
//     'contributor-role': string
// }

// export interface Contributor {
//     'contributor-orcid': ContributorORCID;
//     'credit-name': string;
//     'contributor-email': string | null;
//     'contributor-attributes': ContributorAttributes
// }

export interface ContributorRole {
    role: string;
}

export interface Contributor {
    orcidId: string | null;
    name: string;
    roles: Array<ContributorRole>
}

export interface SelfContributor {
    orcidId: string;
    name: string;
    roles: Array<ContributorRole>
}

/*

class ORCIDContributorORCIDInfo(ServiceBaseModel):
    uri: str = Field(...)
    path: str = Field(...)
    # omitting host, seems never used


ContributorRole = str


class ORCIDContributor(ServiceBaseModel):
    orcidInfo: Optional[ORCIDContributorORCIDInfo] = Field(default=None)
    name: str = Field(...)
    # omitting email, as it seems never used
    roles: List[ContributorRole] = Field(...)

export interface ContributorWrapper {
    contributor: Array<Contributor>
}
*/


/*

class ContributorORCID(ServiceBaseModel):
    uri: Optional[str] = Field(default=None)
    path: Optional[str] = Field(default=None)
    host: Optional[str] = Field(default=None)


class ContributorAttributes(ServiceBaseModel):
    # TODO: this does not seem used either (always null), need to look up
    # the type.
    contributor_sequence: Optional[str] = Field(
        default=None, alias="contributor-sequence"
    )
    contributor_role: str = Field(alias="contributor-role")


class Contributor(ServiceBaseModel):
    contributor_orcid: ContributorORCID = Field(alias="contributor-orcid")
    credit_name: StringValue = Field(alias="credit-name")
    # TODO: email is not exposed in the web ui, so I don't yet know
    # what the type really is
    contributor_email: Optional[str] = Field(default=None, alias="contributor-email")
    contributor_attributes: ContributorAttributes = Field(
        alias="contributor-attributes"
    )


class ContributorWrapper(ServiceBaseModel):
    contributor: List[Contributor] = Field(...)


class Work(PersistedWorkBase):
    """
    These only appear in the call to get a single work record.
    """
    short_description: Optional[str] = Field(default=None, alias="short-description")
    citation: Optional[Citation] = Field(default=None)
    contributors: Optional[ContributorWrapper] = Field(default=None)
*/

export interface WorkBase {
    title: string;
    journal: string;
    date: string;
    workType: string;
    url: string;
    doi: string;
    externalIds: Array<ExternalId>
    citation: Citation | null;
    shortDescription: string;
    selfContributor: SelfContributor;
    otherContributors: Array<Contributor> | null;
}

export interface NewWork extends WorkBase {
}

export interface PersistedWork extends WorkBase {
    putCode: string;
}

export interface WorkUpdate extends PersistedWork {

}

// export interface Work extends NewWork {
//     putCode: string;
//     createdAt: number;
//     updatedAt: number;
//     source: string;
// }

// export interface WorkUpdate extends NewWork {
//     putCode: string;
// }


export interface Work extends PersistedWork {
    createdAt: number;
    updatedAt: number;
    source: string;
}



export interface GetNameResult {
    firstName: string;
    lastName: string | null;
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

export type ReturnInstructionType = "link" | "window";

export interface ReturnInstructionBase {
    type: ReturnInstructionType
}

export interface ReturnInstructionLink extends ReturnInstructionBase {
    type: 'link'
    url: string
    label: string
}

export interface ReturnInstructionWindow extends ReturnInstructionBase {
    type: 'window'
    origin: string;
    id: string
    label: string
}

export type ReturnInstruction =
    ReturnInstructionLink |
    ReturnInstructionWindow;

export interface StatusResponse {
    status: string;
    current_time: number;
    start_time: number;
}

export interface ServiceDescription {
    name: string;
    title: string;
    version: string;
    language: string;
    description: string;
    repoURL: string;
}

export interface ServiceConfig {
    url: string;
}

export interface Auth2Config extends ServiceConfig {
    tokenCacheLifetime: number;
    tokenCacheMaxSize: number;
}

export interface Config {
    services: {
        Auth2: Auth2Config;
        ORCIDLink: ServiceConfig;
    }
    ui: {
        origin: string;
    }
    orcid: {
        oauthBaseURL: string;
        apiBaseURL: string;
        clientId: string;
        clientSecret: string;
    }
    mongo: {
        host: string;
        port: number;
        database: string;
        username: string;
        password: string;
    }
    module: {
        serviceRequestTimeout: number
    }
}

export interface GitInfo {
    commit_hash: string;
    commit_hash_abbreviated: string;
    author_name: string;
    committer_name: string;
    committer_date: string;
    url: string;
    branch: string;
    tag: string | null;
}

export interface InfoResponse {
    'service-description': ServiceDescription;
    config: Config;
    'git-info': GitInfo

}

export type GetWorksResult = Array<{
    externalIds: Array<ExternalId>;
    updatedAt: number;
    works: Array<Work>;
}>

export interface ORCIDAuth {
    access_token: string;
    expires_in: number;
    id_token: string;
    name: string;
    orcid: string;
    refresh_token: string;
    scope: string
    token_type: string;

}

export interface LinkRecord {
    created_at: number,
    expires_at: number;
    retires_at: number;
    username: string;
    orcid_auth: ORCIDAuth
}

export interface ORCIDAuthPublicNonOwner {
    orcid: string;
    name: string;
}

export interface LinkRecordPublicNonOwner {
    username: string;
    orcid_auth: ORCIDAuthPublicNonOwner
}

export interface LinkShareRecord {
    orcidId: string;
}

export interface ErrorInfo {
    code: number;
    title: string;
    description: string;
    status_code: number;
}

export interface ErrorInfoResponse {
    error_info: ErrorInfo
}


export class ORCIDLinkServiceClient extends ServiceClient {
    module = 'ORCIDLink';

    // General

    async getStatus(): Promise<StatusResponse> {
        return await this.get<StatusResponse>("status")
    }

    async getInfo(): Promise<InfoResponse> {
        return await this.get<InfoResponse>("info")
    }

    async getErrorInfo(errorCode: number): Promise<ErrorInfoResponse> {
        return await this.get<ErrorInfoResponse>(`error-info/${errorCode}`)
    }

    //

    async getProfile(): Promise<ORCIDProfile> {
        return await this.get<ORCIDProfile>(`${GET_PROFILE_PATH}`)
    }

    async isLinked(): Promise<boolean> {
        return this.get<boolean>(`${GET_LINK_PATH}/is_linked`)
    }

    async isORCIDLinked(orcidId: string): Promise<boolean> {
        return this.get<boolean>(`${GET_LINK_PATH}/is_orcid_linked/${orcidId}`);
    }

    async getDocURL(): Promise<string> {
        const url = await this.getURL();
        return `${url}/docs`;
    }

    async getLink(): Promise<LinkRecord> {
        return await this.get<LinkRecord>(`${GET_LINK_PATH}`)
    }

    async getLinkForORCIDId(orcidId: string): Promise<LinkRecordPublicNonOwner> {
        return await this.get<LinkRecordPublicNonOwner>(`${GET_LINK_PATH}/for_orcid/${orcidId}`)
    }

    async getLinkShare(username: string): Promise<LinkShareRecord> {
        return await this.get<LinkShareRecord>(`${GET_LINK_SHARE_PATH}/${username}`)
    }

    async deleteLink(): Promise<void> {
        return await this.delete(`${LINK_PATH}`)
    }

    // ORICD Account works

    async getWork(putCode: string): Promise<Work> {
        return await this.get<Work>(`${WORKS_PATH}/${putCode}`)
    }

    async getWorks(): Promise<GetWorksResult> {
        return await this.get<GetWorksResult>(`${WORKS_PATH}`)
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

    async startLinkingSession(sessionId: string, returnInstruction?: ReturnInstruction, skipPrompt?: boolean, uiOptions?: string): Promise<void> {
        const baseURL = await this.getURL();
        const startURL = new URL(`${baseURL}/${LINKING_SESSIONS_PATH}/${sessionId}/oauth/start`);
        // startURL.searchParams.set('session_id', sessionId);

        // Add return link if provided
        if (returnInstruction) {
            // TODO: change the url param name to "return_instruction" - but need to update
            // service for this as well.
            startURL.searchParams.set('return_link', JSON.stringify(returnInstruction));
        }

        if (uiOptions) {
            startURL.searchParams.set('ui_options', uiOptions);
        }

        // Add the 'return from window' if provided
        // if (returnFromWindow) {
        //     startURL.searchParams.set('return_from_window', JSON.stringify(returnFromWindow));
        // }

        startURL.searchParams.set('skip_prompt', skipPrompt ? 'true' : 'false')
        window.open(startURL, '_parent');
    }

    async getLinkingSession(sessionId: string): Promise<LinkingSessionComplete> {
        return await this.get<LinkingSessionComplete>(`${LINKING_SESSIONS_PATH}/${sessionId}`)
    }

    async deletelLinkingSession(token: string): Promise<void> {
        return await this.delete(`${LINKING_SESSIONS_PATH}/${token}`);
    }

    // Not REST?

    async finishLink(sessionId: string): Promise<void> {
        return await this.put<void>(`${LINKING_SESSIONS_PATH}/${sessionId}/finish`);
    }
}



export interface IsManagerResponse {
    is_manager: boolean
}

// Manage api query links

export interface FilterString extends JSONObject {
    eq: string
}

export interface FilterNumber extends JSONLikeObject {
    eq?: number;
    gte?: number;
    gt?: number;
    lte?: number;
    lt?: number;
}

export interface LinkQueryFind extends JSONLikeObject {
    username?: FilterString;
    orcid?: FilterString;
    created?: FilterNumber;
    expires?: FilterNumber;
}

export interface QuerySortSpec extends JSONLikeObject {
    field_name: string;
    descending?: boolean;
}

export interface QuerySort extends JSONLikeObject {
    specs: Array<QuerySortSpec>;
}

// export interface LinkQuery extends JSONLikeObject {
//     find?: LinkQueryFind;
//     sort?: QuerySort;
//     offset?: number;
//     limit?: number;
// }

export interface Query<FilterT extends JSONLikeObject> extends JSONLikeObject {
    find?: FilterT;
    sort?: QuerySort;
    offset?: number;
    limit?: number;
}

export type LinksQuery = Query<LinkQueryFind>

// export interface ManageLinksParams extends JSONLikeObject {
//     query: LinkQuery
// }

export type ManageLinksParams = LinksQuery;

export interface ManageLinksResponse {
    links: Array<LinkRecord>;
}

// Manage Linking Sessions Query

export interface LinkingSessionsFilter extends JSONLikeObject {

}

export type LinkingSessionsQuery = Query<LinkingSessionsFilter>

// export interface LinkingSessionsQuery extends JSONLikeObject {
//     find?: LinkingSessionsQueryFind;
//     sort?: QuerySort;
//     offset?: number;
//     limit?: number;
// }
export type ManageLinkingSessionsQueryParams = LinkingSessionsQuery;

export interface ManageLinkingSessionsQueryResult {
    initial_linking_sessions: Array<LinkingSessionInitial>
    started_linking_sessions: Array<LinkingSessionStarted>
    completed_linking_sessions: Array<LinkingSessionComplete>
}

export interface LinkStats {
    last_24_hours: number
    last_7_days: number
    last_30_days: number
    all_time: number
}

export interface LinkSessionStats {
    active: number
    expired: number
}

export interface ManageStatsResult {
    stats: {
        links: LinkStats,
        linking_sessions_initial: LinkSessionStats,
        linking_sessions_started: LinkSessionStats,
        linking_sessions_completed: LinkSessionStats
    }
}

export class ORCIDLinkServiceManageClient extends ServiceClient {
    module = 'ORCIDLink';

    // Management

    async getIsManager(): Promise<IsManagerResponse> {
        return await this.get<IsManagerResponse>(`${MANAGE_PATH}/is_manager`) as unknown as IsManagerResponse;
    }

    async queryLinks(params: ManageLinksParams): Promise<ManageLinksResponse> {
        return await this.post<ManageLinksResponse>(`${MANAGE_PATH}/links`, toJSON(params)) as unknown as ManageLinksResponse;
    }


    async getLink(username: string): Promise<LinkRecord> {
        return await this.get<LinkRecord>(`${MANAGE_PATH}/link/${username}`) as unknown as LinkRecord;
    }


    // async queryLinkingSessions(params: ManageLinkingSessionsQueryParams): Promise<ManageLinkingSessionsQueryResult> {
    //     return await this.post<void>(`${MANAGE_PATH}/linking_sessions`, toJSON(params)) as unknown as ManageLinkingSessionsQueryResult;
    // }

    async queryLinkingSessions(): Promise<ManageLinkingSessionsQueryResult> {
        return await this.get<ManageLinkingSessionsQueryResult>(`${MANAGE_PATH}/linking_sessions`) as unknown as ManageLinkingSessionsQueryResult;
    }

    async getStats(): Promise<ManageStatsResult> {
        return await this.get<ManageStatsResult>(`${MANAGE_PATH}/stats`) as unknown as ManageStatsResult;
    }

    async deleteExpiredSessions(): Promise<void> {
        return await this.delete(`${MANAGE_PATH}/expired_linking_sessions`);
    }

    async deleteLinkingSessionStarted(sessionId: string): Promise<void> {
        return await this.delete(`${MANAGE_PATH}/linking_session_started/${sessionId}`);
    }

    async deleteLinkingSessionCompleted(sessionId: string): Promise<void> {
        return await this.delete(`${MANAGE_PATH}/linking_session_completed/${sessionId}`);
    }
}