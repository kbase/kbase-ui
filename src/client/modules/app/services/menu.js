define([
    'bluebird',
    'kb_common/observed'
], function (Promise, observed) {
    'use strict';

    function factory(config) {
        var state = observed.make(),
            runtime = config.runtime;

        function setMenus(from) {
            from = from || {};
            var menu = {
                authenticated: {
                    main: [],
                    developer: [],
                    help: []
                },
                unauthenticated: {
                    main: [],
                    developer: [],
                    help: []
                }
            };

            // Sets each menu menu item as the actual menu definition.
            Object.keys(from).forEach(function (menuSet) {
                Object.keys(from[menuSet]).forEach(function (menuSection) {
                    menu[menuSet][menuSection] = from[menuSet][menuSection];
                });
            });

            state.setItem('menus', menu);
        }

        function setupMenus() {
            var menu = {
                authenticated: {
                    main: [],
                    developer: [],
                    help: []
                },
                unauthenticated: {
                    main: [],
                    developer: [],
                    help: []
                }
            };
            state.setItem('menus', menu);
        }

        state.setItem('menuItems', {
            divider: {
                type: 'divider'
            }
        });

        function clearMenu() {
            state.setItem('menu', []);
        }

        function addMenuItem(id, menuDef) {
            state.modifyItem('menuItems', function (menuItems) {
                menuItems[id] = menuDef;
                return menuItems;
            });
        }

        /*
         * TODO: support menu sections. For now, just a simple menu.
         */
        function addToMenu(menuEntry, item) {
            var id, section, position,
                menuItems = state.getItem('menuItems'),
                menuItem = menuItems[item];

            if (!menuItem) {
                throw {
                    type: 'InvalidKey',
                    reason: 'MenuItemNotFound',
                    message: 'The menu item key provided, ' + item + ', is not registered'
                };
            }
            if (typeof menuEntry === 'object') {
                id = menuEntry.name;
                section = menuEntry.section;
                position = menuEntry.position || 'bottom';
            } else {
                id = menuEntry;
                section = 'main';
                position = 'bottom';
            }
            state.modifyItem('menus', function (menus) {
                if (!menus[id]) {
                    throw new Error('Menu type not defined: ' + id);
                }
                if (!menus[id][section]) {
                    throw new Error('Menu section not defined for type ' + id + ':' + section);
                }
                if (position === 'top') {
                    menus[id][section].unshift(menuItems[item]);
                } else {
                    menus[id][section].push(menuItems[item]);
                }
                return menus;
            });
        }

        function getCurrentMenu() {
            var menu,
                menus = state.getItem('menus');
            if (runtime.service('session').isLoggedIn()) {
                menu = menus['authenticated'];
            } else {
                menu = menus['unauthenticated'];
            }
            return menu;
        }

        // Plugin interface
        function pluginHandler(newMenus) {
            if (!newMenus) {
                return;
            }
            return Promise.try(function () {
                newMenus.forEach(function (menu) {
                    addMenuItem(menu.name, menu.definition);
                });
            });
        }

        function onChange(fun) {
            state.listen('menu', {
                onSet: function (value) {
                    fun(getCurrentMenu());
                }
            });
        }

        // SERVICE API

        function start() {
            runtime.recv('session', 'loggedin', function () {
                state.setItem('menu', state.getItem('menus').authenticated);
            });
            runtime.recv('session', 'loggedout', function () {
                state.setItem('menu', state.getItem('menus').unauthenticated);
            });
            Object.keys(config.menus).forEach(function (menuSet) {
                Object.keys(config.menus[menuSet]).forEach(function (menuSection) {
                    config.menus[menuSet][menuSection].forEach(function (menuItem) {
                        addToMenu({
                            name: menuSet,
                            section: menuSection,
                            position: 'bottom'
                        }, menuItem);
                    });
                });
            });
        }

        function stop() {}

        // MAIN
        state.setItem('menu', []);
        setupMenus();

        // API
        return {
            getCurrentMenu: getCurrentMenu,
            pluginHandler: pluginHandler,
            onChange: onChange,
            setMenus: setMenus,
            addMenuItem: addMenuItem,
            addToMenu: addToMenu,
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
