export type JSONScalarValue = string | number | boolean | null;

export type JSONValue = JSONScalarValue | JSONObject | JSONArray;

export interface JSONObjectOf<T extends JSONValue> {
    [x: string]: T;
}

export type JSONObject = JSONObjectOf<JSONValue>;

export interface JSONArrayOf<T extends JSONValue> extends Array<T> { };

export type JSONArray = JSONArrayOf<JSONValue>;

export function isJSONObject(value: JSONValue): value is JSONObject {
    if (typeof value !== 'object') {
        return false;
    }
    if (value === null) {
        return false;
    }
    if (Array.isArray(value)) {
        return false;
    }
    return true;
}

export function isJSONArray(value: JSONValue): value is JSONArray {
    if (Array.isArray(value)) {
        return true;
    }
    return false;
}

export function isJSONValue(value: any): value is JSONValue {
    const typeOf = typeof value;
    if (['string', 'number', 'boolean'].indexOf(typeOf) >= 0) {
        return true;
    }

    if (typeof value !== 'object') {
        return false;
    }
    if (value === null) {
        return true;
    }
    if (Array.isArray(value)) {
        return !value.some((subvalue) => {
            return !isJSONValue(subvalue);
        });
    }
    if (value.constructor === {}.constructor) {
        return !Object.keys(value).some((key) => {
            return !isJSONValue(value[key]);
        });
    }

    return false;
}