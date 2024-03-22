
import { JSONObject } from 'lib/json';
import { ServiceClient } from '../JSONRPC20/ServiceClient';
import {
    LinkRecordPublic, LinkRecordPublicNonOwner, ORCIDAuthPublic, ORCIDProfile
} from './orcidLinkCommon';

export interface StatusResult {
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
    committer_date: number;
    url: string;
    branch: string;
    tag: string | null;
}

export interface RuntimeInfo {
    current_time: number;
    orcid_api_url: string;
    orcid_oauth_url: string;
    orcid_site_url: string;
}

export interface InfoResult {
    'service-description': ServiceDescription;
    'git-info': GitInfo
    runtime_info: RuntimeInfo
}

export interface ErrorInfo {
    code: number;
    title: string;
    description: string;
    status_code: number;
}

export interface ErrorInfoResult {
    error_info: ErrorInfo
}

export interface LinkingSessionBase extends JSONObject {
    session_id: string;
    username: string;
    created_at: number;
    expires_at: number;
}

// TODO: this is not correct - there are three types of linking session info, with "kind" for discrimination
export interface LinkingSessionInitial extends LinkingSessionBase {
}

// TODO: this is not correct - there are three types of linking session info, with "kind" for discrimination
export interface LinkingSessionStarted extends LinkingSessionBase {
    return_link: string;
    skip_prompt: boolean;
}

// // TODO: this is not correct - there are three types of linking session info, with "kind" for discrimination
// export interface LinkingSessionComplete extends LinkingSessionBase {
//     return_link: string;
//     skip_prompt: boolean;
//     orcid_auth: ORCIDAuth;
// }

export interface LinkingSessionPublicComplete extends LinkingSessionBase {
    // kind: 'complete'
    return_link: string;
    skip_prompt: boolean;
    orcid_auth: ORCIDAuthPublic;
}

export interface LinkParams extends JSONObject {
    username: string;
}

export interface LinkForOtherParams extends JSONObject {
    username: string;
}

export interface DeleteLinkParams extends JSONObject {
    username: string;
}

export interface CreateLinkingSessionParams extends JSONObject {
    username: string;
}

export interface CreateLinkingSessionResult extends JSONObject {
    session_id: string;
}

export interface DeleteLinkingSessionParams extends JSONObject {
    session_id: string;
}

export interface FinishLinkingSessionParams extends JSONObject {
    session_id: string;
}

export interface GetLinkingSessionParams extends JSONObject {
    session_id: string;
}

export interface IsLinkedParams extends JSONObject {
    username: string;
}
export interface GetProfileParams extends JSONObject {
    username: string;
}

// Works

export interface ExternalId extends JSONObject {
    type: string;
    value: string;
    url: string;
    relationship: string;
}

export interface Citation extends JSONObject {
    type: string;
    value: string;
}

export interface ContributorORCIDInfo extends JSONObject {
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

export interface ContributorRole extends JSONObject {
    role: string;
}

export interface Contributor extends JSONObject {
    orcidId: string | null;
    name: string;
    roles: Array<ContributorRole>
}

export interface SelfContributor extends JSONObject {
    orcidId: string;
    name: string;
    roles: Array<ContributorRole>
}
export interface WorkBase extends JSONObject {
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

export interface Work extends PersistedWork {
    createdAt: number;
    updatedAt: number;
    source: string;
}

export type GetWorksResult = Array<{
    externalIds: Array<ExternalId>;
    updatedAt: number;
    works: Array<Work>;
}>

export interface GetWorksParams extends JSONObject {
    username: string;
}

export interface GetWorkParams extends JSONObject {
    username: string;
    put_code: string;
}

export interface GetWorkResult extends JSONObject {
    work: Work
}

export interface SaveWorkParams extends JSONObject {
    username: string;
    work_update: WorkUpdate;
}

export interface SaveWorkResult extends JSONObject {
    work: Work
}

export interface DeleteWorkParams extends JSONObject {
    username: string;
    put_code: string;
}

// export interface GetWorksResult extends JSONObject {

// }

export default class ORCIDLinkAPI extends ServiceClient {
    module = 'ORCIDLink';
    prefix = false;
    async status(): Promise<StatusResult> {
        const result = await this.callFunc('status');
        return result as unknown as StatusResult
    }

    async info(): Promise<InfoResult> {
        const result = await this.callFunc('info');
        return result as unknown as InfoResult
    }

    async errorInfo(errorCode: number): Promise<ErrorInfoResult> {
        const result = await this.callFunc('error-info', {
            error_code: errorCode
        });
        return result as unknown as ErrorInfoResult
    }

    async isLinked(params: IsLinkedParams): Promise<boolean> {
        const result = await this.callFunc('is-linked', params);
        return result as unknown as boolean;
    }

    async getOwnerLink(params: LinkParams): Promise<LinkRecordPublic> {
        const result = await this.callFunc('owner-link', params);
        return result as unknown as LinkRecordPublic;
    }

    async getOtherLink(params: LinkForOtherParams): Promise<LinkRecordPublicNonOwner> {
        const result = await this.callFunc('other-link', params);
        return result as unknown as LinkRecordPublicNonOwner;
    }

    async deleteOwnLink(params: DeleteLinkParams): Promise<void> {
        await this.callFunc('delete-own-link', params);
    }

    async createLinkingSession(params: CreateLinkingSessionParams): Promise<CreateLinkingSessionResult> {
        const result = await this.callFunc('create-linking-session', params);
        return result as unknown as CreateLinkingSessionResult;
    }

    async getLinkingSession(params: GetLinkingSessionParams): Promise<LinkingSessionPublicComplete> {
        const result = await this.callFunc('get-linking-session', params);
        return result as unknown as LinkingSessionPublicComplete;
    }

    async deleteLinkingSession(params: DeleteLinkingSessionParams): Promise<void> {
        await this.callFunc('delete-linking-session', params);
    }

    async finishLinkingSession(params: FinishLinkingSessionParams): Promise<void> {
        await this.callFunc('finish-linking-session', params);
    }

    async getProfile(params: GetProfileParams): Promise<ORCIDProfile> {
        const result = await this.callFunc('get-orcid-profile', params);
        return result as unknown as ORCIDProfile;
    }

    // Work Activity

    async getWorks(params: GetWorksParams): Promise<GetWorksResult> {
        const result = await this.callFunc('get-works', params);
        return result as unknown as GetWorksResult;
    }

    async getWork(params: GetWorkParams): Promise<GetWorkResult> {
        const result = await this.callFunc('get-work', params);
        return result as unknown as GetWorkResult;
    }

    async createWork(params: SaveWorkParams): Promise<SaveWorkResult> {
        const result = await this.callFunc('crate-work', params);
        return result as unknown as GetWorkResult;
    }

    async saveWork(params: SaveWorkParams): Promise<SaveWorkResult> {
        const result = await this.callFunc('save-work', params);
        return result as unknown as GetWorkResult;
    }

    async deleteWork(params: DeleteWorkParams): Promise<void> {
        await this.callFunc('delete-work', params);
    }
}
