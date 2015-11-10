/*global define */
/*jslint browser: true, white: true */
define([
    'promise',
    'kb_common_observed',
    'kb_common_props',
    'kb_userprofile_userProfile',
    'kb_common_lang'
], function (Promise, observed, props, userProfile, lang) {
    'use strict';

    function factory(config) {
        var runtime = config.runtime,
            state = observed.make();

        function loadProfile() {
            return Promise.try(function () {
                var username = runtime.getService('session').getUsername();
                if (username) {
                    return Object.create(userProfile).init({
                        username: username,
                        runtime: runtime
                    }).loadProfile();
                }
                throw new lang.UIError({
                    type: 'RuntimeError',
                    reason: 'UsernameMissingFromSession',
                    message: 'The username was not found in the session.'
                });
            });
        }

        // list for request fetch the user profile
        function start() {
            runtime.getService('session').onChange(function (loggedIn) {
                if (loggedIn) {
                    loadProfile()
                        .then(function (profile) {
                            state.setItem('userprofile', profile);
                        })
                        .catch(function (err) {
                            console.log('ERROR starting profile app service');
                            console.log(err);
                        });
                } else {
                    state.setItem('userprofile', null);
                }
            });
        }
        function stop() {
            return Promise.try(function () {
                state.setItem('userprofile', null);
            });
        }

        function getRealname() {
            var profile = state.getItem('userprofile');
            if (profile) {
                return profile.getProp('user.realname');
            }
        }

        //runtime.recv('session', 'loggedin', function () {
        //    loadSession();
        //});

        // send out message when the profile has been received
        function onChange(fun, errFun) {
            state.listen('userprofile', {
                onSet: function (value) {
                    fun(value);
                },
                onError: function (err) {
                    console.log('ERROR in user profile service');
                    console.log(err);
                    if (errFun) {
                        errFun(err);
                    }
                }
            });
        }

        function whenChange() {
            return state.whenItem('userprofile')
        }

        return {
            // lifecycle api
            start: start,
            stop: stop,
            // useful api
            onChange: onChange,
            whenChange: whenChange,
            getRealname: getRealname
        };
    }
    return {
        make: function (config) {
            return factory(config);
        }
    };
});