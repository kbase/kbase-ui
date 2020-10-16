import { JSONRPCClient } from './JSONRPC11';

export interface ServiceClientParams {
    url: string;
    timeout: number;
    authorization?: string;
}

export abstract class ServiceClient {
    abstract module: string;
    url: string;
    timeout: number;
    authorization?: string;
    constructor({ url, timeout, authorization }: ServiceClientParams) {
        this.url = url;
        this.timeout = timeout;
        this.authorization = authorization;
    }
    async callFunc<ParamType, ReturnType>(funcName: string, params: ParamType): Promise<ReturnType> {
        const client = new JSONRPCClient({ url: this.url, timeout: this.timeout, authorization: this.authorization });
        const method = this.module + '.' + funcName;
        const result = await client.callMethod(method, [params], { timeout: this.timeout });

        if (result.length === 0) {
            throw new Error('Too few (none) return values in return array');
        }

        return (result[0] as unknown) as ReturnType;
    }
    async callFuncEmptyResult<ParamType, ReturnType>(funcName: string, params: ParamType): Promise<void> {
        const client = new JSONRPCClient({ url: this.url, timeout: this.timeout, authorization: this.authorization });
        const method = this.module + '.' + funcName;
        const result = await client.callMethod(method, [params], { timeout: this.timeout });

        if (result.length !== 0) {
            throw new Error(`Too many (${result.length}) return values in return array`);
        }

        return;
    }

}
