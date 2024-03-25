import { JSONRPC20Params, JSONRPC20Response, JSONRPCClient } from './JSONRPC20';

export interface GenericClientClientParams {
    module: string;
    url: string;
    timeout: number;
    token?: string;
    prefix?: boolean;
}


/**
 * The base class for all KBase JSON-RPC 1.1 services
 */
export default class GenericClient {
    module: string;
    url: string;
    timeout: number;
    token?: string;
    prefix?: boolean;

    constructor({ module, url, timeout, token, prefix }: GenericClientClientParams) {
        this.module = module;
        this.url = url;
        this.timeout = timeout;
        this.token = token;
        this.prefix = prefix;
    }

    /**
     * The single point of entry for RPC calls, just to help dry out the class.
     * 
     * @param funcName 
     * @param params 
     * @returns 
     */
    public async callFunc(funcName: string, params?: JSONRPC20Params): Promise<JSONRPC20Response> {
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
        const result = await client.callMethod(method, params, {
            timeout: this.timeout,
        });
        return result;
    }

}
