
/**
 * A generic REST(ish) API caller.
 * Really simple. This just ensures that a URL and token exist,
 * it makes calls to them and returns the results.
 *
 * Child classes should implement what endpoints should be use
 * and how to parse the final results, if at all.
 */
export class RestClient {
    endpoint: string;
    token: string;
    constructor(endpoint: string, token: string) {
        if (!endpoint) {
            throw new Error('Feeds endpoint required!');
        }
        if (!endpoint.endsWith('/')) {
            endpoint = endpoint + '/';
        }
        if (!token) {
            throw new Error('Auth token required');
        }

        this.endpoint = endpoint;
        this.token = token;
    }

    /**
     * Makes a generic API call to the feeds service.
     * Really, this could probably be used for any RESTish service.
     * It's also really really simple. Just given the method, path,
     * and data, it crafts the REST call by using the Fetch API.
     * If the method isn't one of the usual HTTP verbs (GET, POST, PUT, DELETE),
     * this raises an error.
     * This returns a Promise with either the result of the call de-JSONified,
     * or it raises an error.
     * @param {string} method
     * @param {string} path
     * @param {object} options
     */
    async makeCall(method: string, path: string, data?: any) {
        // remove the first slash, if present
        if (path.startsWith('/')) {
            path = path.substring(1);
        }
        method = method.toLocaleUpperCase();
        if (!['GET', 'POST', 'PUT', 'DELETE'].includes(method)) {
            throw new Error('Method ' + method + ' not usable');
        }
        let url = this.endpoint + path;
        let request: RequestInit = {
            method,
            cache: 'no-cache',
            headers: {
                'Content-type': 'application/json; charset=utf-8',
                'Authorization': this.token
            },
            redirect: 'follow',
            referrer: 'no-referrer'
        };
        if (data) {
            request.body = JSON.stringify(data);
        }

        const response = this.handleErrors(await fetch(url, request));

        return await response.json();
    }

    /**
     * Invisibly deals with errors from Fetch. Fetch is nice, but annoying in
     * that the 400-level errors don't raise errors on their own. This wraps
     * the call and deals with that before returning the response to whatever
     * called this API.
     * @param {object} response - a response from the Fetch API.
     */
    handleErrors(response: Response) {
        if (!response.ok) {
            console.error(response);
            throw Error(response.statusText);
        }
        return response;
    }
}

