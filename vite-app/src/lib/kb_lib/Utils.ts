import { isPlainObject } from 'lib/json';

export class CustomError {
    message: string;
    name: string;
    constructor(message: string) {
        this.message = message;
        this.name = 'CustomError';
    }
}

export const uniqueId = (() => {
    let genIdSerial = 0;
    return (): string => {
        const random = Math.floor(Math.random() * 1000);
        const time = new Date().getTime();
        if (genIdSerial === 1000) {
            genIdSerial = 0;
        }
        genIdSerial += 1;
        return [random, time, genIdSerial].map(String).join('-');
    };
})();

/**
 * Determines, through a thorough and deep inspection, whether
 * two values are equal. Inspects all array items in order,
 * all object properties.
 *
 * @function isEqual
 *
 * @param {Any} v1 - a value to compare to a second
 * @param {Any} v2 - another value to compare to the first
 *
 * @returns {boolean} true if the two values are equal, false
 * otherwise.
 *
 * @static
 */
export function isEqual(v1: unknown, v2: unknown) {
    const path: Array<unknown> = [];
    function iseq(v1: unknown, v2: unknown) {
        // const t1 = typeof v1;
        // const t2 = typeof v2;
        // if (t1 !== t2) {
        //     return false;
        // }

        if (typeof v1 !== typeof v2) {
            return;
        }

        switch (typeof v1) {
            case 'string':
            case 'number':
            case 'boolean':
                if (v1 !== v2) {
                    return false;
                }
                break;
            case 'undefined':
                if (typeof v2 !== 'undefined') {
                    return false;
                }
                break;
            case 'object':
                if (v1 === null) {
                    return v2 === null;
                } else if (v2 === null) {
                    return false;
                } else if (v1 instanceof Array && v2 instanceof Array) {
                    if (v1.length !== v2.length) {
                        return false;
                    }
                    for (let i = 0; i < v1.length; i++) {
                        path.push(i);
                        if (!iseq(v1[i], v2[i])) {
                            return false;
                        }
                        path.pop();
                    }
                } else {
                    if (typeof v2 === 'undefined' || v2 === null) {
                        return false;
                    }

                    isPlainObject;
                    const keys1 = Object.keys(v1).sort();
                    const keys2 = Object.keys(v2).sort();

                    if (keys1.length !== keys2.length) {
                        return false;
                    }
                    for (let i = 0; i < keys1.length; i++) {
                        path.push(keys1[i]);

                        const k1 = keys1[i];
                        const k2 = keys2[i];

                        // TODO: should not make such an assertion blindly!
                        const val1 = v1 as Record<string, unknown>;
                        const val2 = v2 as Record<string, unknown>;

                        const obj1 = val1[k1];
                        const obj2 = val2[k2];

                        if (!iseq(obj1, obj2)) {
                            return false;
                        }
                        path.pop();
                    }
                }
        }
        return true;
    }
    return iseq(v1, v2);
}

export function tryPromise<T>(callback: () => T): Promise<T> {
    return new Promise((resolve, reject) => {
        try {
            resolve(callback());
        } catch (ex) {
            reject(ex);
        }
    });
}

interface UIErrorParams {
    code: string;
    type: string;
    reason: string;
    message: string;
    blame: string;
    suggestion: string;
}

export class UIError extends CustomError {
    type: string;
    reason: string;
    blame: string;
    code: string;
    suggestion: string;
    constructor({
        type,
        reason,
        message,
        blame,
        code,
        suggestion,
    }: UIErrorParams) {
        super(message);
        this.type = type;
        this.reason = reason;
        this.blame = blame;
        this.code = code;
        this.suggestion = suggestion;
    }
}
