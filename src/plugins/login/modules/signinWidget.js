define([
    'bluebird',
    'kb_lib/html',
    'kb_common/domEvent2',
    'kb_plugin_login',
    'bootstrap'], (
    Promise,
    html,
    DomEvents,
    Plugin
) => {
    'use strict';

    function cleanText(text) {
        const n = document.createElement('div');
        n.textContent = text;
        return n.innerHTML;
    }

    const t = html.tag,
        button = t('button'),
        div = t('div'),
        a = t('a'),
        span = t('span'),
        ul = t('ul'),
        li = t('li'),
        img = t('img');

    class SigninWidget {
        constructor({ runtime }) {
            if (!runtime) {
                throw {
                    name: 'RuntimeMissing',
                    message: 'The runtime argument is required but is missing',
                    suggestion: 'This is an application error, and no fault of yours.'
                };
            }
            this.runtime = runtime;
            this.hostNode = null;
            this.container = null;
            this.isLoginView = null;
        }

        handleSignout(e) {
            e.preventDefault();

            this.runtime
                .service('session')
                .logout()
                .then(() => {
                    this.runtime.send('app', 'navigate', {
                        path: 'auth2/signedout'
                    });
                })
                .catch((err) => {
                    console.error('ERROR');
                    console.error(err);
                    alert('Error signing out (check console for details)');
                });
        }

        buildAvatarUrl(profile) {
            switch (profile.profile.userdata.avatarOption || 'gravatar') {
            case 'gravatar':
                var gravatarDefault = profile.profile.userdata.gravatarDefault || 'identicon';
                var gravatarHash = profile.profile.synced.gravatarHash;
                if (gravatarHash) {
                    return (
                        'https://www.gravatar.com/avatar/' + gravatarHash + '?s=32&amp;r=pg&d=' + gravatarDefault
                    );
                } else {
                    return Plugin.plugin.fullPath + '/images/nouserpic.png';
                }
            case 'silhouette':
            case 'mysteryman':
            default:
                return Plugin.plugin.fullPath + '/images/nouserpic.png';
            }
        }

        buildAvatar(profile) {
            if (!profile || !profile.profile) {
                console.warn('no profile?', profile);
                return '';
            }
            const avatarUrl = this.buildAvatarUrl(profile);

            return img({
                src: avatarUrl,
                style: {
                    width: '40px;'
                },
                class: 'login-button-avatar',
                dataElement: 'avatar'
            });
        }

        renderLogin(events) {
            return Promise.try(() => {
                // TODO: do better!
                if (this.runtime.service('session').isLoggedIn()) {
                    return this.runtime
                        .service('userprofile')
                        .getProfile()
                        .then((profile) => {
                            if (!profile) {
                                // Don't bother rendering yet if the profile is not ready
                                // yet.
                                return;
                            }
                            const realname = cleanText(profile.user.realname);
                            const username = cleanText(profile.user.username);
                            return div(
                                {
                                    class: 'navbar container-fluid'
                                },
                                div(
                                    {
                                        class: 'navbar-right'
                                    },
                                    div(
                                        {
                                            class: 'dropdown',
                                            style: 'display:inline-block',
                                            dataKBTesthookMenu: 'signed-in'
                                        },
                                        [
                                            button(
                                                {
                                                    type: 'button',
                                                    class: 'btn btn-default dropdown-toggle',
                                                    dataToggle: 'dropdown',
                                                    ariaExpanded: 'false',
                                                    dataKBTesthookButton: 'avatar'
                                                },
                                                [
                                                    this.buildAvatar(profile),
                                                    span({ class: 'caret', style: 'margin-left: 5px;' })
                                                ]
                                            ),
                                            ul({ class: 'dropdown-menu', role: 'menu' }, [
                                                li({}, [
                                                    div(
                                                        {
                                                            display: 'inline-block',
                                                            dataElement: 'user-label',
                                                            style: {
                                                                textAlign: 'center'
                                                            }
                                                        },
                                                        [
                                                            div(
                                                                {
                                                                    dataKBTesthookLabel: 'realname'
                                                                },
                                                                realname
                                                            ),
                                                            div(
                                                                {
                                                                    style: {
                                                                        fontStyle: 'italic'
                                                                    },
                                                                    dataKBTesthookLabel: 'username'
                                                                },
                                                                username
                                                            )
                                                        ]
                                                    )
                                                ]),
                                                li({ class: 'divider' }),
                                                li({}, [
                                                    a(
                                                        {
                                                            href: '/#people',
                                                            dataMenuItem: 'user-profile',
                                                            dataKBTesthookButton: 'user-profile',
                                                            style: {
                                                                display: 'flex',
                                                                flexDirection: 'row',
                                                                alignItems: 'center'
                                                            }

                                                        },
                                                        [
                                                            div(
                                                                {
                                                                    style: {
                                                                        flex: '0 0 34px'
                                                                    }
                                                                },
                                                                span({
                                                                    class: 'fa fa-user',
                                                                    style: {
                                                                        fontSize: '150%',
                                                                    }
                                                                })
                                                            ),
                                                            div({
                                                                style: {
                                                                    flex: '1 1 0px'
                                                                }
                                                            }, 'Your Profile')
                                                        ]
                                                    )
                                                ]),
                                                li({}, [
                                                    a(
                                                        {
                                                            href: '#',
                                                            dataMenuItem: 'logout',
                                                            dataKBTesthookButton: 'logout',
                                                            id: events.addEvent({
                                                                type: 'click',
                                                                handler: this.handleSignout.bind(this)
                                                            }),
                                                            style: {
                                                                display: 'flex',
                                                                flexDirection: 'row',
                                                                alignItems: 'center'
                                                            }
                                                        },
                                                        [
                                                            div(
                                                                {
                                                                    style: {
                                                                        flex: '0 0 34px'
                                                                    }
                                                                },
                                                                span({
                                                                    class: 'fa fa-sign-out',
                                                                    style: {
                                                                        fontSize: '150%',
                                                                        marginRight: '10px'
                                                                    }
                                                                })
                                                            ),
                                                            div({
                                                                style: {
                                                                    flex: '1 1 0px'
                                                                }
                                                            }, 'Sign Out')
                                                        ]
                                                    )
                                                ])
                                            ])
                                        ]
                                    )
                                )
                            );
                        });
                }
                return span(
                    {
                        dataKBTesthookWidget: 'signin'
                    },
                    a(
                        {
                            class: 'btn btn-primary navbar-btn kb-nav-btn',
                            disabled: this.isLoginView,
                            dataButton: 'signin',
                            dataKBTesthookButton: 'signin',
                            href: '/#login'
                        },
                        [
                            div({
                                class: 'fa fa-sign-in  fa-inverse',
                                style: { marginRight: '5px' }
                            }),
                            div({ class: 'kb-nav-btn-txt' }, 'Sign In')
                        ]
                    )
                );
            });
        }

        render() {
            const events = DomEvents.make({
                node: this.container
            });
            return this.renderLogin(events)
                .then((loginContent) => {
                    this.container.innerHTML = loginContent;
                    events.attachEvents();
                });
        }

        // LIFECYCLE API

        attach(node) {
            this.hostNode = node;
            this.container = this.hostNode.appendChild(document.createElement('div'));
            this.container.classList.add('kb_plugin_login_signin');
            this.container.setAttribute('data-k-b-testhook-plugin', 'login');
        }

        start() {
            this.runtime.service('userprofile').onChange(() => {
                this.render();
            });

            this.runtime.receive('route', 'routed', (message) => {
                const path = message.data.request.path.join('/');
                if (path === 'login') {
                    this.isLoginView = true;
                } else {
                    this.isLoginView = false;
                }
                this.render();
            });

            return this.render();
        }

        detach() {
            if (this.hostNode && this.container) {
                this.hostNode.removeChild(this.container);
            }
        }

        stop() {
            return null;
        }
    }

    return SigninWidget;
});
