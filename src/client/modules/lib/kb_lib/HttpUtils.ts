// class HttpQueryField {
//     key: string;
//     value: string;

//     constructor(key: string, value: string) {
//         this.key = key;
//         this.value = value;
//     }
// }

export type QueryMap = { [key: string]: string };

export class HttpQuery {
    queryMap: QueryMap = {};

    constructor(map?: QueryMap) {
        if (typeof map === 'undefined') {
            map = <QueryMap>{};
        }
        this.queryMap = map;
    }

    addField(key: string, value: string): void {
        this.queryMap[key] = value;
    }

    removeField(key: string): void {
        delete this.queryMap[key];
    }

    toString(): string {
        return Object.keys(this.queryMap)
            .map((key) => {
                return [key, this.queryMap[key]]
                    .map(encodeURIComponent)
                    .join('=');
            })
            .join('&');
    }
}
