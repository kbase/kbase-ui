/*global define */
/*jslint white: true, browser: true  */

define([
    'bluebird',
    'kb/common/utils',
    'md5',
    'kb/service/client/UserProfile',
    'kb_plugin_userprofileservice'
],
    function (Promise, Utils, md5, UserProfileService, Plugin) {
        "use strict";
        var UserProfile = Object.create({}, {
            init: {
                value: function (cfg) {
                    if (!cfg.runtime) {
                        throw 'Cannot create a profile object without a runtime';
                    }
                    this.runtime = cfg.runtime;

                    if (!cfg.username) {
                        throw 'Cannot create a profile object without a username';
                    }
                    this.username = cfg.username;

                    if (this.runtime.service('session').isLoggedIn()) {
                        if (this.runtime.hasConfig('services.user_profile.url')) {
                            this.userProfileClient = new UserProfileService(this.runtime.getConfig('services.user_profile.url'), {
                                token: this.runtime.service('session').getAuthToken()
                            });
                        } else {
                            throw 'The user profile client url is not defined';
                        }
                    }

                    this.userRecordHistory = [];
                    return this;
                }
            },
            loadProfile: {
                value: function () {
                    return new Promise(function (resolve, reject, notify) {
                        if (!this.userProfileClient) {
                            // We don't fetch any data if a user is not logged in. 
                            this.userRecord = null;
                            resolve(this);
                        } else {
                            Promise.resolve(this.userProfileClient.get_user_profile([this.username]))
                                .then(function (data) {
                                    if (data[0]) {
                                        // profile found
                                        this.userRecord = data[0];
                                        resolve(this);
                                    } else {
                                        this.userRecord = null;
                                        resolve(this);
                                    }
                                }.bind(this))
                                .catch(function (err) {
                                    reject(err);
                                });
                        }
                    }.bind(this));
                }
            },
            getProfile: {
                value: function () {
                    return this.userRecord;
                }
            },
            deleteUserdata: {
                value: function () {
                    this.userRecord.profile.userdata = null;
                    this.userRecord.profile.metadata.modified = (new Date()).toISOString();
                    return Promise.resolve(this.userProfileClient.set_user_profile({
                        profile: this.userRecord
                    }));
                }
            },
            saveProfile: {
                value: function () {
                    return Promise.resolve(this.userProfileClient.set_user_profile({
                        profile: this.userRecord
                    }));
                }
            },
            /*
             merge an update user record into the current one.
             will fail if profile in invalid state
             uses our merge method, see that for details.
             TODO: we must validate the merged object BEFORE setting the userRecord
             TODO: we must have a flag to set whether the profile is valid or not.
             */
            updateProfile: {
                value: function (newRecord) {
                    var recordCopy = Utils.merge({}, this.userRecord),
                        merged = Utils.merge(recordCopy, newRecord);
                    if (this.userRecordHistory.length === 10) {
                        this.userRecordHistory.pop();
                    }
                    this.userRecordHistory.unshift({
                        userRecord: this.userRecord,
                        status: this.getProfileStatus(),
                        completionStatus: this.calcProfileCompletion().status
                    });
                    this.userRecord = merged;
                }
            },
            getProfileStatus: {
                value: function () {
                    var profileStatus;
                    if (this.userRecord) {
                        if (this.userRecord.user) {
                            if (this.userRecord.profile) {
                                if (this.userRecord.profile.userdata) {
                                    profileStatus = 'profile';
                                } else {
                                    profileStatus = 'stub';
                                }
                            } else {
                                profileStatus = 'stub';
                            }
                        } else {
                            if (this.userRecord.profile.account) {
                                profileStatus = 'accountonly';
                            } else {
                                profileStatus = 'error';
                            }
                        }
                    } else {
                        profileStatus = 'none';
                    }
                    return profileStatus;
                }
            },
            createProfile: {
                value: function () {
                    return new Promise(function (resolve, reject) {
                        Promise.resolve(this.userProfileClient.lookup_globus_user([this.username]))
                            .then(function (data) {

                                if (!data || !data[this.username]) {
                                    reject('No user account found for ' + this.username);
                                    return;
                                }

                                var userData = data[this.username];

                                // account data has been set ... copy the account fields to the corresponding user and profile fields.
                                this.userRecord = this.makeProfile({
                                    username: userData.userName,
                                    realname: userData.fullName,
                                    email: userData.email,
                                    account: userData,
                                    createdBy: 'user'
                                });

                                Promise.resolve(this.userProfileClient.set_user_profile({
                                    profile: this.userRecord
                                }))
                                    .then(function () {
                                        resolve();
                                    })
                                    .catch(function (err) {
                                        console.log('ERROR SAVING USER PROFILE: ' + err);
                                        console.log(err);
                                        reject(err);
                                    });

                            }.bind(this))
                            .catch(function (err) {
                                reject(err);
                            });
                    }.bind(this));
                }
            },
            createStubProfile: {
                value: function (options) {
                    return new Promise(function (resolve, reject) {
                        Promise.resolve(this.userProfileClient.lookup_globus_user([this.username]))
                            .then(function (data) {

                                if (!data || !data[this.username]) {
                                    reject('No user account found for ' + this.username);
                                    return;
                                }

                                var userData = data[this.username];

                                // account data has been set ... copy the account fields to the corresponding user and profile fields.
                                this.userRecord = this.makeStubProfile({
                                    username: userData.userName,
                                    realname: userData.fullName,
                                    account: userData,
                                    createdBy: options.createdBy
                                });

                                Promise.resolve(this.userProfileClient.set_user_profile({
                                    profile: this.userRecord
                                }))
                                    .then(function () {
                                        resolve(this);
                                    }.bind(this))
                                    .catch(function (err) {
                                        console.log('ERROR SAVING USER PROFILE: ' + err);
                                        console.log(err);
                                        reject(err);
                                    });

                            }.bind(this))
                            .catch(function (err) {
                                reject(err);
                            });
                    }.bind(this));
                }
            },
            makeStubProfile: {
                value: function (baseProfile) {
                    var record = {
                        user: {
                            username: baseProfile.username,
                            realname: baseProfile.realname
                        },
                        profile: {
                            metadata: {
                                createdBy: baseProfile.createdBy,
                                created: (new Date()).toISOString()
                            },
                            account: baseProfile.account,
                            preferences: {},
                            userdata: null
                        }
                    };
                    return record;
                }
            },
            makeProfile: {
                value: function (baseProfile) {
                    var record = this.makeStubProfile(baseProfile);

                    record.profile.userdata = {};

                    // If real profile fields provided, create the userdata portion of the profile.
                    if (baseProfile.email) {
                        record.profile.userdata.email = baseProfile.email;
                    }

                    return record;
                }
            },
            getAvatarURL: {
                value: function (options) {
                    options = options || {};
                    var gdefault = this.getProp('profile.userdata.avatar.gravatar_default'),
                        email = this.getProp('profile.userdata.email');
                    if (gdefault && email) {
                        return this.makeGravatarURL(email, options.size || 100, options.rating || 'pg', gdefault);
                    }
                    return '/images/nouserpic.png';
                }
            },
            makeGravatarURL: {
                value: function (email, size, rating, gdefault) {
                    var md5Hash = md5.hash(email),
                        url = 'https://www.gravatar.com/avatar/' + md5Hash + '?s=' + size + '&amp;r=' + rating + '&d=' + gdefault;
                    return url;
                }
            },
            getUserProfileSchema: {
                value: function () {
                    // For building and validating user form input for a user profile.
                    // This is a subset of the user profile schema.
                    // FORNOW: fairly loose, other than sensible limits and formatting checks.
                    // NB: 
                    return {
                        type: 'object',
                        properties: {
                            user: {
                                type: 'object',
                                title: 'User',
                                properties: {
                                    realname: {
                                        type: 'string',
                                        title: 'Real Name',
                                        maxLength: 100
                                    },
                                    thumbnail: {
                                        type: 'string'
                                    }
                                    /*avatar: {
                                     type: 'object',
                                     properties: {
                                     gravatar_defaults: {
                                     type: 'string',
                                     title: 'Gravatar Default Setting'
                                     }
                                     }
                                     }
                                     */
                                },
                                required: ['realname']
                            },
                            profile: {
                                type: 'object',
                                properties: {
                                    userdata: {
                                        type: 'object',
                                        properties: {
                                            title: {
                                                type: 'string',
                                                title: 'Title'
                                            },
                                            suffix: {
                                                type: 'string',
                                                title: 'Suffix'
                                            },
                                            location: {
                                                type: 'string',
                                                title: 'Geographic Location',
                                                maxLength: 25
                                            },
                                            email: {
                                                type: 'string',
                                                title: 'E-Mail Address',
                                                format: 'email'
                                            },
                                            personal_statement: {
                                                type: 'string',
                                                title: 'Personal Statement'
                                            },
                                            user_class: {
                                                type: 'string',
                                                title: 'User Type'
                                            },
                                            roles: {
                                                type: 'array',
                                                title: 'Roles',
                                                items: {
                                                    type: 'string'
                                                }
                                            },
                                            avatar: {
                                                type: 'object',
                                                properties: {
                                                    gravatar_default: {
                                                        type: 'string',
                                                        title: 'Gravatar Default Setting'
                                                    }
                                                }
                                            },
                                            affiliations: {
                                                type: 'array',
                                                title: 'Affiliation',
                                                items: {
                                                    type: 'object',
                                                    properties: {
                                                        title: {
                                                            type: 'string',
                                                            title: 'Title'
                                                        },
                                                        institution: {
                                                            type: 'string',
                                                            title: 'Institution'
                                                        },
                                                        start_year: {
                                                            type: 'integer',
                                                            title: 'Start Year',
                                                            minimum: 1900,
                                                            maximum: 2100
                                                        },
                                                        end_year: {
                                                            type: 'integer',
                                                            title: 'End Year',
                                                            minimum: 1900,
                                                            maximum: 2100
                                                        }
                                                    },
                                                    required: ['title', 'institution', 'start_year']
                                                }
                                            }
                                        },
                                        required: ['email', 'user_class', 'roles', 'location']
                                    }
                                }
                            }
                        }
                    };
                }
            },
            getProp: {
                value: function (propName, defaultValue) {
                    if (this.userRecord) {
                        return Utils.getProp(this.userRecord, propName, defaultValue);
                    }
                    return defaultValue;
                }
            },
            nthHistory: {
                value: function (n) {
                    // n is how many saves back to get it.
                    // e.g. n=1 means the most recent save
                    if (n <= this.userRecordHistory.length) {
                        return this.userRecordHistory[n - 1];
                    }
                }
            },
            calcProfileCompletion: {
                value: function () {
                    /*
                     returns:
                     status:
                     message:
                     percentComplete
                     
                     statuses:
                     
                     denied - not logged in - should never return information about a profile
                     error - returned for all profile states for which this calculation is invalid, inluding:
                     accountonly - this is not a normal state for a profile
                     none - no profile, no account
                     error 
                     stub - a stub profile, which means the user has not opted into their profile
                     incomplete - user has a profile, so we can calculate the percent of fields completed.
                     complete -- all fields filled in
                     
                     
                     */
                    var status = null,
                        state = this.getProfileStatus(),
                        requiredFields = [
                            'user.username', 'profile.userdata.email', 'profile.userdata.user_class', 'profile.userdata.location'
                        ],
                        fieldsToCheck = [
                            'user.username', 'profile.userdata.location', 'profile.userdata.email', 'profile.userdata.user_class', 'profile.userdata.roles',
                            'profile.userdata.affiliations', 'profile.userdata.personal_statement'
                        ],
                        formSchema = this.getUserProfileSchema(),
                        missing = [], i;
                    switch (state) {

                        case 'profile':
                            // NORMAL PROFILE 
                            // May or may not be complete. Falls through so we can do the calculations below...
                            break;
                        case 'stub':
                            // STUB PROFILE
                            return {
                                status: 'stub'
                            };
                        case 'accountonly':
                            // NO PROFILE
                            // NB: should not be here!!
                            // no profile, but have basic account info.
                            return {
                                status: 'error'
                            };
                        case 'error':
                            return {
                                status: 'error'
                            };
                        case 'none':
                            // NOT FOUND
                            // no profile, no basic aaccount info
                            return {
                                status: 'notfound'
                            };
                        default:
                            return {
                                status: 'error'
                            };
                    }

                    // rate the profile based on percent of fields completed.
                    /*
                     status:
                     none - no profile
                     incomplete - required fields not filled in
                     complete - required fields filled in, no optional fields
                     percent_complete:
                     if required fields are completed, rate it based on the completion of the
                     the following fields:
                     real name, location, email, user class, roles, affiliations, personal statement
                     */


                    for (i = 0; i < requiredFields.length; i++) {
                        var value = Utils.getProp(this.userRecord, requiredFields[i]);
                        if (Utils.isBlank(value)) {
                            status = 'requiredincomplete';
                            var field = Utils.getSchemaNode(formSchema, requiredFields[i]);
                            missing.push(field);
                        }
                    }

                    if (status) {
                        return {
                            status: status,
                            message: 'The following required profile fields are missing: ' + missing.join(', '),
                            missingFields: missing
                        };
                    }

                    for (i = 0; i < fieldsToCheck.length; i++) {
                        var value = Utils.getProp(this.userRecord, fieldsToCheck[i]);
                        if (fieldsToCheck[i] === 'profile.userdata.personal_statement') {
                        }
                        if (Utils.isBlank(value)) {
                            var field = Utils.getSchemaNode(formSchema, fieldsToCheck[i]);
                            missing.push(field);
                        }
                    }

                    var percentComplete = Math.round(100 * (fieldsToCheck.length - missing.length) / fieldsToCheck.length);

                    if (percentComplete < 100) {
                        return {
                            status: 'incomplete',
                            message: 'The profile is complete, but could be richer.',
                            percentComplete: percentComplete,
                            missingFields: missing
                        };
                    } else {
                        return {
                            status: 'complete',
                            message: 'Congratulations, your profile is complete!'
                        };
                    }


                }
            }

        });

        return UserProfile;
    });
