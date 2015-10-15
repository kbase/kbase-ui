/*global define */
/*jslint white: true, browser: true */
define([
    'kb_common_dom',
    'kb_common_html'
],
    function (dom, html) {
        'use strict';

        function factory(config) {
            var eventsPendingAttachment = [],
                eventsAttached = [];

            // DOM EVENTS
            function addEvent(type, handler, id, data) {
                if (!id) {
                    id = html.genId();
                }
                var event = {
                    type: type,
                    selector: '#' + id,
                    handler: handler
                };
                eventsPendingAttachment.push(event);
                return id;
            }
            function attachEvent(type, handler, selector) {
                var event;
                if (typeof type === 'string') {
                    event = {
                        type: type,
                        selector: selector,
                        handler: handler
                    };
                } else {
                    event = type;
                }
                eventsPendingAttachment.push(event);
            }
            function qsa(selector) {
                console.log('attach: ' + selector);
                var result = document.querySelectorAll(selector);
                if (result === null) {
                    return [];
                }
                console.log(result);
                return Array.prototype.slice.call(result);
            }
            function attachEvents() {
                eventsPendingAttachment.forEach(function (event) {
                    var nodes = qsa(event.selector);
                    console.log('attach: adding event for: ' + event.type + ', ' + event.selector);
                    console.log(nodes);

                   nodes.forEach(function (node) {
                        console.log('attach: found a node, attaching');
                        eventsAttached.push({
                            type: event.type,
                            selector: event.selector,
                            node: node,
                            handler: event.handler,
                            listener: node.addEventListener(event.type, event.handler, event.capture || false)
                        });
                    });
                });
                eventsPendingAttachment = [];
            }
            function detachEvents() {
                eventsAttached.forEach(function (event) {
                    if (event.listener) {
                        event.node.removeEventListener(event.type, event.handler);
                        delete event.listener;
                    }
                });
                eventsAttached = [];
            }

            return Object.freeze({
                addEvent: addEvent,
                attachEvent: attachEvent,
                attachEvents: attachEvents,
                detachEvents: detachEvents
            });
        }

        return {
            make: function (config) {
                return factory(config);
            }
        };
    });