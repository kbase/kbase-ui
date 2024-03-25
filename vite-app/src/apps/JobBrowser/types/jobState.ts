import { EpochTime } from "./base";

export enum JobStateType {
    CREATE = "CREATE",
    QUEUE = "QUEUE",
    RUN = "RUN",
    COMPLETE = "COMPLETE",
    ERROR = "ERROR",
    TERMINATE = "TERMINATE"
}

// HMM how about a state history??
// Each state is a simple statement of what has changed 

export enum JobErrorCode {
    UNKNOWN,
    JOB_CRASHED,
    JOB_TERMINATED_BY_AUTOMATION,
    JOB_TIMED_OUT,
    JOB_MISSING_OUTPUT,
    JOB_AUTHENTICATION_EXPIRED
}

export enum JobTerminateCode {
    USER,
    ADMIN,
    PROCESS
}

export interface JobEventBase {
    type: JobStateType;
    at: EpochTime;
}

export interface JobEventCreate extends JobEventBase {
    type: JobStateType.CREATE;
}

export interface JobEventQueue extends JobEventBase {
    type: JobStateType.QUEUE;
}

export interface JobEventRun extends JobEventBase {
    type: JobStateType.RUN;
}

export interface JobEventComplete extends JobEventBase {
    type: JobStateType.COMPLETE;
}

export interface JobEventError extends JobEventBase {
    type: JobStateType.ERROR;
    code: JobErrorCode;
    message: string;
}

export interface JobEventTerminate extends JobEventBase {
    type: JobStateType.TERMINATE;
    code: JobTerminateCode;
}

export type JobEvent =
    JobEventCreate |
    JobEventQueue |
    JobEventRun |
    JobEventComplete |
    JobEventError |
    JobEventTerminate;


export type JobEventHistory = Array<JobEvent>;

// export type JobEventHistory =
//     [JobEventCreate] |
//     [JobEventCreate, JobEventQueue] |
//     [JobEventCreate, JobEventQueue, JobEventRun] |
//     [JobEventCreate, JobEventQueue, JobEventRun, JobEventComplete] |
//     [JobEventCreate, JobEventError] |
//     [JobEventCreate, JobEventQueue, JobEventError] |
//     [JobEventCreate, JobEventQueue, JobEventRun, JobEventError] |
//     [JobEventCreate, JobEventTerminate] |
//     [JobEventCreate, JobEventQueue, JobEventTerminate] |
//     [JobEventCreate, JobEventQueue, JobEventRun, JobEventTerminate];
