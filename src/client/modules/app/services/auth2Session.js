define([
    'kb_common_ts/Auth2Session',
    'kb_common/observed',
    'kb_common/html'
], function (
    M_auth2Session,
    observed,
    html) {
    'use strict';

    var t = html.tag,
        div = t('div'),
        p = t('p'),
        a = t('a');

    function factory(config) {
        var runtime = config.runtime;

        // TODO: all of this from config?
        var auth2Session = new M_auth2Session.Auth2Session({
            cookieName: runtime.config('services.auth2.cookieName'),
            extraCookies: config.extraCookies,
            baseUrl: runtime.config('services.auth2.url'),
            providers: runtime.config('services.auth2.providers')
        });

        var state = observed.make();

        // Session
        function getAuthToken() {
            return auth2Session.getToken();
        }

        function getUsername() {
            return auth2Session.getUsername();
        }

        function getRealname() {
            return auth2Session.getRealname();
        }

        function getTokenInfo() {
            return auth2Session.getTokenInfo();
        }

        function getMe() {
            return auth2Session.getMe();
        }

        function isLoggedIn() {
            return auth2Session.isLoggedIn();
        }

        function isAuthorized() {
            return auth2Session.isAuthorized();
        }

        function getKbaseSession() {
            return auth2Session.getKbaseSession();
        }

        function getLastProvider() {
            return auth2Session.getLastProvider();
        }

        function setLastProvider() {
            return auth2Session.setLastProvider.apply(null, arguments);
        }

        function getProviders() {
            return auth2Session.getClient().getProviders();
        }

        // Session state change
        function loginStart(arg) {
            // starts an auth login / signup redirect loop
            // it _could_ be done inside an iframe ...
            auth2Session.loginStart(arg);
        }

        function logout() {
            return auth2Session.logout()
                .then(function (result) {
                    state.setItem('loggedin', false);
                    runtime.send('session', 'loggedout');
                    return result;
                });
        }

        function notifyError(message) {
            runtime.send('ui', 'alert', {
                type: 'warning',
                message: message.message,
                description: message.description,
                icon: 'exclamation-triangle',
                name: 'auth-connection'
            });
        }

        function notifyOk(message) {
            runtime.send('ui', 'alert', {
                type: 'success',
                message: message.message,
                description: message.description,
                icon: 'check',
                name: 'auth-connection',
                timeout: 10000
            });
        }


        function start() {
            auth2Session.start()
                .then(function () {
                    // session.setSession(session.importFromCookie());
                    if (auth2Session.isAuthorized()) {
                        state.setItem('loggedin', true);
                        runtime.send('session', 'loggedin');
                    } else {
                        state.setItem('loggedin', false);
                        runtime.send('session', 'loggedout');
                    }
                    auth2Session.onChange(function (change) {
                        switch (change) {
                        case 'interrupted':
                            // runtime.send('app', 'navigate', {
                            //     path: 'auth2/interrupted'
                            // });
                            // runtime.send('connection', 'disconnected', {
                            //     source: 'session'
                            // });
                            var description = div([
                                p('Your session cannot be verified because the authorization service is currently inaccessible'),
                                p([
                                    'You may patiently await it\'s recovery or ',
                                    a({
                                        href: '#signout'
                                    }, 'signout'),
                                    ' and try again later'
                                ])
                            ]);
                            notifyError({
                                message: 'Session cannot be verified',
                                description: description
                            });
                            return;
                        case 'restored':
                            notifyOk({
                                message: 'Communication restored -- session has been verified',
                                description: ''
                            });
                        }

                        if (auth2Session.isAuthorized()) {
                            if (change === 'newuser') {
                                // TODO: do something special...
                            }

                            state.setItem('loggedin', true);
                            runtime.send('session', 'loggedin');
                        } else {
                            state.setItem('loggedin', false);
                            // runtime.send('session', 'loggedout');
                            // TODO: detect if already on signedout page.
                            runtime.send('app', 'navigate', {
                                path: 'auth2/signedout'
                            });
                        }
                    });
                });
        }

        function stop() {
            auth2Session.stop()
                .then(function () {
                    session = null;
                });
        }

        function onChange(fun) {
            state.listen('loggedin', {
                onSet: function (value) {
                    fun(value);
                }
            });
        }

        function getClient() {
            return auth2Session;
        }

        return {
            start: start,
            stop: stop,
            onChange: onChange,
            getAuthToken: getAuthToken,
            getUsername: getUsername,
            getRealname: getRealname,
            isLoggedIn: isLoggedIn,
            isAuthorized: isAuthorized,
            getKbaseSession: getKbaseSession,
            getLastProvider: getLastProvider,
            getProviders: getProviders,
            getTokenInfo: getTokenInfo,
            getMe: getMe,
            getClient: getClient,
            loginStart: loginStart,
            logout: logout
        };
    }
    return {
        make: function (config) {
            return factory(config);
        }
    };
});