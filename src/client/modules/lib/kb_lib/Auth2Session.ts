import { CookieManager, Cookie } from './Cookie';
import {
    Auth2,
    ILoginOptions,
    ILoginCreateOptions,
    LinkOptions,
    UnlinkOptions,
    ITokenInfo,
    LoginPick,
    CreateTokenInput,
    NewTokenInfo,
    UserSearchInput,
    PutMeInput,
    RootInfo,
    Account,
    Role,
} from './Auth2';
import { AuthError } from './Auth2Error';
import { uniqueId } from './Utils';

const SESSION_MONITORING_INTERVAL = 1000;

export type SessionStatus =
    | 'loggedout'
    | 'nosession'
    | 'newtoken'
    | 'interrupted-retry'
    | 'ok'
    | 'cacheexpired';

export interface SessionState {
    status: SessionStatus;
    token?: string;
}

export interface CookieConfig {
    name: string;
    domain: string;
}

export interface AuthSessionConfig {
    cookieName: string;
    baseUrl: string;
    extraCookies: Array<CookieConfig>;
}

export type Listener = (x: string) => null;

enum CacheState {
    New = 1, // newly created cache, no token info yet.
    Ok, // session token exists and is synced
    Stale, // session token exists, but cache lifetime has expired
    Syncing, // session token exists, syncing in progress
    Error, // session token exists, error syncing
    Interrupted, // session token exists, not able to sync
    None, // no session token exists
}

interface SessionCache {
    session: Session | null;
    fetchedAt: number;
    state: CacheState;
    interruptedAt?: number;
    lastCheckedAt?: number;
}

interface Session {
    token: string;
    tokenInfo: ITokenInfo;
    me: Account;
}

export class Auth2Session {
    cookieName: string;

    extraCookies: Array<CookieConfig>;

    baseUrl: string;

    sessionCache: SessionCache;
    session?: Session;
    auth2Client: Auth2;

    cookieManager: CookieManager;
    serviceLoopActive: boolean;

    cookieMaxAge: number;

    changeListeners: { [key: string]: Listener };

    root?: RootInfo;

    serverTime: number;

    // cookieName: string,
    //     baseUrl: string,
    //     endpoints: AuthEndpoints,
    //     providers: Array<AuthProvider>

    constructor(config: AuthSessionConfig) {
        this.cookieName = config.cookieName;
        this.extraCookies = config.extraCookies;
        this.baseUrl = config.baseUrl;
        this.cookieManager = new CookieManager();
        this.auth2Client = new Auth2(config);
        this.serviceLoopActive = false;
        // TODO: feed this from config.

        // how long does the cookie live for
        // TODO: set this properly
        this.cookieMaxAge = 300000;

        this.changeListeners = {};

        this.serverTime = new Date().getTime();

        this.sessionCache = {
            session: null,
            fetchedAt: 0,
            state: CacheState.New,
        };
    }

    getSession(): Session | null {
        if (this.sessionCache.state === CacheState.Ok) {
            return this.sessionCache.session;
        }
        return null;
    }

    getToken(): string | null {
        const session = this.getSession();
        if (session) {
            return session.token;
        }
        return null;
    }

    getUsername(): string | null {
        const session = this.getSession();
        if (session) {
            return session.tokenInfo.user;
        }
        return null;
    }

    getEmail(): string | null {
        const session = this.getSession();
        if (session) {
            return session.me.email;
        }
        return null;
    }

    getRealname(): string | null {
        const session = this.getSession();
        if (session) {
            return session.me.display;
        }
        return null;
    }

    getRoles(): Array<Role> | null {
        const session = this.getSession();
        if (session) {
            return session.me.roles;
        }
        return null;
    }

    getCustomRoles(): Array<string> | null {
        const session = this.getSession();
        if (session) {
            return session.me.customroles;
        }
        return null;
    }
    getKbaseSession(): any {
        const session = this.getSession();
        if (!session) {
            return null;
        }
        const info = session.tokenInfo;
        return {
            un: info.user,
            user_id: info.user,
            name: info.name,
            token: session.token,
            kbase_sessionid: null,
        };
    }

    isAuthorized(): boolean {
        const session = this.getSession();
        if (session) {
            return true;
        }
        return false;
    }

    isLoggedIn(): boolean {
        return this.isAuthorized();
    }

    getClient(): Auth2 {
        return this.auth2Client;
    }

    loginPick(arg: LoginPick): Promise<any> {
        return this.auth2Client.loginPick(arg).then((result) => {
            this.setSessionCookie(result.token.token, result.token.expires);
            return this.evaluateSession().then(() => {
                return result;
            });
        });
    }

    loginCreate(data: ILoginCreateOptions): Promise<any> {
        return this.auth2Client.loginCreate(data);
    }

    initializeSession(tokenInfo: any): Promise<void> {
        this.setSessionCookie(tokenInfo.token, tokenInfo.expires);
        return this.evaluateSession();
    }

    loginUsernameSuggest(username: string): Promise<any> {
        return this.auth2Client.loginUsernameSuggest(username);
    }

    loginCancel(): Promise<null> {
        return this.auth2Client.loginCancel();
    }

    linkCancel(): Promise<null> {
        return this.auth2Client.linkCancel();
    }

    // getAccount() : Promise<any> {
    //     return this.auth2Client.getAccount(this.getToken());
    // }

    getMe(): Promise<any> {
        return this.auth2Client.getMe(this.ensureToken());
    }

    putMe(data: PutMeInput): Promise<any> {
        return this.auth2Client.putMe(this.ensureToken(), data);
    }

    getTokens(): Promise<any> {
        return this.auth2Client.getTokens(this.ensureToken());
    }

    createToken(data: CreateTokenInput): Promise<NewTokenInfo> {
        return this.auth2Client.createToken(this.ensureToken(), data);
    }

    getTokenInfo(): Promise<any> {
        return this.auth2Client.getTokenInfo(this.ensureToken());
    }

    getLoginCoice(): Promise<any> {
        return this.auth2Client.getLoginChoice();
    }

    loginStart(config: ILoginOptions): void {
        this.auth2Client.loginStart(config);
    }

    linkStart(config: LinkOptions): void {
        return this.auth2Client.linkStart(this.ensureToken(), config);
    }

    removeLink(config: UnlinkOptions): Promise<void> {
        return this.auth2Client.removeLink(this.ensureToken(), config);
    }

    getLinkChoice(): Promise<any> {
        return this.auth2Client.getLinkChoice(this.ensureToken());
    }

    linkPick(identityId: string): Promise<any> {
        return this.auth2Client
            .linkPick(this.ensureToken(), identityId)
            .then((result) => {
                return result;
            });
    }

    logout(): Promise<void> {
        return this.auth2Client.logout(this.ensureToken()).then(() => {
            this.removeSessionCookie();
            return this.evaluateSession();
        });
    }

    revokeToken(tokenId: string): Promise<any> {
        return this.getTokenInfo().then((tokenInfo) => {
            return this.auth2Client.revokeToken(this.ensureToken(), tokenId);
        });
    }

    revokeAllTokens(): Promise<any> {
        return this.getTokenInfo().then((tokenInfo) => {
            return this.auth2Client.revokeAllTokens(this.ensureToken());
        });
    }

    onChange(listener: (x: string) => null): string {
        const id = uniqueId();
        this.changeListeners[id] = listener;
        return id;
    }
    offChange(id: string): void {
        delete this.changeListeners[id];
    }
    notifyListeners(change: string | null): void {
        if (change === null) {
            return;
        }
        Object.keys(this.changeListeners).forEach((key) => {
            const listener = this.changeListeners[key];
            try {
                listener(change);
            } catch (ex) {
                console.error('Error running change listener', key, ex);
            }
        });
    }

    checkSession(): SessionState {
        const cookieToken = this.getAuthCookie();
        const now = new Date().getTime();

        // This handles the token cookie going missing. This may happen
        // if the user signed out in another window, or if they deleted
        // their cookies.
        if (!cookieToken) {
            if (this.sessionCache.session) {
                this.sessionCache.session = null;
                this.sessionCache.state = CacheState.None;
                return {
                    status: 'loggedout',
                };
            }
            this.sessionCache.state = CacheState.None;
            return {
                status: 'nosession',
            };
        }

        // No session, but a cookie has appeared.
        if (this.sessionCache.session === null) {
            return {
                status: 'newtoken',
                token: cookieToken,
            };
        }

        // Detect user or session switcheroo. Just kill the old session.
        // The caller of checkSession will need to rebulid the session cache
        // and provide any notifications.
        if (cookieToken !== this.sessionCache.session.token) {
            this.sessionCache.session = null;
            return {
                status: 'newtoken',
                token: cookieToken,
            };
        }

        // Detect expired session
        const expiresIn = this.sessionCache.session.tokenInfo.expires - now;
        if (expiresIn <= 0) {
            this.sessionCache.session = null;
            this.sessionCache.state = CacheState.None;
            this.removeSessionCookie();
            return {
                status: 'loggedout',
            };
        }
        // else if (expiresIn <= 300000) {
        //     // TODO: issue warning to ui.
        //     // console.warn('session about to expire', expiresIn);
        // }

        // Attempt to restore interrupted session.
        // We do this once every 5 seconds for one minute,
        // then once every minute.
        if (this.sessionCache.state === CacheState.Interrupted) {
            const interruptedFor = now - this.sessionCache.interruptedAt!;
            const checkedFor = now - this.sessionCache.lastCheckedAt!;
            if (interruptedFor < 60000) {
                if (checkedFor > 5000) {
                    return {
                        status: 'interrupted-retry',
                        token: cookieToken,
                    };
                }
            } else if (checkedFor > 60000) {
                return {
                    status: 'interrupted-retry',
                    token: cookieToken,
                };
            }
            // Note that we don't try to recache the session while in interrupted
            // state, so we just return ok here.
            return {
                status: 'ok',
                token: cookieToken,
            };
        }

        // If we _still_ have a session, see if the cache is stale.
        // Note that we change the cache state but we leave the session intact.
        // TODO: revert back, just testing...
        const sessionAge = now - this.sessionCache.fetchedAt;
        if (sessionAge > this.sessionCache.session.tokenInfo.cachefor) {
            // this.session = null;
            this.sessionCache.state = CacheState.Stale;
            return {
                status: 'cacheexpired',
                token: cookieToken,
            };
        }

        return {
            status: 'ok',
            token: cookieToken,
        };
    }

    getAuthCookie(): string | null {
        let cookies = this.cookieManager.getItems(this.cookieName);

        // Expected case, just a single session cookie.
        if (cookies.length === 1) {
            return cookies[0];
        }

        // No session cookie.
        if (cookies.length === 0) {
            // Ensure that any dangling extra cookies are also removed.
            this.removeSessionCookie();
            return null;
        }

        // Handle case of a domain and host cookie slipping in.
        // Try removing the session cookie, which also tries to remove
        // all variants.
        if (cookies.length === 2) {
            this.removeSessionCookie();
        }
        cookies = this.cookieManager.getItems(this.cookieName);
        if (cookies.length > 0) {
            throw new Error(
                'Duplicate session cookie detected and cannot remove it. Please delete your browser cookies for this site.'
            );
        }

        // Another case of no session cookie.
        return null;
    }

    async ensureExtraSessionCookies(token: string): Promise<void> {
        let repairNeeded = false;

        // get backup cookies
        this.extraCookies.forEach((cookie) => {
            const items = this.cookieManager.getItems(cookie.name);
            if (items.length === 1) {
                // good.
            } else if (items.length > 1) {
                // bad - what to do?
                repairNeeded = false;
            } else {
                // Add this cookie.
                repairNeeded = true;
            }
        });

        if (!repairNeeded) {
            return;
        }

        const tokenInfo = await this.auth2Client.getTokenInfo(token);
        this.setSessionCookie(token, tokenInfo.expires);
    }

    async evaluateSession(): Promise<void> {
        const sessionState = this.checkSession();
        try {
            if (sessionState.token) {
                this.ensureExtraSessionCookies(sessionState.token).then(() => {
                    return sessionState;
                });
            }

            switch (sessionState.status) {
                case 'loggedout':
                    this.notifyListeners('loggedout');
                    return;
                case 'ok':
                    return;
                case 'nosession':
                    return;
                case 'interrupted-retry':
                case 'newtoken':
                case 'cacheexpired':
                    // All these cases need the session to be rebuilt.
                    break;
                default:
                    throw new Error(
                        `Unexpected session state: ${sessionState.status}`
                    );
            }

            const token = sessionState.token;

            this.sessionCache.lastCheckedAt = new Date().getTime();
            // let tokenInfo: ITokenInfo;
            // let me: Account;
            const tokenInfo = await this.auth2Client.getTokenInfo(token!);
            const me = await this.auth2Client.getMe(token!);
            // TODO detect invalidated token...
            this.sessionCache.fetchedAt = new Date().getTime();
            this.sessionCache.state = CacheState.Ok;
            this.sessionCache.interruptedAt = undefined;
            this.sessionCache.session = {
                token: token!,
                tokenInfo,
                me,
            };

            // Rewrite the extras cookies
            this.setSessionCookie(token!, tokenInfo.expires);

            switch (sessionState.status) {
                case 'newtoken':
                    this.notifyListeners('loggedin');
                    break;
                case 'interrupted-retry':
                    this.notifyListeners('restored');
                    break;
                case 'cacheexpired':
                // nothing special, the session has just been
                // reconfirmed.
            }
        } catch (err) {
            if (err instanceof AuthError) {
                switch (err.code) {
                    case '10020':
                        // invalid token - the token is not accepted by the auth2 service,
                        // so just invalidate the session.
                        console.error('Invalid Session Cookie Detected', err);
                        this.removeSessionCookie();
                        this.notifyListeners('loggedout');
                        break;
                    case 'connection-error':
                    case 'timeout-error':
                    case 'abort-error':
                        // TODO: remove
                        this.sessionCache.state = CacheState.Interrupted;
                        this.sessionCache.interruptedAt = new Date().getTime();
                        this.notifyListeners('interrupted');
                        switch (sessionState.status) {
                            case 'cacheexpired':
                            case 'newtoken':
                                // TODO: go to error page
                                this.sessionCache.fetchedAt =
                                    new Date().getTime();
                                this.notifyListeners('interrupted');
                                break;
                            case 'interrupted-retry':
                                this.notifyListeners('interrupted');
                                break;
                        }
                        // console.error('CONNECTION ERROR', err);
                        break;
                    default:
                        console.error('Unhandled AUTH ERROR', err);
                        this.removeSessionCookie();
                        this.notifyListeners('loggedout');
                }
            } else {
                // TODO: signal error to UI.
                console.error('ERROR', err, err instanceof AuthError);
                this.session = undefined;
                this.removeSessionCookie();
                if (sessionState.status === 'newtoken') {
                    this.notifyListeners('loggedout');
                }
            }
        }
    }

    // root stuff
    serverTimeOffset(): number {
        return this.serverTime - this.root!.servertime;
    }

    loopTimer: number | null = null;

    monitor(): void {
        const nextLoop = () => {
            if (!this.serviceLoopActive) {
                return;
            }
            this.loopTimer = window.setTimeout(
                serviceLoop,
                SESSION_MONITORING_INTERVAL
            );
        };
        const serviceLoop = () => {
            return this.evaluateSession().then(() => {
                nextLoop();
            });
        };
        this.serviceLoopActive = true;
        serviceLoop();
    }

    start(): Promise<any> {
        return this.auth2Client.root().then((root) => {
            this.root = root;

            // An infinite async loop.
            this.monitor();
        });
    }

    stop(): Promise<any> {
        this.serviceLoopActive = false;
        if (this.loopTimer) {
            window.clearTimeout(this.loopTimer);
            this.loopTimer = null;
        }
        return Promise.resolve();
    }

    // COOKIES

    setSessionCookie(token: string, expiration: number) {
        const sessionCookie = new Cookie(this.cookieName, token)
            .setPath('/')
            .setSecure(true);

        sessionCookie.setExpires(new Date(expiration).toUTCString());

        this.cookieManager.setItem(sessionCookie);
        if (this.extraCookies) {
            this.extraCookies.forEach((cookieConfig) => {
                const extraCookie = new Cookie(cookieConfig.name, token)
                    .setPath('/')
                    .setDomain(cookieConfig.domain)
                    .setSecure(true);

                extraCookie.setExpires(new Date(expiration).toUTCString());

                this.cookieManager.setItem(extraCookie);
            });
        }
    }

    removeSessionCookie(): void {
        // Remove host-based cookie.
        this.cookieManager.removeItem(
            new Cookie(this.cookieName, '').setPath('/')
        );

        // Also remove the domain level cookie in case it was in advertently
        // created. This can be a cause for a corrupt token, since the old auth
        // system tokens are invalid, and it could create domain level cookies.
        // New auth code does not (other than the backup cookie.)
        const domainParts = window.location.hostname.split('.');
        let domain;
        for (let len = 2; len <= domainParts.length; len += 1) {
            domain = domainParts.slice(-len).join('.');
            this.cookieManager.removeItem(
                new Cookie(this.cookieName, '').setPath('/').setDomain(domain)
            );
        }

        if (this.extraCookies) {
            this.extraCookies.forEach((cookieConfig) => {
                this.cookieManager.removeItem(
                    new Cookie(cookieConfig.name, '')
                        .setPath('/')
                        .setDomain(cookieConfig.domain)
                );
            });
        }
    }

    ensureToken(): string {
        const token = this.getToken();
        if (token === null) {
            throw new Error('Cannot get admin user - unauthenticated');
        }
        return token;
    }

    userSearch(search: UserSearchInput): Promise<any> {
        return this.auth2Client.userSearch(this.ensureToken(), search);
    }

    adminUserSearch(search: UserSearchInput): Promise<any> {
        return this.auth2Client.adminUserSearch(this.ensureToken(), search);
    }

    getAdminUser(username: string): Promise<any> {
        return this.auth2Client.getAdminUser(this.ensureToken(), username);
    }
}
