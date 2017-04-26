define([
    'kb_service/client/userProfile',
    'kb_common_ts/Auth2'
], function (
    UserProfileService,
    Auth2
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

        function fixProfile() {

        }

        return {
            fetchProfile: fetchProfile,
            saveProfile: saveProfile,
            fixProfile: fixProfile
        };
    }

    return {
        make: function (config) {
            return factory(config);
        }
    };
});