define([
    'kb_service/client/userProfile',
    'kb_common_ts/Auth2'
], function () {
    'use strict';

    function factory(config) {
        var runtime = config.runtime;

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