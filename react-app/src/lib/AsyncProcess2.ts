export enum AsyncProcessStatus {
    NONE = 'NONE',
    PENDING = 'PENDING',
    ERROR = 'ERROR',
    SUCCESS = 'SUCCESS',
}

export interface AsyncProcess2Base<I> {
    status: AsyncProcessStatus;
    initialValue: I;
}

export interface AsyncProcessNone<I> extends AsyncProcess2Base<I> {
    status: AsyncProcessStatus.NONE;
}

export interface AsyncProcessPending<I> extends AsyncProcess2Base<I> {
    status: AsyncProcessStatus.PENDING;
}

export interface AsyncProcessError<I, E> extends AsyncProcess2Base<I> {
    status: AsyncProcessStatus.ERROR;
    error: E;
}

export interface AsyncProcessSuccess<I, T> extends AsyncProcess2Base<I> {
    status: AsyncProcessStatus.SUCCESS;
    value: T;
}

export type AsyncProcess2<I, T, E> =
    | AsyncProcessNone<I>
    | AsyncProcessPending<I>
    | AsyncProcessError<I, E>
    | AsyncProcessSuccess<I, T>;
