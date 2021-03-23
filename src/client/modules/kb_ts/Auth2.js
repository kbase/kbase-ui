define([
    './Html',
    './HttpUtils',
    './HttpClient',
    './Auth2Client',
    './Auth2Error',
    'uuid',
], (
    Html,
    {HttpQuery},
    {HttpHeader},
    {AuthClient},
    {AuthError},
    {v4: uuidv4},
) => {

    // const { HttpQuery } = HttpUtils;
    // const { Response, HttpHeader } = HttpClient;
    // const { AuthError, AuthErrorInfo} = Auth2Error;

    // import { Html } from './Html'
    // import { HttpQuery } from './HttpUtils'
    // import { Response, HttpHeader } from './HttpClient'
    // import { AuthClient } from './Auth2Client';
    // import * as Promise from 'bluebird';
    // import { AuthError, AuthErrorInfo} from './Auth2Error';

    // interface AuthProvider {
    //     id: string,
    //     label: string,
    //     logoutUrl: string
    // }

    // export interface AuthConfig {
    //     baseUrl: string
    // }

    // interface AuthEndpoints {
    //     root: string,
    //     tokenInfo: string,
    //     apiMe: string,
    //     me: string,
    //     loginStart: string,
    //     loginChoice: string,
    //     loginCreate: string,
    //     loginUsernameSuggest: string,
    //     loginPick: string,
    //     loginCancel: string,
    //     logout: string,
    //     linkStart: string,
    //     linkCancel: string,
    //     linkChoice: string,
    //     linkPick: string,
    //     linkRemove: string,
    //     tokens: string,
    //     tokensRevoke: string,
    //     tokensRevokeAll: string,
    //     userSearch: string,
    //     adminUserSearch: string,
    //     adminUser: string
    // }

    const endpoints = {
        root: '',
        tokenInfo: 'api/V2/token',
        apiMe: 'api/V2/me',
        me: 'me',
        loginStart: 'login/start',
        logout: 'logout',
        loginChoice: 'login/choice',
        loginCreate: 'login/create',
        loginUsernameSuggest: 'login/suggestname',
        loginPick: 'login/pick',
        loginCancel: 'login/cancel',
        linkStart: 'link/start',
        linkCancel: 'link/cancel',
        linkChoice: 'link/choice',
        linkPick: 'link/pick',
        linkRemove: 'me/unlink',
        tokens: 'tokens',
        tokensRevoke: 'tokens/revoke',
        tokensRevokeAll: 'tokens/revokeall',
        userSearch: 'api/V2/users/search',
        adminUserSearch: 'api/V2/admin/search',
        adminUser: 'api/V2/admin/user',
    };

    // export interface ILoginOptions {
    //     provider: string,
    //     state: string,
    //     stayLoggedIn: boolean
    // }

    // export interface LinkOptions {
    //     provider: string,
    //     node: HTMLElement
    // }

    // export interface UnlinkOptions {
    //     identityId: string
    // }

    // export interface UserPolicy {
    //     id: string,
    //     agreed_on: number
    // }

    // export interface RootInfo {
    //     version: string,
    //     servertime: number
    // }

    // export interface ILoginCreateOptions {
    //     id: string,
    //     user: string,
    //     display: string,
    //     email: string,
    //     linkall: boolean,
    //     policyids: Array<UserPolicy>
    // }

    // export interface ITokenInfo {
    //     created: number,
    //     expires: number,
    //     id: string,
    //     name: string | null,
    //     token: string,
    //     type: string,
    //     user: string,
    //     cachefor: number
    // }

    // export interface Identity {
    //     id: string,
    //     provider: string,
    //     username: string
    // }

    // export interface Role {
    //     id: string,
    //     desc: string
    // }

    // export interface Account {
    //     created: number,
    //     customroles: Array<string>,
    //     display: string,
    //     email: string,
    //     idents: Array<Identity>,
    //     lastLogin: number,
    //     local: boolean,
    //     roles: Array<Role>,
    //     user: string
    // }

    // export interface ILoginCreateResponse {
    //     redirecturl: string,
    //     token: ITokenInfo
    // }

    // export interface Tokens {
    //     tokens: Array<ITokenInfo>,
    //     dev: boolean,
    //     serv: boolean
    // }

    // export interface CreateChoice {
    //     id: string,
    //     availablename: string,
    //     provusername: string,
    //     provfullname: string,
    //     provemail: string
    // }

    // export interface LoginChoice {
    //     id: string,
    //     provusernames: Array<string>
    //     user: string,
    //     loginallowed: boolean,
    //     disabled: boolean,
    //     adminonly: boolean,
    // }

    // export interface LoginChoice {
    //     createurl: string,
    //     pickurl: string,
    //     provider: string
    //     redirecturl: string,
    //     state: string,
    //     creationallowed: string,
    //     create: Array<CreateChoice>,
    //     login: Array<LoginChoice>,
    //     token?: string,
    //     logged_in: boolean,
    //     // TODO: this is in here twice, bug.
    //     redirect?: string
    // }

    // export interface LinkChoice {
    //     id: string,
    //     expires: number,
    //     cancelurl: string,
    //     pickurl: string,
    //     canlink: boolean,
    //     provider: string,
    //     provusername: string,
    //     linkeduser?: string,
    //     user: string
    // }

    // export interface Auth2ApiErrorInfo {
    //     appcode: number,
    //     apperror: string,
    //     message: string,
    //     httpcode: number,
    //     httpstatus: string,
    //     callid: string,
    //     time: number
    // }

    // export interface PolicyAgreement {
    //     id: string,
    //     version: number
    // }

    // export interface LoginPick {
    //     identityId: string,
    //     linkAll: boolean,
    //     agreements: Array<PolicyAgreement>
    // }

    // export interface CreateTokenInput {
    //     name: string,
    //     type: string
    // }

    // export interface NewTokenInfo {
    //     type: string,
    //     id: string,
    //     expires: number,
    //     created: number,
    //     name: string,
    //     user: string,
    //     token: string
    // }

    // export interface UserSearchInput {
    //     prefix: string,
    //     fields: string
    // }

    // export interface UserSearchOutput {

    // }

    // export interface PutMeInput {
    //     display: string,
    //     email: string
    // }

    // Classes

    class Auth2 {
        // config: AuthConfig;

        constructor(config) {
            this.config = config;
        }


        getProviders() {
            return [
                {
                    id: 'Globus',
                    label: 'Globus',
                    logoutUrl: 'https://www.globus.org/app/logout',
                },
                {
                    id: 'Google',
                    label: 'Google',
                    logoutUrl: 'https://accounts.google.com/Logout',
                },
            ];

        }

        getProvider(providerId) {
            var providers = this.getProviders();
            return providers.filter((provider) => {
                return (provider.id === providerId);
            })[0];
        }

        root() {
            const httpClient = new AuthClient();
            return httpClient.request({
                method: 'GET',
                withCredentials: true,
                header: new HttpHeader({
                    Accept: 'application/json',
                }),
                url: this.makePath([endpoints.root]),
            })
                .then((result) => {
                    return this.processResult(result, 200);
                });
        }

        /*
        Note that this just just punts the browser via a javascript-submitted
        form post.
        There is no return value, nor any way of verifying that the server
        did the correctthing.
    */
        loginStart(config) {
            // Set the client state cookie.
            // var state = JSON.stringify(config.state);

            // Punt over to the auth service
            const html = new Html();
            const t = html.tagMaker();
            const form = t('form');
            const input = t('input');
            // const button = t('button');

            const search = new HttpQuery({
                state: JSON.stringify(config.state),
            }).toString();

            var url = document.location.origin + '?' + search;

            const query = {
                provider: config.provider,
                redirecturl: url,
                stayloggedin: config.stayLoggedIn ? 'true' : 'false',
            };

            const formId = uuidv4();

            const content = form({
                method: 'post',
                id: formId,
                action: this.makePath(endpoints.loginStart),
                style: {
                    display: 'hidden',
                },
            }, [
                input({
                    type: 'hidden',
                    name: 'provider',
                    value: query.provider,
                }, []),
                input({
                    type: 'hidden',
                    name: 'redirecturl',
                    value: query.redirecturl,
                }, []),
            ]);
            var donorNode = document.createElement('div');

            donorNode.innerHTML = content;
            document.body.appendChild(donorNode);

            (document.getElementById(formId)).submit();
        }


        linkStart(token, config) {
            const html = new Html();
            const t = html.tagMaker();
            const form = t('form');
            const input = t('input');

            const query = {
                provider: config.provider,
            };

            const formId = uuidv4();

            config.node.innerHTML = form({
                method: 'POST',
                id: formId,
                action: [this.config.baseUrl, endpoints.linkStart].join('/'),
                style: {
                    display: 'hidden',
                },
            }, [
                input({
                    type: 'hidden',
                    name: 'provider',
                    value: query.provider,
                }, []),
                input({
                    type: 'hidden',
                    name: 'token',
                    value: token,
                }),
            ]);

            (document.getElementById(formId)).submit();
        }


        /*
    POST /me/unlink/:id
    Authorization :token
    throws NoTokenProvidedException, InvalidTokenException, AuthStorageException,
			UnLinkFailedException, DisabledUserException, NoSuchIdentityException
    */

        decodeError(result) {
            // var error;
            try {
                return JSON.parse(result.response);
            } catch (ex) {
                console.error(ex);
                throw new AuthError({
                    code: 'decode-error',
                    message: 'Error decoding JSON error response',
                    detail: ex.message,
                });
            }
        }

        removeLink(token, config) {
            const httpClient = new AuthClient();

            return httpClient.request({
                method: 'POST',
                withCredentials: true,
                header: new HttpHeader({
                    authorization: token,
                    'content-type': 'application/json',
                    accept: 'application/json',
                }),
                url: this.makePath([endpoints.linkRemove, config.identityId]),
            })
                .then((result) => {
                    return this.processResult(result, 204);
                });
        }

        logout(token) {
            const httpClient = new AuthClient();

            return httpClient.request({
                method: 'POST',
                withCredentials: true,
                header: new HttpHeader({
                    authorization: token,
                    'content-type': 'application/json',
                    'accept': 'application/json',
                }),
                url: this.makePath(endpoints.logout),
            })
                .then((result) => {
                    return this.processResult(result, 200);
                });
        }

        revokeToken(token, tokenid) {
            const httpClient = new AuthClient();

            return httpClient.request({
                method: 'DELETE',
                withCredentials: true,
                header: new HttpHeader({
                    authorization: token,
                    'content-type': 'application/json',
                }),
                url: this.makePath([endpoints.tokensRevoke, tokenid]),
            })
                .then((result) => {
                    return this.processResult(result, 204);
                });
        }

        revokeAllTokens(token) {
            const httpClient = new AuthClient();

            return httpClient.request({
                method: 'DELETE',
                withCredentials: true,
                header: new HttpHeader({
                    authorization: token,
                    'content-type': 'application/json',
                }),
                url: this.makePath(endpoints.tokensRevokeAll),
            })
                .then((result) => {
                    return this.processResult(result, 204);
                });
        }

        getTokenInfo(token) {
            const httpClient = new AuthClient();
            return httpClient.request({
                method: 'GET',
                url: this.makePath([endpoints.tokenInfo]),
                withCredentials: true,
                header: new HttpHeader({
                    authorization: token,
                }),
            })
                .then((result) => {
                    return this.processResult(result, 200);
                });
        }

        getMe(token) {
            const httpClient = new AuthClient();
            return httpClient.request({
                method: 'GET',
                withCredentials: true,
                url: this.makePath(endpoints.apiMe),
                header: new HttpHeader({
                    authorization: token,
                    accept: 'application/json',
                }),
            })
                .then((result) => {
                    return this.processResult(result, 200);
                });
        }

        putMe(token, data) {
            const httpClient = new AuthClient();
            return httpClient.request({
                method: 'PUT',
                withCredentials: true,
                url: this.makePath(endpoints.me),
                header: new HttpHeader({
                    authorization: token,
                    accept: 'application/json',
                    'content-type': 'application/json',
                }),
                data: JSON.stringify(data),
            })
                .then((result) => {
                    this.processResult(result, 204);
                });
        }

        makePath(path) {
            if (typeof path === 'string') {
                return [this.config.baseUrl].concat([path]).join('/');
            }
            return [this.config.baseUrl].concat(path).join('/');
        }

        getTokens(token) {
            const httpClient = new AuthClient();
            return httpClient.request({
                method: 'GET',
                withCredentials: true,
                url: this.makePath([endpoints.tokens]),
                header: new HttpHeader({
                    authorization: token,
                    accept: 'application/json',
                }),
            })
                .then((result) => {
                    return this.processResult(result, 200);
                });
        }

        createToken(token, create) {
            const httpClient = new AuthClient();
            return httpClient.request({
                method: 'POST',
                withCredentials: true,
                url: this.makePath(endpoints.tokens),
                header: new HttpHeader({
                    authorization: token,
                    accept: 'application/json',
                    'content-type': 'application/json',
                }),
                data: JSON.stringify(create),
            })
                .then((result) => {
                    return this.processResult(result, 200);
                });
        }

        // Note that the auth2 service will have set cookies
        // in the browser which are implicitly sent.
        getLoginChoice() {
            const httpClient = new AuthClient();
            return httpClient.request({
                method: 'GET',
                withCredentials: true,
                url: this.makePath(endpoints.loginChoice),
                header: new HttpHeader({
                    accept: 'application/json',
                }),
            })
                .then((result) => {
                    return this.processResult(result, 200);
                });
        }

        loginCancel() {
            const httpClient = new AuthClient();
            return httpClient.request({
                method: 'DELETE',
                withCredentials: true,
                url: this.makePath(endpoints.loginCancel),
                header: new HttpHeader({
                    accept: 'application/json',
                }),
            })
                .then((result) => {
                    return this.processResult(result, 204);
                });
        }

        linkCancel() {
            const httpClient = new AuthClient();
            return httpClient.request({
                method: 'DELETE',
                withCredentials: true,
                url: this.makePath(endpoints.linkCancel),
                header: new HttpHeader({
                    accept: 'application/json',
                }),
            })
                .then((result) => {
                    return this.processResult(result, 204);
                });
        }

        loginPick(arg) {
            const data = {
                id: arg.identityId,
                linkall: arg.linkAll,
                policyids: arg.agreements.map((a) => {
                    return [a.id, a.version].join('.');
                }),
            };
            const httpClient = new AuthClient();
            return httpClient.request({
                method: 'POST',
                withCredentials: true,
                url: this.makePath([endpoints.loginPick]),
                data: JSON.stringify(data),
                header: new HttpHeader({
                    'content-type': 'application/json',
                    accept: 'application/json',
                }),
            })
                .then((result) => {
                    return this.processResult(result, 200);
                });
        }

        loginCreate(data) {
            const httpClient = new AuthClient();
            return httpClient.request({
                method: 'POST',
                withCredentials: true,
                url: this.makePath(endpoints.loginCreate),
                data: JSON.stringify(data),
                header: new HttpHeader({
                    'content-type': 'application/json',
                    'accept': 'application/json',
                }),
            })
                .then((result) => {
                    return this.processResult(result, 201);
                });
        }


        loginUsernameSuggest(username) {
            const httpClient = new AuthClient();
            return httpClient.request({
                method: 'GET',
                withCredentials: true,
                url: this.makePath([endpoints.loginUsernameSuggest, username]),
                header: new HttpHeader({
                    accept: 'application/json',
                }),
            })
                .then((result) => {
                    return this.processResult(result, 200);
                });
        }

        getLinkChoice(token) {
            const httpClient = new AuthClient();
            // console.error('fetching with', token);
            return httpClient.request({
                method: 'GET',
                withCredentials: true,
                url: this.makePath(endpoints.linkChoice),
                header: new HttpHeader({
                    accept: 'application/json',
                    authorization: token,
                }),
            })
                .then((result) => {
                    return this.processResult(result, 200);
                })
                .then((response) => {
                    // The link choice structure provided by the auth2 service has evolved
                    // over time, so we normalize it to a structure easier to digest by the
                    // front end.
                    if (response.haslinks) {
                        return {
                            id: response.idents[0].id,
                            expires: response.expires,
                            cancelurl: response.cancelurl,
                            pickurl: response.pickurl,
                            canlink: true,
                            provider: response.provider,
                            provusername: response.idents[0].provusername,
                            linkeduser: null,
                            user: response.user,
                        };
                    } else {
                        return {
                            id: response.linked[0].id,
                            expires: response.expires,
                            cancelurl: response.cancelurl,
                            pickurl: response.pickurl,
                            canlink: false,
                            provider: response.provider,
                            provusername: response.linked[0].provusername,
                            linkeduser: response.linked[0].user,
                            user: response.user,
                        };
                    }
                });
        }

        linkPick(token, identityId) {
            const data = {
                id: identityId,
            };
            const httpClient = new AuthClient();
            return httpClient.request({
                method: 'POST',
                withCredentials: true,
                url: this.makePath(endpoints.linkPick),
                data: JSON.stringify(data),
                header: new HttpHeader({
                    authorization: token,
                    'content-type': 'application/json',
                    accept: 'application/json',
                }),
            })
                .then((result) => {
                    return this.processResult(result, 204);
                });
        }

        processResult(result, expectedResponse) {
            if (result.status >= 200 && result.status < 300) {
                if (expectedResponse !== result.status) {
                    throw new AuthError({
                        code: 'unexpected-response-code',
                        message: 'Unexpected response code; expected ' + String(expectedResponse) + ', received ' + String(result.status),
                    });
                }
                if (result.status === 200 || result.status === 201) {
                    switch (result.header.getContentType().mediaType) {
                    case 'application/json':
                        return JSON.parse(result.response);
                    case 'text/plain':
                        return result.response;
                    }
                } else if (result.status === 204) {
                    return null;
                } else {
                    throw new AuthError({
                        code: 'unexpected-response-code',
                        message: 'Unexpected response code; expected ' + String(expectedResponse) + ', received ' + String(result.status),
                    });
                }
            } else {
                // TODO: should we distinguish error conditions or let the caller do so?
                // Maybe we should throw a basic error type, like
                // AuthorizationError - for 401s
                // ClientError - for 400s
                // ServerError - for 500s
                var auth2ErrorData, errorResponse;
                var errorText = result.response;
                try {
                    switch (result.header.getContentType().mediaType) {
                    case 'application/json':
                        auth2ErrorData = JSON.parse(errorText);
                        break;
                    default:
                        // A 502 proxy error will almost surely not have a json response
                        if (result.status === 502) {
                            errorResponse = {
                                code: 'proxy-error',
                                status: result.status,
                                message: 'The auth service could not be contacted due to a proxy error (502)',
                                detail: 'An error returned by the proxy service indicates that the auth service is not operating corectly',
                                data: {
                                    text: result.response,
                                },
                            };
                        } else {
                            errorResponse = {
                                code: 'invalid-content-type',
                                status: result.status,
                                message: 'An invalid content type was returned',
                                detail: 'An invalid content was returned',
                                data: {
                                    text: result.response,
                                    contentType: result.header.getContentType().mediaType,
                                    status: result.status,
                                },
                            };
                        }
                        // errorData = {
                        //     code: 'unknown',
                        //     message: 'Unknown error',
                        //     text: errorText
                        // };
                    }
                } catch (ex) {
                    throw new AuthError({
                        code: 'decoding-error',
                        status: result.status,
                        message: 'Error decoding error message',
                        detail: 'Original error code: ' + result.status,
                        data: {
                            text: errorText,
                        },
                    });
                }
                if (auth2ErrorData) {
                    const code = auth2ErrorData.error.code || auth2ErrorData.error.appcode || auth2ErrorData.error.httpcode || 0;
                    throw new AuthError({
                        code: String(code),
                        status: result.status,
                        message: auth2ErrorData.error.message || auth2ErrorData.error.apperror,
                        data: auth2ErrorData,
                    });
                }
                throw new AuthError(errorResponse);
            }
        }

        userSearch(token, searchInput) {
            const httpClient = new AuthClient();

            const path = this.makePath([endpoints.userSearch, searchInput.prefix]);

            const search = new HttpQuery({
                fields: searchInput.fields,
            }).toString();

            const url = path + '?' + search;

            return httpClient.request({
                method: 'GET',
                withCredentials: true,
                url: url,
                header: new HttpHeader({
                    authorization: token,
                    accept: 'application/json',
                }),
            })
                .then((result) => {
                    return this.processResult(result, 200);
                });
        }

        adminUserSearch(token, searchInput) {
            const httpClient = new AuthClient();

            const search = new HttpQuery({
                fields: searchInput.fields,
            }).toString();

            const url = this.makePath([endpoints.adminUserSearch, searchInput.prefix]) + '?' + search;

            return httpClient.request({
                method: 'GET',
                withCredentials: true,
                url: url,
                header: new HttpHeader({
                    authorization: token,
                    accept: 'application/json',
                }),
            })
                .then((result) => {
                    return this.processResult(result, 200);
                });
        }

        getAdminUser(token, username) {
            const httpClient = new AuthClient();
            return httpClient.request({
                method: 'GET',
                withCredentials: true,
                url: this.makePath([endpoints.adminUser, username]),
                header: new HttpHeader({
                    authorization: token,
                    accept: 'application/json',
                }),
            })
                .then((result) => {
                    return this.processResult(result, 200);
                });
        }

    }

    return {Auth2};
});