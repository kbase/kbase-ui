define([
    './HttpClient'
], (
    { HttpClient,  GeneralError, TimeoutError, AbortError, HttpHeader }
) => {


    // export interface KBaseJsonRpcRequestOptions {
    //     url: string,
    //     module: string,
    //     func: string,
    //     params: any,
    //     rpcContext: any,
    //     timeout: number,
    //     authorization: string
    // }

    // // The JSON RPC Request parameters
    // // An array of  JSON objects
    // export interface JsonRpcParam {
    //     [key: string]: any
    // }

    // // The entire JSON RPC request object
    // export interface KBaseJsonRpcRequest {
    //     method: string,
    //     version: '1.1',
    //     id: string,
    //     params: Array<JsonRpcParam>,
    //     context?: any
    // }

    // export interface JsonRpcErrorInfo {
    //     code: string,
    //     status?: number,
    //     message: string,
    //     detail?: string
    //     data?: any
    // }

    class KBaseJsonRpcError extends Error {
    // code: string;
    // message: string;
    // detail?: string;
    // data?: any;
        constructor(errorInfo) {
            super(errorInfo.message);
            Object.setPrototypeOf(this, KBaseJsonRpcError.prototype);
            this.name = 'JsonRpcError';

            this.code = errorInfo.code;
            this.message = errorInfo.message;
            this.detail = errorInfo.detail;
            this.data = errorInfo.data;
            this.stack = (new Error()).stack;
        }
    }

    class KBaseJsonRpcClient {
        constructor() {

        }

        isGeneralError(error) {
            return (error instanceof GeneralError);
        }

        request(options) {
            const rpc = {
                version: '1.1',
                method: options.module + '.' + options.func,
                id: String(Math.random()).slice(2),
                params: options.params,
            };
            if (options.rpcContext) {
                rpc.context = options.rpcContext;
            }

            const header = new HttpHeader();
            if (options.authorization) {
                header.setHeader('authorization', options.authorization);
            }

            const requestOptions = {
                method: 'POST',
                url: options.url,
                timeout: options.timeout,
                data: JSON.stringify(rpc),
                header: header
            };

            const httpClient = new HttpClient();
            return httpClient.request(requestOptions)
                .then(function (result) {
                    try {
                        return JSON.parse(result.response);
                    } catch (ex) {
                        throw new KBaseJsonRpcError({
                            code: 'parse-error',
                            message: ex.message,
                            detail: 'The response from the service could not be parsed',
                            data: {
                                responseText: result.response
                            }
                        });
                    }
                })
                .catch(GeneralError, (err) => {
                    throw new KBaseJsonRpcError({
                        code: 'connection-error',
                        message: err.message,
                        detail: 'An error was encountered communicating with the service',
                        data: {}
                    });
                })
                .catch(TimeoutError, (err) => {
                    throw new KBaseJsonRpcError({
                        code: 'timeout-error',
                        message: err.message,
                        detail: 'There was a timeout communicating with the service',
                        data: {}
                    });
                })
                .catch(AbortError, (err) => {
                    throw new KBaseJsonRpcError({
                        code: 'abort-error',
                        message: err.message,
                        detail: 'The connection was aborted while communicating with the s ervice',
                        data: {}
                    });
                });

        }

    }

    return {KBaseJsonRpcClient, KBaseJsonRpcError};
});