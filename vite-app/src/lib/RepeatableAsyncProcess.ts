export enum RepeatAsyncProcessStatus {
    NONE = 'NONE',
    PENDING = 'PENDING',
    ERROR = 'ERROR',
    SUCCESS = 'SUCCESS',
    SUCCESS_PENDING = 'SUCCESS_PENDING'
}

export interface RepeatAsyncProcessBase {
    status: RepeatAsyncProcessStatus;
}

export interface  RepeatAsyncProcessNone extends RepeatAsyncProcessBase {
    status: RepeatAsyncProcessStatus.NONE;
}

export interface  RepeatAsyncProcessPending extends RepeatAsyncProcessBase {
    status: RepeatAsyncProcessStatus.PENDING;
}

export interface  RepeatAsyncProcessPending extends RepeatAsyncProcessBase {
    status: RepeatAsyncProcessStatus.PENDING;
}

export interface  RepeatAsyncProcessError<E> extends RepeatAsyncProcessBase {
    status: RepeatAsyncProcessStatus.ERROR;
    error: E;
}

export interface  RepeatAsyncProcessSuccess<T> extends RepeatAsyncProcessBase {
    status: RepeatAsyncProcessStatus.SUCCESS;
    value: T;
}

export interface  RepeatAsyncProcessSuccessPending<T> extends RepeatAsyncProcessBase {
    status: RepeatAsyncProcessStatus.SUCCESS_PENDING;
    value: T;
}

export type RepeatAsyncProcess<T, E> =
    |  RepeatAsyncProcessNone
    |  RepeatAsyncProcessPending
    |  RepeatAsyncProcessError<E>
    |  RepeatAsyncProcessSuccess<T>
    |  RepeatAsyncProcessSuccessPending<T>;
