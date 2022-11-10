export function pageNumberRange(page: string) {
    const [from, to] = page.split('-');
    if (typeof to === 'undefined') {
        return page;
    }

    const newTo = (() => {
        for (const [index, char] of to.split('').entries()) {
            if (char !== from[index]) {
                return to.slice(index);
            }
        }
        return null;
    })();

    return (() => {
        if (newTo === null) {
            return from;
        }
        return `${from}-${newTo}`;
    })();
}