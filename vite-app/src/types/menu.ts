export type MenuType = 'internal' | 'external';

export interface MenuItemBase {
    name: string;
    label: string;
    type: MenuType;
    requiresAuth: boolean;

    icon?: string;
    image?: string;
    newWindow?: boolean;
    tooltip?: string;
    allowedTags?: Array<string>;
    allowedRoles?: Array<string>;
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
