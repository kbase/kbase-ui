import {
    JSONObject,
    JSONObjectOf,
    JSONValue,
    objectToJSONObject,
} from '@kbase/ui-lib/lib/json';
import { JSONLikeArrayOf, JSONLikeObject, toJSON } from '../../jsonLike';
import { ServiceClient } from '../JSONRPC11/ServiceClient';
import { EpochTimeMS, Mapping, SDKBoolean } from '../types';
// import {
//     JSONLikeArrayOf,
//     JSONLikeObject,
//     JSONObject,
//     JSONObjectOf,
//     JSONValue,
//     objectToJSONObject,
//     toJSON,
//     toJSONLike,
// } from '../../json.ts';

export interface ObjectIdentity extends JSONLikeObject {
    workspace?: string;
    wsid?: number;
    name?: string;
    objid?: string;
    ver?: number;
    ref?: string;
}

export interface WorkspaceIdentity {
    workspace?: string;
    id?: number;
}

export interface ObjectSpecification extends JSONLikeObject {
    workspace?: string;
    wsid?: number;
    name?: string;
    objid?: number;
    ver?: number;
    ref?: string;
    obj_path?: Array<ObjectIdentity>;
    obj_ref_path?: Array<string>;
    to_obj_path?: Array<ObjectIdentity>;
    to_obj_ref_path?: Array<string>;
    find_reference_path?: number; // bool
    included?: string;
    strict_maps?: number; // bool
    strict_arrays?: number; // bool
}

export interface GetObjectInfo3Params {
    objects: Array<ObjectSpecification>;
    includeMetadata?: number; // bool
    ignoreErrors?: number; // bool
}

export type ObjectInfoRaw = [
    number, // objid
    string, // object name
    string, // object type
    string, // save date timestamp YYYY-MM-DDThh:mm:ssZ
    number, // object version
    string, // saved by
    number, // workspace id
    string, // workspace name
    string, // md5 checksum
    number, // size in bytes
    Metadata // metadata
];

export interface ObjectInfo {
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
    saveDate: string;
    
}

export type WorkspaceInfoRaw = [
    number, // workspace id
    string, // workspace name
    string, // workspace owner (username)
    string, // modification timestamp (iso 8601)
    number, // last object id
    string, // user permission (one char)
    string, // global permission (one char)
    string, // lock status
    Metadata // metadata
];

export interface WorkspaceInfo {
    id: number;
    name: string;
    owner: string
    moddate: string,
    object_count: number;
    user_permission: string;
    globalread: string;
    lockstat: string;
    metadata: Metadata;
    modDate: string;
}

export type Metadata = JSONObjectOf<string>;

export interface GetObjectInfo3Result extends JSONObject {
    infos: Array<ObjectInfoRaw>;
    paths: Array<Array<string>>;
}

export interface GetWorkspaceInfoParams extends WorkspaceIdentity {}

export interface GetWorkspaceInfoResult {}

export interface ListWorkspaceInfoParams {
    perm?: string;
    owners?: Array<string>;
    meta?: Metadata;
    after?: Timestamp;
    before?: Timestamp;
    after_epoch?: EpochTimeMS;
    before_epoch?: EpochTimeMS;
    excludeGlobal?: SDKBoolean;
    showDeleted?: SDKBoolean;
    showOnlyDeleted?: SDKBoolean;
}

export type ListWorkspaceInfoResult = Array<WorkspaceInfo>;

export type ObjectRef = string;
export type Username = string;
export type Timestamp = string;
export type WorkspaceID = number;
export type IDType = string;
export type RefString = string;

export interface ExternalDataUnit extends JSONLikeObject {
    resource_name: string;
    resource_url: string;
    resource_version: string;
    resource_release_date: Timestamp;
    resource_release_epoch: EpochTimeMS;
    data_url: string;
    data_id: string;
    description: string;
}

export interface SubAction extends JSONLikeObject {
    name: string;
    ver: string;
    code_url: string;
    commit: string;
    endpoint_url: string;
}

export interface ProvenanceAction extends JSONLikeObject {
    time: Timestamp;
    epoch: EpochTimeMS;
    caller: string;
    service: string;
    service_ver: string;
    method: string;
    method_params: Array<JSONObject>;
    script: string;
    script_ver: string;
    script_command_line: string;
    input_ws_objects: Array<RefString>;
    resolved_ws_objects: Array<ObjectRef>;
    intermediate_incoming: Array<string>;
    intermediate_outgoing: Array<string>;
    external_data: Array<ExternalDataUnit>;
    subactions: Array<SubAction>;
    custom: Mapping<string, string>;
    description: string;
}

export interface ObjectData extends JSONLikeObject {
    data: JSONObject;
    info: ObjectInfoRaw;
    path: Array<ObjectRef>;
    provenance: Array<ProvenanceAction>;
    creator: Username;
    orig_wsid: number;
    created: Timestamp;
    epoch: EpochTimeMS;
    refs: Array<ObjectRef>;
    copied: ObjectRef;
    copy_source_inaccessible: SDKBoolean;
    extracted_ids: Mapping<IDType, Array<string>>;
    handle_error: string;
    handle_stacktrace: string;
}

// Utils

export function workspaceInfoToObject (wsInfo: WorkspaceInfoRaw): WorkspaceInfo {
    return {
        id: wsInfo[0],
        name: wsInfo[1],
        owner: wsInfo[2],
        moddate: wsInfo[3],
        object_count: wsInfo[4],
        user_permission: wsInfo[5],
        globalread: wsInfo[6],
        lockstat: wsInfo[7],
        metadata: wsInfo[8],
        modDate: new Date(wsInfo[3]).toISOString()
    };
}

export function objectInfoToObject (objInfo: ObjectInfoRaw): ObjectInfo {
        const type = objInfo[2].split(/[-.]/);

        return {
            id: objInfo[0],
            name: objInfo[1],
            type: objInfo[2],
            save_date: objInfo[3],
            version: objInfo[4],
            saved_by: objInfo[5],
            wsid: objInfo[6],
            ws: objInfo[7],
            checksum: objInfo[8],
            size: objInfo[9],
            metadata: objInfo[10],
            ref: objInfo[6] + '/' + objInfo[0] + '/' + objInfo[4],
            obj_id: 'ws.' + objInfo[6] + '.obj.' + objInfo[0],
            typeModule: type[0],
            typeName: type[1],
            typeMajorVersion: type[2],
            typeMinorVersion: type[3],
            saveDate: new Date(objInfo[3]).toISOString()
        };
}

// get_objects2

export interface GetObjects2Param extends JSONLikeObject {
    objects: JSONLikeArrayOf<ObjectSpecification>;
    ignoreErrors?: SDKBoolean;
    no_data?: SDKBoolean;
}

export interface GetObjects2Result extends JSONLikeObject {
    data: Array<ObjectData>;
}

export default class WorkspaceClient extends ServiceClient {
    module = 'Workspace';

    // TODO: should be void not null
    async ver(): Promise<string> {
        const [result] = await this.callFunc<[null], [string]>('ver', [null]);
        return result;
    }

    async get_object_info3(
        params: GetObjectInfo3Params
    ) {
        const [result] = await this.callFunc<
            [JSONObject],
            [GetObjectInfo3Result]
        >('get_object_info3', [objectToJSONObject(params)]);

        return {
            infos: result.infos.map((info) => {
                return objectInfoToObject(info);
            }),
            paths: result.paths
        };
    }

    async get_workspace_info(
        params: GetWorkspaceInfoParams
    ): Promise<WorkspaceInfo> {
        const [result] = await this.callFunc<[JSONObject], [WorkspaceInfoRaw]>(
            'get_workspace_info',
            [objectToJSONObject(params)]
        );
        return workspaceInfoToObject(result as unknown as WorkspaceInfoRaw);
    }

    async list_workspace_info(
        params: ListWorkspaceInfoParams
    ): Promise<ListWorkspaceInfoResult> {
        const [result] = await this.callFunc<
            [JSONObject],
            [Array<WorkspaceInfoRaw>]
        >('list_workspace_info', [objectToJSONObject(params)]);
        return result.map((item) => {
            return workspaceInfoToObject(item);
        })
    }

    async get_objects2(params: GetObjects2Param): Promise<GetObjects2Result> {
        const [object] = await this.callFunc<[JSONValue], [JSONValue]>(
            'get_objects2',
            [toJSON(params)]
        );
        return object as GetObjects2Result;
    }
}
