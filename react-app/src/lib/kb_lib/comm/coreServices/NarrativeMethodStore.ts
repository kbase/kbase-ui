import {
    JSONObject,
    JSONObjectOf,
    JSONValue,
    objectToJSONObject,
} from '@kbase/ui-lib/lib/json';
import { JSONLikeArrayOf, JSONLikeObject, toJSON } from '../../jsonLike';
import { ServiceClient } from '../JSONRPC11/ServiceClient';
import { EpochTimeMS, Mapping, SDKBoolean } from '../types';

// Get Method Brief Info

export type AppTag = 'dev' | 'beta' | 'release';

export interface GetMethodBriefInfoParams {
    ids: Array<string>;
    tag?: AppTag | null;
}

export interface GetMethodBriefInfoResult extends JSONLikeObject {
    id: string;
    module_name: string;
    git_commit_hash: string;
    name: string;
    ver: string;
    subtitle: string;
    tooltip: string;
    icon: {
        url: string;
    };
    categories: Array<string>;
    authors: Array<string>;
    input_types: Array<string>;
    output_types: Array<string>
    app_type: string;
    namespace: string;
}


export default class NarrativeMethodStoreClient extends ServiceClient {
    module = 'NarrativeMethodStore';

    // TODO: should be void not null
    async ver(): Promise<string> {
        const [result] = await this.callFunc<[null], [string]>('ver', [null]);
        return result;
    }

    async get_method_brief_info(
        params: GetMethodBriefInfoParams
    ) {
        const [object] = await this.callFunc<[JSONValue], [JSONValue]>(
            'get_method_brief_info',
            [toJSON(params)]
        );
        return object as GetMethodBriefInfoResult;
    }

}
