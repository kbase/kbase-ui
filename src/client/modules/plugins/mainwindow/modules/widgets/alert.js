/*global define */
/*jslint white: true, browser: true */
define([
    'kb/widget/bases/simpleWidget',
    'kb/common/html',
    'kb_plugin_mainWindow'
],
    function (SimpleWidget, html, Plugin) {
        'use strict';

        function factory(config) {
            var container, runtime = config.runtime,
                listeners = [];

            function layout() {
                var a = html.tag('a'),
                    span = html.tag('span'),
                    div = html.tag('div'),
                    button = html.tag('button');
                return div({class: 'container-fluid'}, [
                ]);
            }

            function makeAlert(alert) {
                var a = html.tag('a'),
                    span = html.tag('span'),
                    div = html.tag('div'),
                    button = html.tag('button');
                return div({
                    class: ['alert', 'alert-dismissable', 'alert-' + alert.type].join(' '), 
                    role: 'alert', 
                    style: {marginTop: '8px', marginBottom: '8px'}
                }, [
                    button({type: 'button', class: 'close', dataDismiss: 'alert', ariaLabel: 'Close'}, [
                        span({ariaHidden: 'true'}, '&times;')
                    ]),
                    div([
                        (function () {
                            if (alert.icon) {
                                return div({style: {float: 'left', margin: '0 4px 4px 0'}}, span({class: 'fa fa-2x fa-' + alert.icon}));
                            }
                        }()),
                        div({dataElement: 'message'}, alert.message)
                    ])
                ]);
            }

            function addAlert(alert) {
                if (!alert) {
                    return;
                }
                if (typeof alert === 'string') {
                    alert = {
                        type: 'default',
                        message: alert
                    };
                }
                
                var el = document.createElement('div');
                el.innerHTML = makeAlert(alert);

                container.appendChild(el.firstChild);
            }

            // API

            function attach(node) {
                node.innerHTML = layout();
                container = node.firstChild;
            }

            function start(params) {
                listeners.push(runtime.recv('ui', 'alert', function (alert) {
                    addAlert(alert);
                }));
            }

            function stop() {
                listeners.forEach(function (listener) {
                    runtime.drop(listener);
                });
            }

            return {
                attach: attach,
                start: start,
                stop: stop
            };
        }

        return {
            make: function (config) {
                return factory(config);
            }
        };
    });