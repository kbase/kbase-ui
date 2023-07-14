import { JSONValue } from "../json";

export class FeedsError extends Error {
}

export class ServerError extends Error {
}

export function queryToString(query: Map<string, string>): string {
    return Array.from(query.entries()).map(([key, value]) => {
        // return Object.keys(query).map((key) => {
        // const value = query[key];
        return [
            key, encodeURIComponent(value)
        ].join('=');
    }).join('&');
}

interface UnseenNotificationCountResult {
    unseen: {
        global: number;
        user: number;
    };
}

interface FeedsParams {
    token: string;
    url: string;
}

export class Feeds {
    params: FeedsParams;
    constructor(params: FeedsParams) {
        this.params = params;
    }

    put(path: Array<string>, body: JSONValue) {
        const url = (this.baseURLPath().concat(path)).join('/');
        return fetch(url, {
            headers: {
                Authorization: this.params.token,
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            mode: 'cors',
            method: 'PUT',
            body: JSON.stringify(body)
        })
            .then((response) => {
                if (response.status === 500) {
                    switch (response.headers.get('Content-Type')) {
                        case 'application/json':
                            return response.json()
                                .then((result) => {
                                    throw new FeedsError(result);
                                });
                        case 'text/plain':
                            return response.text()
                                .then((errorText) => {
                                    throw new ServerError(errorText);
                                });
                        default:
                            throw new Error('Unexpected content type: ' + response.headers.get('Content-Type'));
                    }
                } else if (response.status !== 200) {
                    throw new Error('Unexpected response: ' + response.status + ' : ' + response.statusText);
                } else {
                    return response.json()
                        .then((result) => {
                            return result;
                        });
                }
            });
    }

    post(path: Array<string>, body: JSONValue) {
        const url = (this.baseURLPath().concat(path)).join('/');
        return fetch(url, {
            headers: {
                Authorization: this.params.token,
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            mode: 'cors',
            method: 'POST',
            body: body ? JSON.stringify(body) : ''
        })
            .then((response) => {
                if (response.status === 500) {
                    switch (response.headers.get('Content-Type')) {
                        case 'application/json':
                            return response.json()
                                .then((result) => {
                                    throw new FeedsError(result);
                                });
                        case 'text/plain':
                            return response.text()
                                .then((errorText) => {
                                    throw new ServerError(errorText);
                                });

                        default:
                            throw new Error('Unexpected content type: ' + response.headers.get('Content-Type'));
                    }
                } else if (response.status === 200) {
                    return response.json();
                } else if (response.status === 204) {
                    return null;
                } else {
                    throw new Error('Unexpected response: ' + response.status + ' : ' + response.statusText);
                }
            });
    }

    postWithResult(path: Array<string>, body: JSONValue) {
        const url = (this.baseURLPath().concat(path)).join('/');
        return fetch(url, {
            headers: {
                Authorization: this.params.token,
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            mode: 'cors',
            method: 'POST',
            body: body ? JSON.stringify(body) : ''
        })
            .then((response) => {
                if (response.status === 500) {
                    switch (response.headers.get('Content-Type')) {
                        case 'application/json':
                            return response.json()
                                .then((result) => {
                                    throw new FeedsError(result);
                                });
                        case 'text/plain':
                            return response.text()
                                .then((errorText) => {
                                    throw new ServerError(errorText);
                                });
                        default:
                            throw new Error('Unexpected content type: ' + response.headers.get('Content-Type'));
                    }
                } else if (response.status === 200) {
                    return response.json();
                } else {
                    throw new Error('Unexpected response: ' + response.status + ' : ' + response.statusText);
                }
            });
    }

    makeUrl(path: Array<string>, query?: Map<string, string>) {
        const baseUrl = (this.baseURLPath().concat(path)).join('/');
        if (typeof query !== 'undefined') {
            return baseUrl +
                '?' +
                queryToString(query);
        }
        return baseUrl;
    }

    get(path: Array<string>, query?: Map<string, string>): Promise<JSONValue> {
        const url = this.makeUrl(path, query);
        return fetch(url, {
            headers: {
                Authorization: this.params.token,
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            mode: 'cors',
            method: 'GET'
        })
            .then((response) => {
                if (response.status === 500) {
                    switch (response.headers.get('Content-Type')) {
                        case 'application/json':
                            return response.json()
                                .then((result) => {
                                    throw new FeedsError(result);
                                });
                        case 'text/plain':
                            return response.text()
                                .then((errorText) => {
                                    throw new ServerError(errorText);
                                });
                        default:
                            throw new Error('Unexpected content type: ' + response.headers.get('Content-Type'));
                    }
                } else if (response.status === 200) {
                    return response.json();
                } else {
                    throw new Error('Unexpected response: ' + response.status + ' : ' + response.statusText);
                }
            });
    }

    baseURLPath() {
        return [this.params.url, 'api', 'V1'];
    }

    getNotifications({ count = 100 } = {}) {
        const options = new Map<string, string>();
        options.set('n', String(count));
        return this.get(['notifications'], options);
    }

    getUnseenNotificationCount(): Promise<UnseenNotificationCountResult> {
        return (this.get(['notifications', 'unseen_count']) as unknown) as Promise<UnseenNotificationCountResult>;
    }

    seeNotifications(param: JSONValue): Promise<void> {
        return (this.postWithResult(['notifications', 'see'], param) as unknown) as Promise<void>;
    }
}
