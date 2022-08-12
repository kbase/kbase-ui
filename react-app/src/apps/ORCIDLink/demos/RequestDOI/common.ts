export enum FieldStatus {
    NONE = 'NONE',
    INITIAL = 'INITIAL',
    VALID = 'VALID',
    INVALID = 'INVALID'
}

export interface FieldStateBase {
    status: FieldStatus
}
export interface FieldStateNone extends FieldStateBase {
    status: FieldStatus.NONE
}

export interface FieldStateInitial<R, T> extends FieldStateBase {
    status: FieldStatus.INITIAL,
    rawValue: R,
    value: T
}

export interface FieldStateInvalid<R> extends FieldStateBase {
    status: FieldStatus.INVALID,
    rawValue: R,
    error: {
        message: string
    }
}

export interface FieldStateValid<R, T> extends FieldStateBase {
    status: FieldStatus.VALID,
    rawValue: R,
    value: T
}

export type FieldState<R, T> =
    FieldStateNone |
    FieldStateInitial<R, T> |
    FieldStateValid<R, T> |
    FieldStateInvalid<R>;
