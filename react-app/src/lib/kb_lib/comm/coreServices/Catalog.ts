// import { JSONArrayOf, JSONObject, JSONValue, objectToJSONObject } from '../../json.ts';
import {
    JSONArrayOf,
    JSONObject,
    objectToJSONObject,
} from '@kbase/ui-lib/lib/json';
import { ServiceClient } from '../JSONRPC11/ServiceClient';

// interface IsAdminParam {
//     username?: string;
// }

type IsAdminParam = null;

type IsAdminResult = boolean;

interface GetExecAggrTableParam {
    begin?: number;
    end?: number;
}

interface GetExecAggrTableResult extends JSONObject {
    app: string;
    func: string;
    func_mod: string;
    n: number;
    user: string;
}

interface GetExecAggrStatsParam {
    full_app_ids?: JSONArrayOf<string>;
    per_week?: boolean;
}

interface GetExecAggrStatsResult extends JSONObject {
    full_app_id: string;
    time_range: string;
    type: string;
    number_of_calls: number;
    number_of_errors: number;
    module_name: string;
    total_queue_time: number;
    total_exec_time: number;
}

// interface SimpleObject {
//     [k: string]:
// }

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
    ): Promise<Array<GetExecAggrTableResult>> {
        return await this.callFunc<
            JSONArrayOf<JSONObject>,
            JSONArrayOf<GetExecAggrTableResult>
        >('get_exec_aggr_table', [objectToJSONObject(param)]);
    }

    async get_exec_aggr_stats(
        param: GetExecAggrStatsParam
    ): Promise<Array<GetExecAggrStatsResult>> {
        return await this.callFunc<
            JSONArrayOf<JSONObject>,
            JSONArrayOf<GetExecAggrStatsResult>
        >('get_exec_aggr_stats', [objectToJSONObject(param)]);
    }
}
