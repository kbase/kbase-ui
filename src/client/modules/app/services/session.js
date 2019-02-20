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

    function factory(config, params) {
        var runtime = params.runtime;

        var extraCookies = [];
        if (config.cookie.backup.enabled) {
            extraCookies.push({
                name: config.cookie.backup.name,
                domain: config.cookie.backup.domain
            });
        }

        // TODO: all of this from config?
        var auth2Session = new M_auth2Session.Auth2Session({
            cookieName: runtime.config('services.auth2.cookieName'),
            extraCookies: extraCookies,
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

        function getEmail() {
            return auth2Session.getEmail();
        }

        function getRealname() {
            return auth2Session.getRealname();
        }

        function getRoles() {
            return auth2Session.getRoles() || [];
        }

        function getCustomRoles() {
            return auth2Session.getCustomRoles() || [];
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
            return auth2Session.start()
                .then(function () {
                    if (auth2Session.isAuthorized()) {
                        state.setItem('loggedin', true);
                        runtime.send('session', 'loggedin');
                    } else {
                        state.setItem('loggedin', false);
                        runtime.send('session', 'loggedout');
                    }
                    auth2Session.onChange(function (change) {
                        runtime.send('session', 'change', {
                            state: change
                        });
                        switch (change) {
                        case 'interrupted':
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
                            runtime.send('session', 'loggedout');
                            // TODO: detect if already on signedout page.
                            // TODO: this behavior should be defined in the main app
                            // TODO: there this behavior should look at the current plugin route,
                            // if it does not require authorization, just send let it be -- it should
                            // listen for the auth event itself and handle things appropriately.
                            // We'll have to update those or add a new plugin flag indicating that the
                            // plugin handles auth change events itself.
                            // runtime.send('app', 'navigate', {
                            //     path: 'auth2/signedout'
                            // });
                        }
                    });
                });
        }

        function stop() {
            auth2Session.stop()
                .then(function () {
                    // session = null;
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
            getEmail: getEmail,
            getUsername: getUsername,
            getRealname: getRealname,
            getRoles: getRoles,
            getCustomRoles: getCustomRoles,
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
        make: factory
    };
});
