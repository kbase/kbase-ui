export class Cookie {
    name: string;

    reservedKeys: string[] = ['expires', 'max-age', 'path', 'domain', 'secure'];

    value: string;
    expires?: string;
    maxAge?: number;
    domain?: string;
    path?: string;
    secure?: boolean;
    noEncode = false;

    constructor(name: string, value: string) {
        if (this.reservedKeys.indexOf(name.toLowerCase()) >= 0) {
            throw new Error(
                `Cookie key invalid, must not be one of ${this.reservedKeys.join(
                    ', '
                )}`
            );
        }
        if (name.match(/;/) || name.match(/=/)) {
            throw new Error('Cookie name may not contain a ; or =');
        }
        this.name = name;
        this.value = value;
    }

    setValue(value: string): Cookie {
        if (value.match(/;/) || value.match(/=/)) {
            throw new Error('Cookie value may not contain a ; or =');
        }
        this.value = value;
        return this;
    }

    setExpires(expires: string): Cookie {
        if (expires.match(/;/)) {
            throw new Error('Cookie parameter value may not contain a ;');
        }
        this.expires = expires;
        return this;
    }

    setDomain(domain: string): Cookie {
        if (domain.match(/;/)) {
            throw new Error('Cookie parameter value may not contain a ;');
        }
        this.domain = domain;
        return this;
    }

    setMaxAge(maxAge: number): Cookie {
        this.maxAge = maxAge;
        return this;
    }

    setPath(path: string): Cookie {
        if (path.match(/;/)) {
            throw new Error('Cookie parameter value may not contain a ;');
        }
        this.path = path;
        return this;
    }

    setSecure(secure: boolean): Cookie {
        this.secure = secure;
        return this;
    }

    setNoEncode(noEncode: boolean): Cookie {
        this.noEncode = noEncode;
        return this;
    }

    toString(): string {
        const cookieProps: any[] = [];

        if (typeof this.domain !== 'undefined') {
            cookieProps.push({
                key: 'domain',
                value: this.domain,
            });
        }
        if (typeof this.path !== 'undefined') {
            cookieProps.push({
                key: 'path',
                value: this.path,
            });
        }

        if (typeof this.expires !== 'undefined') {
            cookieProps.push({
                key: 'expires',
                value: this.expires,
            });
            if (typeof this.maxAge !== 'undefined') {
                if (this.maxAge === Infinity) {
                    cookieProps.push({
                        key: 'expires',
                        value: new Date('9999-12-31T23:59:59Z').toUTCString(),
                    });
                } else {
                    cookieProps.push({
                        key: 'max-age',
                        value: String(this.maxAge),
                    });
                }
            }
        } else if (typeof this.maxAge !== 'undefined') {
            if (this.maxAge === Infinity) {
                cookieProps.push({
                    key: 'expires',
                    value: new Date('9999-12-31T23:59:59Z').toUTCString(),
                });
            } else {
                // set both expires and max-age. Max-age because it is more accurate
                // and expires because it is more compatible (well, with IE).
                cookieProps.push({
                    key: 'expires',
                    value: new Date(
                        new Date().getTime() + this.maxAge * 1000
                    ).toUTCString(),
                });
                cookieProps.push({
                    key: 'max-age',
                    value: String(this.maxAge),
                });
            }
        }
        if (typeof this.secure !== 'undefined') {
            cookieProps.push({
                key: 'secure',
            });
        }

        const cookieString = [[this.name, this.value].join('=')]
            .concat(
                cookieProps.map((prop) => {
                    return [prop.key, prop.value]
                        .filter((item) => {
                            return typeof item !== 'undefined';
                        })
                        .join('=');
                })
            )
            .join(';');
        return cookieString;
    }
}

export class CookieManager {
    // fields
    global: Document;

    // constructor(s)
    constructor() {
        this.global = document;
    }

    // methods
    importCookies(): Array<Cookie> {
        const cookieString = this.global.cookie;
        if (cookieString.length > 0) {
            return cookieString
                .split(/;/)
                .reduce<Array<Cookie>>((jar, cookie) => {
                    const pieces = cookie.split('=');
                    // handle abuses:
                    let name = pieces[0];
                    if (pieces.length === 0) {
                        return jar;
                    }
                    name = name.trim();
                    if (pieces.length === 1) {
                        jar.push(<Cookie>{
                            name,
                            value: '',
                        });
                    }
                    const value = pieces[1];
                    jar.push(<Cookie>{
                        name,
                        value: decodeURIComponent(value),
                    });
                    return jar;
                }, []);
        }
        return [];
    }

    getCookies() {
        return this.importCookies();
    }

    findCookies(key: string): Array<Cookie> {
        const cookies = this.importCookies();
        return cookies.filter((cookie) => {
            if (cookie.name === key) {
                return true;
            }
        });
    }

    getItem(key: string): string | null {
        if (!key) {
            return null;
        }
        const cookie = this.findCookies(key);
        if (cookie.length > 1) {
            throw new Error('Too many cookies returned, expected 1.');
        }
        if (cookie.length === 0) {
            return null;
        }
        return cookie[0].value;
    }

    getItems(key: string): Array<string> {
        const cookie = this.findCookies(key);
        if (cookie.length === 0) {
            return [];
        }
        return cookie.map((item) => {
            return item.value;
        });
    }

    newCookie(key: string, value: string) {
        return new Cookie(key, value);
    }

    setItem(item: Cookie): void {
        document.cookie = item.toString();
    }

    removeItem(item: Cookie): void {
        const deletionCookie = new Cookie(item.name, '')
            .setPath(item.path || '/')
            .setValue('*')
            .setExpires(new Date('1970-01-01T00:00:00Z').toUTCString());
        if (item.domain) {
            deletionCookie.setDomain(item.domain);
        }
        this.setItem(deletionCookie);
    }
}
