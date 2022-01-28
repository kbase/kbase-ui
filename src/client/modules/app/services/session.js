define([
    'lib/kb_lib/Auth2Session',
    'kb_lib/observed',
    'kb_lib/html'
], (
    { Auth2Session },
    Observed,
    html
) => {
    const t = html.tag,
        div = t('div'),
        p = t('p'),
        a = t('a');

    class SessionService {
        constructor({ config, params: { runtime } }) {
            this.runtime = runtime;
            this.extraCookies = [];
            if (config.cookie.backup.enabled) {
                this.extraCookies.push({
                    name: config.cookie.backup.name,
                    domain: config.cookie.backup.domain
                });
            }
            this.auth2Session = new Auth2Session({
                cookieName: runtime.config('ui.services.session.cookie.name'),
                extraCookies: this.extraCookies,
                baseUrl: runtime.config('services.auth2.url'),
                providers: runtime.config('services.auth2.providers')
            });

            this.state = new Observed();
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
                name: 'auth-connection'
            });
        }

        notifyOk(message) {
            this.runtime.send('ui', 'alert', {
                type: 'success',
                message: message.message,
                description: message.description,
                icon: 'check',
                name: 'auth-connection',
                timeout: 10000
            });
        }

        start() {
            return this.auth2Session.start()
                .then(() => {
                    if (this.auth2Session.isAuthorized()) {
                        this.state.setItem('loggedin', true);
                        this.runtime.send('session', 'loggedin');
                    } else {
                        this.state.setItem('loggedin', false);
                        this.runtime.send('session', 'loggedout');
                    }
                    this.auth2Session.onChange((change) => {
                        this.runtime.send('session', 'change', {
                            state: change
                        });
                        switch (change) {
                        case 'interrupted': {
                            const description = div([
                                p(
                                    'Your session cannot be verified because the authorization service is currently inaccessible'
                                ),
                                p([
                                    'You may patiently await it\'s recovery or ',
                                    a(
                                        {
                                            href: '/#signout'
                                        },
                                        'signout'
                                    ),
                                    ' and try again later'
                                ])
                            ]);
                            this.notifyError({
                                message: 'Session cannot be verified',
                                description
                            });
                            return;
                        }
                        case 'restored':
                            this.notifyOk({
                                message: 'Communication restored -- session has been verified',
                                description: ''
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
                }
            });
        }

        getClient() {
            return this.auth2Session;
        }
    }
    return { ServiceClass: SessionService };
});
