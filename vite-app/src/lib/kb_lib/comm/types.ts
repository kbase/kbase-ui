export type EpochTimeMS = number;
export type SDKBoolean = number;
export type MappingKey = string | number;
export interface Mapping<V> {
    [k: string]: V;
}
