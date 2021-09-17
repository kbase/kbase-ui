import {
    HTTPClient,
    GeneralError,
    RequestOptions,
    HTTPHeader,
} from '../HTTPClient';

// import { v4 as uuid } from 'uuid';
import { JSONValue } from '../../json';
import { uniqueId } from '../../Utils';

export interface JSONRPCRequestOptions {
    func: string;
    params: any;
    timeout?: number;
    authorization?: string;
}

// The JSON RPC Request parameters
// An array of  JSON objects
export interface JSONRPCParam {
    [key: string]: any;
}

// The entire JSON RPC request object
export interface JSONRPCRequest {
    method: string;
    version: '1.1';
    id: string;
    params: Array<JSONRPCParam>;
    context?: any;
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

export interface JSONRPCClientParams {
    url: string;
    timeout: number;
    authorization?: string;
}

export interface JSONPayload {
    version: string;
    method: string;
    id: string;
    params: Array<JSONValue>;
}

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

export class JSONRPCClient {
    url: string;
    timeout: number;
    authorization?: string;
    constructor({ url, timeout, authorization }: JSONRPCClientParams) {
        this.url = url;
        this.timeout = timeout;
        this.authorization = authorization;
    }

    isGeneralError(error: GeneralError) {
        return error instanceof GeneralError;
    }

    protected makePayload(
        method: string,
        params: Array<JSONRPCParam>
    ): JSONPayload {
        return {
            version: '1.1',
            method,
            id: uniqueId(),
            params: params,
        };
    }

    async callMethod(
        method: string,
        params: Array<JSONRPCParam>,
        { timeout }: { timeout?: number } = {}
    ): Promise<Array<JSONValue>> {
        const payload = this.makePayload(method, params);
        // const rpc: JSONRPCRequest = {
        //     version: '1.1',
        //     method: method,
        //     id: uuid.v4(),
        //     params: [params],
        // };

        const header: HTTPHeader = new HTTPHeader();
        header.setHeader('content-type', 'application/json');
        header.setHeader('accept', 'application/json');
        if (this.authorization) {
            header.setHeader('authorization', this.authorization);
        }

        const requestOptions: RequestOptions = {
            method: 'POST',
            url: this.url,
            timeout: timeout || this.timeout,
            data: JSON.stringify(payload),
            header: header,
        };

        const httpClient = new HTTPClient();
        return httpClient
            .request<string>(requestOptions)
            .then((httpResponse) => {
                let result: JSONRPCResponse;
                try {
                    result = JSON.parse(
                        httpResponse.response
                    ) as unknown as JSONRPCResponse;
                } catch (ex) {
                    const message = (() => {
                        if (ex instanceof Error) {
                            return ex.message;
                        }
                        return '';
                    })();
                    throw new JSONRPC11Exception({
                        name: 'parse error',
                        code: 100,
                        message:
                            'The response from the service could not be parsed',
                        error: {
                            originalMessage: message,
                            responseText: httpResponse.response,
                        },
                    });
                }

                if (result.hasOwnProperty('error')) {
                    const errorResult =
                        result as unknown as JSONRPCResponseError;
                    throw new JSONRPC11Exception({
                        name: errorResult.error.name,
                        code: errorResult.error.code,
                        message: errorResult.error.message,
                        error: errorResult.error.error,
                    });
                }

                // if (!(result instanceof Array)) {
                //     throw new JSONRPC11Exception({
                //         name: 'params not array',
                //         code: 100,
                //         message: 'Parameter is not an array',
                //         error: {}
                //     });
                // }
                const rpcResponse = result as unknown as JSONRPCResponseResult;
                return rpcResponse.result;
                // let x: T = ({} as unknown) as T;
                // return x;
            });
        // .then((response) => {
        //     let result: JSONValue;
        //     try {
        //         result = JSON.parse(response.response);
        //     } catch (ex) {
        //         throw new JSONRPC11Exception({
        //             name: 'parse error',
        //             code: 100,
        //             message: 'The response from the service could not be parsed',
        //             error: {
        //                 originalMessage: ex.message,
        //                 responseText: response.response
        //             }
        //         });
        //     }
        //     if (result.hasOwnProperty('error')) {
        //         const errorResult = (result as unknown) as JSONRPCResponseError;
        //         throw new JSONRPC11Exception({
        //             name: result.name,
        //             code: result.code,

        //         })
        //     }
        //     const rpcResponse = (result as unknown) as JSONRPCResponseResult<T>;
        //     return rpcResponse.result;
        // })
        // .catch((err) => {
        //     if (err instanceof GeneralError) {
        //         throw new JSONRPC11Exception({
        //             name: 'connection-error',
        //             code: 100,
        //             message: 'An error was encountered communicating with the service',
        //             error: {
        //                 originalMessage: err.message
        //             }
        //         });
        //     } else if (err instanceof TimeoutError) {
        //         throw new JSONRPC11Exception({
        //             name: 'timeout-error',
        //             code: 100,
        //             error: {
        //                 originalMessage: err.message
        //             },
        //             message: 'There was a timeout communicating with the service'
        //         });
        //     } else if (err instanceof AbortError) {
        //         throw new JSONRPC11Exception({
        //             name: 'abort-error',
        //             code: 100,
        //             error: {
        //                 originalMessage: err.message
        //             },
        //             message: 'The connection was aborted while communicating with the service'
        //         });
        //     }
        // });
    }
}
