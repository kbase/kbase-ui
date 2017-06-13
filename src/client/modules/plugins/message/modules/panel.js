/*global
 define
 */
/*jslint
 browser: true,
 white: true
 */
define([
        'kb_common/html',
        'kb_common/places',
        'bluebird'
    ],
    function(html, Places, Promise) {
        'use strict';

        function widget(config) {
            var mount, container, runtime = config.runtime,
                div = html.tag('div'),
                span = html.tag('span'),
                p = html.tag('p'),
                places;

            function renderLayout() {
                return div({ class: 'container-fluid' }, [
                    div({ class: 'col-md-12' }, [
                        html.makePanel({
                            title: span({ id: places.add('title') }),
                            content: div(({ id: places.add('content') }))
                        })
                    ])
                ]);
            }

            function findMessage(messageId, info) {
                var messages = {
                        notfound: {
                            title: 'Not Found',
                            content: div([
                                p('Sorry, this resource was not found.'),
                                p(['Path: ', info.original])
                            ])
                        }
                    },
                    message = messages[messageId];
                if (!message) {
                    return {
                        title: 'Message not Found',
                        content: 'Sorry, this message was not found: ' + messageId
                    };
                }
                return message;
            }

            function init(config) {}

            function attach(node) {
                return Promise.try(function() {
                    mount = node;
                    container = document.createElement('div');
                    mount.appendChild(container);
                    places = Places.make(container);
                    container.innerHTML = renderLayout();
                });
            }

            function getInfo(params) {
                if (params && params.info) {
                    return JSON.parse(params.info);
                }
                return {};
            }

            function start(params) {
                var id = params.messageId,
                    messageInfo = getInfo(params),
                    message = findMessage(params.id, messageInfo);
                runtime.send('ui', 'setTitle', message.title);
                places.setContent('title', message.title);
                places.setContent('content', message.content);
            }

            function run(params) {}

            function stop() {}

            function detach() {
                return Promise.try(function() {
                    if (container) {
                        mount.removeChild(container);
                    }
                });
            }

            return {
                init: init,
                attach: attach,
                start: start,
                stop: stop,
                detach: detach
            };
        }

        return {
            make: function(config) {
                return widget(config);
            }
        };
    });