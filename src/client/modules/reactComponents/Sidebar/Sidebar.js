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
    'use strict';

    const {h, Component } = preact;
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

            this.state = {
                data: {
                    menu: this.getMenu()
                }
            };
        }

        componentDidMount() {
            this.props.runtime.receive('session', 'change', () => {
                this.setState({
                    data: {
                        menu: this.getMenu()
                    }
                });
            });

            this.props.runtime.receive('route', 'routing', (route) => {
                const path = routeToPath(route);
                this.setState({
                    data: {
                        menu: this.getMenu(path)
                    }
                });
            });
        }

        getMenu(selectedItemPath) {
            const allowedTags = this.props.runtime.config('ui.allow', []);
            const isLoggedIn = this.props.runtime.service('session').isLoggedIn();
            const sidebarMenu =  this.props.runtime.service('menu').getCurrentMenu('sidebar');

            // console.log('SIDEBAR MENU?', this.props.runtime.service('menu').getCurrentMenu('sidebar'));

            return sidebarMenu.main
                .filter((item) => {
                    if (!isLoggedIn && item.authRequired) {
                        return false;
                    }
                    if (item.allow) {
                        if (!intersect(item.allow, allowedTags)) {
                            return false;
                        }
                    }
                    return true;
                })
                .map((button) => {
                    const isActive = (selectedItemPath && selectedItemPath === button.path) ? true : false;
                    return {
                        id: button.id,
                        label: button.label,
                        icon: button.icon,
                        path: button.path,
                        authRequired: button.authRequired ? true : false,
                        isActive,
                        allow: button.allow,
                        beta: button.beta
                    };
                });
        }

        render() {
            if (!this.state.data.menu) {
                return;
            }
            const props = {
                menu: this.state.data.menu
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