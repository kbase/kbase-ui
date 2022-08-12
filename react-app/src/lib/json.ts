export type JSONScalarValue = string | number | boolean | null;

export type JSONValue = JSONScalarValue | JSONObject | JSONArray;

// export interface JSONObjectOf<T extends JSONValue> {
//     [x: string]: T;
// }

// export type JSONObject = JSONObjectOf<JSONValue>;
export interface JSONObject {
    [key: string]: JSONValue;
}

// export type JSONArrayOf<T extends JSONValue> = Array<T>;

export type JSONArray = Array<JSONValue>;

export function isJSONObject(value: JSONValue): value is JSONObject {
    if (value instanceof {}.constructor) {
        return true;
    }
    return false;
    // if (typeof value !== 'object') {
    //     return false;
    // }
    // if (value === null) {
    //     return false;
    // }
    // if (Array.isArray(value)) {
    //     return false;
    // }
    // if (!(value instanceof {}.constructor)) {
    //     return false;
    // }
    // return true;
}

export function isJSONArray(value: JSONValue): value is JSONArray {
    if (Array.isArray(value)) {
        return true;
    }
    return false;
}

export function isJSONValue(value: unknown): value is JSONValue {
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
        const value2 = value as unknown as { [key: string]: unknown };
        return !Object.keys(value).some((key) => {
            return !isJSONValue(value2[key]);
        });
    }

    return false;
}
