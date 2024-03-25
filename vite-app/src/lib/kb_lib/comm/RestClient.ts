/*
    JSONRPC20
    A module implementing JSORPC 2.0
    See: https://www.jsonrpc.org/specification

    This implementation is not complete, but functional enough for it's usages.
    Extend as need be.
*/

export interface RestClientParams {
    url: string;
    timeout: number;
    token?: string;
}

export interface GetParams {
    path: string;
    params?: Record<string, string>;
    timeout?: number;
}

export default class RestClient {
    url: URL;
    timeout: number;
    token?: string
    constructor({url, token, timeout}: RestClientParams) {
        this.url = new URL(url);
        this.timeout = timeout;
        this.token = token;
    }

    createTimeout(after: number) {
        if (!AbortController) {
            console.warn('AbortController not available, cannot implement timeout');
        }
        const controller = new AbortController();
        const timeout = window.setTimeout(() => {
            console.warn(`Timed out after ${after}ms`);
            controller.abort();
        }, after);
        const cancel = () => {
            window.clearTimeout(timeout);
        };
        return { //NOPMD
            signal: controller.signal,
            cancel,
            started: Date.now()
        };
    }

    async get({path, params, timeout}: GetParams) {
        const options: RequestInit = {
            method: 'GET',
            mode: 'cors',
            cache: 'no-cache',
        };
        const headers: Record<string, string> = {
            'Content-Type': 'application/json'
        }
        // Authorization is optional
        if (this.token) {
            headers.Authorization = this.token;
        }

        // Enforce timeout (see timeout method)
        const requestTimeout = timeout || this.timeout;
        const {signal, cancel: cancelTimeout, started} = this.createTimeout(requestTimeout);
        if (signal) {
            options.signal = signal;
        }

        const url = new URL(this.url);
        url.pathname = path;
        if (params) {
            for (const [key, value] of Object.entries(params)) {
                url.searchParams.set(key, value);
            }
        }

        let response: Response;
        try {
            response = await fetch(url, options);
        } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') {
                const elapsed = Date.now() - started;
                if (elapsed >= requestTimeout) {
                    // probably a timeout.
                    throw new Error(`Request canceled - probably timed out after ${elapsed}ms with timeout of ${timeout}ms`);
                } else {
                    // perhaps still could be, given unknowns about the precise timing of setTimeout, but chances are low.
                    throw new Error(`Request canceled - but elapsed time ${elapsed}ms does not exceed timeout of ${timeout}ms`);
                }
            }
            // Otherwise, just let the error propagate.
            throw error;
        }
        
        cancelTimeout();


        // TODO: bespoke errors, etc.; maybe the subclass has to provide this behavior?
        if (response.status !== 200) {
            throw new Error(`Unexpected error ${response.status}`);
        }

        const textResponse = await response.text();

        let jsonResponse: any;
        try {
            jsonResponse = JSON.parse(textResponse);
        } catch (ex) {
            if (ex instanceof SyntaxError) {
                throw new Error("SyntaxError parsing json resopnse: " + ex.message)
            } else {
                throw new Error("Unknown error parsing json response:  " + (ex instanceof Error ? ex.message : 'Unknown error'));
            }
        }

        return jsonResponse;
    }
}

