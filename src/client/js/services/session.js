/*global define */
/*jslint browser: true, white: true */
define([
    'kb_common_session',
    'kb_common_observed'
], function (sessionFactory, observed) {
    'use strict';
    function factory(config) {
        var runtime = config.runtime,
            session = sessionFactory.make({
                cookieName: config.cookieName || 'testSession',
                loginUrl: config.loginUrl || 'https://kbase.us/services/authorization/Sessions/Login',
                cookieMaxAge: config.cookieMaxAge || 100000
            }),
            state = observed.make();


        // Session
        function getAuthToken() {
            return session.getAuthToken();
        }
        function getUsername() {
            return session.getUsername();
        }
        function isLoggedIn() {
            return session.isLoggedIn();
        }
        function login(arg) {
            return session.login(arg)
                .then(function () {
                    state.setItem('loggedin', true);
                    runtime.send('session', 'loggedin');
                });
        }
        function logout() {
            return session.logout()
                .then(function () {
                    state.setItem('loggedin', false);
                    runtime.send('session', 'loggedout');
                });
        }

        function start() {
            console.log('starting session service');
            session.setSession(session.importFromCookie());
            if (isLoggedIn()) {
                state.setItem('loggedin', true);
                runtime.send('session', 'loggedin');
            } else {
                state.setItem('loggedin', false);
                runtime.send('session', 'loogedout');
            }
        }
        function stop() {
            session = null;
        }
        
        function onChange(fun) {
            state.listen('loggedin', {
                onSet: function (value) {
                    fun(value);
                }
            });
        }

        return {
            start: start,
            stop: stop,
            onChange: onChange,
            getAuthToken: getAuthToken,
            getUsername: getUsername,
            isLoggedIn: isLoggedIn,
            login: login,
            logout: logout
        };

    }
    return {
        make: function (config) {
            return factory(config);
        }
    };
})