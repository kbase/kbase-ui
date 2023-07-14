import { ServiceClient, ServiceClientParams } from './ServiceClient';
import { JSONRPCParams } from './JSONRPC20';
import { JSONValue } from '@kbase/ui-lib/lib/json';

export interface GenericClientConstructorParams extends ServiceClientParams {
    module: string;
}

export default class GenericClient extends ServiceClient {
    module: string = '';

    constructor(params: GenericClientConstructorParams) {
        super(params);
        this.module = params.module;
    }

    public async callMethod(
        method: string,
        params: JSONRPCParams
    ): Promise<JSONValue> {
        return await this.callFunc(method, params);
    }
}
