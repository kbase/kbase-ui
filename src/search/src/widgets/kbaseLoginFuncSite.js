(function ($) {
    'use strict';
    $.KBWidget({
        name: "kbaseLogin",
        version: "1.1.0",
        options: {
            style: 'text',
            //loginURL : "http://140.221.92.231/services/authorization/Sessions/Login",
            loginURL: "https://kbase.us/services/authorization/Sessions/Login",
            possibleFields: ['verified', 'name', 'opt_in', 'kbase_sessionid', 'token', 'groups', 'user_id', 'email', 'system_admin'],
            fields: ['name', 'kbase_sessionid', 'user_id', 'token']
        },
        cookieName: 'kbase_session',
        sessionObject: null,
        userProfile: null,
        init: function (options) {
            this._super(options);

            // SYNC WARNING
            // There may be parts of the systCopaem which rely on the sycnronous loading characterstics of
            // this plugin. Specifically, it has traditionally loaded early in the index page, so the
            // session information is available to code which loads later.
            // Most of the session logic is now in kbaseSession.js, which is asynchronous in nature
            // (requirejs loaded). However, there is a small version of the session code in kbaseSessionSync.js
            // which should be loaded towards the top of the index file, certainly before this one.
            // syncronously load the session.

            // Initial load of the session is through the synchronous kbase session sync object.
            // This object is compatible with the full kbase session object, but is loaded
            // at index load time and so available here.
            // We use it for the initial state, but after that all other session interactions
            // are asynchronous, and session state is communicated via jquery messages.
            // The session object will either be the authenticated session object or null.
            this.sessionObject = $.KBaseSessionSync.getKBaseSession();


            // Select which version of the widget to show.
            // NB this widget just shows one state per instantiation --
            // the login form when the session is unauthenticated.
            this.$elem.empty();
            this.renderWidget();
            this.afterInit();

            /*var style = '_' + this.options.style + 'Style';
            this[style](function (content) {
                if (content !== null) {
                    this.$elem.html(content);
                }
                this.afterInit();
            }.bind(this));
            */

            return this;
        },
        afterInit: function () {
            // EVENT LISTENERS
            require(['postal', 'kb.widget.login'], function (Postal, LoginWidget) {

                // These need to go after the element is built, but before session is
                // set up below, because the widget may need to respond to login and profile events.

                // The session stuff is handled here for now, but this should
                // be moved into the App.
                Postal.channel('session').subscribe('profile.loaded', function (data) {
                    // $(document).on('profileLoaded.kbase', function(e, profile) {
                    var profile = data.profile;
                    this.profile = data.profile;
                    this.userProfile = profile.getProfile();
                }.bind(this));

                Postal.channel('session').subscribe('profile.saved', function () {
                    this.fetchUserProfile();
                }.bind(this));

                Postal.channel('session').subscribe('profile.get', function (data, envelope) {
                    envelope.reply(null, this.profile);
                }.bind(this));

                Postal.channel('session').subscribe('login.success', function (data) {
                    var session = data.session.getKBaseSession();
                    // $(document).on('loggedIn.kbase', function(e, session) {
                    this.sessionObject = session;
                    this.$elem.find('[data-element="user-label"]').html(this.get_user_label());
                    this.fetchUserProfile();
                }.bind(this));

                Postal.channel('session').subscribe('logout.success', function () {
                    this.sessionObject = null;
                    var elem = this.$elem;
                    try {
                        var w = LoginWidget.init({
                            container: elem,
                            name: 'LoginWidget',
                            title: 'Login Widget'
                        });
                        w.render();
                    } catch (e) {
                        console.log('Error');
                        console.log(e);
                    }
                }.bind(this));

                //return;
                if (this.sessionObject) {
                    this.fetchUserProfile();
                }
            }.bind(this));
        },
        get_kbase_cookie: function (field) {
            if (this.sessionObject) {
                return this.get_session_prop(field);
            }
        },
        is_authenticated: function () {
            // Use the presence of the primary cookie as the flag for
            // authenticated.
            if (!this.get_session()) {
                // ensure that all traces of authentication are removed.
                $.KBaseSessionSync.removeAuth();
                return false;
            }
            return true;
        },
        get_session: function () {
            return this.sessionObject;
        },
        get_prop: function (obj, propName, defaultValue) {
            var props = propName.split('.');
            var i;
            for (i = 0; i < props.length; i++) {
                var key = props[i];
                if (obj[key] === undefined) {
                    return defaultValue;
                } else {
                    obj = obj[key];
                }
            }
            return obj;
        },
        get_session_prop: function (propName, defaultValue) {
            if (this.sessionObject) {
                return this.get_prop(this.sessionObject, propName, defaultValue);
            } else {
                return defaultValue;
            }
        },
        // NB: require for compatability with old code.
        session: function (propName) {
            if (propName === undefined) {
                return this.sessionObject;
            } else {
                return this.get_session_prop(propName);
            }
        },
        get_profile_prop: function (propName, defaultValue) {
            if (this.userProfile) {
                return this.get_prop(this.userProfile, propName, defaultValue);
            } else {
                return defaultValue;
            }
        },
        sessionId: function () {
            return this.get_session_prop('kbase_sessionid');
        },
        token: function () {
            return this.get_session_prop('token');
        },
        tickleSession: function () {
            require(['kb.session'], function (Session) {
                Session.setAuthCookie();
            });
        },
        populateLoginInfo: function (args) {
            if (this.sessionObject) {
                // this.data('_session', this.sessionObject);
                this._error = null;
            } else {
                // this.data('_session', null);
                this._error = args.message;
            }
        },
        error: function (new_error) {
            if (new_error) {
                this._error = new_error;
            }
            return this._error;
        },
        get_user_label: function () {
            if (this.userProfile) {
                return this.get_profile_prop('user.realname') + '<br><i style="font-size=90%;">' + this.get_profile_prop('user.username') + '</i>';
            } else if (this.sessionObject) {
                return this.get_session_prop('user_id');
            } else {
                return '';
            }
        },
        renderWidget: function (callback) {
            var elem = this.$elem;
            require(['kb.widget.login'], function (LoginWidget) {
                try {
                    var w = LoginWidget.init({
                        container: elem,
                        name: 'LoginWidget',
                        title: 'Login Widget'
                    });
                    w.render();
                } catch (e) {
                    console.log('Error');
                    console.log(e);
                }
            });
        },
        fetchUserProfile: function () {
            require(['kb.user_profile', 'kb.session', 'kb.appstate', 'postal', 'kb_common_ts/Auth2Session'],
                function (UserProfile, Session, AppState, Postal, Auth2Session) {

                    var session = new Auth2Session.Auth2Session({
                        cookieName: 'kbase_session',
                        baseUrl: window.location.origin + '/services/auth',
                        providers: []
                    });

                    session.start()
                        .then(function () {
                            return session.getMe();
                        })
                        .then(function (me) {
                            Postal.channel('session').publish('me.loaded', {
                                me: me
                            });
                            return me;
                        })
                        .catch(function (err) {
                            console.error('ERR', err);
                            Postal.channel('session').publish('me.loadfailure', {
                                error: err,
                                message: 'Error getting user info'
                            });
                        })
                        .then(function (me) {
                            var userProfile = Object.create(UserProfile).init({ username: me.user });
                            return userProfile.loadProfile();
                        })
                        .then(function (profile) {
                            switch (profile.getProfileStatus()) {
                            case 'stub':
                            case 'profile':
                                AppState.setItem('userprofile', profile);
                                Postal.channel('session').publish('profile.loaded', { profile: profile });
                                break;
                            case 'none':
                                profile.createStubProfile({ createdBy: 'session' })
                                    .then(function (profile) {
                                        AppState.setItem('userprofile', profile);
                                        Postal.channel('session').publish('profile.loaded', { profile: profile });
                                    })
                                    .catch(function (err) {
                                        Postal.channel('session').publish('profile.loadfailure', { error: err });
                                    })
                                    .done();
                                break;
                            }
                        })
                        .catch(function (err) {
                            var errMsg = 'Error getting user profile';
                            Postal.channel('session').publish('profile.loadfailure', { error: err, message: errMsg });
                        })
                        .finally(function () {
                            return session.stop();
                        })
                        .done();
                });
        },


    });

}(jQuery));