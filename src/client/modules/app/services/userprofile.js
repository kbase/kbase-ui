/*global define */
/*jslint browser: true, white: true */
define([
    'promise',
    'kb_common/observed',
    'kb_service/userProfile',
    'kb_service/client/userProfile',
    'kb_common/lang'
], function (
    Promise,
    observed,
    userProfile,
    UserProfileService,
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

        function createProfileFromAccount(profile) {
            var userProfileClient = new UserProfileService(runtime.config('services.user_profile.url'), {
                token: runtime.service('session').getAuthToken()
            });
            return runtime.service('session').getMe()
                .then(function (accountInfo) {
                    // first just recreate the stub profile experience.
                    // var newProfile = profile.makeProfile({
                    //     username: accountInfo.user,
                    //     realname: accountInfo.fullname,
                    //     account: {},
                    //     createdBy: 'userprofile_ui_service'
                    // });
                    var newProfile = {
                        // note - don't use this any more.
                        user: {
                            username: accountInfo.user
                        },
                        profile: {
                            metadata: {
                                createdBy: 'userprofile_ui_service',
                                created: new Date().toISOString()
                            },
                            // was globus info, no longer used
                            account: {},
                            preferences: {},
                            // when auto-creating a profile, there is nothing to put here het.
                            userdata: {}
                        }
                    };
                    return userProfileClient.set_user_profile({
                        profile: newProfile
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

            runtime.recv('profile', 'reload', function () {
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
                                // TODO: convert stub profile into a real profile, which is really just
                                // converting the userdata property into a full fledged structure,
                                // or at least simply just an empty structure.
                                profile.updateProfile({
                                    profile: {
                                        userdata: {}
                                    }
                                });
                                return profile.saveProfile()
                                    .then(function () {
                                        state.setItem('userprofile', profile);
                                    });
                                // runtime.send('ui', 'alert', {
                                //     type: 'warning',
                                //     message: 'Stub profile detected, converting to full profile.'
                                // });
                            case 'profile':
                                state.setItem('userprofile', profile);
                                break;
                            case 'none':
                                // this case should no longer occur.
                                // but we can auto-recover
                                // TODO:
                                runtime.send('ui', 'alert', {
                                    type: 'danger',
                                    message: 'User profile not found.'
                                });
                                break;
                                // return createProfileFromAccount(profile);

                                // return profile.createStubProfile({ createdBy: 'session' })
                                //     .then(function () {
                                //         return profile.loadProfile();
                                //     })
                                //     .then(function (profile) {
                                //         state.setItem('userprofile', profile);
                                //     })
                                //     .catch(function (err) {
                                //         console.error(err);
                                //         runtime.send('ui', 'alert', {
                                //             type: 'danger',
                                //             message: 'Error loading profile - could not create stub'
                                //         });
                                //     });
                            default:
                                runtime.send('ui', 'alert', {
                                    type: 'danger',
                                    message: 'Error loading profile - invalid state ' + profileState
                                });
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
                    return profile.userRecord;
                }
                return whenChange()
                    .then(function (profile) {
                        if (!profile) {
                            return;
                        }
                        return profile.userRecord;
                    });
            });
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
        make: function (config) {
            return factory(config);
        }
    };
});