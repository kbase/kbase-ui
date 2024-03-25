import { JSONLikeObject, toJSONObject } from "lib/jsonLike";
import { DynamicServiceClient } from "lib/kb_lib/comm/JSONRPC20/DynamicServiceClient";
import { JSONObject } from "../types/json";

// Metrics client --
// TODO: move
// TODO: use a more dynamic dynamic service client??

// interface JobBrowserBFFParams extends DynamicServiceClientParams { }

export interface IsAdminResult {
    is_admin: boolean;
}

export type SortKey = 'created';

export type SortDirection = 'ascending' | 'descending';

export interface SortSpec extends JSONObject {
    key: SortKey;
    direction: SortDirection;
}

export interface SearchSpec extends JSONObject {
    terms: Array<string>;
}

export interface FilterSpec extends JSONLikeObject {
    workspace_id?: Array<number>;
    status?: Array<string>;
    user?: Array<string>;
    client_group?: Array<string>;
    app_id?: Array<string>;
    app_module?: Array<string>;
    app_function?: Array<string>;
    job_id?: Array<string>;
    error_code?: Array<number>;
    terminated_code?: Array<number>;
}

export interface TimeSpanSpec extends JSONObject {
    from: number;
    to: number;
}

export interface User extends JSONObject {
    username: string;
    realname: string;
}

/* 
Job State
*/

export type JobStatus =
    'create' | 'queue' | 'run' | 'complete' | 'error' | 'terminate';

export type ClientGroup = string;

export interface JobStateBase extends JSONLikeObject {
    status: JobStatus;
    client_group: ClientGroup;
}

export interface JobStateCreate extends JobStateBase {
    status: 'create';
    create_at: number;
}

export interface JobStateQueue extends JobStateBase {
    status: 'queue';
    create_at: number;
    queue_at: number;
}

export interface JobStateRun extends JobStateBase {
    status: 'run';
    create_at: number;
    queue_at: number;
    run_at: number;
}

export interface JobStateComplete extends JobStateBase {
    status: 'complete';
    create_at: number;
    queue_at: number;
    run_at: number;
    finish_at: number;
}

export interface JSONRPC2Error extends JSONObject {
    code: number;
    message: string;
    data: JSONObject | null;
}

export interface JSONRPC11Error  extends JSONObject {
    code: number;
    message: string;
    error: JSONObject | string | null;
}

export type JSONRPCError = JSONRPC2Error | JSONRPC11Error;

export type JobErrorReasonCode = 0 | 1 | 2 | 3 | 4 | 5;

export interface JobErrorReason extends JSONLikeObject {
    code: JobErrorReasonCode;
    message: string;
    jsonrpc_error: JSONRPCError;
}

export interface JobStateError extends JobStateBase {
    status: 'error';
    create_at: number;
    queue_at: number;
    run_at: number;
    finish_at: number;
    error: JobErrorReason;
}

export type TerminationReasonCode = 0 | 1 | 2;

export interface TerminationReason extends JSONLikeObject {
    code: TerminationReasonCode;
    message?: string;
}

export interface JobStateTerminate extends JobStateBase {
    status: 'terminate';
    create_at: number;
    queue_at: number;
    run_at: number;
    finish_at: number;
    reason: TerminationReason;
}

export type JobState =
    JobStateCreate |
    JobStateQueue |
    JobStateRun |
    JobStateComplete |
    JobStateError |
    JobStateTerminate;

export type AppType = "narrative" | "unknown";

export interface AppInfo extends JSONLikeObject{
    id: string;
    module_name: string;
    function_name: string;
    title: string;
    // client_groups: Array<ClientGroup>;
    type: AppType;
    icon_url?: string;
}

export interface Context {
}

export interface JobContextBase  extends JSONLikeObject {
    type: 'narrative' | 'workspace' | 'export' | 'unknown';
}

export interface JobContextNarrative extends JobContextBase {
    type: 'narrative';
    workspace: {
        id: number;
        is_accessible: boolean;
        is_deleted: boolean;
        name: string;
    },
    narrative: {
        title: string | null;
        is_temporary: boolean;
    };
}

export interface JobContextWorkspace extends JobContextBase {
    type: 'workspace';
    workspace: {
        id: number;
        is_accessible: boolean;
        is_deleted: boolean;
        name: string;
    };
}

export interface JobContextExport extends JobContextBase {
    type: 'export';
}

export interface JobContextUnknown extends JobContextBase {
    type: 'unknown';
}

export type NodeClass = string;

export type JobContext =
    JobContextNarrative |
    JobContextWorkspace |
    JobContextExport |
    JobContextUnknown;

export interface JobInfoBase extends JSONLikeObject {
    job_id: string;
    type: string;
    owner: User;
    state: JobState;
    app: AppInfo | null;
    context: JobContext;
    node_class: NodeClass;
}

export interface JobInfoCreate extends JobInfoBase {
    state: JobStateCreate;
}

export interface JobInfoQueue extends JobInfoBase {
    state: JobStateQueue;
}

export interface JobInfoRun extends JobInfoBase {
    state: JobStateRun;
}

export interface JobInfoComplete extends JobInfoBase {
    state: JobStateComplete;
}

export interface JobInfoError extends JobInfoBase {
    state: JobStateError;
}

export interface JobInfoTerminate extends JobInfoBase {
    state: JobStateTerminate;
}

export type JobInfo =
    JobInfoCreate |
    JobInfoQueue |
    JobInfoRun |
    JobInfoComplete |
    JobInfoError |
    JobInfoTerminate;

// METHOD PARAMS AND RESULT TYPES

type JobID = string;

interface ParamsBase extends JSONLikeObject {
    timeout: number;
    admin?: boolean;
}

interface ParamsCollectionBase extends JSONLikeObject {
    offset: number;
    limit: number;
}

// query_jobs

export interface QueryJobsParams extends ParamsBase, ParamsCollectionBase {
    time_span: TimeSpanSpec;
    sort?: Array<SortSpec>;
    search?: SearchSpec;
    filter?: FilterSpec;
}

export interface QueryJobsResult extends JSONLikeObject {
    jobs: Array<JobInfo>;
    found_count: number;
    total_count: number;
}

// get_jobs

export interface GetJobsParams extends ParamsBase {
    job_ids: Array<JobID>;
}

export interface GetJobsResult {
    jobs: Array<JobInfo>;
}

// get_job_log

// TODO: stricter typing 
export interface GetJobLogParams extends ParamsBase, ParamsCollectionBase {
    job_id: JobID;
    search?: Array<string>;
    level?: Array<string>;
}

export type LogLevel = 'normal' | 'error';

interface JobLogEntry {
    row: number;
    logged_at: number;
    message: string;
    level: LogLevel;
}

export interface GetJobLogResult {
    job: JobInfo;
    log: Array<JobLogEntry>;
}

export interface CancelJobParams {
    job_id: string;
    timeout: number;
    admin: boolean;
}

export interface CancelJobResult {
    canceled: boolean;
}

export interface GetClientGroupsResult {
    client_groups: Array<ClientGroup>;
}

export default class JobBrowserBFFClient extends DynamicServiceClient {
    module: string = 'JobBrowserBFF';
    prefix: boolean = true;

    async is_admin(): Promise<IsAdminResult> {
        const result = await this.callFunc('is_admin');
        return result as unknown as IsAdminResult;
    }

    async query_jobs(params: QueryJobsParams): Promise<QueryJobsResult> {
        const result = await this.callFunc('query_jobs', toJSONObject(params));
        return result as QueryJobsResult;
        // return result as unknown as QueryJobsResult;
    }

    async get_jobs(params: GetJobsParams): Promise<GetJobsResult> {
        const result = await this.callFunc('get_jobs', toJSONObject(params));
        return result as unknown as GetJobsResult;
    }

    async get_job_log(params: GetJobLogParams): Promise<GetJobLogResult> {
        const result =  await this.callFunc('get_job_log', toJSONObject(params));
        return result as unknown as GetJobLogResult;
    }

    async cancel_job(params: CancelJobParams): Promise<CancelJobResult> {
        const result = await this.callFunc('cancel_job', toJSONObject(params));
        return result as unknown as CancelJobResult;
    }

    async get_client_groups(): Promise<GetClientGroupsResult> {
        const result = await this.callFunc('get_client_groups');
        return result as unknown as GetClientGroupsResult;
    }
}
