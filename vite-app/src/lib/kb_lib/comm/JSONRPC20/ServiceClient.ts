import { JSONRPC20Params, JSONRPC20Result, JSONRPCClient, resultOrThrow } from './JSONRPC20';

export interface ServiceClientParams {
    url: string;
    timeout: number;
    token?: string;
}


/**
 * The base class for all KBase JSON-RPC 1.1 services
 */
export abstract class ServiceClient {
    abstract module: string;
    abstract prefix: boolean;
    url: string;
    timeout: number;
    token?: string;

    constructor({ url, timeout, token }: ServiceClientParams) {
        this.url = url;
        this.timeout = timeout;
        this.token = token;
    }

    /**
     * The single point of entry for RPC calls, just to help dry out the class.
     * 
     * @param funcName 
     * @param params 
     * @returns 
     */

    public async callFunc(funcName: string, params?: JSONRPC20Params): Promise<JSONRPC20Result> {
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
        return resultOrThrow(result);
    }

    /**
     * For a given function name and set of parameters, calls the configured service and
     * returns the results.
     * 
     * Note that as the KBase convention is that parameters and results are wrapped in
     * an array, only the first parameter is used, and the first parameter is usually
     * an object, in which the "parameters" are the object properties.
     * 
     * This follows the JSON-RPC 1.0/1.1 specification that describes how the parameters can
     * operate like position arguments when an array is used, or as named arguments when an
     * object is used. The original implementation was probably based on JSON-RPC 1.0, in which 
     * the parameters must be an array and thus operate like positional arguments.
     * 
     * This method, and the Service Client generally, operates at this raw JSON-RPC 1.1 level.
     * An implementation of a service client (i.e. an extension of this abstract class)
     * will probably just deal with the unwrapped parameter and result objects.
     * 
     * Also note that we use the term "function" or "func" to refer to what is known as the
     * "method" in JSON-RPC terms. This is because the "method" name is actually a concatenation
     * of the module and function - so "module.function" is the actual method name. Also, in the
     * kb-sdk conventions, the JSON-RPC methods are always referred to as "functions".
     * 
     * @param funcName The name of the service function to call
     * @param params The parameters for the function, wrapped in an Array
     * @returns The result of the function call, wrapped in an Array
     */
    // protected async callFunc(
    //     funcName: string,
    //     params?: JSONRPCParams
    // ): Promise<JSONRPC20Result> {
    //     const result = await this.callFunc0<ParamType>(funcName, params);

    //     if (!isJSONArray(result)) {
    //         throw new Error(`Invalid result type; expected array, got ${typeof result}`)
    //     }

    //     if (result.length === 0) {
    //         throw new Error('Too few (none) return values in return array');
    //     }

    //     return result as unknown as ReturnType;
    // }

    /**
     * This method handles the variants of the service "function call", in which the result
     * array wrapping convention is broken. For some reason, early implementations in KBase
     * did not recognize (or care to recognize) the JSON-RPC spec, which for versions 1.0 
     * requires an array, and for 1.1 an array or object ... and in cases for which there is
     * no result, return a "null". Of course, this should have been achieved with an empty
     * array.
     * 
     * This could be implemented within the callFunc method above, but as this is an outlier
     * case, we've implemented it in a separate method, to keep the internal logica easier
     * to understand. And since it is only used for implementing service apis and not in 
     * normal user code, this is a surely a fine compromise.
     * 
     * Also, it allows us to return void rather than null, as that is the ultimate meaning
     * of returning either null or [] or {}.
     * 
     * @param funcName The name of the service function to call
     * @param params The parameters for the function, wrapped in an Array
     * @returns 
     */
    // protected async callFuncEmptyResult<ParamType extends JSONArray>(
    //     funcName: string,
    //     params?: ParamType
    // ): Promise<void> {
    //     const result = await this.callFunc0<ParamType>(funcName, params);

    //     if (result !== null) {
    //         if (Array.isArray(result) && result.length !== 0) {
    //             throw new Error(
    //                 `Too many (${result.length}) return values in return array`
    //             );
    //         } else {
    //             throw new Error(
    //                 `Unexpected type for a method with no results; expected "null", received ${typeof result}`
    //             );
    //         }
    //     }

    //     return;
    // }
}
