define([
    'preact',
    'htm',
    '../SidebarMenu/SidebarMenu',
    'css!./Sidebar.css'
], (
    preact,
    htm,
    SidebarMenu
) => {

    const {h, Component} = preact;
    const html = htm.bind(h);

    function intersect(a1, a2) {
        return a1.some(function (a) {
            return a2.indexOf(a) >= 0;
        });
    }

    function routeToPath(route) {
        const path = [];
        if (route.route.path) {
            for (let i = 0; i < route.route.path.length; i += 1) {
                const pathElement = route.route.path[i];
                if (pathElement.type !== 'literal') {
                    break;
                }
                path.push(pathElement.value);
            }
        }
        return path.join('/');
    }

    class Sidebar extends Component {
        constructor(props) {
            super(props);

            this.menuService = this.props.runtime.service('menu');

            this.state = {
                menu: this.computeMenu()
            };

            this.menuService.onChange(() => {
                this.setState({
                    menu: this.computeMenu()
                });
            });
        }

        componentDidMount() {
            this.props.runtime.receive('session', 'change', () => {
                this.setState({
                    menu: this.computeMenu()
                });
            });

            this.props.runtime.receive('route', 'routing', (route) => {
                const path = routeToPath(route);
                this.setState({
                    menu: this.computeMenu(path)
                });
            });
        }

        // computeMenu() {
        //     const sidebarMenu = this.menuService.getSidebarMenu();
        //     const allowedTags = this.props.runtime.config('ui.allow', []);
        //     const isLoggedIn = this.props.runtime.service('session').isLoggedIn();
        //     const userRoles = this.props.runtime.service('session').getRoles().map((role) => {
        //         return role.id;
        //     });

        //     const filterMenu = (menu) => {
        //         return menu.filter((item) => {
        //             if (!isLoggedIn && item.authRequired) {
        //                 return false;
        //             }
        //             if (item.allow) {
        //                 return intersect(item.allow, allowedTags);
        //             }
        //             if (item.allowRoles) {
        //                 return intersect(item.allowRoles, userRoles);
        //             }
        //             return true;
        //         });
        //     };



        //     return {
        //         main: filterMenu(sidebarMenu.main)
        //     };
        // }

        computeMenu(selectedItemPath) {
            const allowedTags = this.props.runtime.config('ui.allow', []);
            const isLoggedIn = this.props.runtime.service('session').isLoggedIn();
            const userRoles = this.props.runtime.service('session').getRoles().map((role) => {
                return role.id;
            });

            const sidebarMenu = this.menuService.getSidebarMenu();
            // const sidebarMenu =  this.props.runtime.service('menu').getCurrentMenu('sidebar');

            const filterMenu = (menu) => {
                return menu.filter((item) => {
                    if (!isLoggedIn && item.auth) {
                        return false;
                    }
                    if (item.allow) {
                        return intersect(item.allow, allowedTags);
                    }
                    if (item.allowRoles) {
                        return intersect(item.allowRoles, userRoles);
                    }
                    return true;
                });
            };

            return filterMenu(sidebarMenu.main)
                .map((menuItem) => {
                    const isActive = (selectedItemPath && selectedItemPath === menuItem.path) ? true : false;
                    return {
                        id: menuItem.id,
                        label: menuItem.label,
                        icon: menuItem.icon,
                        path: menuItem.path,
                        authRequired: menuItem.authRequired ? true : false,
                        isActive,
                        allow: menuItem.allow,
                        beta: menuItem.beta
                    };
                });
        }

        render() {
            if (!this.state.menu) {
                return;
            }
            const props = {
                menu: this.state.menu,
                runtime: this.props.runtime
            };
            return html`
                <div className="Sidebar"
                     data-k-b-testhook-component="sidebar">
                     <${SidebarMenu} ...${props} />
                </div>
            `;
        }
    }

    return Sidebar;
});