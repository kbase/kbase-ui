import { Component } from 'react';
import { arraysIntersect } from '../../lib/utils';
// import { FeedsNotification } from '../../services/feeds';
import rawMenuData from 'assets/menu.json';
import {
    AuthenticationState, AuthenticationStateAuthenticated,
    AuthenticationStatus
} from '../../contexts/Auth';
import { Config } from '../../types/config';
import { MenuItem } from '../../types/menu';
import SidebarMenu from '../SidebarMenu/SidebarMenu';

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

const MENU: Menu = {
    ...menuData,
    itemsMap: new Map(menuData.menu.map((item) => {
        return [item.name, item];
    }))
}

// export class Menu {
//     items: Array<MenuItem>;
//     itemsMap: 
//     constructor(menuItems: Array<MenuItem>) {
//         this.items = menuItems;

//     }
// }


// const menu: Array<MenuItem> = [
//     {
//         "name": "narratives",
//         "label": "Navigator",
//         "tooltip": "Narrative Navigator - browse and search Narratives",
//         "type": "internal",
//         "path": "narratives",
//         "newWindow": false,
//         "icon": "compass",
//         "requiresAuth": true
//     },
//     {
//         "name": "orgs",
//         "type": "internal",
//         "tooltip": "Browse, search, join and manage KBase Organizations",
//         "path": "orgs",
//         "newWindow": false,
//         "label": "Orgs",
//         "icon": "users",
//         "requiresAuth": true
//     },
//     {
//         "name": "catalog",
//         "type": "internal",
//         "tooltip": "Browse and search a catalog of KBase Narrative Apps and Workspace Types",
//         "path": "catalog/apps",
//         "newWindow": false,
//         "label": "Catalog",
//         "icon": "book",
//         "requiresAuth": false,
//         "syncHash": true
//     },
//     {
//         "name": "search",
//         "type": "internal",
//         "tooltip": "Search KBase data objects in Narratives and Reference Workspaces",
//         "path": "search",
//         "newWindow": false,
//         "label": "Search",
//         "icon": "search",
//         "requiresAuth": true
//     },
//     {
//         "name": "jobbrowser",
//         "type": "internal",
//         "tooltip": "Browse and manage jobs spawned in your Narratives",
//         "path": "jobbrowser",
//         "newWindow": false,
//         "label": "Jobs",
//         "icon": "suitcase",
//         "requiresAuth": true
//     },
//     {
//         "name": "account",
//         "type": "internal",
//         "tooltip": "Manage your KBase Account",
//         "path": "account",
//         "newWindow": false,
//         "label": "Account",
//         "icon": "drivers-license",
//         "requiresAuth": true
//     },
//     {
//         "name": "feeds",
//         "type": "internal",
//         "tooltip": "Browse and manage notifications from your KBase Feeds",
//         "path": "feeds",
//         "newWindow": false,
//         "label": "Feeds",
//         "icon": "bullhorn",
//         "requiresAuth": true,
//         "renderBadge": () => {
//             return <FeedsBadgeWrapper />;
//         }
//     }
// ];


// function routeToPath(route) {
//     const path = [];
//     if (route.route.path) {
//         for (let i = 0; i < route.route.path.length; i += 1) {
//             const pathElement = route.route.path[i];
//             if (pathElement.type !== 'literal') {
//                 break;
//             }
//             path.push(pathElement.value);
//         }
//     }
//     return path.join('/');
// }

export interface SidebarProps {
    authState: AuthenticationState;
    config: Config;
}

interface SidebarState {
    // feedStatus: FeedsNotification | null;
    path: string;
}

export default class Sidebar extends Component<SidebarProps, SidebarState> {
    hashListener: () => void;
    constructor(props: SidebarProps) {
        super(props);
        const path = document.location.hash.substring(1).replace(/^\/+/, '');
        this.state = {
            path,
        };

        this.hashListener = this.onHashChange.bind(this);
    }

    componentDidMount() {
        // catch hash change in order to update the sidebar menu props, 
        // which will then higlight the current menu item.
        // TODO: base this on a context.
        window.addEventListener('hashchange', this.hashListener);
    }

    onHashChange() {
        const path = document.location.hash
            .substring(1)
            .replace(/^\/+/, '');
        this.setState({
            path,
        });
    }

    componentWillUnmount() {
        window.removeEventListener('hashchange', this.hashListener);
    }

    renderAuthenticated(authState: AuthenticationStateAuthenticated) {
        const userRoles: Array<string> = authState.authInfo.account.roles.map(
            (role) => {
                return role.id;
            }
        );

        const filterMenu = (menu: Array<MenuItem>) => {
            const allowedTags = this.props.config.ui.allow;
            return menu.filter((item: MenuItem) => {
                if (item.allowedTags) {
                    return arraysIntersect(item.allowedTags, allowedTags);
                }
                if (item.allowedRoles) {
                    return arraysIntersect(item.allowedRoles, userRoles);
                }
                return true;
            });
        };

        const authenticatedMenu = MENU.sidebar.map((itemName) => {
            const menuItem = MENU.itemsMap.get(itemName);
            if (!menuItem) {
                throw Error(`Menu item does not exist: ${itemName}`);
            }
            return menuItem;
        });


        return <SidebarMenu path={this.state.path} menu={filterMenu(authenticatedMenu)} />;
    }

    renderUnauthenticated() {
        const unauthenticatedMenu = MENU.sidebar.map((itemName) => {
            const menuItem = MENU.itemsMap.get(itemName);
            if (!menuItem) {
                throw Error(`Menu item does not exist: ${itemName}`);
            }
            return menuItem;
        }).filter(({ requiresAuth }) => {
            return requiresAuth;
        })

        return <SidebarMenu path={this.state.path} menu={unauthenticatedMenu} />;
    }

    render() {
        switch (this.props.authState.status) {
            case AuthenticationStatus.AUTHENTICATED:
                return this.renderAuthenticated(this.props.authState);
            case AuthenticationStatus.NONE:
                return this.renderUnauthenticated();
            case AuthenticationStatus.UNAUTHENTICATED:
                return this.renderUnauthenticated();
        }
    }
}
