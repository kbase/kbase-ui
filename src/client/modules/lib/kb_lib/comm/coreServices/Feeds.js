var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Feeds = exports.queryToString = exports.ServerError = exports.FeedsError = void 0;
    var FeedsError = /** @class */ (function (_super) {
        __extends(FeedsError, _super);
        function FeedsError() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return FeedsError;
    }(Error));
    exports.FeedsError = FeedsError;
    var ServerError = /** @class */ (function (_super) {
        __extends(ServerError, _super);
        function ServerError() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return ServerError;
    }(Error));
    exports.ServerError = ServerError;
    function queryToString(query) {
        return Array.from(query.entries()).map(function (_a) {
            var key = _a[0], value = _a[1];
            // return Object.keys(query).map((key) => {
            // const value = query[key];
            return [
                key, encodeURIComponent(value)
            ].join('=');
        }).join('&');
    }
    exports.queryToString = queryToString;
    var Feeds = /** @class */ (function () {
        function Feeds(params) {
            this.params = params;
        }
        Feeds.prototype.put = function (path, body) {
            var url = (this.baseURLPath().concat(path)).join('/');
            return fetch(url, {
                headers: {
                    Authorization: this.params.token,
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                },
                mode: 'cors',
                method: 'PUT',
                body: JSON.stringify(body)
            })
                .then(function (response) {
                if (response.status === 500) {
                    switch (response.headers.get('Content-Type')) {
                        case 'application/json':
                            return response.json()
                                .then(function (result) {
                                throw new FeedsError(result);
                            });
                        case 'text/plain':
                            return response.text()
                                .then(function (errorText) {
                                throw new ServerError(errorText);
                            });
                        default:
                            throw new Error('Unexpected content type: ' + response.headers.get('Content-Type'));
                    }
                }
                else if (response.status !== 200) {
                    throw new Error('Unexpected response: ' + response.status + ' : ' + response.statusText);
                }
                else {
                    return response.json()
                        .then(function (result) {
                        return result;
                    });
                }
            });
        };
        Feeds.prototype.post = function (path, body) {
            var url = (this.baseURLPath().concat(path)).join('/');
            return fetch(url, {
                headers: {
                    Authorization: this.params.token,
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                },
                mode: 'cors',
                method: 'POST',
                body: body ? JSON.stringify(body) : ''
            })
                .then(function (response) {
                if (response.status === 500) {
                    switch (response.headers.get('Content-Type')) {
                        case 'application/json':
                            return response.json()
                                .then(function (result) {
                                throw new FeedsError(result);
                            });
                        case 'text/plain':
                            return response.text()
                                .then(function (errorText) {
                                throw new ServerError(errorText);
                            });
                        default:
                            throw new Error('Unexpected content type: ' + response.headers.get('Content-Type'));
                    }
                }
                else if (response.status === 200) {
                    return response.json();
                }
                else if (response.status === 204) {
                    return null;
                }
                else {
                    throw new Error('Unexpected response: ' + response.status + ' : ' + response.statusText);
                }
            });
        };
        Feeds.prototype.postWithResult = function (path, body) {
            var url = (this.baseURLPath().concat(path)).join('/');
            return fetch(url, {
                headers: {
                    Authorization: this.params.token,
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                },
                mode: 'cors',
                method: 'POST',
                body: body ? JSON.stringify(body) : ''
            })
                .then(function (response) {
                if (response.status === 500) {
                    switch (response.headers.get('Content-Type')) {
                        case 'application/json':
                            return response.json()
                                .then(function (result) {
                                throw new FeedsError(result);
                            });
                        case 'text/plain':
                            return response.text()
                                .then(function (errorText) {
                                throw new ServerError(errorText);
                            });
                        default:
                            throw new Error('Unexpected content type: ' + response.headers.get('Content-Type'));
                    }
                }
                else if (response.status === 200) {
                    return response.json();
                }
                else {
                    throw new Error('Unexpected response: ' + response.status + ' : ' + response.statusText);
                }
            });
        };
        Feeds.prototype.makeUrl = function (path, query) {
            var baseUrl = (this.baseURLPath().concat(path)).join('/');
            if (typeof query !== 'undefined') {
                return baseUrl +
                    '?' +
                    queryToString(query);
            }
            return baseUrl;
        };
        // getText(path: Array<string>, query?: Map<string, string>): string {
        //     const url = this.makeUrl(path, query);
        //     return fetch(url, {
        //         headers: {
        //             Authorization: this.params.token,
        //             Accept: 'text/plain',
        //             'Content-Type': 'application/json'
        //         },
        //         mode: 'cors',
        //         method: 'GET'
        //     })
        //         .then((response) => {
        //             if (response.status === 500) {
        //                 switch (response.headers.get('Content-Type')) {
        //                     case 'text/plain':
        //                         return response.text()
        //                             .then((errorText) => {
        //                                 throw new ServerError(errorText);
        //                             });
        //                     default:
        //                         throw new Error('Unexpected content type: ' + response.headers.get('Content-Type'));
        //                 }
        //             } else if (response.status === 200) {
        //                 return response.json();
        //             } else {
        //                 throw new Error('Unexpected response: ' + response.status + ' : ' + response.statusText);
        //             }
        //         });
        // }
        Feeds.prototype.get = function (path, query) {
            var url = this.makeUrl(path, query);
            return fetch(url, {
                headers: {
                    Authorization: this.params.token,
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                },
                mode: 'cors',
                method: 'GET'
            })
                .then(function (response) {
                if (response.status === 500) {
                    switch (response.headers.get('Content-Type')) {
                        case 'application/json':
                            return response.json()
                                .then(function (result) {
                                throw new FeedsError(result);
                            });
                        case 'text/plain':
                            return response.text()
                                .then(function (errorText) {
                                throw new ServerError(errorText);
                            });
                        default:
                            throw new Error('Unexpected content type: ' + response.headers.get('Content-Type'));
                    }
                }
                else if (response.status === 200) {
                    return response.json();
                }
                else {
                    throw new Error('Unexpected response: ' + response.status + ' : ' + response.statusText);
                }
            });
        };
        Feeds.prototype.baseURLPath = function () {
            return [this.params.url, 'api', 'V1'];
        };
        Feeds.prototype.getNotifications = function (_a) {
            var _b = (_a === void 0 ? {} : _a).count, count = _b === void 0 ? 100 : _b;
            var options = new Map();
            options.set('n', String(count));
            return this.get(['notifications'], options);
        };
        Feeds.prototype.getUnseenNotificationCount = function () {
            return this.get(['notifications', 'unseen_count']);
        };
        Feeds.prototype.seeNotifications = function (param) {
            return this.postWithResult(['notifications', 'see'], param);
        };
        return Feeds;
    }());
    exports.Feeds = Feeds;
});
