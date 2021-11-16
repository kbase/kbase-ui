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
