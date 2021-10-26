// define([
//     'lib/kb_lib/Auth2Session',
//     'kb_lib/observed',
//     'kb_lib/html'
// ], (
//     { Auth2Session },
//     Observed,
//     html
// ) => {
// const t = html.tag,
//     div = t('div'),
//     p = t('p'),
//     a = t('a');

import { Auth2Session, CookieConfig } from '../lib/kb_lib/Auth2Session';
import { Observed } from '../lib/kb_lib/observed';
import { Runtime } from '../lib/runtime';
import { Config } from '../types/config';

export interface SessionServiceState {
    loggedIn: boolean;
}

export class SessionService {
    runtime: Runtime;
    extraCookies: Array<CookieConfig>;
    auth2Session: Auth2Session;
    state: Observed<SessionServiceState | null>;
    constructor(runtime: Runtime, config: Config) {
        this.runtime = runtime;
        this.extraCookies = [];
        if (config.ui.services.session.cookie.backup.enabled) {
            this.extraCookies.push({
                name: config.ui.services.session.cookie.backup.name,
                domain: config.ui.services.session.cookie.backup.domain,
            });
        }
        this.auth2Session = new Auth2Session({
            cookieName: config.ui.services.session.cookie.name,
            extraCookies: this.extraCookies,
            baseUrl: config.services.Auth2.url,
        });

        this.state = new Observed(null);
    }

    getAuthToken() {
        return this.auth2Session.getToken();
    }

    getUsername() {
        return this.auth2Session.getUsername();
    }

    getEmail() {
        return this.auth2Session.getEmail();
    }

    getRealname() {
        return this.auth2Session.getRealname();
    }

    getRoles() {
        return this.auth2Session.getRoles() || [];
    }

    getCustomRoles() {
        return this.auth2Session.getCustomRoles() || [];
    }

    getTokenInfo() {
        return this.auth2Session.getTokenInfo();
    }

    getMe() {
        return this.auth2Session.getMe();
    }

    isLoggedIn() {
        return this.auth2Session.isLoggedIn();
    }

    isAuthorized() {
        return this.auth2Session.isAuthorized();
    }

    isAuthenticated() {
        return this.auth2Session.isAuthorized();
    }

    getKbaseSession() {
        return this.auth2Session.getKbaseSession();
    }

    getLastProvider() {
        return this.auth2Session.getLastProvider();
    }

    getProviders() {
        return this.auth2Session.getClient().getProviders();
    }

    // Session state change
    loginStart(arg) {
        // starts an auth login / signup redirect loop
        // it _could_ be done inside an iframe ...
        this.auth2Session.loginStart(arg);
    }

    logout() {
        return this.auth2Session.logout().then((result) => {
            return result;
        });
    }

    notifyError(message) {
        this.runtime.send('ui', 'alert', {
            type: 'warning',
            message: message.message,
            description: message.description,
            icon: 'exclamation-triangle',
            name: 'auth-connection',
        });
    }

    notifyOk(message) {
        this.runtime.send('ui', 'alert', {
            type: 'success',
            message: message.message,
            description: message.description,
            icon: 'check',
            name: 'auth-connection',
            timeout: 10000,
        });
    }

    start() {
        return this.auth2Session.start().then(() => {
            if (this.auth2Session.isAuthorized()) {
                this.state.setItem('loggedin', true);
                this.runtime.send('session', 'loggedin');
            } else {
                this.state.setItem('loggedin', false);
                this.runtime.send('session', 'loggedout');
            }
            this.auth2Session.onChange((change) => {
                this.runtime.send('session', 'change', {
                    state: change,
                });
                switch (change) {
                    case 'interrupted':
                        var description = div([
                            p(
                                'Your session cannot be verified because the authorization service is currently inaccessible'
                            ),
                            p([
                                "You may patiently await it's recovery or ",
                                a(
                                    {
                                        href: '/#signout',
                                    },
                                    'signout'
                                ),
                                ' and try again later',
                            ]),
                        ]);
                        this.notifyError({
                            message: 'Session cannot be verified',
                            description: description,
                        });
                        return;
                    case 'restored':
                        this.notifyOk({
                            message:
                                'Communication restored -- session has been verified',
                            description: '',
                        });
                }
                if (this.auth2Session.isAuthorized()) {
                    if (change === 'newuser') {
                        // TODO: do something special...
                    }
                    this.state.setItem('loggedin', true);
                    this.runtime.send('session', 'loggedin');
                } else {
                    this.state.setItem('loggedin', false);
                    this.runtime.send('session', 'loggedout');
                }
            });
        });
    }

    stop() {
        return this.auth2Session.stop().then(() => {
            // session = null;
        });
    }

    onChange(fun) {
        this.state.listen('loggedin', {
            onSet: (value) => {
                fun(value);
            },
        });
    }

    getClient() {
        return this.auth2Session;
    }
}
