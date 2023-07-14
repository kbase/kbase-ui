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

export interface JSONObjectOf<T extends JSONValue> {
    [x: string]: T;
}

export interface JSONArrayOf<T extends JSONValue> extends Array<T> {
}

export function isJSONObject(value: any): value is JSONObject {
    if (value instanceof {}.constructor) {
        return true;
    }
    return false;
}

export function isJSONArray(value: any): value is JSONArray {
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

export type PropPath = Array<string | number>

export function digJSON(
    value: JSONValue,
    propPath: PropPath,
    defaultValue?: JSONValue
): JSONValue {
    if (propPath.length === 0) {
        return value;
    }
    const [prop, ...rest] = propPath;
    switch (typeof prop) {
        case 'string':
            if (!(isJSONObject(value))) {
                throw new TypeError('Not an object');
            }
            return digJSON(value[prop], rest, defaultValue)
        case 'number':
            if (!(isJSONArray(value))) {
                throw new TypeError(`Not an array`);
            }
            return digJSON(value[prop], rest, defaultValue);
    }
}