import {
    JSONObject,
    JSONObjectOf,
    JSONValue,
    objectToJSONObject
} from 'lib/json';
import { JSONLikeArrayOf, JSONLikeObject, toJSON } from '../../../jsonLike';
import { ServiceClient } from '../JSONRPC11/ServiceClient';
import { EpochTimeMS, Mapping, SDKBoolean } from '../types';

export type WorkspaceId = number;
export type ObjectId = number;

export interface ObjectIdentity extends JSONLikeObject {
    workspace?: string;
    wsid?: WorkspaceId;
    name?: string;
    objid?: ObjectId;
    ver?: number;
    ref?: string;
}

export interface WorkspaceIdentity extends JSONLikeObject {
    workspace?: string;
    id?: WorkspaceId;
}

// TODO: either improve or get rid of JSONLikeObject usage ... it allows any key through! 
// That sort of messes up strict typing in the IDE and compiler ...
export interface ObjectSpecification extends JSONLikeObject {
    workspace?: string;
    wsid?: WorkspaceId;
    name?: string;
    objid?: ObjectId;
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
    wsid: WorkspaceId;
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
    savedAt: number;
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
    modifiedAt: number;
}

export type Metadata = JSONObjectOf<string>;

export interface GetObjectInfo3Result extends JSONObject {
    infos: Array<ObjectInfoRaw>;
    paths: Array<Array<string>>;
}

export interface GetWorkspaceInfoParams extends WorkspaceIdentity { }

export interface GetWorkspaceInfoResult { }

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
    custom: Mapping<string>;
    description: string;
}

export interface ObjectData extends JSONLikeObject {
    data: JSONObject;
    info: ObjectInfoRaw;
    path: Array<ObjectRef>;
    provenance: Array<ProvenanceAction>;
    creator: Username;
    orig_wsid: WorkspaceId;
    created: Timestamp;
    epoch: EpochTimeMS;
    refs: Array<ObjectRef>;
    copied: ObjectRef;
    copy_source_inaccessible: SDKBoolean;
    extracted_ids: Mapping<Array<string>>;
    handle_error: string;
    handle_stacktrace: string;
}

// Utils

export function workspaceInfoToObject(wsInfo: WorkspaceInfoRaw): WorkspaceInfo {
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
        modDate: new Date(wsInfo[3]).toISOString(),
        modifiedAt: new Date(wsInfo[3]).getTime()
    };
}

export function objectInfoToObject(objInfo: ObjectInfoRaw): ObjectInfo {
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
        saveDate: new Date(objInfo[3]).toISOString(),
        savedAt: new Date(objInfo[3]).getTime()
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

// get permissions mass

export interface GetPermissionsMassParams extends JSONLikeObject {
    workspaces: Array<WorkspaceIdentity>;
}

// This almost works, but is more copmlicated and gets weird in the assertion 
// function...
// export const userPermissionValues = ['a', 'w', 'r', 'n'] as const;
// // export type UserPermission = 'a' | 'w' | 'r' | 'n';
// type UserPermissionTuple = typeof userPermissionValues;
// export type UserPermission = UserPermissionTuple[number];


export const userPermissionValues = ['a', 'w', 'r', 'n'];
export type UserPermission = 'a' | 'w' | 'r' | 'n';
export function assertUserPermission(value: string): asserts value is UserPermission {
    if (!userPermissionValues.includes(value)) {
        throw new TypeError(`"${value}" is not an expected user permission value (${userPermissionValues.join(', ')})`)
    }
}

export type GlobalPermission = 'n' | 'r'

export interface UserPerm {
    [x: string]: UserPermission
}

export interface GetPermissionsMassResult extends JSONLikeObject {
    perms: Array<UserPerm>;
}

export interface AlterWorkspaceMetadataParams extends JSONLikeObject {
    wsi: WorkspaceIdentity;
    new?: Metadata;
    remove?: Array<string>;
}

export type DeleteWorkspaceParams = WorkspaceIdentity;

export interface SetGlobalPermissionParams extends JSONLikeObject {
    id?: WorkspaceId
    workspace?: string;
    new_permission: GlobalPermission
}

export interface SetPermissionsParams extends JSONLikeObject {
    id?: WorkspaceId
    workspace?: string;
    new_permission: UserPermission;
    users: Array<string>
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

    async get_permissions_mass(params: GetPermissionsMassParams): Promise<GetPermissionsMassResult> {
        const [object] = await this.callFunc<[JSONValue], [JSONValue]>(
            'get_permissions_mass',
            [toJSON(params)]
        );
        return object as GetPermissionsMassResult;
    }

    async alter_workspace_metadata(params: AlterWorkspaceMetadataParams): Promise<void> {
        await this.callFuncEmptyResult<[JSONValue]>(
            'alter_workspace_metadata',
            [toJSON(params)]
        );
    }

    async alter_workspace_metadata2(params: AlterWorkspaceMetadataParams): Promise<void> {
        await this.callFuncEmptyResult<[JSONValue]>(
            'alter_workspace_metadata',
            [toJSON(params)]
        );
    }

    async delete_workspace(params: DeleteWorkspaceParams): Promise<void> {
        await this.callFuncEmptyResult<[JSONValue]>(
            'delete_workspace',
            [toJSON(params)]
        );
    }

    async set_global_permission(params: SetGlobalPermissionParams): Promise<void> {
        // Hmm, should we be defensive here, or just let the workspace provide the error?
        if (typeof params.id === 'undefined' && typeof params.workspace === 'undefined') {
            throw new TypeError('One of "id" or "workspace" must be provided; neither were');
        }
        if (typeof params.id === 'number' && typeof params.workspace === 'string') {
            throw new TypeError('One of "id" or "workspace" must be provided; both were');
        }
        await this.callFuncEmptyResult<[JSONValue]>(
            'set_global_permission',
            [toJSON(params)]
        );
    }

    async set_permissions(params: SetPermissionsParams): Promise<void> {
        // Hmm, should we be defensive here, or just let the workspace provide the error?
        if (typeof params.id === 'undefined' && typeof params.workspace === 'undefined') {
            throw new TypeError('One of "id" or "workspace" must be provided; neither were');
        }
        if (typeof params.id === 'number' && typeof params.workspace === 'string') {
            throw new TypeError('One of "id" or "workspace" must be provided; both were');
        }
        await this.callFuncEmptyResult<[JSONValue]>(
            'set_permissions',
            [toJSON(params)]
        );
    }
}
