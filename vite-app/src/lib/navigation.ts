
export interface NavigateOptions {
    params?: Record<string, string>,
    replace?: boolean,
    cleanNextRequest?: boolean
    external?: boolean;
}

export function updateHistory(key: string, value: string | null) {
    const url = new URL(window.location.href);

    // A little hack for react router, which expects the search to be appended
    // to the hash.
    const [hash, search] = url.hash.split('?');
    const searchParams = new URLSearchParams(search);
    if (!value) {
        searchParams.delete(key);
    } else {
        searchParams.set(key, value);
    }
    url.hash = `${hash}?${searchParams.toString()}`;

    window.history.pushState(null, '', url);
}

export function navigateExternal(url: string) {
    console.warn('navigate external not implemented', url);
}

export function navigateInternal(
    hashPath: string, options: NavigateOptions = {}
): void {
    // Use just the current origin as the basis for our url.
    const url = new URL(window.location.origin);

    // Accommodate a hash path with or without the "hash" (octothorpe #) prefix; ensure it
    // has it.
    const hash = (() => {
        if (hashPath.length > 1 && hashPath[0] !== '#') {
            return `#${hashPath}`
        }
        return hashPath;
    })();

    // Create a real url search params object from the params. 
    // Note that we keep this separate from the url, as we will not use the "search
    // params" in the url search component, but rather attach it to the fragement (hash component).
    const searchParams = new URLSearchParams(options.params);

    const sillyFakeSearch = searchParams.size > 0 ? `$${searchParams.toString()}` : '';

    url.hash = `${hash}${sillyFakeSearch}`

    if (options.replace) {
        window.history.replaceState(null, '', url);
    } else {
        window.history.pushState(null, '', url.toString());
    }

    // Manually trigger a "hashchange" event, as the history api will not do it.
    window.dispatchEvent(new HashChangeEvent('hashchange', {
        newURL:url.toString()
    }));

    // That is it. Note that Europa sync with the kbase-ui path is via the europaSupport
    // module which listens for the hashchange event all by itself.
}



/**
 * The default path is set by environment variable, so to simplify things it is a single
 * string, which may contain a path, hash, and params, in the form:
 * path#hash?params
 * 
 * @param path 
 */
// export function parseDefaultPath(path: string): HashPath {
//     const [path, hashString] = path.split('#');
//     const [hash, paramsString] = hashString.split('?');
//     const query = new URLSearchParams(paramsString);
//     const params = searchParamsToParams(query);
//     return {
//         hash, path, params, 
//     }
// }

export function navigate(pathOrURL: string, options: NavigateOptions = {}) {
    if (options.external) {
        navigateExternal(pathOrURL)
    } else {
        navigateInternal(pathOrURL, options);
    }
}

export interface ResourcePath {
    path: string;
    params?: Record<string, string>;
}


export type NavigationType = 'kbaseui' | 'europaui';

export interface NavigationPathBase extends ResourcePath {
    type: NavigationType;
    newWindow?: boolean;
}

export interface NavigationPathKBaseUI extends NavigationPathBase {
    type: 'kbaseui';
}

export interface NavigationPathEuropa extends NavigationPathBase {
    type: 'europaui';
}

export type NavigationPath = NavigationPathKBaseUI | NavigationPathEuropa;


export function urlToKBaseUI({path, params}: {path: string, params?: Record<string, string>}): URL {
    if (!path) {
        throw new Error('KBase UI navigation must provide a path');
    }
    const sillyFakeSearch = (() => {
        if (!params || Object.keys(params).length === 0) {
            return '';
        }
        const searchParams = new URLSearchParams(params);
        return `$${searchParams.toString()}`;
    })();
    const url = new URL(window.location.href);
    url.hash = `#${path}${sillyFakeSearch}`;
    // if (options.replace) {
    //     window.history.replaceState(null, '', url);
    // } else {
    // window.history.pushState(null, '', url.toString());
    // // }
    // window.dispatchEvent(new HashChangeEvent('hashchange', {
    //     newURL:url.toString()
    // }));
    return url;
}

export function navigateToKBaseUI({path, params}: {path: string, params?: Record<string, string>}) {
    if (!path) {
        throw new Error('KBase UI navigation must provide a path');
    }

    const sillyFakeSearch = (() => {
        if (!params) {
            return '';
        }
        const searchParams = new URLSearchParams(params);
        return `$${searchParams.toString()}`;
    })();
    const url = new URL(window.location.href);
    url.hash = `#${path}${sillyFakeSearch}`;
    // if (options.replace) {
    //     window.history.replaceState(null, '', url);
    // } else {
    window.history.pushState(null, '', url.toString());
    // }
    window.dispatchEvent(new HashChangeEvent('hashchange', {
        newURL:url.toString()
    }));
}

export function navigateToEuropa({path, params, newWindow}: {path: string, params?: Record<string, string>, newWindow?: boolean;}) {
    // const hostname = window.location.hostname.split('.').slice(1).join('.');
    const hostname = window.location.hostname;
    const url = new URL(`https://${hostname}`);
    url.pathname = path || '';
    if (params) {
        for (const [key, value] of Object.entries(params)) {
            url.searchParams.set(key, value);
        }
    }
    const urlTarget = newWindow ? '_blank' : '_top';
    window.open(url, urlTarget);
}

export function navigate2({type, path, params, newWindow}: NavigationPath) {
    switch (type) {
        case 'europaui': 
            navigateToEuropa({path, params, newWindow});
            break;
        case 'kbaseui': 
            if (newWindow) {
                navigateToEuropa({path: `legacy/${path}`, params, newWindow});
            } else {
                navigateToKBaseUI({path, params});
            }
    }
}

/**
 * Create a url to a rousource in kbase-ui.
 * 
 * @param path 
 * @returns 
 */
export function resourceURL(path: string): URL {
    const url = new URL(window.location.origin);
    let pathnameList: Array<string>;
    if (window.location.pathname) {
        pathnameList = [...window.location.pathname.split('/'), ...path.split('/')];
    } else {
        pathnameList = path.split('/');
    }

    const pathname = pathnameList
        .filter((pathElement) => {
            return pathElement.length !== 0;
        })
        .join('/');

    url.pathname = pathname;

    return url;
}