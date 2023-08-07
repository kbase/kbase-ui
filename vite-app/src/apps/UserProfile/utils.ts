
export function arraysEqual(a: any, b: any): boolean {
    if (!Array.isArray(a)) {
        return false;
    }
    if (!Array.isArray(b)) {
        return false;
    }

    if (a.length !== b.length) {
        return false;
    }
    for (let i = 0; i < a.length; i += 1) {
        if (a[i] !== b[i]) {
            return false;
        }
    }
    return true;
}

export function noScriptTag(value: string) {
    if (/<script[^>]*>/ig.test(value)) {
        throw Error('the "script" tag (<script>) is not allowed')
    }
}

export function containsScriptTag(value: string) {
    return /<script[^>]*>/ig.test(value)
}

export function hasOwnProperty(value: unknown, property: string): boolean {
    if (typeof value !== 'object') {
        return false;
    }
    return (Object.prototype.hasOwnProperty.call(value, property))
}