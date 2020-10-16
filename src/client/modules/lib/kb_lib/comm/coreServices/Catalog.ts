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

interface GetExecAggrTableResult {
    app: string;
    func: string;
    func_mod: string;
    n: number;
    user: string;
}

interface GetExecAggrStatsParam {
    full_app_ids?: Array<string>;
    per_week?: boolean;
}

interface GetExecAggrStatsResult {
    full_app_id: string;
    time_range: string;
    type: string;
    number_of_calls: number;
    number_of_errors: number;
    module_name: string;
    total_queue_time: number;
    total_exec_time: number;
}

export default class CatalogClient extends ServiceClient {
    module: string = 'Catalog';

    async isAdmin(): Promise<IsAdminResult> {
        try {
            return await this.callFunc<IsAdminParam, IsAdminResult>('is_admin', null);
        } catch (ex) {
            console.error('ERROR', ex);
            throw ex;
        }
    }

    async getExecAggrTable(param: GetExecAggrTableParam): Promise<Array<GetExecAggrTableResult>> {
        return await this.callFunc<GetExecAggrTableParam, Array<GetExecAggrTableResult>>('get_exec_aggr_table', param);
    }

    async getExecAggrStats(param: GetExecAggrStatsParam): Promise<Array<GetExecAggrStatsResult>> {
        return await this.callFunc<GetExecAggrStatsParam, Array<GetExecAggrStatsResult>>('get_exec_aggr_stats', param);
    }
}
