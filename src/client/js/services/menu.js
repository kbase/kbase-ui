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
        state.setItem('menus', {
            authenticated: [],
            unauthenticated: []
        });
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
         function deleteMenuItem(id) {
         delete menu[id];
         }
         function insertMenuItem(id, beforeItem) {
         }
         */
        function setMenu(ids) {
            clearMenu();
            state.setItem('menu', ids.map(function (id) {
                return id;
            }));
        }

        /*
         * TODO: support menu sections. For now, just a simple menu.
         */
        function addToMenu(id, item) {
            state.modifyItem('menus', function (menus) {
                menus[id].push(item);
                return menus;
            });
        }

        function getCurrentMenu() {
            var menu,
                menus = state.getItem('menus'),
                menuItems = state.getItem('menuItems');

            if (runtime.getService('session').isLoggedIn()) {
                menu = menus['authenticated'];
            } else {
                menu = menus['unauthenticated'];
            }
            return menu.map(function (item) {
                return menuItems[item];
            });
        }


        // Plugin interface
        function installMenu(menu) {
            addMenuItem(menu.name, menu.definition);
            if (menu.menus) {
                menu.menus.forEach(function (menuId) {
                    addToMenu(menuId, menu.name);
                });
            }
        }

        function pluginHandler(newMenus) {
            if (!newMenus) {
                return;
            }
            return Promise.try(function () {
                newMenus.forEach(function (menu) {
                    installMenu(menu);
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
            onChange: onChange
        };
    }
    
    return {
        make: function (config) {
            return factory(config);
        }
    };
});