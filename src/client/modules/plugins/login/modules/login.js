/*global
 define
 */
/*jslint
 browser: true,
 white: true
 */
define([
    'kb/common/html',
    'kb/common/domEvent',
    'jquery',
    'bluebird',
    'kb_plugin_login'
],
function (html, domEvent, $, Promise, Plugin) {
    'use strict';


    function widget(config) {
        var mount, container, runtime = config.runtime,
            nextRequest,
            events;

        // This should be somewhere else, and handle all types of fields
        // I'm sure we've done this already.
        function getFieldValue(name) {
            var field = $(container).find(' form [name="' + name + '"]');
            if (field) {
                return field.val();
            }
        }
        function node(selector) {
            return $(container).find(selector);
        }
        function element(name) {
            return node('[data-element="' + name + '"]');
        }

        function handleLogin(e) {
            e.preventDefault();

            // TODO: add support for nextPath, nextURL

            var username = getFieldValue('username'),
                    password = getFieldValue('password');

            if (!username) {
                element('error').html('The username is required').show();
                return;
            }
            if (!password) {
                element('error').html('The password is required').show();
                return;
            }

            element('error').hide();
            element('sign-in').hide();
            element('signing-in').show();
            runtime.send('ui', 'setTitle', 'Signing in ...');
            runtime.getService('session').login({
                username: username,
                password: password
            })
                    .then(function () {
                        runtime.send('ui', 'setTitle', 'Successful Sign In!');
                        runtime.send('app', 'loggedin');
                        /* TODO should be configurable default login location */
                        if (nextRequest) {
                            runtime.send('app', 'navigate', nextRequest);
                        } else {
                            runtime.send('app', 'navigate', '');
                        }
                    })
                    .catch(function (errorMsg) {
                        runtime.send('ui', 'setTitle', 'Sign In Error');
                        element('running').hide();
                        if (errorMsg === "LoginFailure: Authentication failed.") {
                            errorMsg = "Login Failed: your username/password is incorrect.";
                        }
                        element('error').html(errorMsg).show();
                        element('sign-in').show();
                        element('signing-in').hide();
                    })
                    .done();
        }
        
        var currentUsername; 
        function handleUsernameKeyup(e) {
            e.preventDefault();
            
            // validate the username!
            var potentialUsername = e.target.value,
                messageElement = container.querySelector('[data-element="username-message"]'),
                invalidCharsRe = /[\s@]/,
                message;
            
            currentUsername = potentialUsername;
            if (currentUsername && currentUsername.length > 0) {                
                if (invalidCharsRe.test(currentUsername)) {
                    message = 'Invalid characters in username: spaces and @ are not allowed';
                    messageElement.innerHTML = message;
                    messageElement.style.display = 'block';
                    messageElement.classList.add('alert-danger');
                    return;
                }
            }
            messageElement.innerHTML = '';
            messageElement.style.display = 'none';
            messageElement.classList.remove('alert-danger');
        }

        function renderForm() {
            var form = html.tag('form'),
                    input = html.tag('input'),
                    button = html.tag('button'),
                    div = html.tag('div'),
                    p = html.tag('p'),
                    h1 = html.tag('h1'),
                    legend = html.tag('legend'),
                    i = html.tag('i'),
                    a = html.tag('a');

            /* TODO: use the actual next path */
            // Variables for form.
            var nextPath = 'next path',
                    nextURL = 'next url';

            // eventMan.reset();
            var doodlePath = Plugin.plugin.fullPath + '/doodle.png';
            
            return div({class: 'container', style: 'margin-top: 4em', dataWidget: 'login'}, [
                div({}, [
                    div({style: {
                            position: 'absolute',
                            backgroundImage: 'url(' + doodlePath + ')',
                            backgroundRepeat: 'no-repeat',
                            backgroundSize: '35%',
                            top: '0',
                            left: '0',
                            bottom: '0',
                            right: '0',
                            opacity: '0.1',
                            zIndex: '-1000'
                        }})
                ]),
                div({class: 'row'}, [
                    div({class: 'col-sm-7 col-sm-offset-1'}, [
                        h1({style: 'font-size:1.6em'}, ['Welcome to KBase']),
                        p([
                            'After signing in, you can start working with KBase. Upload your experimental data and perform comparative genomics and systems biology analyses by creating ', 
                            i('Narratives'), 
                            ': interactive, dynamic, and shareable documents. Narratives include all your analysis steps, commentary, and visualizations.'
                        ]),
                        p([
                            'Want to learn more?  Check out the ',
                            a({href: runtime.config('resources.documentation.narrativeGuide.url')}, 'Narrative Interface User Guide'),
                            ' or the ',
                            a({href: 'https://youtu.be/6ql7HAUzU7U'}, 'Narrative Interface video tutorial'),
                            ', and a ',
                            a({href: runtime.config('resources.documentation.tutorials.url')}, 'library of tutorials'), 
                            ' that show you how to use various KBase apps to analyze your data.'
                        ])
                    ]),
                    div({class: 'col-sm-3'}, [
                        div({class: 'well well-kbase'}, [
                            form({class: 'form login-form', id: events.addEvent('submit', handleLogin)}, [
                                input({type: 'hidden', value: nextPath}),
                                input({type: 'hidden', value: nextURL}),
                                legend({style: 'text-align: center'}, 'KBase Sign In'),
                                div({class: 'form-group'}, [
                                    input({name: 'username', type: 'text', placeholder: 'username', id: events.addEvent('keyup', handleUsernameKeyup), dataElement: 'username', autocomplete: 'off', class: 'form-control form-control-kbase', tabindex: '1'}),
                                    div({dataElement: 'username-message', class: 'alert', style: {display: 'none'}})
                                ]),
                                div({class: 'form-group'}, [
                                    input({name: 'password', type: 'password', placeholder: 'password', id: 'kbase_password', dataElement: 'password', autocomplete: 'off', class: 'form-control form-control-kbase', tabindex: '2'})
                                ]),
                                div({class: 'form-group'}, [
                                    button({id: 'signinbtn', type: 'submit', class: 'btn btn-primary btn-block btn-kbase', tabindex: '3', 'data-element': 'sign-in'}, [
                                        i({class: 'fa fa-sign-in', style: 'margin-right: 1em;'}),
                                        'Sign In'
                                    ]),
                                    button({id: 'signinbtn', type: 'submit', class: 'btn btn-primary btn-block btn-kbase', style: 'display:none;', tabindex: '3', 'data-element': 'signing-in'}, [
                                        i({class: 'fa fa-spinner fa-spin', style: 'margin-right: 1em;'}),
                                        'Signing In...'
                                    ]),
                                    div({'data-element': 'error', class: 'alert alert-danger alert-kbase', style: 'display:none; margin-top: 1em'})
                                ]),
                                div({class: 'form-group', style: 'margin-top: 3em; margin-bottom: 0;'}, [
                                    a({target: '_blank', href: runtime.config('resources.userAccount.signUp.url'), class: 'btn btn-block btn-link'}, 'New to KBase? Sign Up'),
                                    a({target: '_blank', href: runtime.config('resources.userAccount.resetPassword.url'), class: 'btn btn-block btn-link'}, 'Forgot your password?'),
                                    a({target: '_blank', href: runtime.config('resources.documentation.loginHelp.url'), class: 'btn btn-block btn-link'}, 'Help')
                                ])
                            ])
                        ])
                    ])
                ])
            ]);

        }

        // API

        function attach(node) {
            return Promise.try(function () {
                mount = node;
                container = document.createElement('div');
                // $container = $(container);
                events = domEvent.make(container);
                mount.appendChild(container);
            });
        }

        function start(params) {
            return Promise.try(function () {
                runtime.send('ui', 'setTitle', 'Sign in to KBase');
                events.detachEvents();
                container.innerHTML = renderForm();
                events.attachEvents();

                container.querySelector('[data-element="username"]').focus();
                if (params.nextrequest) {
                    try {
                        nextRequest = JSON.parse(params.nextrequest);
                    } catch (ex) {
                        console.error('Error parsing nextrequest', ex);
                    }
                }
            });
        }

        function detach() {
            events.detachEvents();
            if (container) {
                mount.removeChild(container);
            }
        }

        return {
            attach: attach,
            detach: detach,
            start: start
        };
    }

    return {
        make: function (config) {
            return widget(config);
        }
    };

});