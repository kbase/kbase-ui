
export function arraysEqual(a: Array<string>, b: Array<string>) {
    if (a.length !== b.length) {
        return false;
    }
    const aSorted = a.slice().sort();
    const bSorted = b.slice().sort();
    return aSorted.every((value, index) => {
        return value === bSorted[index];
    })
}

export function formatDate(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDay()).padStart(2, '0');

    return `${year}/${month}/${day}`;
}