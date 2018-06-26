define([
    'bluebird',
    'kb_common/observed'
], function (
    Promise,
    observed
) {
    'use strict';

    function factory(config) {
        var state = observed.make();

        function setupMenus() {
            var hamburgerMenu = {
                main: [],
                developer: [],
                help: []
            };
            state.setItem('menu.hamburger', hamburgerMenu);

            var sidebarMenu = {
                main: []
            };
            state.setItem('menu.sidebar', sidebarMenu);
        }

        // Create default menu item definitions
        state.setItem('menuItems', {
            divider: {
                type: 'divider'
            }
        });

        // Adds a menu item definition
        function addMenuItem(id, menuDef) {
            state.modifyItem('menuItems', function (menuItems) {
                menuItems[id] = menuDef;
                return menuItems;
            });
        }

        /*
         * Add a defined menu item to a menu, according to a menu entry definition.
         */
        function addToMenu(menuEntry, menuItemSpec) {
            var menu, section, position,
                menuItems = state.getItem('menuItems'),
                menuItemDef = menuItems[menuItemSpec.id];

            if (!menuItemDef) {
                throw {
                    type: 'InvalidKey',
                    reason: 'MenuItemNotFound',
                    message: 'The menu item key provided, ' + menuItemSpec.id + ', is not registered'
                };
            }

            var path;
            if (menuItemDef.path) {
                if (typeof menuItemDef.path === 'string') {
                    path = menuItemDef.path;
                } else if (menuItemDef.path instanceof Array) {
                    path = menuItemDef.path.join('/');
                } else {
                    throw new Error('Invalid path for menu item', menuItemDef);
                }
            }
            var menuItem = {
                // These are from the plugin's menu item definition
                label: menuItemSpec.label || menuItemDef.label,
                path: path,
                icon: menuItemDef.icon,
                uri: menuItemDef.uri,
                newWindow: menuItemDef.newWindow,
                beta: menuItemDef.beta || false,
                // These are from the ui menu item spec
                allow: menuItemSpec.allow || null,
                allowRoles: menuItemSpec.allowRoles || null,
                authRequired: menuItemSpec.auth ? true : false
            };

            menu = menuEntry.menu;
            section = menuEntry.section;
            position = menuEntry.position || 'bottom';

            state.modifyItem('menu.' + menu, function (menus) {
                if (!menus[section]) {
                    console.error('ERROR: Menu section not defined', menuEntry, menu, section, menus);
                    throw new Error('Menu section not defined: ' + section);
                }
                if (position === 'top') {
                    menus[section].unshift(menuItem);
                } else {
                    menus[section].push(menuItem);
                }
                return menus;
            });
        }

        function getCurrentMenu(menu) {
            menu = menu || 'hamburger';
            var menus = state.getItem('menu.' + menu);
            return menus;
        }

        // Plugin interface
        function pluginHandler(newMenus) {
            if (!newMenus) {
                return;
            }
            return Promise.try(function () {
                newMenus.forEach(function (menu) {
                    addMenuItem(menu.name, menu.definition || menu);
                });
            });
        }

        function onChange(fun) {
            state.listen('menu.hamburger', {
                onSet: function () {
                    fun(getCurrentMenu('hamburger'));
                }
            });
        }

        // SERVICE API

        function start() {
            // The hamburger menu.
            Object.keys(config.menus).forEach(function (menu) {
                var menuDef = config.menus[menu];
                // Skip a menu with no sections
                if (!menuDef.sections) {
                    return;
                }
                Object.keys(menuDef.sections).forEach(function (section) {
                    // Skip sections with no items.
                    if (!menuDef.sections[section]) {
                        return;
                    }
                    if (!menuDef.sections[section].items) {
                        return;
                    }
                    var items = menuDef.sections[section].items;
                    var disabled = menuDef.disabled || [];
                    items.forEach(function (menuItem) {
                        if (menuItem.disabled) {
                            return;
                        }
                        if (disabled.indexOf(menuItem.id) >= 0) {
                            return;
                        }
                        addToMenu({
                            menu: menu,
                            section: section,
                            position: 'bottom',
                            allow: menuItem.allow
                        }, menuItem);
                    });
                });
            });
        }

        function stop() {}

        // MAIN
        state.setItem('menu', []);

        // creates initial empty menus
        setupMenus();

        // API
        return {
            getCurrentMenu: getCurrentMenu,
            pluginHandler: pluginHandler,
            onChange: onChange,
            // setMenus: setMenus,
            addMenuItem: addMenuItem,
            addToMenu: addToMenu,
            start: start,
            stop: stop
        };
    }

    return {
        make: factory
    };
});
