import {DynamicServiceClient} from "../kb_lib/comm/JSONRPC11/DynamicServiceClient";
import {JSONObject, JSONObjectOf} from "@kbase/ui-lib/lib/json";

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

export interface GetStaticNarrativeInfoParams extends JSONObject {
    ws_id: number;
}

export interface StaticNarrativeInfo extends JSONObject {
    ws_id: number;
    narrative_id: number;
    narrative_version: number;
    url: string;
    narr_saved: number;
    static_saved: number;
}

export type GetStaticNarrativeInfoResult = StaticNarrativeInfo;

export class StaticNarrative extends DynamicServiceClient {
    module:string = 'StaticNarrative'

    async get_static_narrative_info(params: GetStaticNarrativeInfoParams): Promise<GetStaticNarrativeInfoResult> {
        const [result] = await this.callFunc<[GetStaticNarrativeInfoParams], [GetStaticNarrativeInfoResult]>('get_static_narrative_info', [
            params
        ]);
        return result;
    }

}
