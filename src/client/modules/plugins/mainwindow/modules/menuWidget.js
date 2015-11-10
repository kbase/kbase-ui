/*global define */
/*jslint white: true, browser: true */
define([
    'underscore',
    'kb_widgetBases_simpleWidget',
    'kb_common_html',
    'kb_plugin_mainWindow',
    'bootstrap'
],
    function (_, SimpleWidget, html, Plugin) {
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
                            return (function () {
                                var linkAttribs = {href: item.uri};
                                if (item.newWindow) {
                                    linkAttribs.target = '_blank';
                                }
                                return li({}, a(linkAttribs, [
                                    icon,
                                    item.label
                                ]));
                            }());
                        } 
                        if (path !== undefined) {
                            return li({}, a({href: '#' + path}, [
                                icon,
                                item.label
                            ]));
                        }
                        break;
                    case 'divider':
                        return li({role: 'presentation', class: 'divider'});
                }
            }
            
            function renderMenuSection(section) {
                var content = [];
                if (!section && section.length === 0) {
                    return;
                }
                section.forEach(function (item) {
                    if (!item) {
                        console.log('Menu item not defined');
                    } else {
                        content.push(renderMenuItem(item));
                    }
                });
                return content;
            }

            function renderMenu(w) {
                var ul = html.tag('ul'),
                    menu = w.getState('menu'),
                    items = [
                        renderMenuSection(menu.main),
                        renderMenuSection(menu.developer),
                        renderMenuSection(menu.help)
                    ].filter(function (items) {
                        if (!items || items.length > 0) {
                            return true;
                        }
                        return false;
                    }).map(function (items) {
                        return items.join('');
                    }).join(renderMenuItem({type: 'divider'}));
                
                return ul({class: 'dropdown-menu', role: 'menu', 'aria-labeledby': 'kb-nav-menu'}, items);
            }

            return SimpleWidget.make({
                runtime: runtime,
                on: {
                    start: function (params) {
                        runtime.getService('menu').onChange(function (value) {
                            this.set('menu', value);
                        }.bind(this));
                    },
                    render: function () {
                        return div({class: 'kb-widget-menu'}, [
                            button({id: 'kb-nav-menu',
                                class: 'btn btn-default navbar-btn kb-nav-btn',
                                dataToggle: 'dropdown',
                                ariaHaspopup: 'true'}, [
                                span({class: 'fa fa-navicon'})
                            ]),
                            renderMenu(this)
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