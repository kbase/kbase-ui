export enum SyncProcessStatus {
    NONE = 'NONE',
    ERROR = 'ERROR',
    SUCCESS = 'SUCCESS',
}

export interface SyncProcessBase {
    status: SyncProcessStatus;
}

export interface SyncProcessNone extends SyncProcessBase {
    status: SyncProcessStatus.NONE;
}

export interface SyncProcessError extends SyncProcessBase {
    status: SyncProcessStatus.ERROR;
    message: string;
}

export interface SyncProcessSuccess<T> extends SyncProcessBase {
    status: SyncProcessStatus.SUCCESS;
    value: T;
}

export type SyncProcess<T> =
    | SyncProcessNone
    | SyncProcessError
    | SyncProcessSuccess<T>;
