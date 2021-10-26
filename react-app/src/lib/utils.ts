// import {
//     AMDRequire
// } from "./types";

import { isJSONObject, JSONObject } from './json';

// TODO: a hack to override the node require definition built into TS
// TODO: there may be a compiler option to allow using AMD require?
// declare var require: AMDRequire;

// function isSimpleObject(obj: any) {
//     if (typeof obj !== 'object' || obj === null) {
//         return false;
//     }
//     return Object.getPrototypeOf(obj) === Object.getPrototypeOf({});
// }

export function mergeObjects(listOfObjects: Array<JSONObject>): JSONObject {
    function merge(
        obj1: JSONObject,
        obj2: JSONObject,
        keyStack: Array<string>
    ) {
        Object.keys(obj2).forEach((key) => {
            const obj1Value = obj1[key];
            const obj2Value = obj2[key];
            const obj1Type = typeof obj1Value;
            const obj2Type = typeof obj2Value;
            if (obj1Value === null) {
                // undefined or null properties are always overwritable
                obj1[key] = obj2[key];
            } else if (isJSONObject(obj1Value) && isJSONObject(obj2Value)) {
                // thread through objects.
                keyStack.push(key);
                merge(obj1Value, obj2Value, keyStack);
                keyStack.pop();
            } else if (obj1Type === obj2Type) {
                // same typed values may be overwritten, but with a warning.
                obj1[key] = obj2[key];
            } else {
                console.error(
                    `Unmergable at ${keyStack.join('.')}:${key}`,
                    obj1Type,
                    obj1Value,
                    obj2Type,
                    obj2Value
                );
                throw new Error(`Unmergable at ${keyStack.join('.')}:${key}`);
            }
        });
    }

    const base = JSON.parse(JSON.stringify(listOfObjects[0]));
    for (let i = 1; i < listOfObjects.length; i += 1) {
        merge(base, listOfObjects[i], []);
    }
    return base;
}

// export function prequire(dependencies: Array<string>) {
//     return new Promise((resolve, reject) => {
//         try {
//             require(dependencies, (result) => {
//                 resolve(result);
//             }, (error) => {
//                 reject(error);
//             });
//         } catch (ex) {
//             reject(ex);
//         }
//     });
// }

export function arraysIntersect(a1: Array<unknown>, a2: Array<unknown>) {
    return a1.some(function (a) {
        return a2.indexOf(a) >= 0;
    });
}

export function tryPromise<T>(fun: () => T) {
    return new Promise((resolve, reject) => {
        try {
            resolve(fun());
        } catch (ex) {
            reject(ex);
        }
    });
}
