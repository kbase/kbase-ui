// import { getCookie } from './cookies';
import {} from '@kbase/ui-lib';
import * as Cookie from 'es-cookie';

const COOKIE_NAME = 'kbase_session';

/**
 * A class implementing auth interactions with the browser
 */
export class BrowserAuth {
    /**
     * Returns the current KBase auth token, if any, or null if not present.
     *
     * @returns A KBase login auth token, or null
     */
    public static getToken(): string | null {
        return Cookie.get(COOKIE_NAME) || null;
    }

    public static removeToken(): void {
        Cookie.remove(COOKIE_NAME);
    }
}
