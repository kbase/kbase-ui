/*global define */
/*jslint
  white: true, browser: true
 */
define([
   'bluebird',
   'utils',
   'kb_common_session',
   'kb_common_pluginManager'
], function (Promise, utils, sessionFactory, pluginManagerFactory) {
    'use strict';
    
    function factory() {
        var authToken,
            config,
            session = sessionFactory.make({
                cookieName: 'testSession',
                loginUrl: 'https://kbase.us/services/authorization/Sessions/Login',
                cookieMaxAge: 100000
            }),
            pluginManager = pluginManagerFactory.make();

        function getConfig(prop, defaultValue) {
            return null;
        }    
        function getAuthToken() {
            return session.getAuthToken();
        }
        function isLoggedIn() {
            return session.isLoggedIn();
        }
        function login(arg) {
            return session.login(arg);
        }
        function installPlugins(plugins) {
            return pluginManager.installPlugins(plugins);
        }
        
        // Creation tasks
        
        var api = {
            getConfig: getConfig,
            getAuthToken: getAuthToken,
            isLoggedIn: isLoggedIn,
            login: login,
            installPlugins: installPlugins
        };
        function begin() {
            var loginOptions = {
                username: 'eapearson',
                password: 'Oc3an1cWhal3',
                disableCookie: true
            };
            /*return session.login(loginOptions)
                .then(function (auth) {
                    if (auth) {
                        setAuthToken(auth.token);
                        return api;
                    } else {
                        alert('need to log in here');
                         throw error.getErrorObject({
                            name: 'NoAuth',
                            message: 'No Authorization found; Authorization is required for the data api',
                            suggestion: 'Umm, there should be a way for the user to log in...'
                        });
                    }
                });
                */
            return Promise.try(function () {
                return api;
            });
        }
        return {
            begin: begin
        };
    }
    return {
        run: function () {
            var runtime = factory();
            return runtime.begin();
        }
    };
});