export enum AsyncProcessStatus {
    NONE = 'NONE',
    PENDING = 'PENDING',
    ERROR = 'ERROR',
    SUCCESS = 'SUCCESS',
}

export interface AsyncProcessBase {
    status: AsyncProcessStatus;
}

export interface AsyncProcessNone extends AsyncProcessBase {
    status: AsyncProcessStatus.NONE;
}

export interface AsyncProcessPending extends AsyncProcessBase {
    status: AsyncProcessStatus.PENDING;
}

export interface AsyncProcessError<E> extends AsyncProcessBase {
    status: AsyncProcessStatus.ERROR;
    error: E;
}

export interface AsyncProcessSuccess<T> extends AsyncProcessBase {
    status: AsyncProcessStatus.SUCCESS;
    value: T;
}

export type AsyncProcess<T, E> =
    | AsyncProcessNone
    | AsyncProcessPending
    | AsyncProcessError<E>
    | AsyncProcessSuccess<T>;
