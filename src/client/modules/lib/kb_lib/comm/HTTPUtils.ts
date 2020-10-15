// class HttpQueryField {
//     key: string;
//     value: string;

//     constructor(key: string, value: string) {
//         this.key = key;
//         this.value = value;
//     }
// }

export type QueryMap = { [key: string]: string; };

export class HTTPQuery {

    queryMap: QueryMap = {};

    constructor(map?: QueryMap) {
        if (typeof map === 'undefined') {
            map = {} as QueryMap;
        }
        this.queryMap = map;
    }

    addField(key: string, value: string) {
        this.queryMap[key] = value;
    }

    removeField(key: string) {
        delete this.queryMap[key];
    }

    toString(): string {
        let that = this;
        return Object.keys(this.queryMap).map(function (key) {
            return [key, that.queryMap[key]]
                .map(encodeURIComponent)
                .join('=');
        }).join('&');
    }

}