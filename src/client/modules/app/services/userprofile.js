/*global define */
/*jslint browser: true, white: true */
define([
    'promise',
    'kb/common/observed',
    'kb/service/userProfile',
    'kb/common/lang'
], function (
    Promise,
    observed,
    userProfile,
    lang
    ) {
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

            runtime.recv('profile', 'check', function () {
                return loadProfile()
                    .then(function (profile) {
                        state.setItem('userprofile', profile);
                        runtime.send('profile', 'loaded', profile);
                    })
                    .done();
            });

            runtime.getService('session').onChange(function (loggedIn) {
                if (loggedIn) {
                    loadProfile()
                        .then(function (profile) {
                            var profileState = profile.getProfileStatus();
                            switch (profileState) {
                                case 'stub':
                                case 'profile':
                                    state.setItem('userprofile', profile);
                                    // AppState.setItem('userprofile', profile);
                                    // Postal.channel('session').publish('profile.loaded', {profile: profile});
                                    break;
                                case 'none':
                                    return profile.createStubProfile({createdBy: 'session'})
                                        .then(function () {
                                            return profile.loadProfile();
                                        })
                                        .then(function (profile) {
                                            state.setItem('userprofile', profile);
                                            //AppState.setItem('userprofile', profile);
                                            //Postal.channel('session').publish('profile.loaded', {profile: profile});
                                        })
                                        .catch(function (err) {
                                            // Postal.channel('session').publish('profile.loadfailure', {error: err});
                                            // TODO: global error handler!?!?!?
                                            // Send to alert?
                                            console.error(err);
                                            runtime.send('ui', 'alert', {
                                                type: 'error',
                                                message: 'Error loading profile - could not create stub'
                                            });
                                        });
                                    break;
                                default:
                                    runtime.send('ui', 'alert', 'Error loading profile - invalid state ' + profileState);
                            }
                        })
                        .catch(function (err) {
                            console.error('ERROR starting profile app service');
                            console.error(err);
                        });
                } else {
                    state.setItem('userprofile', null);
                }
            });
            return true;
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
                    console.error('ERROR in user profile service');
                    console.error(err);
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