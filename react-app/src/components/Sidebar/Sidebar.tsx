import {Component} from 'react';
import {arraysIntersect} from '../../lib/utils';
// import { FeedsNotification } from '../../services/feeds';
import {Config} from '../../types/config';
import {Menu, MenuItem} from '../../types/menu';
import {AuthenticationState, AuthenticationStateAuthenticated, AuthenticationStatus,} from '../../contexts/Auth';
import SidebarMenu from '../SidebarMenu/SidebarMenu';
import './Sidebar.css';

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
    constructor(props: SidebarProps) {
        super(props);

        // this.menuService = this.props.runtime.service('menu');
        const path = document.location.hash.substring(1).replace(/^\/+/, '');
        this.state = {
            // path: null,
            // menu: this.computeMenu(),
            // feedStatus: null,
            path,
        };

        // this.menuService.onChange(() => {
        //     this.setState({
        //         menu: this.computeMenu(this.state.path)
        //     });
        // });
    }

    componentDidMount() {
        //     this.props.runtime.receive('session', 'change', () => {
        //         this.setState({
        //             menu: this.computeMenu(this.state.path)
        //         });
        //     });

        //     this.props.runtime.receive('route', 'routing', (route) => {
        //         const path = routeToPath(route);
        //         this.setState({
        //             path,
        //             menu: this.computeMenu(path)
        //         });
        //     });
        window.addEventListener('hashchange', (ev: Event) => {
            const path = document.location.hash
                .substring(1)
                .replace(/^\/+/, '');
            this.setState({
                path,
            });
        });
        // window.onhashchange((ev: Event) => {

        // })
    }

    // computeMenu(selectedItemPath) {
    //     const allowedTags = this.props.runtime.config('ui.allow', []);
    //     const isLoggedIn = this.props.runtime.service('session').isLoggedIn();
    //     const userRoles = this.props.runtime.service('session').getRoles().map((role) => {
    //         return role.id;
    //     });

    //     const sidebarMenu = this.menuService.getSidebarMenu();

    //     const filterMenu = (menu) => {
    //         return menu.filter((item) => {
    //             if (!isLoggedIn && item.auth) {
    //                 return false;
    //             }
    //             if (item.allow) {
    //                 return arraysIntersect(item.allow, allowedTags);
    //             }
    //             if (item.allowRoles) {
    //                 return arraysIntersect(item.allowRoles, userRoles);
    //             }
    //             return true;
    //         });
    //     };

    //     return filterMenu(sidebarMenu.main)
    //         .map((menuItem) => {
    //             const isActive = (selectedItemPath && selectedItemPath === menuItem.path) ? true : false;
    //             return {
    //                 id: menuItem.name,
    //                 name: menuItem.name,
    //                 label: menuItem.label,
    //                 tooltip: menuItem.tooltip,
    //                 icon: menuItem.icon,
    //                 path: menuItem.path,
    //                 authRequired: menuItem.authRequired ? true : false,
    //                 isActive,
    //                 allow: menuItem.allow,
    //                 beta: menuItem.beta
    //             };
    //         });
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

        const menu = filterMenu(this.props.config.ui.menus.sidebar);

        return <SidebarMenu menu={menu} path={this.state.path}/>;
    }

    renderUnauthenticated() {
        const menu = this.props.config.ui.menus.sidebar.items.filter(
            (item: MenuItem) => {
                return item.requiresAuth !== true;
            }
        );

        return <SidebarMenu menu={menu} path={this.state.path}/>;
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
