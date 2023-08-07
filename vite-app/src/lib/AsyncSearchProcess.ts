export enum AsyncSearchProcessStatus {
    NONE = 'NONE',
    PENDING = 'PENDING',
    ERROR = 'ERROR',
    SUCCESS = 'SUCCESS',
}

export interface AsyncSearchProcessBase {
    status: AsyncSearchProcessStatus;
}

export interface AsyncSearchProcessNone extends AsyncSearchProcessBase {
    status: AsyncSearchProcessStatus.NONE;
}

export interface AsyncSearchProcessPending<T> extends AsyncSearchProcessBase {
    status: AsyncSearchProcessStatus.PENDING;
    value: T;
}

export interface AsyncSearchProcessError<E> extends AsyncSearchProcessBase {
    status: AsyncSearchProcessStatus.ERROR;
    error: E;
}

export interface AsyncSearchProcessSuccess<T> extends AsyncSearchProcessBase {
    status: AsyncSearchProcessStatus.SUCCESS;
    value: T;
}

export type AsyncSearchProcess<T, E> =
    | AsyncSearchProcessNone
    | AsyncSearchProcessPending<T>
    | AsyncSearchProcessError<E>
    | AsyncSearchProcessSuccess<T>;
