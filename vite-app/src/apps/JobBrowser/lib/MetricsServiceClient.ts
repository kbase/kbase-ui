// import { DynamicServiceClient, DynamicServiceClientParams } from '../lib/comm/DynamicServiceClient';

import { JSONObject } from "lib/json";
import { JSONLikeObject } from "lib/jsonLike";
import { DynamicServiceClient } from "lib/kb_lib/comm/JSONRPC11/DynamicServiceClient";

// Metrics client --
// TODO: move
// TODO: use a more dynamic dynamic service client??

// interface MetricsServiceParams extends DynamicServiceClientParams { }


export interface JobState extends JSONLikeObject {
    app_id: string;
    client_groups: Array<string>;
    user?: string;

    complete: boolean;
    error: boolean;
    status: string;
    state: string;

    creation_time: number;
    exec_start_time?: number;
    modification_time?: number;
    finish_time?: number;

    job_id: string;
    method: string;

    wsid: string;
    narrative_objNo: number;

    narrative_name: string;
    workspace_name: string;
}


interface GetAppMetricsParam extends JSONObject {
    epoch_range: [number, number];
    user_ids: Array<string>;
}
interface GetAppMetricsResult extends JSONLikeObject {
    job_states: Array<JobState>;
}

interface GetJobsParam extends JSONObject{
    epoch_range: [number, number];
    user_ids: Array<string>;
}
interface GetJobsResult extends JSONLikeObject {
    job_states: Array<JobState>;
    total_count: number;
}

interface GetJobParam extends JSONObject {
    job_id: string;
}
interface GetJobResult extends JSONLikeObject {
    job_state: JobState;
}

export default class MetricsServiceClient extends DynamicServiceClient {
    module: string = 'kb_Metrics';

    async getJobs({ epoch_range, user_ids }: GetJobsParam): Promise<GetJobsResult> {
        const [result]  = await this.callFunc<Array<GetJobsParam>, Array<JSONObject>>('get_jobs', [{
            epoch_range,
            user_ids
        }]);
        return result as GetJobsResult;

        // return this.callFunc<GetJobsParam, GetJobsResult>('get_jobs', {
        //     epoch_range,
        //     user_ids
        // });
    }

    async getJob({ job_id }: GetJobParam): Promise<GetJobResult> {
        const [result] = await this.callFunc<Array<GetJobParam>, Array<JSONObject>>('get_job', [{
            job_id
        }]);

        return result as GetJobResult;
    }

    async getAppMetrics({ epoch_range, user_ids }: GetAppMetricsParam): Promise<GetAppMetricsResult> {
        const [result] = await this.callFunc<Array<GetAppMetricsParam>, Array<JSONObject>>('get_job',[{
            epoch_range,
            user_ids
        }]);
        return result as GetAppMetricsResult;
    }
}
