import { PluginConfig, PluginDefinition, Service, ServiceConfig } from '../../lib/types';
import { StateMachine } from '../../lib/kb_lib/StateMachine';
import { stache, tryPromise } from '../../lib/kb_lib/Utils';

interface MenuSystem {
    menuItems: Map<string, MenuItemDefinition>,
    menus: MenuConfig;
}

interface MenuItemDefinitionBase {
    type: string;
    name: string;
    label: string;
    icon: string;
    auth?: boolean;
    newWindow?: boolean;
}

interface MenuItemDefinitionInternal extends MenuItemDefinitionBase {
    type: 'internal',
    path: string;
}

interface MenuItemDefinitionExternal extends MenuItemDefinitionBase {
    type: 'external',
    uri: string;
}

export type MenuItemDefinition = MenuItemDefinitionInternal | MenuItemDefinitionExternal;

interface MenuServiceConfig extends ServiceConfig {
    items: Array<MenuItemDefinition>;
}

export interface Menus {
    hamburger: Array<string>;
    developer: Array<string>;
    sidebar: Array<string>;
}

interface MenuConfig {
    hamburger: {
        sections: {
            main: Array<MenuItemConfig>;
            developer: Array<MenuItemConfig>;
            help: Array<MenuItemConfig>;
        },
        disabled: Array<string>;
    },
    sidebar: {
        sections: {
            main: Array<MenuItemConfig>;
        },
        disabled: Array<string>;
    };
}

interface MenuItemConfig {
    id: string;
    label: string;
    auth: boolean;
    allowRoles?: Array<string>;
    allow?: Array<string>;
    disabled?: boolean;
    beta?: boolean;
}

interface MenuConstructorConfig {
    config: {
        menus: MenuConfig;
    };
}

export class MenuService extends Service<MenuServiceConfig> {
    // menus: MenuConfig;
    state: StateMachine<MenuSystem>;

    constructor({ config: { menus } }: MenuConstructorConfig) {
        super();
        // this.menus = menus;
        this.state = new StateMachine<MenuSystem>({
            initialState: {
                menuItems: new Map<string, MenuItemDefinition>(),
                menus,
            }, interval: 100
        });
    }

    // Adds a menu item definition
    addMenuItem(menuDef: MenuItemDefinition) {
        this.state.update((state: MenuSystem) => {
            state.menuItems.set(menuDef.name, menuDef);
            return state;
        });
    }

    /*
     * Adds a new menu item to the catalog of available menu items.
     */
    // addToMenu(menuItemConfig: MenuItemConfig) {


    //     // const menuItems = this.state.getItem('menuItems');
    //     // const menuItemDef = menuItems[menuItemConfig.id];

    //     // if (!menuItemDef) {
    //     //     throw {
    //     //         type: 'InvalidKey',
    //     //         reason: 'MenuItemNotFound',
    //     //         message: 'The menu item key provided, "' + menuItemConfig.id + '", is not registered'
    //     //     };
    //     // }

    //     // let path;
    //     // if (menuItemDef.path) {
    //     //     if (typeof menuItemDef.path === 'string') {
    //     //         path = menuItemDef.path;
    //     //     } else if (menuItemDef.path instanceof Array) {
    //     //         path = menuItemDef.path.join('/');
    //     //     } else {
    //     //         console.error('Invalid path for menu item', menuItemDef);
    //     //         throw new Error('Invalid path for menu item');
    //     //     }
    //     // }
    //     // const menuItem = {
    //     //     // These are from the plugin's menu item definition
    //     //     id: menuItemDef.id,
    //     //     label: menuItemConfig.label || menuItemDef.label,
    //     //     path: path,
    //     //     icon: menuItemDef.icon,
    //     //     uri: menuItemDef.uri,
    //     //     newWindow: menuItemDef.newWindow,
    //     //     beta: menuItemDef.beta || false,
    //     //     // These are from the ui menu item spec
    //     //     // allow: menuItemConfig.allow || null,
    //     //     allowRoles: menuItemConfig.allowRoles || null,
    //     //     authRequired: menuItemConfig.auth ? true : false
    //     // };

    //     // const menu = menuEntry.menu;
    //     // const section = menuEntry.section;
    //     // const position = menuEntry.position || 'bottom';

    //     // this.state.update((state: MenuSystem) => {
    //     //     // 'menu.' + menu, 
    //     //     const menu = state.menuItems.
    //     //     if (!menus[section]) {
    //     //         console.error('ERROR: Menu section not defined', menuEntry, menu, section, menus);
    //     //         throw new Error('Menu section not defined: ' + section);
    //     //     }
    //     //     if (position === 'top') {
    //     //         menus[section].unshift(menuItem);
    //     //     } else {
    //     //         menus[section].push(menuItem);
    //     //     }
    //     //     // return menus;
    //     //     return state;
    //     // });
    // }

    // getCurrentMenu(menu) {
    //     menu = menu || 'hamburger';
    //     return this.state.getItem('menu.' + menu);
    // }

    getMenuSection(section: Array<MenuItemConfig>, state: MenuSystem) {
        return section.map((menuItem) => {
            // TODO: filter menu items.
            const menuDef = state.menuItems.get(menuItem.id);
            if (!menuDef) {
                console.warn('Menu definition not found', menuItem, Array.from(state.menuItems));
                return;
            }

            // The ui's menu config can ovveride certain properties of the 
            // plugin's menu definition
            menuDef.auth = menuDef.auth || menuItem.auth;
            return menuDef;
        })
            .filter((possibleMenuItem) => {
                return possibleMenuItem ? true : false;
            });
    }

    getHamburgerMenu() {
        const state = this.state.getState();
        const menu = state.menus.hamburger;
        const main = this.getMenuSection(menu.sections.main, state);
        const developer = this.getMenuSection(menu.sections.developer, state);
        const help = this.getMenuSection(menu.sections.help, state);
        return {
            main, developer, help
        };
    }

    getSidebarMenu() {
        const state = this.state.getState();
        const menu = state.menus.sidebar;
        const main = this.getMenuSection(menu.sections.main, state);
        return {
            main
        };
    }

    // Plugin interface
    pluginHandler(serviceConfig: MenuServiceConfig, pluginDef: PluginDefinition, pluginConfig: PluginConfig) {
        if (!serviceConfig) {
            return;
        }
        // if (Array.isArray(serviceConfig)) {
        //     serviceConfig = {
        //         items: serviceConfig
        //     };
        // }
        // console.log('[pluginHandler]', serviceConfig, pluginDef, pluginConfig);

        return tryPromise(() => {
            serviceConfig.items.forEach((menuItem) => {
                // TODO: maybe just store the whole menu from
                // the plugin config?
                // menu.id = menu.name;
                // if (serviceConfig.mode === 'auto') {
                //     menu.path.unshift(pluginDef.package.name);
                // }
                // Not all plugins will have the "type", and I'm not comfortable necessarily with
                // exposing TS' discriminated union typing...
                if (typeof menuItem.type === 'undefined' && 'path' in menuItem) {
                    menuItem.type = 'internal';
                }
                if (menuItem.type === 'internal') {
                    menuItem.path = stache(menuItem.path, new Map<string, string>([['plugin', pluginConfig.package.name]]));
                }
                this.addMenuItem(menuItem);
            });
        });
    }

    onChange(fun: (menuSystem: MenuSystem) => void) {
        console.log('onChange 1');
        this.state.onChange((state: MenuSystem) => {
            console.log('onChange 2', state);
            fun(state);
        });
    }

    start() {
        return Promise.resolve();
    }

    // SERVICE API
    // initialize() {
    //     // The hamburger menu.
    //     const menu = menus.hamburger;
    //     menu.section.main.items.forEach((menuItem) => {
    //         if (menuItem.disabled) {
    //             return;
    //         }
    //         if (menu.disabled.includes(menuItem.id)) {
    //             return;
    //         }
    //         this.addToMenu(menuItem);
    //         //     {
    //         //         menu,
    //         //         section: menu.section,
    //         //         position: 'bottom'
    //         //         // allow: menuItem.allow
    //         //     },

    //         // );

    //     });

    //     Object.entries(menus)
    //         .forEach(([menuDef]) => {
    //             // Skip a menu with no sections
    //             if (!menuDef.sections) {
    //                 return;
    //             }
    //             Object.entries(menuDef.sections)
    //                 .forEach(([section, sectionDef]) => {
    //                     // Skip sections with no items.
    //                     if (!sectionDef) {
    //                         return;
    //                     }
    //                     if (!sectionDef.items) {
    //                         return;
    //                     }
    //                     const items = sectionDef.items;
    //                     const disabled = menuDef.disabled || [];
    //                     items.forEach((menuItem) => {
    //                         if (menuItem.disabled) {
    //                             return;
    //                         }
    //                         if (disabled.indexOf(menuItem.id) >= 0) {
    //                             return;
    //                         }
    //                         this.addToMenu(menuItem);
    //                         //     {
    //                         //         menu: menu,
    //                         //         section: section,
    //                         //         position: 'bottom',
    //                         //         allow: menuItem.allow
    //                         //     },

    //                         // );
    //                     });
    //                 });
    //         });
    //     return Promise.resolve();
    // }

    stop() {
        return Promise.resolve();
    }
};

export const ServiceClass = MenuService;