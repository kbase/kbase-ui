define(['bluebird', 'kb_lib/observed'], (Promise, Observed) => {

    return class Menu {
        constructor({config: {menus}}) {
            this.menus = menus;
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
            const hamburgerMenu = {
                main: [],
                developer: [],
                help: []
            };
            this.state.setItem('menu.hamburger', hamburgerMenu);

            const sidebarMenu = {
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
            const menuItems = this.state.getItem('menuItems');
            const menuItemDef = menuItems[menuItemSpec.id];

            if (!menuItemDef) {
                throw {
                    type: 'InvalidKey',
                    reason: 'MenuItemNotFound',
                    message: 'The menu item key provided, "' + menuItemSpec.id + '", is not registered'
                };
            }

            let path;
            if (menuItemDef.path) {
                if (typeof menuItemDef.path === 'string') {
                    path = menuItemDef.path;
                } else if (menuItemDef.path instanceof Array) {
                    path = menuItemDef.path.join('/');
                } else {
                    throw new Error('Invalid path for menu item', menuItemDef);
                }
            }
            const menuItem = {
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

            const menu = menuEntry.menu;
            const section = menuEntry.section;
            const position = menuEntry.position || 'bottom';

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
            return this.state.getItem('menu.' + menu);
        }

        // Plugin interface
        pluginHandler(serviceConfig, pluginConfig, pluginDef) {
            if (!serviceConfig) {
                return;
            }
            if (Array.isArray(serviceConfig)) {
                serviceConfig = {
                    items: serviceConfig
                };
            }
            return Promise.try(() => {
                serviceConfig.items.forEach((menu) => {
                    // quick patch to the definition to add the id.
                    // TODO: maybe just store the whole menu from
                    // the plugin config?
                    menu.id = menu.name;
                    if (serviceConfig.mode === 'auto') {
                        menu.path.unshift(pluginDef.package.name);
                    }
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
            Object.entries(this.menus)
                .forEach(([menu, menuDef]) => {
                    // Skip a menu with no sections
                    if (!menuDef.sections) {
                        return;
                    }
                    Object.entries(menuDef.sections)
                        .forEach(([section, sectionDef]) => {
                            // Skip sections with no items.
                            if (!sectionDef) {
                                return;
                            }
                            if (!sectionDef.items) {
                                return;
                            }
                            const items = sectionDef.items;
                            const disabled = menuDef.disabled || [];
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
            return Promise.resolve();
        }

        stop() {
            return Promise.resolve();
        }
    };
});
