define([
    'preact',
    'htm',
    './reactComponents/HamburgerMenu/HamburgerMenu'
], function (
    preact,
    htm,
    HamburgerMenuComponent
) {
    'use strict';

    const {h, render} = preact;
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

    class MenuWidget {
        constructor(config) {
            this.runtime = config.runtime;

            this.hostNode = null;
            this.container = null;
            this.dataSource = new DataSource({
                runtime: this.runtime,
                onUpdate: this.renderMenu.bind(this)});
        }

        attach(node) {
            this.hostNode = node;
            this.container = this.hostNode.appendChild(document.createElement('div'));
            this.container.classList.add('widget-menu');
        }

        renderMenu(menu) {
            const params = {
                menu
            };
            const content = html`<${HamburgerMenuComponent} ...${params} />`;
            render(content, this.container);
        }

        start() {
            this.dataSource.update();
        }

        detach() {
            if (this.hostNode && this.container) {
                this.container.removeChild(this.hostNode);
            }
        }
    }

    return { Widget: MenuWidget };
});
