define([
    'kb.widget.base',
    'kb.session',
    'jquery',
    'postal',
    'q',
    'kb.appstate',
    'kb.utils',
    'kb_common/gravatar',
    'kb.user_profile'
], function (
    BaseWidget,
    Session,
    $,
    Postal,
    Q,
    AppState,
    Utils,
    Gravatar,
    UserProfile) {
    'use strict';
    // make a widget ... on the fly?
    var W = Object.create(BaseWidget, {
        init: {
            value: function (cfg) {
                cfg.name = 'LoginWidget';
                cfg.title = 'Login Widget';
                this.BaseWidget_init(cfg);

                Postal.channel('app').subscribe('location.change', function () {
                    this.render();
                }.bind(this));

                var widget = this;
                this.container
                    .on('submit', '[data-dialog="login-dialog"] form', function (e) {
                        e.preventDefault();
                        var username = widget.container.find('form [name="username"]').val();
                        var password = widget.container.find('form [name="password"]').val();
                        widget.login(username, password);
                    });

                return this;
            }
        },
        getUserLabel: {
            value: function (profile) {
                if (profile) {
                    return profile.realname + '<br><i style="font-size=90%;">' + profile.username + '</i>';
                    //return Utils.getProp(profile, 'user.realname') + '<br><i style="font-size=90%;">' + Utils.getProp(profile, 'user.username') + '</i>';
                } else if (this.sessionObject) {
                    return Utils.getProp('user_id');
                } else {
                    return '';
                }
            }
        },
        showErrorMessage: {
            value: function (msg) {
                var alert = this.container.find('[data-alert="login-error"]');
                alert.html(data.error.message);
                alert.removeClass('hidden');
            }
        },
        hideErrorMessage: {
            value: function () {
                var alert = this.container.find('[data-alert="login-error"]');
                alert.addClass('hidden');
            }
        },
        createTemplateContext: {
            value: function () {
                return {
                    isLoggedIn: Session.isLoggedIn(),
                    username: Session.getUsername(),
                    realname: Session.getRealname()
                };
            }
        },
        renderAvatar: {
            value: function (profile) {
                this.container.find('[data-element="user-label"]').html(this.getUserLabel(profile));
                this.container.find('[data-menu-item="userlabel"]').attr('href', '/#people/' + profile.username);
                var url = Gravatar.make().makeGravatarUrl(profile.email, 40, 'pg', 'monsterid');
                this.container.find('[data-element="avatar"]').attr('src', url);
            }
        },
        render: {
            value: function () {
                if (Session.isLoggedIn()) {
                    this.container.html(this.renderTemplate('loggedin'));
                    // a bit crood:
                    AppState.whenItem('me')
                        .then(function (me) {
                            if (me) {
                                // "profile" just needs username and realname properties.
                                this.renderAvatar({
                                    username: me.user,
                                    realname: me.display,
                                    email: me.email
                                });
                            }
                        }.bind(this))
                        .done();
                    this.container.find('[data-menu-item="logout"]').on('click', function (e) {
                        e.preventDefault();
                        Postal.channel('session').publish('logout.request');
                    });
                } else {
                    // just a quick hack until the login widget is incorporated
                    // into the navbar, etc.
                    if (/^#\/login\//.test(window.location.hash)) {
                        this.container.empty();
                    } else {
                        this.container.html(this.renderTemplate('loggedout'));
                        this.container.find('[data-button="signin"]').on('click', function () {
                            location.href = '/#login';
                            return;
                            //Postal.channel('loginwidget').publish('login.prompt');
                        });
                    }
                }
                return this;
            }
        },
        showLoginDialog: {
            value: function () {
                var dialog = this.container.find('[data-dialog="login-dialog"]');
                if (dialog) {
                    dialog.modal('show');
                }
            }
        },
        closeLoginDialog: {
            value: function () {
                var dialog = this.container.find('[data-dialog="login-dialog"]');
                if (dialog) {
                    dialog.modal('hide');
                }
            }
        },
        login: {
            value: function (userId, password) {
                Session.login({
                        username: userId,
                        password: password
                    })
                    .then(function (session) {
                        // omg this is the callback protocol
                        session.status = 1;
                        session.success = 1;

                        // Awaiting clients can get the session object directly, from the cookie, or query the
                        // global singleton session object.
                        Postal.channel('session').publish('login.success', { session: session });
                    })
                    .catch(function (err) {
                        var errObject = {
                            status: 0,
                            success: 0,
                            message: err
                        };
                        Postal.channel('session').publish('login.failure', { error: errObject });
                    })
                    .done();
            }
        }
    });
    return W;
});