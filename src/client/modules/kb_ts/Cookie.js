define([], () => {
    class Cookie {
        // name: string;
        // value: string;
        // expires?: string;
        // maxAge?: number;
        // domain?: string;
        // path?: string;
        // secure?: boolean;
        // noEncode: boolean = false;

        constructor(name) {
            this.reservedKeys = [
                'expires',
                'max-age',
                'path',
                'domain',
                'secure'
            ];
            if (this.reservedKeys.indexOf(name.toLowerCase()) >= 0) {
                throw new Error('Cookie key invalid, must not be one of ' + this.reservedKeys.join(', '));
            }
            if (name.match(/;/) || name.match(/=/)) {
                throw new Error('Cookie name may not contain a ; or =');
            }
            this.name = name;
        }

        setValue(value) {
            if (value.match(/;/) || value.match(/=/)) {
                throw new Error('Cookie value may not contain a ; or =');
            }
            this.value = value;
            return this;
        }

        setExpires(expires) {
            if (expires.match(/;/)) {
                throw new Error('Cookie parameter value may not contain a ;');
            }
            this.expires = expires;
            return this;
        }

        setDomain(domain) {
            if (domain.match(/;/)) {
                throw new Error('Cookie parameter value may not contain a ;');
            }
            this.domain = domain;
            return this;
        }

        setMaxAge(maxAge) {
            this.maxAge = maxAge;
            return this;
        }

        setPath(path)  {
            if (path.match(/;/)) {
                throw new Error('Cookie parameter value may not contain a ;');
            }
            this.path = path;
            return this;
        }

        setSecure(secure)  {
            this.secure = secure;
            return this;
        }

        setNoEncode(noEncode)  {
            this.noEncode = noEncode;
            return this;
        }

        toString() {
            var cookieProps = [];

            if (typeof this.domain !== 'undefined') {
                cookieProps.push({
                    key: 'domain',
                    value: this.domain
                });
            }
            if (typeof this.path !== 'undefined') {
                cookieProps.push({
                    key: 'path',
                    value: this.path
                });
            }

            if (typeof this.expires !== 'undefined') {
                cookieProps.push({
                    key: 'expires',
                    value: this.expires
                });
                if (typeof this.maxAge !== 'undefined') {
                    if (this.maxAge === Infinity) {
                        cookieProps.push({
                            key: 'expires',
                            value: new Date('9999-12-31T23:59:59Z').toUTCString()
                        });
                    } else {
                        cookieProps.push({
                            key: 'max-age',
                            value: String(this.maxAge)
                        });
                    }
                }
            } else {
                if (typeof this.maxAge !== 'undefined') {
                    if (this.maxAge === Infinity) {
                        cookieProps.push({
                            key: 'expires',
                            value: new Date('9999-12-31T23:59:59Z').toUTCString()
                        });
                    } else {
                        // set both expires and max-age. Max-age because it is more accurate
                        // and expires because it is more compatible (well, with IE).
                        cookieProps.push({
                            key: 'expires',
                            value: new Date(new Date().getTime() + this.maxAge * 1000).toUTCString()
                        });
                        cookieProps.push({
                            key: 'max-age',
                            value: String(this.maxAge)
                        });
                    }
                }
            }
            if (typeof this.secure !== 'undefined') {
                cookieProps.push({
                    key: 'secure'
                });
            }

            var cookieString = [[
                this.name,
                this.value
            ].join('=')]
                .concat(cookieProps.map((prop) => {
                    return [prop.key, prop.value].filter((item) => {
                        return typeof item === 'undefined' ? false : true;
                    })
                        .join('=');
                }))
                .join(';');
            return cookieString;
        }
    }


    class CookieManager {
        // fields
        // global: Document;

        // constructor(s)
        constructor() {
            this.global = document;
        }

        // methods
        importCookies() {
            var cookieString = this.global.cookie;
            if (cookieString.length > 0) {
                return cookieString.split(/;/)
                    .reduce((jar, cookie) => {
                        var pieces = cookie.split('=');
                        // handle abuses:
                        var name = pieces[0];
                        if (pieces.length === 0) {
                            return jar;
                        }
                        name = name.trim();
                        if (pieces.length === 1) {
                            jar.push({
                                name: name,
                                value: ''
                            });
                        }
                        var value = pieces[1];
                        jar.push({
                            name: name,
                            value: decodeURIComponent(value)
                        });
                        return jar;
                    }, []);
            } else {
                return [];
            }
        }

        getCookies() {
            return this.importCookies();
        }

        findCookies(key) {
            var cookies = this.importCookies();
            return cookies.filter((cookie) => {
                if (cookie.name === key) {
                    return true;
                }
            });
        }

        getItem(key) {
            if (!key) {
                return null;
            }
            var cookie = this.findCookies(key);
            if (cookie.length > 1) {
                throw new Error('Too many cookies returned, expected 1.');
            }
            if (cookie.length === 0) {
                return null;
            }
            return cookie[0].value;
        }

        getItems(key) {
            if (!key) {
                return null;
            }
            var cookie = this.findCookies(key);
            if (cookie.length === 0) {
                return [];
            }
            return cookie.map(function (item) {
                return item.value;
            });
        }

        newCookie(key) {
            return new Cookie(key);
        }

        setItem(item) {
            document.cookie = item.toString();
        }

        removeItem(item) {
            const deletionCookie = new Cookie(item.name)
                .setPath(item.path)
                .setValue('*')
                .setExpires(new Date('1970-01-01T00:00:00Z').toUTCString());
            if (item.domain) {
                deletionCookie.setDomain(item.domain);
            }
            this.setItem(deletionCookie);
        }

    }
    return {Cookie, CookieManager};
});