/* global Promise */
define([
    'md5',
    'kb_service/client/userProfile',
    'kb_common_ts/Auth2',
    './props'
], function (
    md5,
    UserProfileService,
    Auth2,
    Props
) {
    'use strict';

    function factory(config) {
        var runtime = config.runtime;
        var profile = null;

        function fetchProfile() {
            var userProfileService = new UserProfileService(runtime.config('services.user_profile.url'), {
                token: runtime.service('session').getAuthToken()
            });
            var username = runtime.service('session').getUsername();
            userProfileService.get_user_profile([username]);
        }

        function saveProfile() {

        }

        function gravatarHash(email) {
            return md5.hash(email.trim().toLowerCase());
        }

        function fixProfile(profile) {
            var fixed = false;
            return Promise.try(function () {

                    // ensure structure.
                    if (profile.profile.account) {
                        delete profile.profile.account;
                        fixed = true;
                    }
                    if (!profile.profile.synced) {
                        profile.profile.synced = {};
                        fixed = true;
                    }
                    if (!profile.profile.userdata) {
                        profile.profile.userdata = {};
                        fixed = true;
                    }
                    if (!profile.profile.preferences) {
                        profile.profile.preferences = {};
                        fixed = true;
                    }
                    if (!profile.profile.metadata) {
                        profile.profile.metadata = {};
                        fixed = true;
                    }

                    // ensure that the realname is correctly copied and consistent with the auth account

                    // ensure that the gravatar hash is consistent.
                    if (!Props.getDataItem(profile, 'profile.synced.gravatarHash')) {
                        var email = runtime.service('session').getEmail();
                        var hash = gravatarHash(email);
                        profile.profile.synced.gravatarHash = hash;
                        fixed = true;
                    }
                })
                .then(function () {
                    if (fixed) {
                        var client = new UserProfileService(runtime.config('services.user_profile.url'), {
                            token: runtime.service('session').getAuthToken()
                        });
                        return client.set_user_profile({
                            profile: profile
                        });
                    }
                })
                .then(function () {
                    return profile;
                });
        }

        function createProfile(username) {
            console.warn('creating missing profile...', username);
        }

        return {
            fetchProfile: fetchProfile,
            saveProfile: saveProfile,
            fixProfile: fixProfile,
            createProfile: createProfile
        };
    }

    return {
        make: function (config) {
            return factory(config);
        }
    };
});