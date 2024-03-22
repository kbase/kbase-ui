export function hasOwnProperty(value: unknown, property: string): boolean {
    return (Object.prototype.hasOwnProperty.call(value, property))
}
