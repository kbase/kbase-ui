// import { JSONArrayOf, JSONObject, JSONValue, objectToJSONObject } from '../../json.ts';
import {
    JSONArrayOf,
    JSONObject,
    objectToJSONObject,
} from '@kbase/ui-lib/lib/json';
import { JSONLikeObject, toJSONObject } from 'lib/jsonLike';
import { ServiceClient } from '../JSONRPC11/ServiceClient';
import { SDKBoolean } from '../types';

// interface IsAdminParam {
//     username?: string;
// }

type IsAdminParam = null;

type IsAdminResult = boolean;

interface GetExecAggrTableParam {
    begin?: number;
    end?: number;
}

interface GetExecAggrTableItem extends JSONObject {
    app: string;
    func: string;
    func_mod: string;
    n: number;
    user: string;
}

type GetExecAggrTableResult = JSONArrayOf<GetExecAggrTableItem>

interface GetExecAggrStatsParam {
    full_app_ids?: JSONArrayOf<string>;
    per_week?: boolean;
}

interface GetExecAggrStatsItem extends JSONObject {
    full_app_id: string;
    time_range: string;
    type: string;
    number_of_calls: number;
    number_of_errors: number;
    module_name: string;
    total_queue_time: number;
    total_exec_time: number;
}

type GetExecAggrStatsResult = JSONArrayOf<GetExecAggrStatsItem>;


export interface VersionCommitInfo {
    git_commit_hash: string;
}

export interface BasicModuleInfo {
    module_name: string;
    git_url: string;
    language: string;
    dynamic_service: SDKBoolean;
    owners: Array<string>;
    dev: VersionCommitInfo;
    beta: VersionCommitInfo;
    release: VersionCommitInfo;
    released_version_list: Array<VersionCommitInfo>;
}


export interface ListBasicModuleInfoParams extends JSONLikeObject {
    owners?: Array<string>;
    include_released?: SDKBoolean;
    include_unreleased?: SDKBoolean;
    include_disabled?: SDKBoolean;
    include_modules_with_no_name_set?: SDKBoolean;
}

export type ListBasicModuleInfoResult = Array<BasicModuleInfo>;

export default class CatalogClient extends ServiceClient {
    module: string = 'Catalog';

    async is_admin(): Promise<JSONArrayOf<IsAdminResult>> {
        try {
            return await this.callFunc<
                JSONArrayOf<IsAdminParam>,
                JSONArrayOf<IsAdminResult>
            >('is_admin', [null]);
        } catch (ex) {
            console.error('ERROR', ex);
            throw ex;
        }
    }

    async get_exec_aggr_table(
        param: GetExecAggrTableParam
    ): Promise<GetExecAggrTableResult> {
        const [result] = await this.callFunc<
            JSONArrayOf<JSONObject>,
            JSONArrayOf<GetExecAggrTableResult>
        >('get_exec_aggr_table', [objectToJSONObject(param)]);
        return result;
    }

    async get_exec_aggr_stats(
        param: GetExecAggrStatsParam
    ): Promise<GetExecAggrStatsResult> {
        const [result] = await this.callFunc<
            JSONArrayOf<JSONObject>,
            JSONArrayOf<GetExecAggrStatsResult>
        >('get_exec_aggr_stats', [objectToJSONObject(param)]);
        return result;
    }

    async list_basic_module_info(param: ListBasicModuleInfoParams): Promise<ListBasicModuleInfoResult> {
        const [result] = await this.callFunc<Array<JSONObject>, Array<JSONObject>>('list_basic_module_info', [toJSONObject(param)]);
        return result as unknown as ListBasicModuleInfoResult;
    }
}
