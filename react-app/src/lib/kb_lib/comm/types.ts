export type EpochTimeMS = number;
export type SDKBoolean = number;
export type MappingKey = string | number;
export interface Mapping<K extends MappingKey, V> {
    [k: string]: V;
}
