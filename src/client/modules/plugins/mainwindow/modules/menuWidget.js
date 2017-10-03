define([
    'kb_common/html',
    'bootstrap'
], function (
    html
) {
    'use strict';

    function factory(config) {
        var t = html.tag,
            ul = t('ul'),
            li = t('li'),
            a = t('a'),
            div = t('div'),
            span = t('span'),
            button = t('button'),
            runtime = config.runtime,
            hostNode, container;

        function renderMenuItem(item) {
            var icon, path,
                type = item.type || 'button';

            if (item.icon) {
                icon = div({ class: 'navbar-icon' }, [
                    span({ class: 'fa fa-' + item.icon })
                ]);
            }
            if (item.path) {
                if (typeof item.path === 'string') {
                    path = item.path;
                } else if (item.path instanceof Array) {
                    path = item.path.join('/');
                }
            }
            switch (type) {
            case 'button':
                if (item.uri) {
                    return (function () {
                        var linkAttribs = { href: item.uri };
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
                    return li({}, a({ href: '#' + path }, [
                        icon,
                        item.label
                    ]));
                }
                break;
            case 'divider':
                return li({ role: 'presentation', class: 'divider' });
            }
        }

        function renderMenuSection(section) {
            var content = [];
            if (!section && section.length === 0) {
                return;
            }
            section.forEach(function (item) {
                if (!item) {
                    console.warn('Menu item not defined');
                } else {
                    content.push(renderMenuItem(item));
                }
            });
            return content;
        }

        function renderMenu() {
            var menu = runtime.service('menu').getCurrentMenu(),
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
                }).join(renderMenuItem({ type: 'divider' }));
            container.querySelector('.dropdown-menu').innerHTML = items;
        }

        function attach(node) {
            hostNode = node;
            container = hostNode.appendChild(document.createElement('div'));
            container.classList.add('widget-menu');
        }

        function start() {
            container.innerHTML = div({
                class: 'navbar'
            }, [
                button({
                    id: 'kb-nav-menu',
                    class: 'btn btn-default navbar-btn kb-nav-btn',
                    dataToggle: 'dropdown',
                    ariaHaspopup: 'true'
                }, [
                    span({ class: 'fa fa-navicon' })
                ]),
                ul({
                    class: 'dropdown-menu',
                    role: 'menu',
                    ariaLabeledby: 'kb-nav-menu'
                })
            ]);
            renderMenu();
            runtime.service('menu').onChange(function (value) {
                renderMenu();
            }.bind(this));
        }

        function detach() {
            if (hostNode && container) {
                container.removeChild(hostNode);
            }
        }

        return {
            attach: attach,
            start: start,
            detach: detach
        };
    }

    return {
        make: factory
    };
});
