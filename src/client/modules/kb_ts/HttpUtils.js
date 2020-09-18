define([], () => {
    // class HttpQueryField {
    //     key: string;
    //     value: string;

    //     constructor(key: string, value: string) {
    //         this.key = key;
    //         this.value = value;
    //     }
    // }

    // export type QueryMap = {[key:string]: string};

    class HttpQuery {

        // queryMap : QueryMap = {};

        constructor(map) {
            if (typeof map === 'undefined') {
                map = {};
            }
            this.queryMap = map;
        }

        addField(key, value) {
            this.queryMap[key] = value;
        }

        removeField(key) {
            delete this.queryMap[key];
        }

        toString() {
            const that = this;
            return Object.keys(this.queryMap).map(function (key) {
                return [key, that.queryMap[key]]
                    .map(encodeURIComponent)
                    .join('=');
            }).join('&');
        }

    }
    return {HttpQuery};
});