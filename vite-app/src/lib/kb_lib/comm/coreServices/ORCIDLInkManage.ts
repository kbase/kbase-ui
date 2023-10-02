import { JSONArrayOf, JSONObject } from 'lib/json';
import { JSONLikeObject } from 'lib/jsonLike';
import { ServiceClient2 } from '../JSONRPC20/ServiceClient2';
import { LinkingSessionInitial, LinkingSessionPublicComplete, LinkingSessionStarted } from './ORCIDLInk';
import { LinkRecordPublic } from './orcidLinkCommon';


export interface IsManagerParams extends JSONObject {
    username: string;
}

export interface IsManagerResult extends JSONObject {
    is_manager: boolean;
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
    links: Array<LinkRecordPublic>;
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

export interface FindLinksParams extends JSONObject {

}

export interface FindLinksResult extends JSONObject {
    links: JSONArrayOf<LinkRecordPublic>
}

export interface GetLinkParams extends JSONObject {
    username: string;
}

export interface GetLinkResult extends JSONObject {
    link: LinkRecordPublic
}

export interface GetLinkingSessionsResult extends JSONObject {
    initial_linking_sessions: Array<LinkingSessionInitial>
    started_linking_sessions: Array<LinkingSessionStarted>
    completed_linking_sessions: Array<LinkingSessionPublicComplete>
}

export interface DeleteLinkingSessionInitialParams extends JSONObject {
    session_id: string;
}

export interface DeleteLinkingSessionStartedParams extends JSONObject {
    session_id: string;
}
export interface DeleteLinkingSessionCompletedParams extends JSONObject {
    session_id: string;
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

export interface GetStatsResult {
    stats: {
        links: LinkStats,
        linking_sessions_initial: LinkSessionStats,
        linking_sessions_started: LinkSessionStats,
        linking_sessions_completed: LinkSessionStats
    }
}

export default class ORCIDLinkManageAPI extends ServiceClient2 {
    async isManager(params: IsManagerParams): Promise<IsManagerResult> {
        const result = await this.callMethod('is-manager', params);
        return result as unknown as IsManagerResult;
    }

    async findLinks(params: FindLinksParams): Promise<FindLinksResult> {
        const result = await this.callMethod('find-links', params);
        return result as unknown as FindLinksResult;
    }

    async getLink(params: GetLinkParams): Promise<GetLinkResult> {
        const result = await this.callMethod('get-link', params);
        return result as unknown as GetLinkResult;
    }

    async getLinkingSessions(): Promise<GetLinkingSessionsResult> {
        const result = await this.callMethod('get-linking-sessions');
        return result as unknown as GetLinkingSessionsResult;
    }

    async deleteExpiredLinkingSessions(): Promise<void> {
        await this.callMethod('delete-expired-linking-sessions');
    }
    async deleteLinkingSessionInitial(params: DeleteLinkingSessionInitialParams): Promise<void> {
        await this.callMethod('delete-linking-session-initial', params);
    }
    async deleteLinkingSessionStarted(params: DeleteLinkingSessionStartedParams): Promise<void> {
        await this.callMethod('delete-linking-session-started', params);
    }
    async deleteLinkingSessionCompleted(params: DeleteLinkingSessionCompletedParams): Promise<void> {
        await this.callMethod('delete-linking-session-completed', params);
    }

    async getStats(): Promise<GetStatsResult> {
        const result = await this.callMethod('get-stats');
        return result as unknown as GetStatsResult;
    }
}
