import { JSONRPCClient } from './JSONRPC11';

export interface GenericClientParams {
    module: string;
    url: string;
    timeout: number;
    authorization?: string;
}

export class GenericClient {
    module: string;
    url: string;
    timeout: number;
    authorization?: string;
    constructor({ url, timeout, authorization, module }: GenericClientParams) {
        this.url = url;
        this.timeout = timeout;
        this.authorization = authorization;
        this.module = module;
    }
    async callFunc<ParamType, ReturnType>(funcName: string, params: ParamType): Promise<ReturnType> {
        const client = new JSONRPCClient({
            url: this.url,
            timeout: this.timeout,
            authorization: this.authorization
        });
        const method = `${this.module}.${funcName}`;
        const result = await client.callMethod(method, [params], { timeout: this.timeout });

        if (result.length === 0) {
            throw new Error('Too few (0) return values in return array');
        }

        return (result[0] as unknown) as ReturnType;
    }
    async callFuncEmptyResult<ParamType, ReturnType>(funcName: string, params: ParamType): Promise<void> {
        const client = new JSONRPCClient({
            url: this.url,
            timeout: this.timeout,
            authorization: this.authorization
        });
        const method = `${this.module}.${funcName}`;
        const result = await client.callMethod(method, [params], { timeout: this.timeout });

        if (result.length !== 0) {
            throw new Error(`Too many (${result.length}) return values in return array`);
        }

        return;
    }
}
