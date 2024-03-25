import { AuthClient } from './Auth2Client';
import { AuthError, AuthErrorInfo } from './Auth2Error';
import { HTML } from './HTML';
import { HttpHeader, Response } from './HttpClient';
import { HttpQuery } from './HttpUtils';

const TIMEOUT = 60000;

const WITH_CREDENTIALS = true;

interface AuthProvider {
  id: string;
  label: string;
  logoutUrl: string;
}

interface AuthEndpoints {
  root: string;
  tokenInfo: string;
  apiMe: string;
  me: string;
  loginStart: string;
  loginChoice: string;
  loginCreate: string;
  loginUsernameSuggest: string;
  loginPick: string;
  loginCancel: string;
  logout: string;
  linkStart: string;
  linkCancel: string;
  linkChoice: string;
  linkPick: string;
  linkRemove: string;
  tokens: string;
  tokensRevoke: string;
  tokensRevokeAll: string;
  userSearch: string;
  adminUserSearch: string;
  adminUser: string;
}

const endpoints: AuthEndpoints = {
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

export interface LoginOptions {
  provider: string;
  state: string;
  stayLoggedIn: boolean;
}

export interface LinkOptions {
  provider: string;
  node: HTMLElement;
}

export interface UnlinkOptions {
  identityId: string;
}

export interface UserPolicy {
  id: string;
  agreedon: number;
}

export interface RootInfo {
  version: string;
  servertime: number;
}

export interface LoginCreateOptions {
  id: string;
  user: string;
  display: string;
  email: string;
  linkall: boolean;
  policyids: Array<string>;
}

// The first one is definitely returned by /token, but don't know where the other comes
// into play...

export interface TokenInfo {
  cachefor: number; // TODO: does not appear to always be present; e.g. in login pick result
  created: number;
  custom: Record<string, string>;
  expires: number;
  id: string;
  name: string | null;
  type: string; // TODO: type this: Login, Dev, Serv ?
  user: string;
}

export interface TokenInfoFull {
  cachefor: number; // TODO: does not appear to always be present; e.g. in login pick result
  created: number;
  custom: Record<string, string>;
  expires: number;
  id: string;
  name: string | null;
  type: string; // TODO: type this: Login, Dev, Serv ?
  user: string;

  token: string;
  device: string;
  os: string;
  osver: string;
  agent: string;
  agentver: string;
  ip: string;
}

// TODO: inspect
export interface Identity {
  id: string;
  provider: string;
  username: string;
  provusername: string;
}

export interface Role {
  id: string;
  desc: string;
}

export interface Account {
  created: number;
  customroles: Array<string>;
  policyids: Array<UserPolicy>;
  display: string;
  email: string;
  idents: Array<Identity>;
  lastlogin: number;
  local: boolean;
  roles: Array<Role>;
  user: string;
  anonid: string;
}

export interface LoginCreateResponse {
  redirecturl: string;
  token: TokenInfo;
}

export interface Tokens {
  tokens: Array<TokenInfoFull>;
  current: TokenInfoFull;
  dev: boolean;
  serv: boolean;
}

export interface CreateChoice {
  id: string;
  availablename: string;
  provusername: string;
  provfullname: string;
  provemail: string;
  expires: number;
}

export interface LoginChoiceLogin {
  id: string;
  provusernames: Array<string>;
  user: string;
  loginallowed: boolean;
  disabled: boolean;
  adminonly: boolean;
  // TODO: double check this
  policyids: Array<UserPolicy>;
}

export interface LoginChoice {
  createurl: string;
  pickurl: string;
  provider: string;
  redirecturl: string;
  state: string;
  creationallowed: string;
  create: Array<CreateChoice>;
  login: Array<LoginChoiceLogin>;
  token?: string;
  logged_in: boolean;
  // TODO: this is in here twice, bug.
  redirect?: string;
  expires: number;
}

export interface LinkChoice {
  id: string;
  expires: number;
  cancelurl: string;
  pickurl: string;
  canlink: boolean;
  provider: string;
  provusername: string;
  linkeduser?: string;
  user: string;
}

export interface Auth2ApiErrorInfo {
  appcode: number;
  apperror: string;
  message: string;
  httpcode: number;
  httpstatus: string;
  callid: string;
  time: number;
}

export interface PolicyAgreement {
  id: string;
  version: number;
}

export interface LoginPickParams {
  identityId: string;
  linkAll: boolean;
  agreements: Array<PolicyAgreement>;
}

// TODO: check the actual result
export interface LoginPickResult {
  redirecturl: string;
  token: TokenInfoFull;
}

export interface LoginCreateResult {
  token: TokenInfoFull;
  // {
  //     agent: string,
  //     agentver: string,
  //     created: number,
  //     custom: Record<string, string>,
  //     device: string,
  //     expires: number;
  //     id: string,
  //     ip: string,
  //     name: string | null,
  //     os: string,
  //     osver: string,
  //     user: string,
  //     type: string,
  //     token: string
  // }
}

export interface CreateTokenInput {
  name: string;
  type: string;
}

export interface NewTokenInfo {
  type: string;
  id: string;
  expires: number;
  created: number;
  name: string;
  user: string;
  token: string;
}

export interface UserSearchInput {
  prefix: string;
  fields: string;
}

// export interface UserSearchOutput {}

export interface PutMeInput {
  display: string;
  email: string;
}

// Classes

export interface AuthConfig {
  baseUrl: string;
}

export class Auth2 {
  config: AuthConfig;

  constructor(config: AuthConfig) {
    this.config = config;
  }

  // TODO: use this whenever need provider assets...
  getProviders(): Array<AuthProvider> {
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
  getProvider(providerId: string): AuthProvider {
    const providers = this.getProviders();
    return providers.filter((provider) => {
      return provider.id === providerId;
    })[0];
  }

  root(): Promise<RootInfo> {
    const httpClient = new AuthClient();
    return httpClient
      .request({
        method: 'GET',
        withCredentials: WITH_CREDENTIALS,
        header: new HttpHeader({
          Accept: 'application/json',
        }),
        url: this.makePath([endpoints.root]),
        timeout: TIMEOUT,
      })
      .then((result: Response) => {
        return this.processResult(result, 200);
      });
  }

  /*
          Note that this just just punts the browser via a javascript-submitted
          form post.
          There is no return value, nor any way of verifying that the server
          did the correct thing.
      */
  loginStart(config: LoginOptions): void {
    // Set the client state cookie.
    // const state = JSON.stringify(config.state);

    // Punt over to the auth service
    const html = new HTML();
    const t = html.tagMaker();
    const form = t('form');
    const input = t('input');
    // const button = t('button');

    const search = new HttpQuery({
      state: JSON.stringify(config.state),
    }).toString();

    const url = `${document.location.origin}?${search}`;

    const query = {
      provider: config.provider,
      redirecturl: url,
      stayloggedin: config.stayLoggedIn ? 'true' : 'false',
    };

    const formId = html.genId();

    const content = form(
      {
        method: 'post',
        id: formId,
        action: this.makePath(endpoints.loginStart),
        style: {
          display: 'hidden',
        },
      },
      [
        input(
          {
            type: 'hidden',
            name: 'provider',
            value: query.provider,
          },
          [],
        ),
        input(
          {
            type: 'hidden',
            name: 'redirecturl',
            value: query.redirecturl,
          },
          [],
        ),
        input(
          {
            type: 'hidden',
            name: 'environment',
            value: 'bar',
          },
          [],
        ),
      ],
    );

    const donorNode = document.createElement('div');

    // xss safe (all values internal)
    donorNode.innerHTML = content;
    document.body.appendChild(donorNode);

    (document.getElementById(formId) as HTMLFormElement).submit();
  }

  linkStart(token: string, config: LinkOptions): void {
    const html = new HTML();
    const t = html.tagMaker();
    const form = t('form');
    const input = t('input');

    const query = {
      provider: config.provider,
    };

    const formId = html.genId();

    const content = form(
      {
        method: 'POST',
        id: formId,
        action: [this.config.baseUrl, endpoints.linkStart].join('/'),
        style: {
          display: 'hidden',
        },
      },
      [
        input(
          {
            type: 'hidden',
            name: 'provider',
            value: query.provider,
          },
          [],
        ),
        input({
          type: 'hidden',
          name: 'token',
          value: token,
        }),
      ],
    );

    // xss safe (all values internal)
    config.node.innerHTML = content;

    (document.getElementById(formId) as HTMLFormElement).submit();
  }

  /*
      POST /me/unlink/:id
      Authorization :token
      throws NoTokenProvidedException, InvalidTokenException, AuthStorageException,
              UnLinkFailedException, DisabledUserException, NoSuchIdentityException
      */

  decodeError(result: Response): Auth2ApiErrorInfo {
    try {
      return JSON.parse(result.response) as Auth2ApiErrorInfo;
    } catch (ex) {
      console.error(ex);
      const message = (() => {
        if (ex instanceof Error) {
          return ex.message;
        }
        return 'Unknown Error';
      })();
      throw new AuthError({
        code: 'decode-error',
        message: 'Error decoding JSON error response',
        detail: message,
      });
    }
  }

  removeLink(token: string, config: UnlinkOptions): Promise<void> {
    const httpClient = new AuthClient();

    return httpClient
      .request({
        method: 'POST',
        withCredentials: WITH_CREDENTIALS,
        header: new HttpHeader({
          authorization: token,
          'content-type': 'application/json',
          accept: 'application/json',
        }),
        url: this.makePath([endpoints.linkRemove, config.identityId]),
        timeout: TIMEOUT,
      })
      .then((result: Response) => {
        return this.processResult(result, 204);
      });
  }

  logout(token: string): Promise<any> {
    const httpClient = new AuthClient();

    return httpClient
      .request({
        method: 'POST',
        withCredentials: WITH_CREDENTIALS,
        header: new HttpHeader({
          authorization: token,
          'content-type': 'application/json',
          accept: 'application/json',
        }),
        url: this.makePath(endpoints.logout),
        timeout: TIMEOUT,
      })
      .then((result: Response) => {
        return this.processResult(result, 200);
      });
  }

  revokeToken(token: string, tokenid: string): Promise<any> {
    const httpClient = new AuthClient();

    return httpClient
      .request({
        method: 'DELETE',
        withCredentials: WITH_CREDENTIALS,
        header: new HttpHeader({
          authorization: token,
          'content-type': 'application/json',
        }),
        url: this.makePath([endpoints.tokensRevoke, tokenid]),
        timeout: TIMEOUT,
      })
      .then((result: Response) => {
        return this.processResult(result, 204);
      });
  }

  revokeAllTokens(token: string): Promise<any> {
    const httpClient = new AuthClient();

    return httpClient
      .request({
        method: 'DELETE',
        withCredentials: WITH_CREDENTIALS,
        header: new HttpHeader({
          authorization: token,
          'content-type': 'application/json',
        }),
        url: this.makePath(endpoints.tokensRevokeAll),
        timeout: TIMEOUT,
      })
      .then((result: Response) => {
        return this.processResult(result, 204);
      });
  }

  getTokenInfo(token: string): Promise<TokenInfo> {
    const httpClient = new AuthClient();
    return httpClient
      .request({
        method: 'GET',
        url: this.makePath([endpoints.tokenInfo]),
        withCredentials: WITH_CREDENTIALS,
        header: new HttpHeader({
          authorization: token,
          accept: 'application/json',
        }),
        timeout: TIMEOUT,
      })
      .then((result: Response) => {
        return this.processResult(result, 200) as TokenInfo;
      });
  }

  getMe(token: string): Promise<Account> {
    const httpClient = new AuthClient();
    return httpClient
      .request({
        method: 'GET',
        withCredentials: WITH_CREDENTIALS,
        url: this.makePath(endpoints.apiMe),
        header: new HttpHeader({
          authorization: token,
          accept: 'application/json',
        }),
        timeout: TIMEOUT,
      })
      .then((result) => {
        return this.processResult(result, 200) as Account;
      });
  }

  putMe(token: string, data: PutMeInput): Promise<any> {
    const httpClient = new AuthClient();
    return httpClient
      .request({
        method: 'PUT',
        withCredentials: WITH_CREDENTIALS,
        url: this.makePath(endpoints.me),
        header: new HttpHeader({
          authorization: token,
          accept: 'application/json',
          'content-type': 'application/json',
        }),
        data: JSON.stringify(data),
        timeout: TIMEOUT,
      })
      .then((result) => {
        this.processResult(result, 204);
      });
  }

  makePath(path: Array<string> | string): string {
    if (typeof path === 'string') {
      return [this.config.baseUrl].concat([path]).join('/');
    }
    return [this.config.baseUrl].concat(path).join('/');
  }

  getTokens(token: string): Promise<Tokens> {
    const httpClient = new AuthClient();
    return httpClient
      .request({
        method: 'GET',
        withCredentials: WITH_CREDENTIALS,
        url: this.makePath([endpoints.tokens]),
        header: new HttpHeader({
          authorization: token,
          accept: 'application/json',
        }),
        timeout: TIMEOUT,
      })
      .then((result) => {
        return this.processResult(result, 200) as Tokens;
      });
  }

  createToken(token: string, create: CreateTokenInput): Promise<TokenInfoFull> {
    const httpClient = new AuthClient();
    return httpClient
      .request({
        method: 'POST',
        withCredentials: WITH_CREDENTIALS,
        url: this.makePath(endpoints.tokens),
        header: new HttpHeader({
          authorization: token,
          accept: 'application/json',
          'content-type': 'application/json',
        }),
        data: JSON.stringify(create),
        timeout: TIMEOUT,
      })
      .then((result) => {
        return this.processResult(result, 200) as TokenInfoFull;
      });
  }

  // Note that the auth2 service will have set cookies
  // in the browser which are implicitly sent.
  getLoginChoice(): Promise<LoginChoice> {
    const httpClient = new AuthClient();
    return httpClient
      .request({
        method: 'GET',
        withCredentials: WITH_CREDENTIALS,
        url: this.makePath(endpoints.loginChoice),
        header: new HttpHeader({
          accept: 'application/json',
        }),
        timeout: TIMEOUT,
      })
      .then((result) => {
        return this.processResult(result, 200) as LoginChoice;
      });
  }

  loginCancel(): Promise<null> {
    const httpClient = new AuthClient();
    return httpClient
      .request({
        method: 'DELETE',
        withCredentials: WITH_CREDENTIALS,
        url: this.makePath(endpoints.loginCancel),
        header: new HttpHeader({
          accept: 'application/json',
        }),
        timeout: TIMEOUT,
      })
      .then((result) => {
        return this.processResult(result, 204);
      });
  }

  linkCancel(): Promise<null> {
    const httpClient = new AuthClient();
    return httpClient
      .request({
        method: 'DELETE',
        withCredentials: WITH_CREDENTIALS,
        url: this.makePath(endpoints.linkCancel),
        header: new HttpHeader({
          accept: 'application/json',
        }),
        timeout: TIMEOUT,
      })
      .then((result) => {
        return this.processResult(result, 204);
      });
  }

  async loginPick(arg: LoginPickParams): Promise<LoginPickResult> {
    const data = {
      id: arg.identityId,
      linkall: arg.linkAll,
      policyids: arg.agreements.map((a) => {
        return [a.id, a.version].join('.');
      }),
    };
    const httpClient = new AuthClient();
    const result = await httpClient.request({
      method: 'POST',
      withCredentials: WITH_CREDENTIALS,
      url: this.makePath([endpoints.loginPick]),
      data: JSON.stringify(data),
      header: new HttpHeader({
        'content-type': 'application/json',
        accept: 'application/json',
      }),
      timeout: TIMEOUT,
    });

    return this.processResult(result, 200);
  }

  async loginCreate(data: LoginCreateOptions): Promise<LoginCreateResult> {
    const httpClient = new AuthClient();
    return httpClient
      .request({
        method: 'POST',
        withCredentials: WITH_CREDENTIALS,
        url: this.makePath(endpoints.loginCreate),
        data: JSON.stringify(data),
        header: new HttpHeader({
          'content-type': 'application/json',
          accept: 'application/json',
        }),
        timeout: TIMEOUT,
      })
      .then((result) => {
        return this.processResult(result, 201);
      });
  }

  loginUsernameSuggest(username: string): Promise<any> {
    const httpClient = new AuthClient();
    return httpClient
      .request({
        method: 'GET',
        withCredentials: WITH_CREDENTIALS,
        url: this.makePath([endpoints.loginUsernameSuggest, username]),
        header: new HttpHeader({
          accept: 'application/json',
        }),
        timeout: TIMEOUT,
      })
      .then((result) => {
        return this.processResult(result, 200);
      });
  }

  getLinkChoice(token: string) {
    const httpClient = new AuthClient();
    // console.error('fetching with', token);
    return httpClient
      .request({
        method: 'GET',
        withCredentials: WITH_CREDENTIALS,
        url: this.makePath(endpoints.linkChoice),
        header: new HttpHeader({
          accept: 'application/json',
          authorization: token,
        }),
        timeout: TIMEOUT,
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
            linkeduser: undefined,
            user: response.user,
          } as LinkChoice;
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
          } as LinkChoice;
        }
      });
  }

  linkPick(token: string, identityId: string): Promise<any> {
    const data = {
      id: identityId,
    };
    const httpClient = new AuthClient();
    return httpClient
      .request({
        method: 'POST',
        withCredentials: WITH_CREDENTIALS,
        url: this.makePath(endpoints.linkPick),
        data: JSON.stringify(data),
        header: new HttpHeader({
          authorization: token,
          'content-type': 'application/json',
          accept: 'application/json',
        }),
        timeout: TIMEOUT,
      })
      .then((result) => {
        return this.processResult(result, 204);
      });
  }

  processResult(result: Response, expectedResponse: number): any {
    if (result.status >= 200 && result.status < 300) {
      if (expectedResponse !== result.status) {
        throw new AuthError({
          code: 'unexpected-response-code',
          message: `Unexpected response code; expected ${String(expectedResponse)}, received ${String(result.status)}`,
        });
      }
      if (result.status === 200 || result.status === 201) {
        const mediaType = (() => {
          const contentType = result.header.getContentType();
          if (contentType) {
            return contentType.mediaType;
          }
          return 'text/plain';
        })();
        switch (mediaType) {
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
          message: `Unexpected response code; expected ${String(expectedResponse)}, received ${String(result.status)}`,
        });
      }
    } else {
      // TODO: should we distinguish error conditions or let the caller do so?
      // Maybe we should throw a basic error type, like
      // AuthorizationError - for 401s
      // ClientError - for 400s
      // ServerError - for 500s
      let auth2ErrorData: any;
      let errorResponse: AuthErrorInfo;
      const errorText = result.response;
      try {
        const mediaType = (() => {
          const contentType = result.header.getContentType();
          if (contentType) {
            return contentType.mediaType;
          }
          return 'text/plain';
        })();
        switch (mediaType) {
          case 'application/json':
            errorResponse = (() => {
              auth2ErrorData = JSON.parse(errorText);
              const code =
                auth2ErrorData.error.code || auth2ErrorData.error.appcode || auth2ErrorData.error.httpcode || 0;
              return {
                code: String(code),
                status: result.status,
                message: auth2ErrorData.error.message || auth2ErrorData.error.apperror,
                data: auth2ErrorData,
              };
            })();

            break;
          default:
            // A 502 proxy error will almost surely not have a json response
            if (result.status === 502) {
              errorResponse = {
                code: 'proxy-error',
                status: result.status,
                message: 'The auth service could not be contacted due to a proxy error (502)',
                detail:
                  'An error returned by the proxy service indicates that the auth service is not operating corectly',
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
                  contentType: mediaType,
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
          detail: `Original error code: ${result.status}`,
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
      if (errorResponse === undefined) {
        throw new Error('Impossible? Error response undefined');
      }
      throw new AuthError(errorResponse);
    }
  }

  userSearch(token: string, searchInput: UserSearchInput): Promise<any> {
    const httpClient = new AuthClient();

    const path = this.makePath([endpoints.userSearch, searchInput.prefix]);

    const search = new HttpQuery({
      fields: searchInput.fields,
    }).toString();

    const url = `${path}?${search}`;

    return httpClient
      .request({
        method: 'GET',
        withCredentials: WITH_CREDENTIALS,
        url,
        header: new HttpHeader({
          authorization: token,
          accept: 'application/json',
        }),
        timeout: TIMEOUT,
      })
      .then((result) => {
        return this.processResult(result, 200);
      });
  }

  adminUserSearch(token: string, searchInput: UserSearchInput): Promise<any> {
    const httpClient = new AuthClient();

    const search = new HttpQuery({
      fields: searchInput.fields,
    }).toString();

    const url = `${this.makePath([endpoints.adminUserSearch, searchInput.prefix])}?${search}`;

    return httpClient
      .request({
        method: 'GET',
        withCredentials: WITH_CREDENTIALS,
        url,
        header: new HttpHeader({
          authorization: token,
          accept: 'application/json',
        }),
        timeout: TIMEOUT,
      })
      .then((result) => {
        return this.processResult(result, 200);
      });
  }

  getAdminUser(token: string, username: string): Promise<any> {
    const httpClient = new AuthClient();
    return httpClient
      .request({
        method: 'GET',
        withCredentials: WITH_CREDENTIALS,
        url: this.makePath([endpoints.adminUser, username]),
        header: new HttpHeader({
          authorization: token,
          accept: 'application/json',
        }),
        timeout: TIMEOUT,
      })
      .then((result) => {
        return this.processResult(result, 200);
      });
  }
}
