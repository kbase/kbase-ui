export type MenuType = 'internal' | 'external';

export interface MenuItemBase {
    name: string;
    type: MenuType;
    label: string;
    syncHash?: boolean;
    icon: string;
    newWindow?: boolean;
    tooltip?: string;
    requiresAuth?: boolean;
    allowedTags?: Array<string>;
    allowedRoles?: Array<string>;
    renderBadge?: (menuItem: MenuItem) => JSX.Element;
}

export interface MenuItemInternal extends MenuItemBase {
    type: 'internal';
    path: string;
}

export interface MenuItemExternal extends MenuItemBase {
    type: 'external';
    url: string;
}

export type MenuItem = MenuItemInternal | MenuItemExternal;

export interface Menu {
    items: Array<MenuItem>;
}
