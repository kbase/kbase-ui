import { JSONArrayOf, JSONValue } from 'lib/json';
import { ServiceClient, ServiceClientParams } from './ServiceClient';

export type GenericClientParams = JSONArrayOf<JSONValue>;
export type GenericClientResult = JSONArrayOf<JSONValue>;

export interface GenericClientConstructorParams extends ServiceClientParams {
    module: string;
}

/**
 * The "GenericClient" provides unfettered access to a service. It is based on the 
 * ServiceClient, so it is essentially a free-form implementation of a client. 
 * 
 * It is preferred to create bespoke service clients which define methods named
 * for the corresponding functions. This allows for good typing, and less code and
 * handling of various conditions in user code.
 */
export default class GenericClient extends ServiceClient {
    module: string = '';

    constructor(params: GenericClientConstructorParams) {
        super(params);
        this.module = params.module;
    }

    /**
     * For normal, Array-wrapped results.
     * 
     * @param method 
     * @param params 
     * @returns 
     */
    public async func(
        method: string,
        params: GenericClientParams
    ): Promise<GenericClientResult> {
        const result = await this.callFunc<GenericClientParams, GenericClientResult>(
            method,
            params
        );
        return result;
    }

    /**
     * For methods which return no results, which is typically by returning null, which is
     * a meaningless result.
     * 
     * @param method 
     * @param params 
     */
    public async proc(
        method: string,
        params: GenericClientParams
    ): Promise<void> {
        await this.callFuncEmptyResult<GenericClientParams>(
            method,
            params
        );
    }
}
