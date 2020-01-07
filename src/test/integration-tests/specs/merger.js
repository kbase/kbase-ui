/*eslint-env node */
/*eslint strict: ["error", "global"] */
'use strict';
class Merger {
    constructor(obj) {
        if (obj) {
            this.dest = JSON.parse(JSON.stringify(obj));
        } else {
            this.dest = {};
        }
    }

    value() {
        return this.dest;
    }

    getType(x) {
        var t = typeof x;
        if (t === 'object') {
            if (x === null) {
                return 'null';
            } else if (x.pop && x.push) {
                return 'array';
            } else {
                return 'object';
            }
        } else {
            return t;
        }
    }

    mergeIn(obj) {
        if (!obj) {
            return this;
        }
        switch (this.getType(obj)) {
        case 'string':
        case 'integer':
        case 'boolean':
        case 'null':
            throw new TypeError('Can\'t merge a \'' + (typeof obj) + '\'');
        case 'object':
            this.mergeObject(obj);
            break;
        case 'array':
            this.mergeArray(obj);
            break;
        default:
            throw new TypeError('Can\'t merge a \'' + (typeof obj) + '\'');
        }
        return this;
    }

    mergeObject(obj) {
        const keys = Object.keys(obj);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const val = obj[key];
            switch (this.getType(val)) {
            case 'string':
            case 'number':
            case 'boolean':
            case 'null':
            case 'function':
                this.dest[key] = val;
                break;
            case 'object':
                if (!this.dest[key]) {
                    this.dest[key] = {};
                }
                this.dest[key] = new Merger(this.dest[key]).mergeObject(obj[key]).value();
                break;
            case 'array':
                if (!this.dest[key]) {
                    this.dest[key] = [];
                } else {
                    this.dest[key] = [];
                }
                this.dest[key] = new Merger(this.dest[key]).mergeArray(obj[key]).value();
                break;
            case 'undefined':
                if (this.dest[key]) {
                    delete this.dest[key];
                }
                break;
            }
        }
        return this;
    }

    mergeArray(arr) {
        const deleted = false;
        for (let i = 0; i < arr.length; i++) {
            const val = arr[i];
            switch (this.getType(val)) {
            case 'string':
            case 'number':
            case 'boolean':
            case 'null':
            case 'function':
                this.dest[i] = val;
                break;
            case 'object':
                if (!this.dest[i]) {
                    this.dest[i] = {};
                }
                this.dest[i] = new Merger(this.dest[i]).mergeObject(arr[i]).value();
                break;
            case 'array':
                if (!this.dest[i]) {
                    this.dest[i] = [];
                }
                this.dest[i] = new Merger(this.dest[i]).mergeArray(arr[i]).value();
                break;
            case 'undefined':
                if (this.dest[i]) {
                    this.dest[i] = undefined;
                }
                break;
            }
        }
        if (deleted) {
            this.dest = this.dest.filter((value) => {
                return (value === undefined) ? false : true;
            });
        }
        return this;
    }
}

module.exports = {
    Merger
};