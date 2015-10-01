/*global define */
/*jslint white: true, browser: true */
define([
    'underscore',
    'kb_widgetBases_standardWidget',
    'kb_common_html',
    'kb_plugin_mainWindow',
    'bootstrap'
],
    function (_, StandardWidget, html, Plugin) {
        'use strict';

        function myWidget(config) {
            var li = html.tag('li'),
                a = html.tag('a'),
                div = html.tag('div'),
                span = html.tag('span'),
                button = html.tag('button'),
                runtime = config.runtime;

            function renderMenuItem(item) {
                var icon, path,
                    type = item.type || 'button';
                
                if (item.icon) {
                    icon = div({class: 'navbar-icon'}, [
                        span({class: 'fa fa-' + item.icon})
                    ]);
                }
                if (item.path) {
                    if (typeof item.path === 'string') {
                        path = item.path;
                    } else if (_.isArray(item.path)) {
                        path = item.path.join('/');
                    }
                }
                switch (type) {
                    case 'button':
                        if (item.uri) {
                            return li({}, a({href: item.uri}, [
                                icon,
                                item.label
                            ]));
                        } else if (path !== undefined) {
                            return li({}, a({href: '#' + path}, [
                                icon,
                                item.label
                            ]));
                        }
                    case 'divider':
                        return li({role: 'presentation', class: 'divider'});
                }
            }

            function renderMenu(w) {
                var ul = html.tag('ul'),
                    menu = w.getState('menu');
                return ul({class: 'dropdown-menu', role: 'menu', 'aria-labeledby': 'kb-nav-menu'}, menu.map(function (item) {
                    if (!item) {
                        console.log('item ' + id + ' not defined');
                    } else {
                        return renderMenuItem(item);
                    }
                }));
            }

            return StandardWidget.make({
                runtime: runtime,
                on: {
                    start: function (w, params) {
                        runtime.getService('menu').onChange(function (value) {
                            //console.log('changed...');
                            //console.log(value);
                            w.setState('menu', value);
                        });
                    },
                    render: function (w) {
                        return div({class: 'kb-widget-menu'}, [
                            button({id: 'kb-nav-menu',
                                class: 'btn btn-default navbar-btn kb-nav-btn',
                                dataToggle: 'dropdown',
                                ariaHaspopup: 'true'}, [
                                span({class: 'fa fa-navicon'})
                            ]),
                            renderMenu(w)
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