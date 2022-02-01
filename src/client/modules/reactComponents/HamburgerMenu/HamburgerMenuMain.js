define([
    'preact',
    'htm',
    './HamburgerMenu'
], (
    preact,
    htm,
    HamburgerMenu
) => {

    const {h, Component} = preact;
    const html = htm.bind(h);

    function intersect(a1, a2) {
        return a1.some((a) => {
            return a2.indexOf(a) >= 0;
        });
    }

    class Menu extends Component {
        constructor(props) {
            super(props);
            this.menuService = this.props.runtime.service('menu');
            this.menu = null;

            this.state = {
                isLoaded: true,
                menu: this.computeMenu()
            };

            // TODO: dropping the message listener necessary?
            // after all, the hamburger menu lives for the lifetime of the
            // web app.
            this.props.runtime.receive('session', 'change', () => {
                this.setState({
                    menu: this.computeMenu()
                });
            });

            this.menuService.onChange(() => {
                this.setState({
                    menu: this.computeMenu()
                });
            });
        }

        componentDidMount() {
            this.computeMenu();
        }

        computeMenu() {
            const hamburgerMenu = this.menuService.getHamburgerMenu();
            const allowedTags = this.props.runtime.config('ui.allow', []);
            const isLoggedIn = this.props.runtime.service('session').isLoggedIn();
            const userRoles = this.props.runtime.service('session').getRoles().map((role) => {
                return role.id;
            });

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

            return {
                main: filterMenu(hamburgerMenu.main),
                developer: filterMenu(hamburgerMenu.developer),
                help: filterMenu(hamburgerMenu.help)
            };
        }

        render() {
            if (this.state.isLoaded) {
                return html`
                    <${HamburgerMenu} ...${this.state} />
                `;
            }
            return;
        }
    }

    return Menu;
});
