
/**
 * The "next request" captures the concept of a navigation target which will be invoked
 * follwing some event. The primary use case is authentication - if an route is
 * requested that requires authentication, but there is none, that route is captures as
 * a "next request" object wi
 */

import { urlToNavigationPath } from "contexts/RouterContext";
import { NavigationPath } from "./navigation";

export interface NextRequestObject {
    path: NavigationPath;

    // An optional label to be displayed in a context in which the next request is
    // described to the user; e.g., sign in.
    label?: string;
}

export function nextRequestFromURL(url: URL): NextRequestObject {
    const path = urlToNavigationPath(url);
    return {
        path
    }
}

export function nextRequestFromCurrentURL(): NextRequestObject {
    return nextRequestFromURL(new URL(window.location.href));
}

export function nextRequestFromURLSearch(url: URL): NextRequestObject | null {
    const nextRequest = url.searchParams.get('nextrequest');
    if (!nextRequest) {
        return null;
    }
    return JSON.parse(nextRequest);
}
