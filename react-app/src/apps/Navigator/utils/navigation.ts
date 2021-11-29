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

export function changeHash(
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

    // window.history.pushState(null, '', url);
    window.location.hash = url.hash;
}
