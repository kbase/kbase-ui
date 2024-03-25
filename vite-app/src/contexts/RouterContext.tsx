import { LEGACY_PATH } from 'behavior';
import { NavigationPath } from 'lib/navigation';
import React, { PropsWithChildren } from 'react';
import { AsyncProcess, AsyncProcessStatus } from '../lib/AsyncProcess';

export type Params = Record<string, string>;



/**
 * Holds the current config information
 */
export interface RouterInfo {
    hashPath: HashPath
}

export interface ErrorInfo {
    message: string;
}

export type RouterState = AsyncProcess<RouterInfo, ErrorInfo>;

// Route stuff

// export function searchParamsToObject(searchParams: URLSearchParams) {
//     const object: { [key: string]: string } = {};
//     for (const [key, value] of searchParams.entries()) {
//         object[key] = value;
//     }
//     return object;
// }

export function searchParamsToParams(searchParams: URLSearchParams): Record<string, string> {
    return Array.from(searchParams.entries()).reduce<Params>((accum, [key, value]) => {
        accum[key] = value;
        return accum;
    }, {});
}

export interface HashPath {
    hash: string;  // The hash path (with any matched params removed)
    params?: Params;
}


// Context

/**
 * The AuthContext is the basis for propagating auth state
 * throughout the app.
 */

export const RouterContext = React.createContext<RouterState>({
    status: AsyncProcessStatus.NONE,
});

// Auth Wrapper Component

export type RouterWrapperProps = PropsWithChildren<{}>;

interface RouterWrapperState {
    routerState: RouterState;
}

/**
 * Wraps a component tree, ensuring that authentication status is
 * resolved and placed into the AuthContext. The auth state in the
 * context can then be used by descendants to do "the right thing".
 * In this app, the right thing is to show an error message if
 * there is lack of authentication (no token, invalid token), and to
 * proceed otherwise.
 *
 * Also note that the auth state is itself wrapped into an AsyncProcess,
 * which ensures that descendants can handle the async behavior of
 * determining the auth state (because we may need to call the auth service),
 * which includes any errors encountered.
 */
export default class RouterWrapper extends React.Component<
    RouterWrapperProps,
    RouterWrapperState
> {
    hashListener: ((ev: HashChangeEvent) => void) | null;
    pageShowListener: ((ev: PageTransitionEvent) => void) | null;
    constructor(props: RouterWrapperProps) {
        super(props);
        this.state = {
            routerState: {
                status: AsyncProcessStatus.SUCCESS,
                value: {
                    hashPath: this.getHashPath()
                }
            }
        };
        this.hashListener = null;
        this.pageShowListener = null;
    }

    componentDidMount() {
        this.hashListener = () => {
            const hashPath = this.getHashPath();

            if (this.state.routerState.status === 'SUCCESS' &&
                hashPath === this.state.routerState.value.hashPath) {
                return;
            }
            this.setState({
                routerState: {
                    status: AsyncProcessStatus.SUCCESS,
                    value: {
                        hashPath
                    }
                }
            });
        }
        window.addEventListener('hashchange', this.hashListener);
        this.pageShowListener = (ev: PageTransitionEvent) => {
            if (ev.persisted) {
                window.location.reload();
            }
        }
        window.addEventListener('pageshow', this.pageShowListener);
    }

    componentWillUnmount() {
        if (this.hashListener !== null) {
            window.removeEventListener('hashchange', this.hashListener);
            this.hashListener = null;
        }
        if (this.pageShowListener !== null) {
            window.removeEventListener('pageshow', this.pageShowListener);
            this.pageShowListener = null;
        }
    }

    getHashPath(): HashPath {
        const url = new URL(document.location.href);
        return urlToHashPath(url);
    }

    render() {
        return (
            <RouterContext.Provider value={this.state.routerState}>
                {this.props.children}
            </RouterContext.Provider>
        );
    }
}

export function urlToHashPath(url: URL): HashPath {
    // One form of the hash string, which is friendly to replacement in an iframe src
    // without reloading the document, uses an initial & rather than ?, so we convert it
    // here for easier parsing in the next step.
    // const [rawHash, queryString] = url.hash.replace('&', '?').split('?');

    const [rawHash, queryString] = url.hash.split('$');

    // First we ensure that the hash has no empty path segments.
    const hash = rawHash.substring(1)
        .split('/')
        .filter((pathElement: string) => {
            return pathElement.trim().length > 0;
        })
        .join('/');

    const hashQuery = new URLSearchParams(queryString);

    const searchParams = new URLSearchParams([
        ...Array.from(hashQuery.entries()),
        ...Array.from(url.searchParams.entries())
    ]);

    const params = searchParamsToParams(searchParams);

    return {
        hash,
        params
    }
}

export function urlToNavigationPath(url: URL): NavigationPath {
    // One form of the hash string, which is friendly to replacement in an iframe src
    // without reloading the document, uses an initial & rather than ?, so we convert it
    // here for easier parsing in the next step.
    // const [rawHash, queryString] = url.hash.replace('&', '?').split('?');

    const [rawHash, queryString] = url.hash.split('$');

    // First we ensure that the hash has no empty path segments.
    const path = rawHash.substring(1)
        .split('/')
        .filter((pathElement: string) => {
            return pathElement.trim().length > 0;
        })
        .join('/');

    const hashQuery = new URLSearchParams(queryString);

    const searchParams = new URLSearchParams([
        ...Array.from(hashQuery.entries()),
        ...Array.from(url.searchParams.entries())
    ]);

    const params = searchParamsToParams(searchParams);

    return {
        path,
        params,
        type: 'kbaseui'
    }
}

export function kbaseUIBaseURL() {
    // We take the base name from the kbase-ui window.
    const baseName = window.location.pathname;
    const url = new URL(window.location.origin);
    url.pathname = baseName;
    return url;
}

export function europaBaseURL() {
    const europaHostname = window.location.hostname.split('.')
        .slice(-3)
        .join('.');
    const url = new URL(window.location.origin);
    url.hostname = europaHostname;
    return url;
}

/**
 * Given a NavigationPath object, creates a URL object suitable for usage in a link,
 * button, or window.open.
 * 
 * Note that for behavior parameterization, we use VITE_ build parameters (our
 * paremeters, but using the Vite environment variable mechanism) and convention.
 * 
 * The convention is that 
 * 
 * @param param0 
 * @param newWindow 
 * @returns 
 */
export function navigationPathToURL({path, params, type}: NavigationPath, newWindow?: boolean): URL {
    // Here we take advantage of the fact that the user interface is always accessed on 
    // ENV.kbase.us or subhost.ENV.kbase.us. In otherwords, the domain always has three 
    // parts, we we just extract the final 3 parts, no matter the subdomain.
    // This "convention over configuration" saves some mental space and configuration,
    // of course.
    // const europaHostname = window.location.hostname.split('.').slice(-3).join('.');

    let url: URL;
    switch (type) {
        case 'kbaseui': {
            if (newWindow) {
                // A url back to kbase-ui but in a new window requires navigation
                // through Europa.
                // Note that we assume that kbase-ui operates on a subdomain, so the
                // hostname of Europa is simply the current hostname sans the left-most
                // element.
                url = europaBaseURL();
                url.pathname = `${LEGACY_PATH}/${path}`;
                if (params && Object.keys(params).length > 0) {
                    for (const [key, value] of Object.entries(params)) {
                        url.searchParams.set(key, value);
                    }
                }
            } else {
                // A url back to kbase-ui within this window requires a hash change 
                // We don't care what the hostname, path prefix are in this case,
                // because they are already established.
                url = kbaseUIBaseURL();
                url.hash = `#${path}`
                if (params && Object.keys(params).length > 0) {
                    url.hash += `$${new URLSearchParams(params).toString()}`
                }
            }
            break;
        }
        case 'europaui': {
            url = europaBaseURL();
            if (params && Object.keys(params).length > 0) {
                for (const [key, value] of Object.entries(params)) {
                    url.searchParams.set(key, value);
                }
            }
            url.pathname = path;
        }
    }
    return url;
}

