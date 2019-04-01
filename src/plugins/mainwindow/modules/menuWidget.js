define([
    'knockout',
    'kb_lib/html',
    './components/hamburgerMenu',
    'bootstrap'
], function (
    ko,
    html,
    HamburgerMenuComponent
) {
    'use strict';

    const t = html.tag,
        div = t('div');

    function intersect(a1, a2) {
        return a1.some(function (a) {
            return a2.indexOf(a) >= 0;
        });
    }

    class ViewModel {
        constructor(params) {
            this.runtime = params.runtime;
            this.menuDefinition = this.runtime.service('menu').getCurrentMenu('hamburger');
            this.isLoggedIn = ko.observable();
            this.userRoles = ko.observableArray();

            // TODO: can this just be a more generic change in session state?
            this.runtime.recv('session', 'change', () => {
                this.syncMenu();
            });

            var allowedTags = this.runtime.config('ui.allow', []);

            this.menu = {
                main: ko.observableArray(this.menuDefinition.main).filter((item) => {
                    if (!this.isLoggedIn() && item.authRequired) {
                        return false;
                    }
                    if (item.allow) {
                        return intersect(item.allow, allowedTags);
                    }
                    if (item.allowRoles) {
                        return intersect(item.allowRoles, this.userRoles);
                    }
                    return true;
                }),
                developer: ko.observableArray(this.menuDefinition.developer).filter((item) => {
                    if (!this.isLoggedIn() && item.authRequired) {
                        return false;
                    }
                    if (item.allow) {
                        return intersect(item.allow, allowedTags);
                    }
                    if (item.allowRoles) {
                        return intersect(item.allowRoles, this.userRoles);
                    }
                    return true;
                }),
                help: ko.observableArray(this.menuDefinition.help).filter((item) => {
                    if (!this.isLoggedIn() && item.authRequired) {
                        return false;
                    }
                    if (item.allow) {
                        return intersect(item.allow, allowedTags);
                    }
                    if (item.allowRoles) {
                        return intersect(item.allowRoles, this.userRoles);
                    }
                    return true;
                })
            };

            this.syncMenu();
        }

        syncMenu() {
            this.isLoggedIn(this.runtime.service('session').isLoggedIn());
            this.userRoles(this.runtime.service('session').getRoles().map((role) => {
                return role.id;
            }));
        }
    }

    class MenuWidget {
        constructor(config) {
            this.runtime = config.runtime;

            this.hostNode = null;
            this.container = null;
            this.viewModel = new ViewModel({runtime: this.runtime});
        }

        attach(node) {
            this.hostNode = node;
            this.container = this.hostNode.appendChild(document.createElement('div'));
            this.container.classList.add('widget-menu');
        }

        start() {
            this.container.innerHTML = div({
                dataBind: {
                    component: {
                        name: HamburgerMenuComponent.quotedName(),
                        params: {
                            menu: 'menu'
                        }
                    }
                }
            });

            ko.applyBindings(this.viewModel, this.container);
        }

        detach() {
            if (this.hostNode && this.container) {
                this.container.removeChild(this.hostNode);
            }
        }
    }

    return {Widget: MenuWidget};
});




