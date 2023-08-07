export enum AsyncFetchStatus {
    NONE = 'AsyncFetchStatus$NONE',
    FETCHING = 'AsyncFetchStatus$FETCHING',
    REFETCHING = 'AsyncFetchStatus$REFETCHING',
    SUCCESS = 'AsyncFetchStatus$SUCCESS',
    ERROR = 'AsyncFetchStatus$ERROR'
}


export interface AsyncFetchStateNone {
    status: AsyncFetchStatus.NONE;
}

export interface AsyncFetchStateFetching {
    status: AsyncFetchStatus.FETCHING;
}

export interface AsyncFetchStateRefetching<T> {
    status: AsyncFetchStatus.REFETCHING;
    value: T
}

export interface AsyncFetchStateSuccess<T> {
    status: AsyncFetchStatus.SUCCESS;
    value: T
}

export interface AsyncFetchStateError<E> {
    status: AsyncFetchStatus.ERROR;
    error: E
}

export type AsyncFetchState<T, E> =
    AsyncFetchStateNone |
    AsyncFetchStateFetching |
    AsyncFetchStateSuccess<T> |
    AsyncFetchStateRefetching<T> |
    AsyncFetchStateError<E>;
