/*global define */
/*jslint browser: true, white: true */
define([
    'kb_common_ts/Auth2Session',
    'kb_common/observed'
], function (M_auth2Session, observed) {
    'use strict';
    function factory(config) {
        var runtime = config.runtime;

        // TODO: all of this from config?
        var auth2Session = new M_auth2Session.Auth2Session({
            cookieName: runtime.config('services.auth2.cookieName'),
            extraCookies: config.extraCookies,
            baseUrl: runtime.config('services.auth2.url'),
            
            providers: [{
                    id: 'Globus',
                    label: 'Globus'
                },
                {
                    id: 'Google',
                    label: 'Google'
                }
            ]
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
        function login(arg) {
            // starts an auth login / signup redirect loop
            // it _could_ be done inside an iframe ...
            auth2Session.login(arg);
        }
        function logout() {
            return auth2Session.logout()
                .then(function (result) {
                    state.setItem('loggedin', false);
                    runtime.send('session', 'loggedout');
                    return result;
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
                        runtime.send('session', 'loogedout');
                    }
                    auth2Session.onChange(function (change) {
                         if (auth2Session.isAuthorized()) {
                             if (change === 'newuser') {
                                 // TODO: do something special...
                             }

                            state.setItem('loggedin', true);
                            runtime.send('session', 'loggedin');
                        } else {
                            state.setItem('loggedin', false);
                            runtime.send('session', 'loogedout');
                        }
                    });
                });
        }
        function stop() {
            auth2Session.stop()
                .then(function() {
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
            login: login,
            logout: logout
        };

    }
    return {
        make: function (config) {
            return factory(config);
        }
    };
});