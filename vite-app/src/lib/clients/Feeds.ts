import { JSONValue } from "../json";

export type FeedEntityType = 'user' | 'group' | 'narrative'; 


export interface FeedEntity {
    id: string; // e.g. username
    name: string // e.g. realname
    type: string // "user"
}

export interface FeedActor extends FeedEntity {
    // id: string; // e.g. username
    // name: string // e.g. realname
    // type: string // "user"
}

export interface FeedObject extends FeedEntity{
    // id: string;
    // name: string;
    // type: string ; // "group"
}

export interface FeedTarget extends FeedEntity {
    // id: string;
    // name: string;
    // type: string;
}

export type FeedNotificationContext = Record<string, any>;

// NOTE: I've added 'success', to at least handle front end need - it would be nice if
// the feeds service had this too. E.g. a job finishes successfully should be a nice,
// juicey, success notification :)
export type FeedNotificationLevel = 'error' | 'request' | 'warning' | 'alert' | 'success';

export interface FeedNotification {
    actor: FeedActor
    context: null | FeedNotificationContext
    created: number;
    expires: number;
    external_key: string;
    id: string;
    level: FeedNotificationLevel;
    object: FeedObject;
    seen: boolean;
    source: string;
    target: Array<FeedTarget>;
    verb: string;
}

export interface Feed {
    feed: Array<FeedNotification>
    name: string;
    unseen: number;
}

export type Feeds = Record<string, Feed>;

export interface GetNotificationsOptions {
    reverseSort?: boolean;
    verb?: string | number;
    level?: string | number;
    includeSeen?: boolean;
}


// export interface Notification {
//     verb: string;
//     object: string;
//     level: number;
//     context: Record<string, string>
// }


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


interface FeedsParams {
    token: string;
    url: string;
}

// Method types

export interface GetNotificationsOptions {
    limit?: number;
    reverseSort?: boolean;
    verb?: string | number;
    level?: string | number;
    includeSeen?: boolean;
}

export interface UnseenNotificationCount {
    global: number;
    user: number;
}

export interface UnseenNotificationCountResult {
    unseen: UnseenNotificationCount
}

// TODO: timeout!
export class FeedsClient {
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

    getNotifications(options: GetNotificationsOptions): Promise<Feeds> {
        const params = new Map<string, string>();

        // let params = [];
        if (options.reverseSort) {
            params.set('rev', "1");
            // params.push('rev=1');
        }
        if (options.verb) {
            params.set('v', String(options.verb));
            // params.push('v=' + options.verb);
        }
        if (options.level) {
            // params.push('l=' + options.level);
            params.set('l', String(options.level))
        }
        if (options.includeSeen) {
            // params.push('seen=1');
            params.set('seen', String(1));
        }

        // options.set('n', String(count));
        // TODO: perhaps make the method types all json compatible?
        return this.get(['notifications'], params) as unknown as Promise<Feeds>
    }

    getUnseenNotificationsCount(): Promise<UnseenNotificationCountResult> {
        return (this.get(['notifications', 'unseen_count']) as unknown) as Promise<UnseenNotificationCountResult>;
    }

    seeNotifications(param: JSONValue): Promise<void> {
        return (this.postWithResult(['notifications', 'see'], param) as unknown) as Promise<void>;
    }

    markSeen(notificationIds: Array<string>): Promise<void> {
        return this.post(['notifications', 'see'], {note_ids: notificationIds})
    }

    markUnseen(notificationIds: Array<string>): Promise<void> {
        return this.post(['notifications', 'unsee'], {note_ids: notificationIds})
    }

    forceExpire(notificationIds: Array<string>, source: string): Promise<void> {
        return this.post(['notifications', 'expire'], {
            note_ids: notificationIds,
            source
        });
    }
}
