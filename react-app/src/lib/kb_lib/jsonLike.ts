import {
    JSONArray,
    JSONObject,
    JSONScalarValue,
    JSONValue,
} from '@kbase/ui-lib/lib/json';

export type JSONLikeValue =
    | JSONScalarValue
    | JSONLikeObject
    | JSONLikeArray
    | undefined;

export interface JSONLikeObjectOf<T extends JSONLikeValue> {
    [x: string]: T;
}

export type JSONLikeObject = JSONLikeObjectOf<JSONLikeValue>;

export interface JSONLikeArrayOf<T extends JSONLikeValue> extends Array<T> {}

export type JSONLikeArray = JSONLikeArrayOf<JSONLikeValue>;

export function toJSONLike(like: unknown): JSONLikeValue {
    // return (like as unknown) as JSONValue;
    switch (typeof like) {
        case 'string':
        case 'number':
        case 'boolean':
            return like;
        case 'undefined':
            return like;
        case 'object':
            if (like === null) {
                return like;
            } else if (Array.isArray(like)) {
                const na: JSONLikeArray = [];
                for (const item of like) {
                    na.push(toJSONLike(item));
                }
                return na;
            } else if (like.constructor !== {}.constructor) {
                const x: JSONLikeObject = {};
                for (const [k, v] of Object.entries(like)) {
                    x[k] = toJSONLike(v);
                }
                return x;
            } else {
                throw new Error(
                    `Not acceptable JSONLikeObject value: ${typeof like}`
                );
            }
        default:
            throw new Error(`Not acceptable JSONLike value: ${typeof like}`);
    }
}

export function toJSON(like: unknown): JSONValue {
    // return (like as unknown) as JSONValue;
    switch (typeof like) {
        case 'string':
        case 'number':
        case 'boolean':
            return like;
        case 'undefined':
            throw new Error('Should never see this!');
        case 'object':
            if (like === null) {
                return like;
            } else if (Array.isArray(like)) {
                const na: JSONArray = [];
                for (const item of like) {
                    if (typeof item !== 'undefined') {
                        na.push(toJSON(item));
                    }
                }
                return na;
            } else {
                const x: JSONObject = {};
                for (const [k, v] of Object.entries(like)) {
                    if (typeof k !== 'undefined') {
                        x[k] = toJSON(v);
                    }
                }
                return x;
            }
        default:
            throw new Error(`Not acceptable JSON value: ${typeof like}`);
    }
}
