// should be from @kbase/ui_lib
export type SDKBoolean = 0 | 1;
export type EpochTimeMS = number;
export type Username = string;
export type WSUPA = string;

export type SampleNodeId = string;
export type SampleId = string;
export type SampleVersion = number;
export type SampleNodeType = "BioReplicate" | "TechReplicate" | "SubSample";


export interface MetadataValue {
    value: string | number;
    units: string;
}

export interface Metadata {
    [key: string]: MetadataValue;
}

export interface UserMetadataValue {
    value: string;
    unit: string;
}

export interface UserMetadata {
    [key: string]: UserMetadataValue;
}

export type MetadataSource = Array<MetadataSourceField>;

export interface MetadataSourceField {
    key: string;
    skey: string;
    svalue: {
        value: string;
    };
}

export interface SampleNode {
    id: SampleNodeId;
    parent: SampleNodeId | null;
    type: SampleNodeType;
    meta_controlled: Metadata;
    meta_user: UserMetadata;
    source_meta: MetadataSource;
}

export interface Sample {
    id: SampleId;
    user: Username;
    node_tree: Array<SampleNode>;
    name: string;
    save_date: EpochTimeMS;
    version: SampleVersion;
}