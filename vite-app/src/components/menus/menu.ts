
import rawMenuData from './menu.json';

import { MenuItem } from '../../types/menu';

export interface MenuData {
    menu: Array<MenuItem>;
    itemsMap: Map<string, MenuItem>;
    sidebar: Array<string>;
    hamburger: {
        narrative: Array<string>;
        search: Array<string>;
        developer: Array<string>;
        help: Array<string>;
    }
}


export interface Menu extends MenuData {
    itemsMap: Map<string, MenuItem>;
}

const menuData: MenuData = rawMenuData as unknown as MenuData;

export const MENU: Menu = {
    ...menuData,
    itemsMap: new Map(menuData.menu.map((item) => {
        return [item.name, item];
    }))
}