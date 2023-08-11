import { JSONObject, JSONValue } from 'lib/json';
import { toJSON } from 'lib/kb_lib/jsonLike';



export interface ServiceClientParams {
    url: string;
    timeout: number;
    token?: string;
}

export interface SearchParams {
    [key: string]: string
}

export type SearchParams2 = Array<[string, string]>

/*
 * arg is:
 * url - service wizard url
 * timeout - request timeout
 * version - service release version or tag
 * auth - auth structure
 *   token - auth token
 *   username - username
 * rpcContext
 */

export interface ServiceErrorResponse {
    code: number,
    title?: string,
    message: string,
    data?: JSONObject
}

export class ServiceError extends Error {
    responseCode: number;
    code: number;
    title?: string;
    data?: JSONObject;
    constructor(responseCode: number, response: ServiceErrorResponse) {
        super(response.message);
        this.title = response.title;
        this.code = response.code;
        this.data = response.data;
        this.responseCode = responseCode;
    }
}

export class InternalServerError extends ServiceError {

}

export class ClientError extends ServiceError {

}


export abstract class ServiceClientBase {
    url: string;
    timeout: number;
    token?: string;

    abstract module: string;

    constructor(params: ServiceClientParams) {
        this.url = params.url;
        this.token = params.token;
        this.timeout = params.timeout;
    }

    protected abstract getURL(): Promise<string>;

    private async handleResponse<T>(response: Response): Promise<T> {
        const rawResult = await response.text();
        const result = (() => {
            try {
                // TODO: align this with how we are designing the ORCID Link Service
                // The response can either be:
                // 200 with the expected JSON value
                // 4xx with the JSON response: code, message, data?
                // 500 with the JSON response: code, message, data, where
                // data contains at least exception, traceback
                // It should always contain a JSON response.
                return JSON.parse(rawResult);
            } catch (ex) {
                if (ex instanceof Error) {
                    throw new Error('Error parsing JSON: ' + ex.message);
                }
                throw new Error('Error parsing JSON: Unknown Error');
            }
        })();

        if (response.status === 500) {
            const errorResult = result as unknown as ServiceErrorResponse;
            throw new InternalServerError(response.status, errorResult);
        } else if (response.status >= 400) {
            // TODO: real RestException
            const errorResult = result as unknown as ServiceErrorResponse;
            throw new ClientError(response.status, errorResult);
        }

        return result as unknown as T;
    }

    private async handleEmptyResponse(response: Response): Promise<void> {
        // const rawResult = await response.text();
        // const result = (() => {
        //     try {
        //         // TODO: align this with how we are designing the ORCID Link Service
        //         // The response can either be:
        //         // 200 with the expected JSON value
        //         // 4xx with the JSON response: code, message, data?
        //         // 500 with the JSON response: code, message, data, where
        //         // data contains at least exception, traceback
        //         // It should always contain a JSON response.
        //         return JSON.parse(rawResult);
        //     } catch (ex) {
        //         if (ex instanceof Error) {
        //             throw new Error('Error parsing JSON: ' + ex.message);
        //         }
        //         throw new Error('Error parsing JSON: Unknown Error');
        //     }
        // })();

        if (response.status !== 204) {
            const result = await response.json();
            if (response.status === 500) {
                const errorResult = result as unknown as ServiceErrorResponse;
                throw new InternalServerError(response.status, errorResult);
            } else if (response.status >= 400) {
                // TODO: real RestException
                const errorResult = result as unknown as ServiceErrorResponse;
                throw new ClientError(response.status, errorResult);
            }
        }
    }

    protected async get<ReturnType>(
        path: string,
        data?: SearchParams
    ): Promise<ReturnType> {
        const url = await this.getURL();

        const headers = new Headers({
            accept: 'application/json'
        });

        if (this.token) {
            headers.append('Authorization', this.token);
        }

        const requestURL = (() => {
            const theURL = new URL(`${url}/${path}`);
            if (data) {
                for (const [key, value] of Object.entries(data)) {
                    theURL.searchParams.set(key, value);
                }
            }
            return theURL;
        })();

        const response = await fetch(requestURL.toString(), {
            method: 'GET',
            headers
        });

        return this.handleResponse<ReturnType>(response);
    }

    protected async get2<ReturnType>(
        path: string,
        data?: SearchParams2
    ): Promise<ReturnType> {
        const url = await this.getURL();

        const headers = new Headers({
            accept: 'application/json'
        });

        if (this.token) {
            headers.append('Authorization', this.token);
        }

        const requestURL = (() => {
            const theURL = new URL(`${url}/${path}`);
            if (data) {
                for (const [key, value] of data) {
                    theURL.searchParams.append(key, value);
                }
            }
            return theURL;
        })();

        // const requestURL = `${url}/${path}`;
        const response = await fetch(requestURL.toString(), {
            method: 'GET',
            headers
        });

        return this.handleResponse<ReturnType>(response);
    }

    protected async delete(
        path: string,
    ): Promise<void> {
        const url = await this.getURL();

        const headers = new Headers({
            accept: 'application/json'
        });

        if (this.token) {
            headers.append('Authorization', this.token);
        }

        const requestURL = `${url}/${path}`;
        const response = await fetch(requestURL, {
            method: 'DELETE',
            headers
        });

        // TODO: check response status code. Should be 204, otherwise throw error.

        return this.handleEmptyResponse(response);
    }

    protected async put<ReturnType>(
        path: string,
        data?: JSONValue
    ): Promise<ReturnType> {
        const url = await this.getURL();

        const headers = new Headers({
            'content-type': 'application/json',
            accept: 'application/json'
        });

        if (this.token) {
            headers.append('Authorization', this.token);
        }

        const requestURL = `${url}/${path}`;

        const options: RequestInit = {
            method: 'PUT',
            headers
        };
        if (typeof data !== 'undefined') {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(requestURL, options);

        return this.handleResponse<ReturnType>(response);
    }

    protected async post<ReturnType>(
        path: string,
        data?: JSONValue
    ): Promise<ReturnType> {
        const url = await this.getURL();

        const headers = new Headers({
            'content-type': 'application/json',
            accept: 'application/json'
        });

        if (this.token) {
            headers.append('Authorization', this.token);
        }

        const requestURL = `${url}/${path}`;

        const options: RequestInit = {
            method: 'POST',
            headers
        };
        if (typeof data !== 'undefined') {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(requestURL, options);

        return this.handleResponse<ReturnType>(response);
    }

    protected async post2<ParamType, ReturnType>(
        path: string,
        data?: ParamType
    ): Promise<ReturnType> {
        const url = await this.getURL();

        const headers = new Headers({
            'content-type': 'application/json',
            accept: 'application/json'
        });

        if (this.token) {
            headers.append('Authorization', this.token);
        }

        const requestURL = `${url}/${path}`;

        const options: RequestInit = {
            method: 'POST',
            headers
        };
        if (typeof data !== 'undefined') {
            options.body = JSON.stringify(toJSON(data));
        }

        const response = await fetch(requestURL, options);

        return this.handleResponse<ReturnType>(response);
    }
}


export abstract class ServiceClient extends ServiceClientBase {
    async getURL(): Promise<string> {
        return this.url;
    }
}

