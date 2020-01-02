define(['bluebird', 'kb_lib/observed'], (Promise, Observed) => {
    'use strict';

    return class Menu {
        constructor({config}) {
            this.config = config;
            this.state = new Observed();

            this.state.setItem('menuItems', {
                divider: {
                    type: 'divider'
                }
            });

            // MAIN
            this.state.setItem('menu', []);

            // creates initial empty menus
            this.setupMenus();
        }

        setupMenus() {
            var hamburgerMenu = {
                main: [],
                developer: [],
                help: []
            };
            this.state.setItem('menu.hamburger', hamburgerMenu);

            var sidebarMenu = {
                main: []
            };
            this.state.setItem('menu.sidebar', sidebarMenu);
        }

        // Adds a menu item definition
        addMenuItem(id, menuDef) {
            // Another quick hack - not all menu defs have the name - the name
            // aka id  is also the may key for plugin config menu items.
            menuDef.id = id;
            this.state.modifyItem('menuItems', (menuItems) => {
                menuItems[id] = menuDef;
                return menuItems;
            });
        }

        /*
         * Add a defined menu item to a menu, according to a menu entry definition.
         */
        addToMenu(menuEntry, menuItemSpec) {
            var menu,
                section,
                position,
                menuItems = this.state.getItem('menuItems'),
                menuItemDef = menuItems[menuItemSpec.id];

            if (!menuItemDef) {
                throw {
                    type: 'InvalidKey',
                    reason: 'MenuItemNotFound',
                    message: 'The menu item key provided, "' + menuItemSpec.id + '", is not registered'
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
                id: menuItemDef.id,
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

            this.state.modifyItem('menu.' + menu, (menus) => {
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

        getCurrentMenu(menu) {
            menu = menu || 'hamburger';
            var menus = this.state.getItem('menu.' + menu);
            return menus;
        }

        // Plugin interface
        pluginHandler(newMenus) {
            if (!newMenus) {
                return;
            }
            return Promise.try(() => {
                newMenus.forEach((menu) => {
                    // quick patch to the definition to add the id.
                    // TODO: maybe just store the whole menu from
                    // the plugin config?
                    menu.id = menu.name;
                    this.addMenuItem(menu.name, menu.definition || menu);
                });
            });
        }

        onChange(fun) {
            this.state.listen('menu.hamburger', {
                onSet: () => {
                    fun(this.getCurrentMenu('hamburger'));
                }
            });
        }

        // SERVICE API

        start() {
            // The hamburger menu.
            Object.keys(this.config.menus).forEach((menu) => {
                var menuDef = this.config.menus[menu];
                // Skip a menu with no sections
                if (!menuDef.sections) {
                    return;
                }
                Object.keys(menuDef.sections).forEach((section) => {
                    // Skip sections with no items.
                    if (!menuDef.sections[section]) {
                        return;
                    }
                    if (!menuDef.sections[section].items) {
                        return;
                    }
                    var items = menuDef.sections[section].items;
                    var disabled = menuDef.disabled || [];
                    items.forEach((menuItem) => {
                        if (menuItem.disabled) {
                            return;
                        }
                        if (disabled.indexOf(menuItem.id) >= 0) {
                            return;
                        }
                        this.addToMenu(
                            {
                                menu: menu,
                                section: section,
                                position: 'bottom',
                                allow: menuItem.allow
                            },
                            menuItem
                        );
                    });
                });
            });
        }

        stop() {}
    };
});
