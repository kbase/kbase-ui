import { JSONValue } from '@kbase/ui-lib/lib/json';
import { JSONRPCClient, JSONRPCParams } from './JSONRPC20';

export interface ServiceClientParams {
    url: string;
    timeout: number;
    token?: string;
    prefix?: boolean;
}

export abstract class ServiceClient {
    abstract module: string;
    url: string;
    timeout: number;
    token?: string;
    prefix?: boolean;
    protected constructor({
        url,
        timeout,
        token,
        prefix = true,
    }: ServiceClientParams) {
        this.url = url;
        this.timeout = timeout;
        this.token = token;
        this.prefix = prefix;
    }
    async callFunc(
        funcName: string,
        params?: JSONRPCParams
    ): Promise<JSONValue> {
        const client = new JSONRPCClient({
            url: this.url,
            timeout: this.timeout,
            token: this.token,
        });
        const method = (() => {
            if (this.prefix) {
                return `${this.module}.${funcName}`;
            } else {
                return funcName;
            }
        })();
        return await client.callMethod(method, params, {
            timeout: this.timeout,
        });
    }
}
