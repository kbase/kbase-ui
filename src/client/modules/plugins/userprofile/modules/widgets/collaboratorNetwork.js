/*global define*/
/*jslint white: true*/
define([
    'bluebird',
    'kb_userProfile_widget_base',
    'kb/service/serviceApi',
    'kb/service/client/userProfile'
],
    function (Promise, SocialWidget, ServiceApi, UserProfileService) {
        'use strict';
        var Widget = Object.create(SocialWidget, {
            init: {
                value: function (cfg) {
                    cfg.name = 'CommonCollaboratorNetwork';
                    cfg.title = 'Common Collaborator Network';
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
                    // Set up workspace client

                    this.clientMethods = ServiceApi.make({runtime: this.runtime});

                    if (this.runtime.service('session').isLoggedIn()) {
                        if (this.runtime.hasConfig('services.user_profile.url')) {
                            this.userProfileClient = new UserProfileService(this.runtime.config('services.user_profile.url'), {
                                token: this.runtime.service('session').getAuthToken()
                            });
                        } else {
                            throw 'The user profile client url is not defined';
                        }

                    } else {
                        this.userProfileClient = null;
                    }
                }
            },
            setInitialState: {
                value: function (options) {
                    return Promise.try(function () {
                        if (this.runtime.service('session').isLoggedIn()) {
                            return Promise.resolve(this.userProfileClient.get_user_profile([this.params.userId]))
                                .then(function (data) {
                                    if (data && data[0]) {
                                        this.setState('currentUserProfile', data[0], false);
                                        return this.clientMethods.getCollaborators({
                                            users: [this.getParam('userId')]
                                        });
                                    } else {
                                        throw new Error('User not found');
                                    }
                                }.bind(this))
                                .then(function (collaborators) {
                                    this.setState('collaborators', collaborators);
                                    return null;
                                }.bind(this));
//                                             .catch(function (err) {
//                                                this.runtime.service('logger').logError({
//                                                    message: 'error building collab network...',
//                                                    data: err
//                                                });
//                                                reject(err);
//                                            });
                                    
                        }
                    }.bind(this));
                }
            },
            // Overriding the default, simple, render because we need to update the title
            // TODO: make it easy for a widget to customize the title.
            render: {
                value: function () {
                    // Generate initial view based on the current state of this widget.
                    // Head off at the pass -- if not logged in, can't show profile.
                    if (this.error) {
                        this.renderError();
                    } else if (this.runtime.service('session').isLoggedIn()) {

                        this.places.title.html(this.renderTemplate('authorized_title'));
                        this.places.content.html(this.renderTemplate('authorized'));
                    } else {
                        // no profile, no basic aaccount info
                        this.places.title.html(this.widgetTitle);
                        this.places.content.html(this.renderTemplate('unauthorized'));
                    }
                    return this;
                }
            }
        });

        return Widget;
    });