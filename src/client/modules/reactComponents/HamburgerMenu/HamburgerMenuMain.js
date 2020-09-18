define([
    'preact',
    'htm',
    './HamburgerMenu'
], (
    preact,
    htm,
    HamburgerMenu
) => {

    const {h, Component } = preact;
    const html = htm.bind(h);


    function intersect(a1, a2) {
        return a1.some(function (a) {
            return a2.indexOf(a) >= 0;
        });
    }

    class DataSource {
        constructor(params) {
            this.runtime = params.runtime;
            this.menuDefinition = this.runtime.service('menu').getCurrentMenu('hamburger');
            this.onUpdate = params.onUpdate;

            // TODO: can this just be a more generic change in session state?
            this.runtime.receive('session', 'change', () => {
                this.update();
            });
        }

        update() {
            this.onUpdate(this.computeMenu());
        }

        computeMenu() {
            const allowedTags = this.runtime.config('ui.allow', []);
            const isLoggedIn = this.runtime.service('session').isLoggedIn();
            const userRoles = this.runtime.service('session').getRoles().map((role) => {
                return role.id;
            });

            return {
                main: this.menuDefinition.main.filter((item) => {
                    if (!isLoggedIn && item.authRequired) {
                        return false;
                    }
                    if (item.allow) {
                        return intersect(item.allow, allowedTags);
                    }
                    if (item.allowRoles) {
                        return intersect(item.allowRoles, userRoles);
                    }
                    return true;
                }),
                developer: this.menuDefinition.developer.filter((item) => {
                    if (!isLoggedIn && item.authRequired) {
                        return false;
                    }
                    if (item.allow) {
                        return intersect(item.allow, allowedTags);
                    }
                    if (item.allowRoles) {
                        return intersect(item.allowRoles, userRoles);
                    }
                    return true;
                }),
                help: this.menuDefinition.help.filter((item) => {
                    if (!isLoggedIn && item.authRequired) {
                        return false;
                    }
                    if (item.allow) {
                        return intersect(item.allow, allowedTags);
                    }
                    if (item.allowRoles) {
                        return intersect(item.allowRoles, userRoles);
                    }
                    return true;
                })
            };
        }
    }

    class Menu extends Component {
        constructor(props) {
            super(props);
            this.state = {
                isLoaded: false,
                data: null
            };
            this.dataSource = new DataSource({
                runtime: this.props.runtime,
                onUpdate: this.onMenuUpdate.bind(this)
            });
        }

        componentDidMount() {
            this.dataSource.update();
        }

        onMenuUpdate(menu) {
            this.setState({
                isLoaded: true,
                data: {
                    menu
                }
            });
        }

        render() {
            if (this.state.isLoaded) {
                return html`
                    <${HamburgerMenu} ...${this.state.data} />
                `;
            }
            return;
        }
    }

    return Menu;
});