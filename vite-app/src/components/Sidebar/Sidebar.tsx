import { Component } from 'react';
import {
    AuthenticationState, AuthenticationStateAuthenticated,
    AuthenticationStatus
} from '../../contexts/Auth';
import { arraysIntersect } from '../../lib/utils';
import { Config } from '../../types/config';
import { MenuItem } from '../../types/menu';
import SidebarMenu from '../SidebarMenu/SidebarMenu';

import { MENU } from '../menus/menu';

export interface SidebarProps {
    authState: AuthenticationState;
    config: Config;
}

interface SidebarState {
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
            return !requiresAuth;
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
