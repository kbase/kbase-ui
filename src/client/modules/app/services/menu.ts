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
    tooltip?: string;
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

    getMenuSection(section: Array<MenuItemConfig>, state: MenuSystem) {
        return section.map((menuItem) => {
            // TODO: filter menu items.
            const menuDef = state.menuItems.get(menuItem.id);
            if (!menuDef) {
                // console.warn('Menu definition not found', menuItem, Array.from(state.menuItems));
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

        return tryPromise(() => {
            serviceConfig.items.forEach((menuItem) => {
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
        this.state.onChange((state: MenuSystem) => {
            fun(state);
        });
    }

    start() {
        return Promise.resolve();
    }

    stop() {
        return Promise.resolve();
    }
};

export const ServiceClass = MenuService;