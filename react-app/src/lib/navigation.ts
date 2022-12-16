
export interface ChangePathOptions {
    search?: { [key: string]: string },
    replace?: boolean
}

export function changePath(
    path: string,
    options: ChangePathOptions = {}
): void {
    const { search, replace } = options;
    const url = new URL(window.location.href);
    // clear any other bits here, like the real path and the
    // query params.
    for (const key of url.searchParams.keys()) {
        url.searchParams.delete(key);
    }
    url.hash = '';

    if (search) {
        // for (const key of url.searchParams.keys()) {
        //     url.searchParams.delete(key);
        // }

        for (const [key, value] of Object.entries(search)) {
            if (!value) {
                url.searchParams.delete(key);
            } else {
                url.searchParams.set(key, value);
            }
        }

        const searchString = url.searchParams.toString();
        if (searchString.length > 0) {
            url.hash += `?${searchString}`;
        }
    }

    // Finally, set the path.
    url.pathname = path;

    if (replace) {
        window.history.replaceState(null, '', url);
    } else {
        window.history.pushState(null, '', url);
    }
    window.history.go();
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

export function pushHistory(
    hashPath: string,
    search?: { [key: string]: string }
) {
    const url = new URL(window.location.href);

    // A little hack for react router, which expects the search to be appended
    // to the hash.
    url.hash = `#${hashPath}`;

    if (search) {
        for (const key of Array.from(url.searchParams.keys())) {
            url.searchParams.delete(key);
        }

        for (const [key, value] of Object.entries(search)) {
            if (!value) {
                url.searchParams.delete(key);
            } else {
                url.searchParams.set(key, value);
            }
        }
    }

    window.history.pushState(null, '', url);
}

export function changeHash2(
    hashPath: string, options: ChangePathOptions = {}
): void {
    const { search, replace } = options;
    const url = new URL(window.location.href);
    // clear any other bits here, like the real path and the
    // query params.
    for (const key of url.searchParams.keys()) {
        url.searchParams.delete(key);
    }
    url.hash = (() => {
        if (hashPath.length > 1 && hashPath[0] !== '#') {
            return `#${hashPath}`
        }
        return hashPath;
    })();

    if (search) {
        for (const [key, value] of Object.entries(search)) {
            if (!value) {
                url.searchParams.delete(key);
            } else {
                url.searchParams.set(key, value);
            }
        }

        const searchString = url.searchParams.toString();
        if (searchString.length > 0) {
            url.hash += `?${searchString}`;
        }
    }

    if (replace) {
        window.history.replaceState(null, '', url);
    } else {
        window.history.pushState(null, '', url);
    }
    // window.history.go();
    const result = window.dispatchEvent(new HashChangeEvent('hashchange'));
}
