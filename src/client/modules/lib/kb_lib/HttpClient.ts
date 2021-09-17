import { HttpQuery, QueryMap } from './HttpUtils';

export type HttpHeaderFields = { [key: string]: string };

interface ContentType {
    mediaType: string;
    charset: string;
}

export class HttpHeader {
    header: HttpHeaderFields;

    public static fromXHR(xhr: XMLHttpRequest): HttpHeaderFields {
        let responseHeaders = xhr.getAllResponseHeaders();
        if (!responseHeaders) {
            return {};
        }
        let fieldsArray = responseHeaders.split(/\n/);
        const fieldsMap: { [key: string]: string } = {};
        fieldsArray.forEach((field) => {
            let firstColon = field.indexOf(':', 0);
            let name = field.substr(0, firstColon).trim();
            let value = field.substr(firstColon + 1).trim();
            fieldsMap[name.toLowerCase()] = value;
        });
        return fieldsMap;
    }

    public static fromMap(header: Map<string, string>): HttpHeaderFields {
        const fieldsMap: { [key: string]: string } = {};
        header.forEach((value: string, key: string) => {
            fieldsMap[key.toLowerCase()] = value;
        });

        return fieldsMap;
    }

    public static fromObject(header: any): HttpHeaderFields {
        const fieldsMap: { [key: string]: string } = {};
        Object.keys(header).forEach((name) => {
            fieldsMap[name.toLowerCase()] = header[name];
        });
        return fieldsMap;
    }

    constructor(initialHeaders?: any) {
        if (typeof initialHeaders === 'undefined') {
            this.header = {};
        } else if (initialHeaders instanceof XMLHttpRequest) {
            this.header = HttpHeader.fromXHR(initialHeaders);
        } else if (initialHeaders instanceof Map) {
            this.header = HttpHeader.fromMap(initialHeaders);
        } else {
            this.header = HttpHeader.fromObject(initialHeaders);
        }
    }

    getHeader(fieldName: string): string {
        return this.header[fieldName.toLowerCase()];
    }

    setHeader(fieldName: string, fieldValue: string): void {
        this.header[fieldName.toLowerCase()] = fieldValue;
    }

    exportHeader(xhr: XMLHttpRequest) {
        Object.keys(this.header)
            .filter((key) => {
                if (
                    this.getHeader(key) === undefined ||
                    this.getHeader(key) === null
                ) {
                    return false;
                }
                return true;
            })
            .forEach((key) => {
                // normalize value?
                const stringValue = (function (value) {
                    switch (typeof value) {
                        case 'string':
                            return value;
                        case 'number':
                            return String(value);
                        case 'boolean':
                            return String(value);
                        default:
                            throw new Error(
                                'Invalid type for header value: ' + typeof value
                            );
                    }
                })(this.getHeader(key));
                xhr.setRequestHeader(key, stringValue);
            });
    }

    getContentType(): ContentType | null {
        let value = this.header['content-type'];
        if (!value) {
            return null;
        }
        let values = value.split(';').map((x) => x.trim());
        return {
            mediaType: values[0],
            charset: values[1],
        };
    }
}

// interface HttpHeaderField {
//     name: string;
//     value: string;
// }

export class TimeoutError extends Error {
    timeout: number;
    elapsed: number;
    xhr: XMLHttpRequest;

    constructor(
        timeout: number,
        elapsed: number,
        message: string,
        xhr: XMLHttpRequest
    ) {
        super(message);

        Object.setPrototypeOf(this, TimeoutError.prototype);

        this.name = 'TimeoutError';
        this.stack = (<any>new Error()).stack;

        this.timeout = timeout;
        this.elapsed = elapsed;
        this.xhr = xhr;
    }

    toString(): string {
        return this.message;
    }
}

export class GeneralError extends Error {
    xhr: XMLHttpRequest;
    constructor(message: string, xhr: XMLHttpRequest) {
        super(message);

        Object.setPrototypeOf(this, GeneralError.prototype);

        this.name = 'GeneralError';
        this.stack = (<any>new Error()).stack;

        this.xhr = xhr;
    }
    toString(): string {
        return this.message;
    }
}

export class AbortError extends Error {
    xhr: XMLHttpRequest;
    constructor(message: string, xhr: XMLHttpRequest) {
        super(message);
        Object.setPrototypeOf(this, AbortError.prototype);

        this.name = 'AbortError';
        this.stack = (<any>new Error()).stack;

        this.xhr = xhr;
    }
    toString(): string {
        return this.message;
    }
}

export interface RequestOptions {
    url: string;
    method: string;
    timeout: number;
    query?: QueryMap;
    header?: HttpHeader;
    responseType?: string;
    withCredentials?: boolean;
    data?: null | string | Array<number>;
}

export interface Response {
    status: number;
    response: string;
    responseType: string;
    header: HttpHeader;
}

export class HttpClient {
    constructor() {}

    request(options: RequestOptions): Promise<Response> {
        let startTime = new Date().getTime();
        let that = this;
        return <Promise<Response>>new Promise((resolve, reject) => {
            const xhr: XMLHttpRequest = new XMLHttpRequest();
            xhr.onload = () => {
                resolve(<Response>{
                    status: xhr.status,
                    response: xhr.response,
                    responseType: xhr.responseType,
                    header: new HttpHeader(xhr),
                });
            };
            xhr.ontimeout = () => {
                const elapsed = new Date().getTime() - startTime;
                reject(
                    new TimeoutError(
                        options.timeout,
                        elapsed,
                        'Request timeout',
                        xhr
                    )
                );
            };
            xhr.onerror = () => {
                reject(
                    new GeneralError(
                        'General request error ' + options.url,
                        xhr
                    )
                );
            };
            xhr.onabort = () => {
                reject(new AbortError('Request was aborted', xhr));
            };

            let url = options.url;
            if (options.query) {
                url += '?' + new HttpQuery(options.query).toString();
            }

            const rt = (options.responseType ||
                'text') as XMLHttpRequestResponseType;
            xhr.responseType = rt;

            try {
                xhr.open(options.method, url, true);
            } catch (ex) {
                reject(new GeneralError('Error opening request', xhr));
                return;
            }

            if (options.timeout) {
                xhr.timeout = options.timeout;
            }

            xhr.withCredentials = options.withCredentials || false;

            try {
                if (options.header) {
                    options.header.exportHeader(xhr);
                }
            } catch (ex) {
                const message = (() => {
                    if (ex instanceof Error) {
                        return ex.message;
                    }
                    return '';
                })();
                reject(
                    new GeneralError(
                        `Error applying header before send - ${message}`,
                        xhr
                    )
                );
            }

            try {
                if (typeof options.data === 'string') {
                    xhr.send(options.data);
                    // if (onCancel) {
                    //     onCancel(() => {
                    //         xhr.abort();
                    //     });
                    // }
                } else if (options.data instanceof Array) {
                    xhr.send(new Uint8Array(options.data));
                } else if (typeof options.data === 'undefined') {
                    xhr.send();
                } else if (options.data === null) {
                    xhr.send();
                } else {
                    reject(
                        new Error(
                            'Invalid type of data to send: ' +
                                typeof options.data
                        )
                    );
                }
            } catch (ex) {
                reject(new GeneralError('Error sending data in request', xhr));
            }
        });
    }
}
