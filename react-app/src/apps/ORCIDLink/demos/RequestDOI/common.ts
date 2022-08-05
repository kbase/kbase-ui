export enum FieldStatus {
    INITIAL = 'INITIAL',
    VALID = 'VALID',
    INVALID = 'INVALID'
}

export interface FieldStateBase<T> {
    status: FieldStatus,
    value: T
}

export interface FieldStateInitial<T> extends FieldStateBase<T> {
    status: FieldStatus.INITIAL
}

export interface FieldStateValid<T> extends FieldStateBase<T> {
    status: FieldStatus.VALID
}

export interface FieldStateInvalid<T> extends FieldStateBase<T> {
    status: FieldStatus.INVALID,
    error: {
        message: string
    }
}

export type FieldState<T> =
    FieldStateInitial<T> |
    FieldStateValid<T> |
    FieldStateInvalid<T>;
