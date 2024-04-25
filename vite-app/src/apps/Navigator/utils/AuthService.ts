export interface TokenInfo {
    type: string;
    id: string;
    expires: number;
    created: number;
    name: string | null;
    user: string;
    custom: { [key: string]: string };
    cachefor: number;
}

export type TokenInfoCache = Map<string, TokenInfo>;

const tokenInfoCache = new Map();

export interface AuthAPIError {
    appcode: number;
    apperror: string;
    callid: string;
    httpcode: number;
    httpstatus: string;
    message: string;
    time: number;
}

export class AuthError extends Error {
    error: AuthAPIError;
    constructor(error: AuthAPIError) {
        super(error.message);
        this.error = error;
    }
}

export class AuthService {
    token: string;
    url: string;
    constructor(url: string, token: string) {
        this.token = token;
        this.url = url;
    }

    clearCache() {
        tokenInfoCache.clear();
    }

    async getTokenInfo(): Promise<TokenInfo | null> {
        const tokenInfo = await this.makeAuthCall('token');
        return tokenInfo as unknown as TokenInfo;
    }

    async getUsernames(userIds: string[]): Promise<Record<string, string>> {
        const encodedUsers = userIds.map((u) => encodeURIComponent(u));
        const operation = 'users/?list=' + encodedUsers.join(',');
        const result = await this.makeAuthCall(operation);
        return result as Record<string, string>;
    }

    async searchUsernames(
        query: string,
        options?: string[],
    ): Promise<Record<string, string>> {
        let operation = 'users/search/' + query;
        if (options) {
            operation += '?fields=' + options.join(',');
        }
        const result = await this.makeAuthCall(operation);
        return result as Record<string, string>;
    }

    async makeAuthCall(operation: string): Promise<unknown> {
        const result = await (
            await fetch(`${this.url}/api/V2/${operation}`, {
                method: 'GET',
                headers: { Authorization: this.token },
            })
        ).json();
        if ('error' in result) {
            const error = result.error as unknown as AuthAPIError;
            throw new AuthError(error);
        }
        return result;
    }
}
