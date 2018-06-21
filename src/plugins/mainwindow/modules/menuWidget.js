define([
    'knockout-plus',
    'kb_common/html',
    './components/hamburgerMenu',
    'bootstrap'
], function (
    ko,
    html,
    HamburgerMenuComponent
) {
    'use strict';

    function factory(config) {
        var t = html.tag,
            div = t('div'),
            runtime = config.runtime,
            hostNode, container;

        function intersect(a1, a2) {
            return a1.some(function (a) {
                return a2.indexOf(a) >= 0;
            });
        }

        function attach(node) {
            hostNode = node;
            container = hostNode.appendChild(document.createElement('div'));
            container.classList.add('widget-menu');
        }

        function ViewModel() {
            var menu = runtime.service('menu').getCurrentMenu('hamburger');
            var initiallyLoggedIn = runtime.service('session').isLoggedIn();
            var isLoggedIn = ko.observable(initiallyLoggedIn);
            var userRoles = ko.observableArray(runtime.service('session').getRoles().map((role) => {
                return role.id;
            }));
            // var username = ko.ovservable(runtime.service('session').getUsername());

            // TODO: can this just be a more generic change in session state?
            runtime.recv('session', 'change', function () {
                isLoggedIn(runtime.service('session').isLoggedIn());
                userRoles(runtime.service('session').getRoles().map((role) => {
                    return role.id;
                }));
            });

            var allowedTags = runtime.config('ui.allow', []);

            var menus = {
                main: ko.observableArray(menu.main).filter(function (item) {
                    if (!isLoggedIn() && item.authRequired) {
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
                developer: ko.observableArray(menu.developer).filter(function (item) {
                    if (!isLoggedIn() && item.authRequired) {
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
                help: ko.observableArray(menu.help).filter(function (item) {
                    if (!isLoggedIn() && item.authRequired) {
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

            return {
                menu: menus,
                isLoggedIn: isLoggedIn
            };
        }

        var viewModel = ViewModel();

        function start() {
            container.innerHTML = div({
                dataBind: {
                    component: {
                        name: HamburgerMenuComponent.quotedName(),
                        params: {
                            menu: 'menu'
                        }
                    }
                }
            });

            ko.applyBindings(viewModel, container);
        }

        function detach() {
            if (hostNode && container) {
                container.removeChild(hostNode);
            }
        }

        return {
            attach: attach,
            start: start,
            detach: detach
        };
    }

    return {
        make: factory
    };
});
