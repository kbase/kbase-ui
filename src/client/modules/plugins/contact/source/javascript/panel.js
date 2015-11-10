/*global
 define
 */
/*jslint
 browser: true,
 white: true
 */
define([
    'kb.html',
    'kb.runtime',
    'bluebird',
    'knockout'
],
    function (html, R, Promise, ko) {
        'use strict';
        function renderContactForm() {
            var table = html.tag('table'),
                tr = html.tag('tr'),
                td = html.tag('td'),
                form = html.tag('form'),
                input = html.tag('input'),
                textarea = html.tag('textarea'),
                button = html.tag('button'),
                span = html.tag('span'),
                div = html.tag('div'),
                p = html.tag('p');
            return form({}, [
                div({class: 'panel panel-default'}, [
                    div({class: 'panel-heading'}, [
                        span({class: 'panel-title'}, 'Contact Us')
                    ]),
                    div({class: 'panel-body'}, [
                        table({class: 'table', border: '1'}, [
                            tr({}, [
                                td({}, [
                                    'Name'
                                ]),
                                td({}, [
                                    input({'data-bind': 'value: name'})
                                ])
                            ]),
                            tr({}, [
                                td({}, [
                                    'E-Mail'
                                ]),
                                td({}, [
                                    input({'data-bind': 'value: email'})
                                ])
                            ]),
                            tr({}, [
                                td({}, [
                                    'What?'
                                ]),
                                td({}, [
                                    textarea({'data-bind': 'value: what', style: 'width: 400px; height: 100px;'})
                                ])
                            ]),
                            tr({}, [
                                td({}),
                                td({}, [
                                    button({type: 'submit', 'data-bind': 'click: submitForm'}, 'Submit')
                                ])
                            ])
                        ]),
                        table({class: 'table', border: '1'}, [
                            tr({}, [
                                td({}, [
                                    'Name'
                                ]),
                                td({}, [
                                    span({'data-bind': 'text: name'})
                                ])
                            ]),
                            tr({}, [
                                td({}, [
                                    'E-Mail'
                                ]),
                                td({}, [
                                    span({'data-bind': 'text: email'})
                                ])
                            ]),
                            tr({}, [
                                td({}, [
                                    'What?'
                                ]),
                                td({}, [
                                    span({'data-bind': 'text: what'})
                                ])
                            ])
                        ]),
                        div({style: 'border: 1px red solid;'}, [
                            p({}, [
                                'Name: ', span({'data-bind': 'text: name', style: 'font-weight: bold; font-size: 150%;'})
                            ]),
                            p({}, [
                                'E-Mail: ', span({'data-bind': 'text: email', style: 'font-weight: bold; font-size: 150%;'})
                            ]),
                            p({}, [
                                'What?: ', span({'data-bind': 'text: what', style: 'font-weight: bold; font-size: 150%;'})
                            ])
                        ])
                    ])
                ])
            ]);
        }

        function ContactViewModel() {
            // NB by using the event handler first argument, we can avoid usage of
            // the 'this', which would also work (being bound to the object the 
            // event handler is accessed.)
            function submitIt(contact) {
                var name = contact.name();
                alert('submitting form for ' + name);
            }
            return {
                name: ko.observable(''),
                email: ko.observable(''),
                what: ko.observable(''),
                submitForm: submitIt
            };
        }

        function widget() {
            var mount, container;
            var contact = ContactViewModel();

            // API
            function init(config) {
                return new Promise(function (resolve) {
                    resolve();
                });
            }
            function attach(node) {
                return new Promise(function (resolve) {
                    mount = node;
                    container = document.createElement('div');
                    mount.appendChild(container);
                    container.innerHTML = renderContactForm();
                    R.send('app', 'title', 'Contact KBase');
                    resolve();
                });
            }
            function detach(node) {
                return new Promise(function (resolve) {
                    mount.removeChild(container);
                    resolve();
                });
            }
            function start(node) {
                return new Promise(function (resolve) {
                    contact = ContactViewModel();
                    ko.applyBindings(contact, container);
                    resolve();
                });
            }
            function stop(node) {
                return new Promise(function (resolve) {
                    ko.cleanNode(container);
                    contact = null;
                    resolve();
                });
            }
            return {
                init: init,
                attach: attach,
                detach: detach,
                start: start,
                stop: stop
            };
        }
        return {
            make: function (config) {
                return widget(config);
            }
        };
    });