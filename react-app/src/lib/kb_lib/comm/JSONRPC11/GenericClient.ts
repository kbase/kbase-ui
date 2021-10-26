import { JSONArrayOf, JSONValue } from '@kbase/ui-lib/lib/json';
import { ServiceClient, ServiceClientParams } from './ServiceClient';

export type GenericClientParams = JSONArrayOf<JSONValue>;
export type GenericClientResult = JSONArrayOf<JSONValue>;

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
        params: GenericClientParams
    ): Promise<GenericClientResult> {
        return await this.callFunc<GenericClientParams, GenericClientResult>(
            method,
            params
        );
    }
}
