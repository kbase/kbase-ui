define([
    'bluebird',
    'kb_lib/observed',
    'kb_lib/jsonRpc/genericClient',
    'kb_lib/lang',
    'kb_lib/props',
    'md5'
], (
    Promise,
    Observed,
    GenericClient,
    lang,
    Props,
    md5
) => {
    'use strict';

    class UserProfileService {
        constructor({ params: { runtime } }) {
            this.runtime = runtime;
            this.state = new Observed();
        }

        loadProfile() {
            return Promise.try(() => {
                const username = this.runtime.service('session').getUsername();
                if (!username) {
                    throw new lang.UIError({
                        type: 'RuntimeError',
                        reason: 'UsernameMissingFromSession',
                        message: 'The username was not found in the session.'
                    });
                }
                const client = new GenericClient({
                    module: 'UserProfile',
                    url: this.runtime.config('services.user_profile.url'),
                    token: this.runtime.service('session').getAuthToken()
                });
                return client.callFunc('get_user_profile', [[username]]).then(([profiles]) => {
                    if (!profiles || profiles.length === 0 || profiles[0] === null) {
                        // TODO: create profile and return it.f
                        return this.createProfile(client);
                    } else {
                        return this.fixProfile(client, profiles[0]);
                    }
                });
            });
        }

        createProfile(client) {
            return this.runtime
                .service('session')
                .getMe()
                .then((accountInfo) => {
                    const newProfile = {
                        user: {
                            username: accountInfo.user,
                            realname: accountInfo.display
                        },
                        profile: {
                            metadata: {
                                createdBy: 'userprofile_ui_service',
                                created: new Date().toISOString()
                            },
                            preferences: {},
                            // This is where all user-visible and user-controlled information goes.
                            // when auto-creating a profile, there is nothing to put here yet.
                            userdata: {
                                avatarOption: 'gravatar',
                                gravatarDefault: 'identicon'
                            },
                            // this is where synchronized data goes. not directly visible to the user.
                            synced: {
                                gravatarHash: this.gravatarHash(accountInfo.email)
                            }
                        }
                    };
                    return client
                        .callFunc('set_user_profile', [
                            {
                                profile: newProfile
                            }
                        ])
                        .then(() => {
                            return client.callFunc('get_user_profile', [accountInfo.user]);
                        })
                        .then(([profiles]) => {
                            return profiles;
                        });
                });
        }

        fixProfile(client, profile) {
            let fixed = false;
            return Promise.try(() => {
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
                if (!Props.getProp(profile, 'profile.synced.gravatarHash')) {
                    const email = this.runtime.service('session').getEmail();
                    const hash = this.gravatarHash(email);
                    profile.profile.synced.gravatarHash = hash;
                    fixed = true;
                }
            })
                .then(() => {
                    if (fixed) {
                        const client = new GenericClient({
                            module: 'UserProfile',
                            url: this.runtime.config('services.user_profile.url'),
                            token: this.runtime.service('session').getAuthToken()
                        });
                        return client.callFunc('set_user_profile', [
                            {
                                profile: profile
                            }
                        ]);
                    }
                })
                .then(() => {
                    return profile;
                });
        }

        gravatarHash(email) {
            return md5.hash(email.trim().toLowerCase());
        }

        // list for request fetch the user profile
        start() {
            this.runtime.receive('profile', 'check', () => {
                return this.loadProfile()
                    .then((profile) => {
                        this.state.setItem('userprofile', profile);
                        this.runtime.send('profile', 'loaded', profile);
                    })
                    .done();
            });

            this.runtime.receive('profile', 'reload', () => {
                return this.loadProfile()
                    .then((profile) => {
                        this.state.setItem('userprofile', profile);
                        this.runtime.send('profile', 'loaded', profile);
                    })
                    .done();
            });

            this.runtime.getService('session').onChange((loggedIn) => {
                if (loggedIn) {
                    this.loadProfile()
                        .then((profile) => {
                            this.state.setItem('userprofile', profile);
                        })
                        .catch((err) => {
                            console.error('ERROR starting profile app service', err);
                        });
                } else {
                    this.state.setItem('userprofile', null);
                }
            });
            return true;
        }

        stop() {
            return Promise.try(() => {
                this.state.setItem('userprofile', null);
            });
        }

        getRealname() {
            const profile = this.state.getItem('userprofile');
            if (profile) {
                return profile.getProp('user.realname');
            }
        }

        getItem(path, defaultValue) {
            return Promise.try(() => {
                const profile = this.state.getItem('userprofile');
                if (profile) {
                    return profile.getProp(path, defaultValue);
                }
                return this.whenChange().then((profile) => {
                    if (!profile) {
                        return defaultValue;
                    }
                    return profile.getProp(path, defaultValue);
                });
            });
        }

        getProfile() {
            return Promise.try(() => {
                const profile = this.state.getItem('userprofile');
                if (profile) {
                    return profile;
                }
                return this.whenChange().then((profile) => {
                    if (!profile) {
                        return;
                    }
                    return profile;
                });
            });
        }

        // send out message when the profile has been received
        onChange(fun, errFun) {
            this.state.listen('userprofile', {
                onSet: (value) => {
                    fun(value);
                },
                onError: (err) => {
                    console.error('ERROR in user profile service', err);
                    if (errFun) {
                        errFun(err);
                    }
                }
            });
        }

        whenChange() {
            return this.state.whenItem('userprofile');
        }
    }
    return { ServiceClass: UserProfileService };
});
