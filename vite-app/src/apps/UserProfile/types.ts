export type JSONValue = string | number | boolean | null | JSONObject | JSONArray;

// export interface JSONArray extends Array<JSONValue> { };
export type JSONArray = Array<JSONValue>;

export interface JSONObject {
    [x: string]: JSONValue;
}



export enum ValidationStatus {
    NONE,
    SUCCESS,
    ERROR,
    WARNING,
    VALIDATING
}

export interface ValidationStateBase {
    status: ValidationStatus;
}

export interface ValidationStateSuccess<T> extends ValidationStateBase {
    status: ValidationStatus.SUCCESS,
    value: T;
}

export interface ValidationStateError extends ValidationStateBase {
    status: ValidationStatus.ERROR,
    message: string;
}

export interface ValidationStateWarning extends ValidationStateBase {
    status: ValidationStatus.WARNING;
}

export interface ValidationStateValidating extends ValidationStateBase {
    status: ValidationStatus.VALIDATING;
}

export interface ValidationStateNone extends ValidationStateBase {
    status: ValidationStatus.NONE;
}

export type ValidationState<T> =
    ValidationStateSuccess<T> |
    ValidationStateError |
    ValidationStateWarning |
    ValidationStateValidating |
    ValidationStateNone;


export type AntDesignValidationStatus = "" | "error" | "success" | "warning" | "validating" | undefined;
