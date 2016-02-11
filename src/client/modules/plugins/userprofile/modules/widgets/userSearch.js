define([
    'jquery',
    'bluebird',
    'kb_userProfile_widget_base', 
    'kb/service/client/userProfile'
],
    function ($, Promise, SocialWidget, UserProfileService) {
        "use strict";
        var widget = Object.create(SocialWidget, {
            init: {
                value: function (cfg) {
                    cfg.name = 'UserSearch';
                    cfg.title = 'Find Other Users';
                    this.SocialWidget_init(cfg);

                    return this;
                }
            },
            go: {
                value: function () {
                    this.start();
                    return this;
                }
            },
            setup: {
                value: function () {
                    // User profile service
                    if (this.runtime.service('session').isLoggedIn()) {
                        if (this.runtime.hasConfig('services.user_profile.url')) {
                            this.userProfileClient = new UserProfileService(this.runtime.config('services.user_profile.url'), {
                                token: this.runtime.service('session').getAuthToken()
                            });
                        } else {
                            throw 'The user profile client url is not defined';
                        }
                    }
                }
            },
            renderLayout: {
                value: function () {
                    this.container.html(this.renderTemplate('layout'));
                    this.places = {
                        title: this.container.find('[data-placeholder="title"]'),
                        alert: this.container.find('[data-placeholder="alert"]'),
                        content: this.container.find('[data-placeholder="content"]')
                    };

                    // Only enable the search form if the user is logged in.
                    if (this.runtime.service('session').isLoggedIn()) {
                        var widget = this;
                        this.container.find('[data-field="search_text"] input').on('keyup', function (e) {
                            if ((e.key === undefined && e.keyCode === 27) || e.key === 'Esc' || e.key === 'Escape') {
                                $(this).val('');
                                widget.setState('searchResults', []);
                                return;
                            }
                            widget.params.searchText = $(this).val();
                            if (widget.params.searchText && widget.params.searchText.length < 3) {
                                widget.refresh().done();
                            } else {
                                Promise.resolve(widget.userProfileClient.filter_users({
                                    filter: widget.params.searchText
                                }))
                                    .then(function (users) {
                                        users.sort(function (a, b) {
                                            var aName = a.realname.toLowerCase();
                                            var bName = b.realname.toLowerCase();
                                            if (aName < bName) {
                                                return -1;
                                            } else if (aName > bName) {
                                                return 1;
                                            } else {
                                                return 0;
                                            }
                                        });
                                        widget.setState('searchResults', users);
                                    })
                                    .catch(function (err) {
                                        widget.renderErrorView(err);
                                    });
                            }
                        });
                    }
                }
            }

        });
        return widget;
    });