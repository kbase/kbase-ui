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