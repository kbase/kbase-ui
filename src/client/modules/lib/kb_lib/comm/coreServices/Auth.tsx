import { HTTPClient, HTTPHeader } from '../HTTPClient';

export interface RootInfo {
    version: string;
    servertime: number;
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
    adminUser: 'api/V2/admin/user'
};

export interface TokenInfo {
    created: number;
    expires: number;
    id: string;
    name: string | null;
    token: string;
    type: string;
    user: string;
    cachefor: number;
}

export interface Identity {
    id: string;
    provider: string;
    username: string;
}

export interface Role {
    id: string;
    desc: string;
}

export interface Account {
    created: number;
    customroles: Array<string>;
    display: string;
    email: string;
    idents: Array<Identity>;
    lastLogin: number;
    local: boolean;
    roles: Array<Role>;
    user: string;
}
export default class AuthClient {
    url: string;

    constructor({ url }: { url: string; }) {
        this.url = url;
    }

    makePath(path: Array<string> | string): string {
        if (typeof path === 'string') {
            return [this.url].concat([path]).join('/');
        }
        return [this.url].concat(path).join('/');
    }

    async root(): Promise<RootInfo> {
        const httpc = new HTTPClient();
        const header = new HTTPHeader({
            Accept: 'application/json',
        });
        const response = await httpc.request<string>({
            url: this.makePath([endpoints.root]),
            method: 'GET',
            timeout: 10000,
            header
        });

        return JSON.parse(response.response) as RootInfo;
    }

    async getTokenInfo(token: string): Promise<TokenInfo> {
        const httpc = new HTTPClient();
        const header = new HTTPHeader({
            Accept: 'application/json',
            Authorization: token
        });
        const data = await httpc.request<string>({
            url: this.makePath([endpoints.tokenInfo]),
            method: 'GET',
            timeout: 10000,
            header
        });

        // const { data } = await axios.get(this.makePath([endpoints.tokenInfo]), {
        //     headers: {
        //         Accept: 'application/json',
        //         Authorization: token
        //     }
        // });

        return JSON.parse(data.response) as TokenInfo;
    }

    async getMe(token: string): Promise<Account> {
        const httpc = new HTTPClient();
        const header = new HTTPHeader({
            Accept: 'application/json',
            Authorization: token
        });
        const result = await httpc.request<string>({
            url: this.makePath([endpoints.apiMe]),
            method: 'GET',
            timeout: 10000,
            header
        });
        return JSON.parse(result.response) as Account;
    }
}
