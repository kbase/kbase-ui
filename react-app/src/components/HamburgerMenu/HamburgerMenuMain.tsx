import { Component } from 'react';
import { arraysIntersect } from '../../lib/utils';
import { Config, HamburgerMenuDefintion } from '../../types/config';
import { Menu, MenuItem } from '../../types/menu';
import {
    AuthenticationState,
    AuthenticationStateAuthenticated,
    AuthenticationStatus,
} from '../../contexts/Auth';
import HamburgerMenu from './HamburgerMenuLogo';

export interface HamburgerMenuMainProps {
    authState: AuthenticationState;
    config: Config;
}

interface HamburgerMenuMainState { }

export default class HamburgerMenuMain extends Component<
    HamburgerMenuMainProps,
    HamburgerMenuMainState
> {
    menu: Menu | null;
    constructor(props: HamburgerMenuMainProps) {
        super(props);
        // this.menuService = this.props.runtime.service('menu');
        this.menu = null;

        this.state = {
            isLoaded: true,
            // menu: this.computeMenu(),
        };

        // TODO: dropping the message listener necessary?
        // after all, the hamburger menu lives for the lifetime of the
        // web app.
        // this.props.runtime.receive('session', 'change', () => {
        //     this.setState({
        //         menu: this.computeMenu(),
        //     });
        // });

        // this.menuService.onChange(() => {
        //     this.setState({
        //         menu: this.computeMenu()
        //     });
        // });
    }

    // componentDidMount() {
    //     this.computeMenu();
    // }

    // computeMenu() {
    //     // const hamburgerMenu = this.menuService.getHamburgerMenu();
    //     const allowedTags = this.props.config.ui.allow;
    //     const isLoggedIn =
    //         this.props.authState.status === AuthenticationStatus.AUTHENTICATED;

    //     const userRoles: Array<string> = (() => {
    //         if (
    //             this.props.authState.status ===
    //             AuthenticationStatus.AUTHENTICATED
    //         ) {
    //             return this.props.authState.authInfo.account.roles.map(
    //                 (role) => {
    //                     return role.id;
    //                 }
    //             );
    //         } else {
    //             return [];
    //         }
    //     })();

    //     const filterMenu = (menu: Menu) => {
    //         return menu.items.filter((item: MenuItem) => {
    //             if (!isLoggedIn && item.requiresAuth) {
    //                 return false;
    //             }
    //             if (item.allowedTags) {
    //                 return arraysIntersect(item.allowedTags, allowedTags);
    //             }
    //             if (item.allowedRoles) {
    //                 return arraysIntersect(item.allowedRoles, userRoles);
    //             }
    //             return true;
    //         });
    //     };

    //     const menu = this.props.config.ui.menus.hamburger;

    //     return {
    //         main: filterMenu(menu.main),
    //         developer: filterMenu(menu.developer),
    //         help: filterMenu(menu.help),
    //     };
    // }

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

        const menuDefinition = this.props.config.ui.menus.hamburger;

        const menu = {
            narrative: filterMenu(menuDefinition.narrative),
            search: filterMenu(menuDefinition.search),
            developer: filterMenu(menuDefinition.developer),
            help: filterMenu(menuDefinition.help),
        };

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

        const menuDefinition = this.props.config.ui.menus.hamburger;

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
