/*global define */
/*jslint white: true, browser: true */
define([
    'kb_widgetBases_standardWidget',
    'kb_common_html',
    'kb_plugin_mainWindow',
    'bootstrap'
],
    function (StandardWidget, html, Plugin) {
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
                runtime.getService('session').logout()
                    .then(function () {
                        // w.setState('updated', new Date());
                    })
                    .catch(function (err) {
                        console.log('ERROR');
                        console.log(err);
                        alert('Error signing out (check console for details)');
                    });
            }
            function renderAvatar(w) {
                var profile = w.getState('userProfile');
                if (profile) {
                    return img({src: profile.getAvatarURL(), style: 'width: 40px;', class: 'login-button-avatar', 'data-element': 'avatar'});
                }
                return img({src: Plugin.plugin.path + '/images/nouserpic.png', style: 'width: 40px;', class: 'login-button-avatar', 'data-element': 'avatar'});
            }
            function renderLogin(w) {
                if (runtime.getService('session').isLoggedIn()) {
                    /* TODO: fix dependencies like this -- realname is not available until, and unless, the                     
                     profile is loaded, which happens asynchronously.            
                     */
                    var profile = w.getState('userProfile'),
                        realname = profile ? profile.getProp('user.realname') : '?';
                    return div({class: 'dropdown', style: 'display:inline-block'}, [
                        button({type: 'button', class: 'btn btn-default dropdown-toggle', 'data-toggle': 'dropdown', 'aria-expanded': 'false'}, [
                            renderAvatar(w),
                            span({class: 'caret', style: 'margin-left: 5px;'})
                        ]),
                        ul({class: 'dropdown-menu', role: 'menu'}, [
                            li({}, [
                                a({href: '#people/' + runtime.getService('session').getUsername(), 'data-menu-item': 'userlabel'}, [
                                    div({style: 'display:inline-block; width: 34px; vertical-align: top;'}, [
                                        span({class: 'fa fa-user', style: 'font-size: 150%; margin-right: 10px;'})
                                    ]),
                                    div({style: 'display: inline-block', 'data-element': 'user-label'}, [
                                        realname,
                                        br(),
                                        i({}, runtime.getService('session').getUsername())
                                    ])
                                ])
                            ]),
                            li({class: 'divider'}),
                            li({}, [
                                a({href: '#', 'data-menu-item': 'logout', id: w.addDomEvent('click', handleSignout)}, [
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

            return StandardWidget.make({
                runtime: runtime,
                on: {
                    start: function (w, params) {
                        w.setState('loggedin', runtime.getService('session').isLoggedIn());
//                        w.recv('session', 'loggedout', function () {
//                            w.setState('loggedin', false);
//                        });
//                        w.recv('session', 'loggedin', function () {
//                            w.setState('loggedin', true);
//                        });
                        runtime.getService('userprofile').onChange(function (data) {
                            w.setState('userProfile', data);
                        });
//                        AppState.listenForItem('userprofile', {
//                            onSet: function (data) {
//                                w.setState('userProfile', data);
//                            }
//                        });
//                        
                        /*if (R.isLoggedIn()) {
                         
                         return R.whenItem('userprofile', 10000)
                         .then(function (data) {
                         console.log('GOT IT!');
                         console.log(data);
                         w.setState('userProfile', data[0]);
                         });
                         } else {
                         w.setState('updated', new Date());
                         }
                         */
                    },
                    render: function (w) {
                        return div({class: 'kb-widget-login'}, [
                            span({id: 'signin-button', 'data-element': 'signin-button'}, [
                                renderLogin(w)
                            ])
                        ]);
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