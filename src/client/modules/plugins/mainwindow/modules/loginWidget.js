/*global define */
/*jslint white: true, browser: true */
define([
    'kb_widgetBases_simpleWidget',
    'kb/common/html',
    'kb_plugin_mainWindow',
    'bootstrap'
],
    function (SimpleWidet, html, Plugin) {
        'use strict';

        function myWidget(config) {

            var runtime = config.runtime;
            if (!runtime) {
                throw {
                    name: 'RuntimeMissing',
                    message: 'The runtime argument is required but is missing',
                    suggestion: 'This is an application error, and no fault of yours.'
                }
            }

            var button = html.tag('button'),
                div = html.tag('div'),
                a = html.tag('a'),
                span = html.tag('span'),
                ul = html.tag('ul'),
                li = html.tag('li'),
                br = html.tag('br', {close: false}),
                i = html.tag('i'),
                img = html.tag('img');

            function handleSignout(e) {
                e.preventDefault();
                runtime.service('session').logout()
                    .then(function () {
                        // w.setState('updated', new Date());
                    })
                    .catch(function (err) {
                        console.log('ERROR');
                        console.log(err);
                        alert('Error signing out (check console for details)');
                    });
            }
            function renderAvatar(widget) {
                var profile = widget.get('userProfile');
                if (profile) {
                    return img({src: profile.getAvatarURL(), style: 'width: 40px;', class: 'login-button-avatar', 'data-element': 'avatar'});
                }
                return img({src: Plugin.plugin.path + '/images/nouserpic.png', style: 'width: 40px;', class: 'login-button-avatar', 'data-element': 'avatar'});
            }
            function renderLogin(widget) {
                if (runtime.service('session').isLoggedIn()) {
                    /* TODO: fix dependencies like this -- realname is not available until, and unless, the                     
                     profile is loaded, which happens asynchronously.            
                     */
                    var profile = widget.get('userProfile'), realname;
                    
                    if (!profile) {
                        // Don't bother rendering yet if the profile is not ready 
                        // yet.
                        return;
                    }
                    realname = profile ? profile.getProp('user.realname') : '?';
                    return div({class: 'dropdown', style: 'display:inline-block'}, [
                        button({type: 'button', class: 'btn btn-default dropdown-toggle', 'data-toggle': 'dropdown', 'aria-expanded': 'false'}, [
                            renderAvatar(widget),
                            span({class: 'caret', style: 'margin-left: 5px;'})
                        ]),
                        ul({class: 'dropdown-menu', role: 'menu'}, [
                            li({}, [
                                a({href: '#people/' + runtime.service('session').getUsername(), 'data-menu-item': 'userlabel'}, [
                                    div({style: 'display:inline-block; width: 34px; vertical-align: top;'}, [
                                        span({class: 'fa fa-user', style: 'font-size: 150%; margin-right: 10px;'})
                                    ]),
                                    div({style: 'display: inline-block', 'data-element': 'user-label'}, [
                                        realname,
                                        br(),
                                        i({}, runtime.service('session').getUsername())
                                    ])
                                ])
                            ]),
                            li({class: 'divider'}),
                            li({}, [
                                a({href: '#', 'data-menu-item': 'logout', id: widget.addDomEvent('click', handleSignout)}, [
                                    div({style: 'display: inline-block; width: 34px;'}, [
                                        span({class: 'fa fa-sign-out', style: 'font-size: 150%; margin-right: 10px;'})
                                    ]),
                                    'Sign Out'
                                ])
                            ])
                        ])
                    ]);
                }
                return a({type: 'button', class: 'btn btn-primary navbar-btn kb-nav-btn', 'data-button': 'signin', href: '#login'}, [
                    div({class: 'fa fa-sign-in  fa-inverse', style: 'margin-right: 5px;'}),
                    div({class: 'kb-nav-btn-txt'}, ['Sign In'])
                ]);
            }

            return SimpleWidet.make({
                runtime: runtime,
                on: {
                    start: function (params) {
                        this.set('loggedin', runtime.service('session').isLoggedIn());
                        runtime.service('userprofile').onChange(function (data) {
                            this.set('userProfile', data);
                        }.bind(this));
                    },
                    render: function () {
                        return {
                            content: div({class: 'kb-widget-login'}, [
                                span({id: 'signin-button', dataElement: 'signin-button'}, [
                                    renderLogin(this)
                                ])
                            ])
                        };
                    }
                }
            });
        }

        return {
            make: function (config) {
                return myWidget(config);
            }
        };
    });