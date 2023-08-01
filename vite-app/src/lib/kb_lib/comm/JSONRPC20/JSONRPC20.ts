// import { v4 as uuidv4 } from "https://deno.land/std@0.99.0/uuid/mod.ts";
import { JSONArray, JSONObject, JSONValue } from '@kbase/ui-lib/lib/json';
import * as uuid from 'uuid';

export interface JSONRPCRequestOptions {
    func: string;
    params: any;
    timeout?: number;
    token?: string;
}

// The entire JSON RPC request object
export interface JSONRPCRequest {
    method: string;
    jsonrpc: '2.0';
    id: string;
    params: Array<JSONValue>;
    context?: any;
}

export interface JSONRPCErrorInfo {
    code: string;
    status?: number;
    message: string;
    detail?: string;
    data?: any;
}

export interface JSONRPCClientParams {
    url: string;
    timeout: number;
    token?: string;
}

export type JSONRPCParams = JSONArray | JSONObject;

export interface JSONPayload {
    jsonrpc: string;
    method: string;
    id: string;
    params?: JSONRPCParams;
}

export interface JSONRPC20Error {
    name: string;
    code: number;
    message: string;
    error: JSONValue;
}

export type JSONRPCError = JSONRPC20Error;

export class JSONRPC20Exception extends Error {
    error: JSONRPC20Error;
    constructor(error: JSONRPCError) {
        super(error.message);
        this.error = error;
    }
}

export interface JSONRPCResponseBase {
    jsonrpc: '2.0';
    id?: string;
}

export interface JSONRPCResponseResult extends JSONRPCResponseBase {
    result: JSONValue;
}

export interface JSONRPCResponseError extends JSONRPCResponseBase {
    error: JSONRPCError;
}

export type JSONRPCResponse = JSONRPCResponseResult | JSONRPCResponseError;

export class JSONRPCClient {
    url: string;
    timeout: number;
    token?: string;
    constructor({ url, timeout, token }: JSONRPCClientParams) {
        this.url = url;
        this.timeout = timeout;
        this.token = token;
    }

    protected makePayload(method: string, params?: JSONRPCParams): JSONPayload {
        return {
            jsonrpc: '2.0',
            method,
            id: uuid.v4(),
            params,
        };
    }

    async callMethod(
        method: string,
        params?: JSONRPCParams,
        { timeout }: { timeout?: number } = {}
    ): Promise<JSONValue> {
        const payload = this.makePayload(method, params);
        const headers = new Headers();
        headers.set('content-type', 'application/json');
        headers.set('accept', 'application/json');
        if (this.token) {
            headers.set('authorization', this.token);
        }

        // TODO: timeout, cancellation
        const response = await fetch(this.url, {
            method: 'POST',
            body: JSON.stringify(payload),
            headers,
        });

        const rpcResponse = await (async () => {
            const responseText = await response.text();

            try {
                return JSON.parse(responseText) as JSONRPCResponse;
            } catch (ex) {
                console.error('error', ex);
                throw new JSONRPC20Exception({
                    name: 'parse error',
                    code: 100,
                    message:
                        'The response from the service could not be parsed',
                    error: {
                        originalMessage:
                            ex instanceof Error ? ex.message : 'Unknown error',
                        responseText,
                    },
                });
            }
        })();

        if ('error' in rpcResponse) {
            throw new JSONRPC20Exception({
                name: rpcResponse.error.name,
                code: rpcResponse.error.code,
                message: rpcResponse.error.message,
                error: rpcResponse.error.error,
            });
        }

        return rpcResponse.result;
    }
}
