import { Component } from 'react';
import {
    AuthenticationState,
    AuthenticationStateAuthenticated,
    AuthenticationStatus
} from '../../contexts/Auth';
import { arraysIntersect } from '../../lib/utils';
import { Config, HamburgerMenuDefintion } from '../../types/config';
import { Menu, MenuItem } from '../../types/menu';
import HamburgerMenu from './HamburgerMenu';
import HamburgerMenuLogo from './HamburgerMenuLogo';

import { MENU } from '../menus/menu';

const menuDefinition: HamburgerMenuDefintion = {
    narrative: {
        items: MENU.hamburger.narrative.map((item) => {
            return MENU.itemsMap.get(item)!
        })
    },
    search: {
        items: MENU.hamburger.search.map((item) => {
            return MENU.itemsMap.get(item)!
        })
    },
    developer: {
        items: MENU.hamburger.developer.map((item) => {
            return MENU.itemsMap.get(item)!
        })
    },
    help: {
        items: MENU.hamburger.help.map((item) => {
            return MENU.itemsMap.get(item)!
        })
    },
}

export interface HamburgerMenuMainProps {
    authState: AuthenticationState;
    config: Config;
}

interface HamburgerMenuMainState { }

export default class HamburgerMenuMain extends Component<
    HamburgerMenuMainProps,
    HamburgerMenuMainState
> {
    constructor(props: HamburgerMenuMainProps) {
        super(props);
        this.state = {
            isLoaded: true,
        };
    }

    renderAuthenticated(authState: AuthenticationStateAuthenticated) {
        const userRoles: Array<string> = authState.authInfo.account.roles.map(
            (role) => {
                return role.id;
            }
        );

        const filterMenu = (menu: Menu) => {
            const allowedTags = this.props.config.ui.allow;
            return menu.items.filter((item: MenuItem) => {
                if (item.allowedTags) {
                    return arraysIntersect(item.allowedTags, allowedTags);
                }
                if (item.allowedRoles) {
                    return arraysIntersect(item.allowedRoles, userRoles);
                }
                return true;
            });
        };

        const menu = {
            narrative: filterMenu(menuDefinition.narrative),
            search: filterMenu(menuDefinition.search),
            developer: filterMenu(menuDefinition.developer),
            help: filterMenu(menuDefinition.help),
        };

        if (this.props.config.ui.defaults.integratedHamburgerAndLogo) {
            return <HamburgerMenuLogo menu={menu} />;
        }

        return <HamburgerMenu menu={menu} />;
    }

    renderUnauthenticated() {
        const allowedTags = this.props.config.ui.allow;

        const filterMenu = (menu: Menu) => {
            return menu.items.filter((item: MenuItem) => {
                if (item.requiresAuth) {
                    return false;
                }
                if (item.allowedTags) {
                    return arraysIntersect(item.allowedTags, allowedTags);
                }
                return true;
            });
        };

        const menu = {
            narrative: filterMenu(menuDefinition.narrative),
            search: filterMenu(menuDefinition.search),
            developer: filterMenu(menuDefinition.developer),
            help: filterMenu(menuDefinition.help),
        };

        return <HamburgerMenu menu={menu} />;
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
