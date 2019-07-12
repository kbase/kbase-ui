define(['bluebird', 'knockout', 'kb_lib/html', './components/sidebarMenu'], function (
    Promise,
    ko,
    html,
    SidebarMenuComponent
) {
    'use strict';

    var t = html.tag,
        div = t('div');

    function routeToPath(route) {
        var path = [];
        var i;
        if (route.route.path) {
            for (i = 0; i < route.route.path.length; i += 1) {
                var pathElement = route.route.path[i];
                if (pathElement.type !== 'literal') {
                    break;
                }
                path.push(pathElement.value);
            }
        }
        return path.join('/');
    }

    function intersect(a1, a2) {
        return a1.some(function (a) {
            return a2.indexOf(a) >= 0;
        });
    }

    class ViewModel {
        constructor(params) {
            this.runtime = params.runtime;
            this.isLoggedIn = ko.observable(this.runtime.service('session').isLoggedIn());

            // A session state change may signal that the session has been logged
            // out.
            this.runtime.receive('session', 'change', () => {
                this.isLoggedIn(this.runtime.service('session').isLoggedIn());
            });

            const allowedTags = this.runtime.config('ui.allow', []);

            this.buttonsList = ko.observableArray();
            this.buttonsMap = {};
            this.buttonsPathMap = {};

            params.buttons.forEach((button) => {
                var viewButton = {
                    id: button.id,
                    label: button.label,
                    icon: button.icon,
                    path: button.path,
                    authRequired: button.authRequired ? true : false,
                    active: ko.observable(false),
                    allow: button.allow,
                    beta: button.beta
                };
                this.buttonsList.push(viewButton);
                this.buttonsMap[viewButton.id] = viewButton;
                this.buttonsPathMap[viewButton.path] = viewButton;
            });

            // weird, the filter doesn't work with elements added via push if the push is
            // invoked after the filter is attached.
            // TODO: look for a fix, or switch to the Sanderson projections.
            this.buttons = this.buttonsList.filter((item) => {
                if (!this.isLoggedIn() && item.authRequired) {
                    return false;
                }
                if (item.allow) {
                    if (!intersect(item.allow, allowedTags)) {
                        return false;
                    }
                }
                return true;
            });

            this.isAuthorized = ko.observable(this.runtime.service('session').isLoggedIn());

            // TODO: rethink this!!!
            this.runtime.receive('session', 'change', () => {
                this.isAuthorized(this.runtime.service('session').isLoggedIn());
            });

            this.runtime.receive('route', 'routing', (route) => {
                this.selectButton(route);
            });
        }

        selectButton(route) {
            this.buttons().forEach((button) => {
                button.active(false);
            });
            const path = routeToPath(route);
            const button = this.buttonsPathMap[path];
            if (!button) {
                return;
            }
            button.active(true);
        }
    }

    class SidebarNav {
        constructor(config) {
            this.runtime = config.runtime;

            this.hostNode = null;
            this.container = null;
        }

        attach(node) {
            this.hostNode = node;
            this.container = node;
        }

        start() {
            this.container.innerHTML = div({
                dataKBTesthookWidget: 'sidebarNav',
                dataBind: {
                    component: {
                        name: SidebarMenuComponent.quotedName(),
                        params: {
                            buttons: 'buttons',
                            isAuthorized: 'isAuthorized',
                            runtime: 'runtime'
                        }
                    }
                }
            });
            const sidebarMenu = this.runtime.service('menu').getCurrentMenu('sidebar');
            const vm = new ViewModel({
                buttons: sidebarMenu.main,
                runtime: this.runtime
            });
            ko.applyBindings(vm, this.container);
        }

        detach() {
            if (this.container) {
                this.container.innerHTML = '';
            }
        }
    }

    return { Widget: SidebarNav };
});
