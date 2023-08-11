import { JSONArrayOf, JSONObjectOf, JSONValue } from 'lib/json';
import { hasOwnProperty } from 'lib/utils';
import * as uuid from 'uuid';


// The entire JSON RPC request object
export interface JSONRPCRequest {
    version: '1.1';
    method: string;
    id: string;
    params: Array<JSONValue>;
}

export interface JSONRPCErrorInfo {
    code: string;
    status?: number;
    message: string;
    detail?: string;
    data?: any;
}

// export class JSONRPCError extends Error {
//     code: string;
//     message: string;
//     detail?: string;
//     data?: any;
//     constructor(errorInfo: JSONRPCErrorInfo) {
//         super(errorInfo.message);
//         this.name = 'JSONRPCError';

//         this.code = errorInfo.code;
//         this.message = errorInfo.message;
//         this.detail = errorInfo.detail;
//         this.data = errorInfo.data;
//         this.stack = (<any>new Error()).stack;
//     }
// }



export interface JSONPayload {
    version: string;
    method: string;
    id: string;
    params: Array<JSONValue>;
}

export type JSONRPC11Result = JSONArrayOf<JSONValue> | JSONObjectOf<JSONValue> | null;

export interface JSONRPC11Error {
    name: string;
    code: number;
    message: string;
    error: JSONValue;
}

export type JSONRPCError = JSONRPC11Error;

export class JSONRPC11Exception extends Error {
    error: JSONRPC11Error;
    constructor(error: JSONRPCError) {
        super(error.message);
        this.error = error;
    }
}

export interface JSONRPCResponseResult {
    result: Array<JSONValue>;
    error: null;
}

export interface JSONRPCResponseError {
    result: null;
    error: JSONRPCError;
}

export type JSONRPCResponse = JSONRPCResponseResult | JSONRPCResponseError;

export class ConnectionError extends Error {
}

export class RequestError extends Error {
}

/**
 * Constructor parameters
 */
export interface JSONRPCClientParams {
    url: string;
    timeout: number;
    token?: string;
}

/**
 * A JSON-RPC 1.1 compliant client
 */
export class JSONRPCClient {
    url: string;
    timeout: number;
    token?: string;
    constructor({ url, timeout, token }: JSONRPCClientParams) {
        this.url = url;
        this.timeout = timeout;
        this.token = token;
    }

    /**
     * Given a method and parameters, construct and return a JSON-RPC 1.1 request
     * object - aka, payload.
     * @param method JSON-RPC 1.1 method name
     * @param params JSON-RPC 1.1 parameters; any JSON-compatible value will do.
     * @returns A JSON-RPC 1.1 request object
     */
    protected makePayload(
        method: string,
        params: Array<JSONValue>
    ): JSONPayload {
        return {
            version: '1.1',
            method,
            id: uuid.v4(),
            params,
        };
    }

    /**
     * Given a method name and parameters, call the known endpoint, process the response, 
     * and return the result. 
     * 
     * Exceptions included
     * 
     * @param method JSON-RPC 1.1 method name
     * @param params JSON-RPC 1.1 parameters; any JSON-compatible value will do.
     * @param options An object containing optional paremeters 
     * @returns A
     */
    async callMethod(
        method: string,
        params: Array<JSONValue>,
        { timeout }: { timeout?: number } = {}
    ): Promise<JSONRPC11Result> {
        // The innocuously named "payload" is the entire request object.
        const payload = this.makePayload(method, params);

        // In practice JSON-RPC 1.1 services at KBase don't care about content-type.
        const headers = new Headers();
        headers.set('content-type', 'application/json');
        headers.set('accept', 'application/json');
        if (this.token) {
            headers.set('authorization', this.token);
        }

        // The abort controller allows us to abort the request after a specific amount 
        // of time passes.
        const controller = new AbortController();
        const timeoutTimer = window.setTimeout(() => {
            controller.abort('Timeout');
        }, timeout)

        let response;
        try {
            response = await fetch(this.url, {
                method: 'POST',
                body: JSON.stringify(payload),
                headers,
                signal: controller.signal
            });
        } catch (ex) {
            if (ex instanceof DOMException) {
                throw new ConnectionError(`Connection error ${ex.name}: ${ex.message}`);
            } else if (ex instanceof TypeError) {
                throw new RequestError(`Request error: ${ex.message}`)
            } else {
                // Should never occur.
                throw ex;
            }
        }
        clearTimeout(timeoutTimer);

        const responseText = await response.text();
        let result;
        try {
            result = JSON.parse(responseText) as JSONArrayOf<JSONValue>;
        } catch (ex) {
            // Emit error to console for debugging, as this is a truly exceptional
            // case.
            console.error('error', ex);
            throw new JSONRPC11Exception({
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

        if (hasOwnProperty(result, 'error')) {
            const errorResult = result as unknown as JSONRPCResponseError;
            const { name, code, message, error } = errorResult.error;
            throw new JSONRPC11Exception({
                name, code, message, error
            });
        }

        const rpcResponse = result as unknown as JSONRPCResponseResult;
        return rpcResponse.result;
    }
}
