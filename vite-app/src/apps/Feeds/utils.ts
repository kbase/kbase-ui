
export function cleanText(text: string) {
    const n = document.createElement('div');
    n.textContent = text;
    return n.innerHTML;
}



/**
 * Converts JS Date object to <time unit> ago.
 * Like "29 seconds ago" or whatever.
 * @param {Date} date - a Date object
 */
const dateFilter = [{
    'div': 86400000,
    'interval': ' day'
}, {
    'div': 3600000,
    'interval': ' hour'
}, {
    'div': 60000,
    'interval': ' minute'
}, {
    'div': 1000,
    'interval': ' second'
}];

export function dateToAgo(date: number) {
    const now = Date.now();
    const diffMs = Math.abs(now - date);
    let diff;
    if (now < date) {
        return 'just now';
    }
    for (let i = 0; i < dateFilter.length; i++) {
        diff = Math.floor(diffMs / dateFilter[i].div);
        if (diff > 0) {
            const s = (diff > 1) ? 's' : '';
            return diff + dateFilter[i].interval + s + ' ago';
        }
    }
    return 'just now';
}

