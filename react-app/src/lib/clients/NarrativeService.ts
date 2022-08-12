import {DynamicServiceClient} from "../kb_lib/comm/JSONRPC11/DynamicServiceClient";
import {JSONObject, JSONObjectOf, objectToJSONObject} from "@kbase/ui-lib/lib/json";
import { JSONLikeObject } from "../kb_lib/jsonLike";
import { ObjectInfoRaw, WorkspaceInfoRaw } from "lib/kb_lib/comm/coreServices/Workspace";

export interface RenameNarrativeParams extends JSONObject {
    narrative_ref: string;
    new_name: string;
}

export interface RenameNarrativeResult extends JSONObject {
    narrative_upa: string;
}

export interface CopyNarrativeParams extends JSONObject {
    workspaceRef: string;
    workspaceId: number;
    newName: string;
}

export interface CopyNarrativeResult extends JSONObject {
    newWsId: number;
    newNarId: number;
}

export type AppParam = [number, string, string];

export interface CreateNewNarrativeParams extends JSONLikeObject {
    app?: string;
    method?: string;
    appparam?: string;
    appData?: Array<AppParam>;
    markdown?: string;
    copydata?: string;
    importData?: Array<string>;
    includeIntroCell?: number;
    title?: string;
}

export type Metadata = JSONObjectOf<string>;

export interface WorkspaceInfo extends JSONObject {
    id: number;
    name: string;
    owner: string
    moddate: string,
    object_count: number;
    user_permission: string;
    globalread: string;
    lockstat: string;
    metadata: Metadata;
    modDateMs: string;
}

export interface ObjectInfo extends JSONObject {
    id: number;
    name: string;
    type: string;
    save_date: string;
    version: number;
    saved_by: string;
    wsid: number;
    ws: string;
    checksum: string;
    size: number;
    metadata: Metadata,
    ref: string;
    obj_id: string;
    typeModule: string;
    typeName: string;
    typeMajorVersion: string;
    typeMinorVersion: string;
    saveDateMs: string;
    
}


export interface CreateNewNarrativeResult extends JSONObject {
    workspaceInfo: WorkspaceInfo;
    narrativeInfo: ObjectInfo;
}

export interface ListNarrativesParams extends JSONObject {
    type: 'mine' | 'public' | 'shared'
}


/*
    Note: the service re-uses the "Narrative" object like this in several 
    methods, but the property names are different in each one!
*/
export interface Narrative extends JSONObject{
    ws: WorkspaceInfoRaw;
    nar: ObjectInfoRaw
}

export interface ListNarrativesResult extends JSONObject {
    narratives: Array<Narrative>
}

export class NarrativeService extends DynamicServiceClient {
    module:string = 'NarrativeService'

    async rename_narrative(params: RenameNarrativeParams): Promise<RenameNarrativeResult> {
        const [result] = await this.callFunc<[RenameNarrativeParams], [RenameNarrativeResult]>('rename_narrative', [
            params
        ]);
        return result;
    }

    async copy_narrative(params: CopyNarrativeParams): Promise<CopyNarrativeResult> {
        const [result] = await this.callFunc<[CopyNarrativeParams], [CopyNarrativeResult]>('copy_narrative', [
            params
        ]);
        return result;
    }

    async create_new_narrative(params: CreateNewNarrativeParams): Promise<CreateNewNarrativeResult> {
        const [result] = await this.callFunc<[JSONObject], [CreateNewNarrativeResult]>('create_new_narrative', [
            objectToJSONObject(params)
        ]);
        return result;
    }

    async list_narratives(params: ListNarrativesParams): Promise<ListNarrativesResult> {
         const [result] = await this.callFunc<[ListNarrativesParams], [ListNarrativesResult]>('list_narratives', [
            params
         ]);
        // Unfortunately, list_narratives does not return beautiful objectified infos.
        return result;
    }
}