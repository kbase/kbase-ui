/*global define */
/*jslint browser: true, white: true */
define([
    'promise',
    'kb_common/observed',
    'kb_service/userProfile',
    'kb_service/client/userProfile',
    'kb_common/lang',
    'lib/userProfile'
], function (
    Promise,
    observed,
    userProfile,
    UserProfileService,
    lang,
    UserProfile
) {
    'use strict';

    function factory(config, params) {
        var runtime = params.runtime,
            state = observed.make();

        // function loadProfile() {
        //     return Promise.try(function () {
        //         var username = runtime.getService('session').getUsername();
        //         if (username) {
        //             return Object.create(userProfile).init({
        //                 username: username,
        //                 runtime: runtime
        //             }).loadProfile();
        //         }
        //         throw new lang.UIError({
        //             type: 'RuntimeError',
        //             reason: 'UsernameMissingFromSession',
        //             message: 'The username was not found in the session.'
        //         });
        //     });
        // }

        function loadProfile() {
            return Promise.try(function () {
                var username = runtime.service('session').getUsername();
                if (!username) {
                    throw new lang.UIError({
                        type: 'RuntimeError',
                        reason: 'UsernameMissingFromSession',
                        message: 'The username was not found in the session.'
                    });
                }
                var client = new UserProfileService(runtime.config('services.user_profile.url'), {
                    token: runtime.service('session').getAuthToken()
                });
                var userProfileLib = UserProfile.make({
                    runtime: runtime
                });
                return client.get_user_profile([username])
                    .then(function (profiles) {
                        if (!profiles || profiles.length === 0 || profiles[0] === null) {
                            // TODO: create profile and return it.f
                            return userProfileLib.createProfile(username);
                        } else {
                            return userProfileLib.fixProfile(profiles[0]);
                        }
                    });
            });
        }

        // list for request fetch the user profile
        function start() {

            runtime.receive('profile', 'check', function () {
                return loadProfile()
                    .then(function (profile) {
                        state.setItem('userprofile', profile);
                        runtime.send('profile', 'loaded', profile);
                    })
                    .done();
            });

            runtime.receive('profile', 'reload', function () {
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
                            state.setItem('userprofile', profile);
                        })
                        .catch(function (err) {
                            console.error('ERROR starting profile app service', err);
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

        function getItem(path, defaultValue) {
            return Promise.try(function () {
                var profile = state.getItem('userprofile');
                if (profile) {
                    return profile.getProp(path, defaultValue);
                }
                return whenChange()
                    .then(function (profile) {
                        if (!profile) {
                            return defaultValue;
                        }
                        return profile.getProp(path, defaultValue);
                    });
            });
        }

        function getProfile() {
            return Promise.try(function () {
                var profile = state.getItem('userprofile');
                if (profile) {
                    return profile;
                }
                return whenChange()
                    .then(function (profile) {
                        if (!profile) {
                            return;
                        }
                        return profile;
                    });
            });
        }

        //runtime.receive('session', 'loggedin', function () {
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
            return state.whenItem('userprofile');
        }

        return {
            // lifecycle api
            start: start,
            stop: stop,
            // useful api
            onChange: onChange,
            whenChange: whenChange,
            getRealname: getRealname,
            getItem: getItem,
            getProfile: getProfile
        };
    }
    return {
        make: factory
    };
});