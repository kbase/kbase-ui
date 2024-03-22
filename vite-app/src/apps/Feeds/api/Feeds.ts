import { RestClient } from "./RestClient";

const API_PATH = 'api/V1/notification';

/**
 * Instantiates the Feeds API. Requires both the endpoint (i.e. https://kbase.us/services/feeds)
 * and a valid KBase Auth token. The token is NOT validated before use.
 * @param {string} endpoint - the endpoint for the Feeds service
 * @param {string} token - the user's auth token
 */

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

export interface FeedItem {
    actor: FeedActor
    context: null | Record<string, any>
    created: number;
    expires: number;
    external_key: string;
    id: string;
    level: string;
    object: FeedObject;
    seen: boolean;
    source: string;
    target: Array<FeedTarget>;
    verb: string;
}

export interface Feed {
    feed: Array<FeedItem>
    name: string;
    unseen: number;
}

export type Notifications = Record<string, Feed>;

export interface GetNotificationsOptions {
    reverseSort?: boolean;
    verb?: string | number;
    level?: string | number;
    includeSeen?: boolean;
}

export interface Notification {
    verb: string;
    object: string;
    level: number;
    context: Record<string, string>
}

export interface GlobalNotification {
    verb: string;
    object: string;
    level: number;
    context: Record<string, string>;
    expires?: number;
}

export interface UnseenNotificationCount {
    global: number;
    user: number;
}

export interface UnseenNotificationCountResult {
    unseen: UnseenNotificationCount
}

export class FeedsAPI extends RestClient {

    /**
     * Returns the list of notifications for a single user.
     * @param {object} options
     *  - reverseSort - boolean
     *  - verb - string or int
     *  - level - string or int
     *  - includeSeen - boolean
     */
    async getNotifications(options: GetNotificationsOptions): Promise<Notifications> {
        let params = [];
        if (options.reverseSort) {
            params.push('rev=1');
        }
        if (options.verb) {
            params.push('v=' + options.verb);
        }
        if (options.level) {
            params.push('l=' + options.level);
        }
        if (options.includeSeen) {
            params.push('seen=1');
        }
        let path = 'api/V1/notifications/?' + params.join('&');

        return this.makeCall('GET', path);
    }

    /**
     * Posts a single notification. User's gotta be special.
     * Note - this was mainly for early-stage debugging. Probably doesn't work
     * anymore unless the user's auth token is really a service token. And if
     * you're logging in with a service token.... don't.
     * @param {object} data
     * - verb
     * - object
     * - level
     * - context (keys text, link)
     */
    postNotification(data: Notification) {
        return this.makeCall('POST', API_PATH, data);
    }

    /**
     * Posts a Global notification on behalf of an admin. Requires
     * the used auth token to have the custom auth role FEEDS_ADMIN
     * or an error will occur.
     * @param {object} data
     * - verb
     * - object
     * - level
     * - context (keys: text, link)
     * - expires (optional, default = 30 days after posting)
     */
    postGlobalNotification(data: GlobalNotification) {
        return this.makeCall('POST', `${API_PATH}/global`, data);
    }

    /**
     * Marks an array of notification ids as seen by the user.
     * @param {Array} noteIds - array of note id strings
     */
    markSeen(noteIds: Array<string>) {
        return this.makeCall('POST', `${API_PATH}/see`, { note_ids: noteIds });
    }

    /**
     * Marks an array of notification ids as unseen by the given user.
     * @param {Array} noteIds - array of note id strings
     */
    markUnseen(noteIds: Array<string>) {
        return this.makeCall('POST', `${API_PATH}/unsee`, { note_ids: noteIds });
    }

    /**
     * Expires a single global notification from its id.
     * Requires the user to have the custom auth role FEEDS_ADMIN, or an error
     * will occur.
     * @param {string} noteId - a single notification id
     */
    expireGlobalNotification(noteId: string) {
        return this.makeCall('POST', `${API_PATH}/expire`, { note_ids: [noteId] });
    }

}
