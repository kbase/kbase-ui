import { JSONValue } from '@kbase/ui-lib/lib/json';
import { JSONRPCClient, JSONRPCParams } from './JSONRPC20';

export interface ServiceClient2Params {
    url: string;
    timeout: number;
    token?: string;
    prefix?: boolean;
}

export abstract class ServiceClient2 {
    url: string;
    timeout: number;
    token?: string;
    constructor({
        url,
        timeout,
        token
    }: ServiceClient2Params) {
        this.url = url;
        this.timeout = timeout;
        this.token = token;
    }
    async callMethod(
        method: string,
        params?: JSONRPCParams
    ): Promise<JSONValue> {
        const client = new JSONRPCClient({
            url: this.url,
            timeout: this.timeout,
            token: this.token,
        });
        return await client.callMethod(method, params, {
            timeout: this.timeout,
        });
    }
}
