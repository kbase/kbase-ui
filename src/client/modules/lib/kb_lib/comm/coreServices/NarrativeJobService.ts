import { ServiceClient } from '../JSONRPC11/ServiceClient';
import { JSONRPC11Error } from '../JSONRPC11/JSONRPC11';

type Job_ID = string;

interface CancelJobParam {
    job_id: Job_ID;
}

interface GetJobLogsParam {
    job_id: Job_ID;
    skip_lines: number;
}

interface LogLine {
    line: string;
    is_error: number;
}

interface GetJobLogsResult {
    lines: Array<LogLine>;
    last_line_number: number;
}

type CheckJobParam = Job_ID;

interface CheckJobResult {
    job_id: Job_ID;
    finished: boolean;
    ujs_url: string;
    status: any;
    result: any;
    error: JSONRPC11Error;
    job_state: string;
    position: number;
    creation_time: number;
    exec_start_time: number;
    finish_time: number;
    cancelled: boolean;
    canceled: boolean;
}

export default class NarrativeJobServiceClient extends ServiceClient {
    module: string = 'NarrativeJobService';

    async cancelJob(param: CancelJobParam): Promise<void> {
        return await this.callFuncEmptyResult<CancelJobParam, void>('cancel_job', param);
    }

    async getJobLogs(param: GetJobLogsParam): Promise<GetJobLogsResult> {
        return await this.callFunc<GetJobLogsParam, GetJobLogsResult>('get_job_logs', param);
    }

    async checkJob(param: CheckJobParam): Promise<CheckJobResult> {
        return await this.callFunc<CheckJobParam, CheckJobResult>('check_job', param);
    }
}
