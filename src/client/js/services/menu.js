/*global define */
/*jslint white: true */
define([
    'bluebird',
    'kb_common_observed'
], function (Promise, observed) {
    'use strict';
    function factory(config) {
        var state = observed.make(),
            runtime = config.runtime;
        state.setItem('menu', []);
//        state.setItem('menus', {
//            authenticated: [],
//            unauthenticated: []
//        });

        function setMenus(from) {
            from = from || {};
            var menu = {
                authenticated: {
                    main: [
                    ],
                    developer: [
                    ],
                    help: [
                    ]
                },
                unauthenticated: {
                    main: [
                    ],
                    developer: [
                    ],
                    help: [
                    ]
                }
            }
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
                    main: [
                    ],
                    developer: [
                    ],
                    help: [
                    ]
                },
                unauthenticated: {
                    main: [
                    ],
                    developer: [
                    ],
                    help: [
                    ]
                }
            }
            state.setItem('menus', menu);
        }
        setupMenus();

        state.setItem('menuItems', {
            divider: {
                type: 'divider'
            }
        });

        runtime.recv('session', 'loggedin', function () {
            state.setItem('menu', state.getItem('menus').authenticated);
        });
        runtime.recv('session', 'loggedout', function () {
            state.setItem('menu', state.getItem('menus').unauthenticated);
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
            console.log('adding to menu...');
            console.log(menuEntry);
            console.log(item);
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
                console.log('MENUS???');
                console.log(menus);
                if (position === 'top') {
                    menus[id][section].push(menuItems[item]);
                } else {
                    menus[id][section].unshift(menuItems[item]);
                }
                return menus;
            });
        }

        function getCurrentMenu() {
            var menu,
                menus = state.getItem('menus');
            if (runtime.getService('session').isLoggedIn()) {
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
//                    if (menu.menus) {
//                        menu.menus.forEach(function (menuEntry) {
//                            
//                            addToMenu(menuEntry, menu.name);
//                        });
//                    }
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

        // API
        return {
            getCurrentMenu: getCurrentMenu,
            pluginHandler: pluginHandler,
            onChange: onChange,
            setMenus: setMenus,
            addToMenu: addToMenu
        };
    }

    return {
        make: function (config) {
            return factory(config);
        }
    };
});