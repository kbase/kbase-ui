import { JSONArray, JSONObject, JSONValue } from 'lib/json';
import * as uuid from 'uuid';

export type JSONRPC20Params = JSONObject | JSONArray;

export type JSONRPCId = string | number | null;

// The entire JSON RPC request object
export interface JSONRPC20Request {
    jsonrpc: '2.0';
    method: string;
    id?: JSONRPCId;
    params?: JSONRPC20Params;
}

// export interface JSONRPCErrorInfo {
//     code: string;
//     status?: number;
//     message: string;
//     detail?: string;
//     data?: any;
// }

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

export type JSONRPC20Result = JSONValue;

export interface JSONRPC20ResultResponse {
    jsonrpc: '2.0',
    id?: JSONRPCId
    result: JSONRPC20Result,
}

export interface JSONRPC20ErrorResponse {
    jsonrpc: '2.0',
    id?: JSONRPCId
    error: JSONRPC20Error
}

export interface JSONRPC20Error {
    code: number;
    message: string;
    data?: JSONValue;
}

export class JSONRPC20Exception extends Error {
    error: JSONRPC20Error;
    constructor(error: JSONRPC20Error) {
        super(error.message);
        this.error = error;
    }
}

export function resultOrThrow(response: JSONRPC20Response): JSONRPC20Result {
    if ('result' in response) {
        return response.result;
    }
    throw new JSONRPC20Exception(response.error);
}

// export interface JSONRPCResponseResult {
//     result: Array<JSONValue>;
//     error: null;
// }

// export interface JSONRPCResponseError {
//     result: null;
//     error: JSONRPCError;
// }

export type JSONRPC20Response = JSONRPC20ResultResponse | JSONRPC20ErrorResponse;

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
 * A JSON-RPC 2.0 compliant client
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
    // protected makePayload(
    //     method: string,
    //     params?: JSONRPCParams
    // ): JSONRPC20Request {
    //     return {
    //         jsonrpc: '2.0',
    //         method,
    //         id: uuid.v4(),
    //         params,
    //     };
    // }

    /**
     * Given a method name and parameters, call the known endpoint, process the response, 
     * and return the result. 
     * 
     * Exceptions included
     * 
     * @param method JSON-RPC 2.0 method name
     * @param params JSON-RPC 2.0 parameters; must be an object or array
     * @param options An object containing optional parameters 
     * @returns A
     */
    async callMethod(
        method: string,
        params?: JSONRPC20Params,
        { timeout }: { timeout?: number } = {}
    ): Promise<JSONRPC20Response> {
        // The innocuously named "payload" is the entire request object.
        const payload = {
            jsonrpc: '2.0',
            method,
            id: uuid.v4(),
            params,
        }

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
                mode: 'cors',
                signal: controller.signal
            });
        } catch (ex) {
            if (ex instanceof DOMException) {
                console.error('ERROR', this.url, ex);
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
        const responseStatus = response.status;
        let result;
        try {
            result = JSON.parse(responseText);
        } catch (ex) {
            // Emit error to console for debugging, as this is a truly exceptional
            // case.
            console.error('error', ex);

            throw new JSONRPC20Exception({
                // name: 'parse error',
                code: 100,
                message:
                    `The response from the service could not be parsed (${responseStatus})`,
                data: {
                    originalMessage:
                        ex instanceof Error ? ex.message : 'Unknown error',
                    responseText,
                    responseStatus
                },
            });
        }

        // if (hasOwnProperty(result, 'result')) {
        //     const resultResult = result as unknown as JSONRPC20ResultRespose;
        //     return resultResult;
        // }

        // if (hasOwnProperty(result, 'error')) {
        //     const errorResult = result as unknown as JSONRPC20Error;
        //     // const {  code, message, data } = errorResult.error;
        //     // throw new JSONRPC20Exception({
        //     //      code, message, data
        //     // });
        //     return errorResult;
        // }

        return result as unknown as JSONRPC20Response;
        // return rpcResponse.result;
    }
}
