export interface SimpleObject {
    [k: string]: any;
}

export function isSimpleObject(value: any): value is SimpleObject {
    if (typeof value !== 'object') {
        return false;
    }
    if (value === null) {
        return false;
    }
    return (value.constructor === {}.constructor);
}