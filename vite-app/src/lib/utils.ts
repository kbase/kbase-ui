export function hasOwnProperty(value: unknown, property: string): boolean {
    return Object.prototype.hasOwnProperty.call(value, property);
}

// function assertIsString(value: unknown): asserts value is string {
//     if (typeof value !== 'string') {
//         throw new Error('Not a string');
//     }
// }

// export function objectToRecord<T>(obj: object, proof?: <T>(value: unknown) => asserts value is T): Record<string, T> {
//     const result: Record<string, unknown> = {};
//     for (const [key, rawValue] of Object.entries(obj)) {
//         let value: T;
//         if (proof) {
//             value = rawValue;
//             proof<T>(value);
//         } else {
//             value = rawValue as T;
//         }
//         result[key] = value;
//     }
//     return result;
// }

export function objectToRecord<T>(obj: object): Record<string, T> {
    const result: Record<string, T> = {};
    for (const [key, value] of Object.entries(obj)) {
        result[key] = value as T;
    }
    return result;
}
