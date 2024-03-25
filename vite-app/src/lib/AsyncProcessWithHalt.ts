export enum AsyncProcessWithHaltStatus {
    NONE = 'NONE',
    PENDING = 'PENDING',
    HALTED = 'HALTED',
    SUCCESS = 'SUCCESS',
}

export interface AsyncProcessWithHaltSBase {
    status: AsyncProcessWithHaltStatus;
}

export interface AsyncProcessWithHaltNone extends AsyncProcessWithHaltSBase {
    status: AsyncProcessWithHaltStatus.NONE;
}

export interface AsyncProcessWithHaltPending extends AsyncProcessWithHaltSBase {
    status: AsyncProcessWithHaltStatus.PENDING;
}

export interface AsyncProcessWithHaltError<H> extends AsyncProcessWithHaltSBase {
    status: AsyncProcessWithHaltStatus.HALTED;
    value: H;
}

export interface AsyncProcessWithHaltSuccess<T> extends AsyncProcessWithHaltSBase {
    status: AsyncProcessWithHaltStatus.SUCCESS;
    value: T;
}

export type AsyncProcessWithHalt<T, E> =
    | AsyncProcessWithHaltNone
    | AsyncProcessWithHaltPending
    | AsyncProcessWithHaltError<E>
    | AsyncProcessWithHaltSuccess<T>;
