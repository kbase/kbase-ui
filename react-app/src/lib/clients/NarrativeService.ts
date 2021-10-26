import {DynamicServiceClient} from "../kb_lib/comm/JSONRPC11/DynamicServiceClient";
import {JSONObject} from "@kbase/ui-lib/lib/json";

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
}