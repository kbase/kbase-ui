
type PropPath = Array<string> | string;

export function getProp<T>(obj: any, propPath: PropPath, defaultValue?: T): T | undefined {
    if (typeof propPath === 'string') {
        propPath = propPath.split('.');
    } else if (!(propPath instanceof Array)) {
        throw new TypeError('Invalid type for key: ' + (typeof propPath));
    }
    for (let i = 0; i < propPath.length; i += 1) {
        if ((obj === undefined) ||
            (typeof obj !== 'object') ||
            (obj === null)) {
            return defaultValue;
        }
        obj = obj[propPath[i]];
    }
    if (obj === undefined) {
        return defaultValue;
    }
    return obj as T;
}


export function hasProp(obj: any, propPath: PropPath): boolean {
    if (typeof propPath === 'string') {
        propPath = propPath.split('.');
    } else if (!(propPath instanceof Array)) {
        throw new TypeError('Invalid type for key: ' + (typeof propPath));
    }
    for (let i = 0; i < propPath.length; i += 1) {
        if ((obj === undefined) ||
            (typeof obj !== 'object') ||
            (obj === null)) {
            return false;
        }
        obj = obj[propPath[i]];
    }
    if (obj === undefined) {
        return false;
    }
    return true;
}


export function setProp<T>(obj: any, propPath: PropPath, value: T) {
    if (typeof propPath === 'string') {
        propPath = propPath.split('.');
    } else if (!(propPath instanceof Array)) {
        throw new TypeError('Invalid type for key: ' + (typeof propPath));
    }
    if (propPath.length === 0) {
        return;
    }
    // pop off the last property for setting at the end.
    const propKey = propPath[propPath.length - 1];
    let key;
    // Walk the path, creating empty objects if need be.
    for (let i = 0; i < propPath.length - 1; i += 1) {
        key = propPath[i];
        if (obj[key] === undefined) {
            obj[key] = {};
        }
        obj = obj[key];
    }
    // Finally set the property.
    obj[propKey] = value;
}



export function incrProp(obj: any, propPath: PropPath, increment?: number): number {
    if (typeof propPath === 'string') {
        propPath = propPath.split('.');
    } else if (!(propPath instanceof Array)) {
        throw new TypeError('Invalid type for key: ' + (typeof propPath));
    }
    if (propPath.length === 0) {
        throw new TypeError('Property path must have at least one element');
    }
    increment = (typeof increment === 'undefined') ? 1 : increment;
    const propKey = propPath[propPath.length - 1];
    for (let i = 0; i < propPath.length - 1; i += 1) {
        const key = propPath[i];
        if (obj[key] === undefined) {
            obj[key] = {};
        }
        obj = obj[key];
    }
    if (typeof obj[propKey] === 'undefined') {
        obj[propKey] = increment;
    } else {
        if (typeof obj[propKey] === 'number') {
            obj[propKey] += increment;
        } else {
            throw new Error('Can only increment a number');
        }
    }
    return obj[propKey];
}


export function deleteProp(obj: any, propPath: PropPath) {
    if (typeof propPath === 'string') {
        propPath = propPath.split('.');
    } else if (!(propPath instanceof Array)) {
        throw new TypeError('Invalid type for key: ' + (typeof propPath));
    }
    if (propPath.length === 0) {
        return false;
    }
    const propKey = propPath[propPath.length - 1];
    for (let i = 0; i < propPath.length - 1; i += 1) {
        const key = propPath[i];
        if (obj[key] === undefined) {
            // for idempotency, and utility, do not throw error if
            // the key doesn't exist.
            return false;
        }
        obj = obj[key];
    }
    if (obj[propKey] === undefined) {
        return false;
    }
    delete obj[propKey];
    return true;
}

export class Props {
    obj: any;
    constructor({ data }: { data?: any; }) {
        this.obj = typeof data === 'undefined' ? {} : data;
    }

    getItem<T>(props: PropPath, defaultValue: T) {
        return getProp<T>(this.obj, props, defaultValue);
    }

    hasItem(propPath: PropPath) {
        return hasProp(this.obj, propPath);

    }

    setItem(path: PropPath, value: any) {
        return setProp(this.obj, path, value);
    }

    incrItem(path: PropPath, increment?: number) {
        return incrProp(this.obj, path, increment);
    }

    deleteItem(path: PropPath) {
        return deleteProp(this.obj, path);
    }

    getRaw() {
        return this.obj;
    }
}

