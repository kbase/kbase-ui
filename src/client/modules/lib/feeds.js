define([], () => {
    'use strict';

    class FeedsError extends Error {
        constructor(...args) {
            console.error('FeedsError', args);
            super(args);
        }
    }

    class ServerError extends Error {
        constructor(...args) {
            super(args);
        }
    }

    function queryToString(query) {
        return Array.from(query.entries()).map(([k, v]) => {
            return [
                k, encodeURIComponent(v)
            ].join('=');
        }).join('&');
    }

    class FeedsClient {
        constructor(params) {
            this.params = params;
        }

        put(path, body) {
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

        post(path, body) {
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

        postWithResult(path, body) {
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

        makeUrl(path, query) {
            const baseUrl = (this.baseURLPath().concat(path)).join('/');
            if (query) {
                return baseUrl +
                    '?' +
                    queryToString(query);
            }
            return baseUrl;
        }

        get(path, query) {
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
            const options = new Map();
            options.set('n', String(count));
            return this.get(['notifications'], options);
        }

        getUnseenNotificationCount() {
            return this.get(['notifications', 'unseen_count']);
        }

        seeNotifications(param) {
            return this.postWithResult(['notifications', 'see'], param);
        }
    }


    return { FeedsClient, FeedsError, ServerError };
});