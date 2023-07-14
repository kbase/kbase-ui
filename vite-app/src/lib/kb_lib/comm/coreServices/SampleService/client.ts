import {
    EpochTimeMS,
    Sample,
    SampleId,
    SampleNodeId,
    SampleVersion,
    SDKBoolean,
    Username,
    WSUPA,
} from './Sample';
import { ControlledField } from './ControlledField';
import {
    ServiceClient,
    ServiceClientParams,
} from '../../JSONRPC11/ServiceClient';
import groupsData from './data/groups/groups.json';
import schemasData from './data/schemas/schemas.json';
import { JSONObject, objectToJSONObject } from '@kbase/ui-lib/lib/json';
import { JSONLikeObject } from '../../../jsonLike';

// const __dirname = dirname(fromFileUrl(import.meta.url));
// const groupsData = JSON.parse(Deno.readTextFileSync(join(__dirname, 'data/groups/groups.json')));
// const schemasData = JSON.parse(Deno.readTextFileSync(join(__dirname, 'data/schemas/schemas.json')));
const groups = groupsData as unknown as Array<FieldGroup>;
const schemas = schemasData as unknown as Array<ControlledField>;

interface SchemaMap {
    [k: string]: ControlledField;
}

const schemasMap: SchemaMap = schemas.reduce<SchemaMap>((m, schema) => {
    m[schema.kbase.sample.key] = schema;
    return m;
}, {});

export type ControlledFieldKey = string;

export interface FieldGroup extends JSONObject {
    name: string;
    title: string;
    fields: Array<ControlledFieldKey>;
}

export type FieldGroups = Array<FieldGroup>;

export interface StatusResult extends JSONObject {
    state: string;
    message: string;
    version: string;
    git_url: string;
    git_commit_hash: string;
}

/* Types for the get_sample method*/
export interface GetSampleParams {
    id: SampleId;
    version?: number;
    as_admin?: SDKBoolean;
}

export type GetSampleResult = Sample;

/* Types for the get_data_links_from_sample method */
export interface GetDataLinksFromSampleParams {
    id: SampleId;
    version: SampleVersion;
    effective_time?: EpochTimeMS;
}

export type DataId = string;

export interface DataLink extends JSONObject {
    linkid: string;
    upa: WSUPA;
    dataid: DataId | null;
    id: SampleId;
    version: SampleVersion;
    node: SampleNodeId;
    created: EpochTimeMS;
    createdby: Username;
    expiredby: Username | null;
    expired: EpochTimeMS | null;
}

export type DataLinks = Array<DataLink>;

export interface GetDataLinksFromSampleResult {
    links: DataLinks;
}

// TODO: document
export type KeyPrefix = 0 | 1 | 2;

export interface GetMetadataKeyStaticMetadataParams extends JSONObject {
    keys: Array<string>;
    prefix: KeyPrefix;
}

export interface StaticMetadataValue {
    display_name: string;
    description?: string;
}

export interface StaticMetadata {
    [key: string]: StaticMetadataValue;
}

export interface GetMetadataKeyStaticMetadataResult {
    static_metadata: StaticMetadata;
}

export interface GetSampleACLsParams extends JSONObject {
    id: SampleId;
    as_admin: SDKBoolean;
}

export interface SampleACLs extends JSONObject {
    owner: Username;
    admin: Array<Username>;
    write: Array<Username>;
    read: Array<Username>;
}

export type GetSampleACLsResult = SampleACLs;

export interface GetFieldDefinitionsParams extends JSONObject {
    keys: Array<string>;
}

export interface GetFieldDefinitionsResult extends JSONLikeObject {
    fields: Array<ControlledField>;
}

export interface GetFieldGroupsParams {}

export interface GetFieldGroupsResult extends JSONObject {
    groups: FieldGroups;
}

// Create data links

export interface CreateDataLinksParam extends JSONLikeObject {
    upa: string;
    id: string;
    version: number;
    node: string;
    // optional
    dataid?: string;
    update?: boolean;
    as_admin?: boolean;
    as_user?: Username;
}

export interface CreateDataLinksResult {
    new_link: DataLink;
}

// Expire data links

export interface ExpireDataLinksParam extends JSONLikeObject {
    upa: string;
    // optional
    dataid?: string;
    as_admin?: boolean;
    as_user?: Username;
}

// The service client itself

export interface SampleServiceClientParams extends ServiceClientParams {
    url: string;
}

export default class SampleServiceClient extends ServiceClient {
    module = 'SampleService';

    async status(): Promise<StatusResult> {
        const [result] = await this.callFunc<[], [StatusResult]>('status', []);
        return result;
    }

    async get_sample(params: GetSampleParams): Promise<GetSampleResult> {
        // TODO: revive the effort to provide result verification and type coercion.
        const [result] = (await this.callFunc<[JSONObject], [JSONObject]>(
            'get_sample',
            [objectToJSONObject(params)]
        )) as unknown as Array<GetSampleResult>;
        return result;
    }

    async get_data_links_from_sample(
        params: GetDataLinksFromSampleParams
    ): Promise<GetDataLinksFromSampleResult> {
        const [result] = await this.callFunc<[JSONObject], [JSONObject]>(
            'get_data_links_from_sample',
            [objectToJSONObject(params)]
        );
        return result as unknown as GetDataLinksFromSampleResult;
    }

    async get_metadata_key_static_metadata(
        params: GetMetadataKeyStaticMetadataParams
    ): Promise<GetMetadataKeyStaticMetadataResult> {
        const [result] = await this.callFunc<
            [GetMetadataKeyStaticMetadataParams],
            [JSONObject]
        >('get_metadata_key_static_metadata', [params]);
        return result as unknown as GetMetadataKeyStaticMetadataResult;
    }

    async get_sample_acls(
        params: GetSampleACLsParams
    ): Promise<GetSampleACLsResult> {
        const [result] = await this.callFunc<
            [GetSampleACLsParams],
            [GetSampleACLsResult]
        >('get_sample_acls', [params]);
        return result;
    }

    async create_data_link(
        params: CreateDataLinksParam
    ): Promise<CreateDataLinksResult> {
        const [result] = await this.callFunc<[JSONObject], [JSONObject]>(
            'create_data_link',
            [objectToJSONObject(params)]
        );
        return result as unknown as CreateDataLinksResult;
    }

    async expire_data_link(params: ExpireDataLinksParam): Promise<void> {
        await this.callFuncEmptyResult<[JSONObject]>('expire_data_link', [
            objectToJSONObject(params),
        ]);
    }

    // These are not part of the sample service api, but should be:

    get_field_definitions(
        params: GetFieldDefinitionsParams
    ): Promise<GetFieldDefinitionsResult> {
        // TODO: pass through to back end.
        // const [result] = await this.callFunc<[JSONObject],
        //     [GetFieldDefinitionsResult]>("get_field_definitions", [params]);
        // return result;

        // return {
        //     fields: schemas.filter((schema) => {
        //         return (params.keys.includes(schema.kbase.sample.key));
        //     })
        // }

        return Promise.resolve({
            fields: params.keys.map((key) => {
                if (key in schemasMap) {
                    return schemasMap[key];
                } else {
                    throw new Error(`Field key ${key} not found`);
                }
            }),
        });

        // const fields = await Promise.all(params.keys.map(async (key) => {
        //     const scrubbedKey = key.replace(/[:]/, "-");
        //     return await this.fetchSchema(scrubbedKey);
        // }));
        // return {fields};
    }

    get_field_groups(): Promise<GetFieldGroupsResult> {
        // const [result] = await this.callFunc<[],
        //     [GetFieldGroupsResult]>("get_field_groups", []);
        // return result;

        return Promise.resolve({
            groups,
        });

        // const result = await fetch(
        //     `${process.env.PUBLIC_URL}/mock-data/groups/groups.json`,
        // );
        //
        // if (result.status >= 300) {
        //     throw new Error(`Error fetching group definitions (${result.status})`);
        // }
        //
        // return await (async () => {
        //     const payload = await result.text();
        //     try {
        //         const groups = JSON.parse(payload) as FieldGroups;
        //         return {groups};
        //     } catch (ex) {
        //         throw new Error(
        //             `Invalid JSON for group definitions: ${ex.message}`,
        //         );
        //     }
        // })();
    }
}
