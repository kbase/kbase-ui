import { HashPath } from 'contexts/RouterContext';

export class NextRequest {
    source: string;
    hashPath: HashPath;
    constructor(source: string, hashPath: HashPath) {
        this.source = source;
        this.hashPath = hashPath;
    }

    fromURL(): HashPath | null {
        // ?source=authorization&nextrequest=%7B%22realPath%22%3A%22%2F%22%2C%22path%22%3A%5B%22feeds%22%5D%2C%22original%22%3A%22feeds%22%2C%22query%22%3A%7B%7D%7D#login
        const url = new URL(window.location.href);
        const nextRequest = url.searchParams.get('nextrequest');
        if (!nextRequest) {
            return null;
        }

        try {
            const {
                realPath, path, original, query
            } = JSON.parse(nextRequest);

            if (typeof realPath === 'string' &&
                (path instanceof Array && path.every((element) => {
                    return typeof element === 'string'
                })) &&
                typeof original === 'string' &&
                (query instanceof {}.constructor && Object.entries(query).every(([key, value]) => {
                    return typeof key === 'string' && typeof value === 'string'
                }))) {

                // TODO: the query should be a plain object; see Router2
                const searchParams: URLSearchParams = new URL('').searchParams;
                for (const [key, value] of Object.entries(query)) {
                    searchParams.set(key, value);
                }
                return {
                    realPath, path, query: searchParams, hash: path.join('/')
                }
            }
            console.warn('It looks like an invalid nextrequest: ', nextRequest, JSON.parse(nextRequest));
            return null;
        } catch (ex) {
            console.error('Invalid nextRequest will not parse', nextRequest);
            return null;
        }
    }

    toJSON() {
        return {
            realPath: this.hashPath.realPath,
            path: this.hashPath.path,
            original: this.hashPath.hash,
            query: this.hashPath.query
        }
    }

    toSearchParams(): URLSearchParams {
        const url = new URL(window.location.href);
        url.pathname = '';
        const params = url.searchParams;
        params.set('source', 'authorization');
        params.set('nextrequest', JSON.stringify(this.toJSON()));
        return params;
    }
}
