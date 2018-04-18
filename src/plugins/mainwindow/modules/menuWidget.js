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


        function attach(node) {
            hostNode = node;
            container = hostNode.appendChild(document.createElement('div'));
            container.classList.add('widget-menu');
        }

        function ViewModel() {
            var menu = runtime.service('menu').getCurrentMenu('hamburger');
            var initiallyLoggedIn = runtime.service('session').isLoggedIn();
            var isLoggedIn = ko.observable(initiallyLoggedIn);
            var roles = runtime.service('session').getRoles().map((role) => {
                return role.id;
            });
            // var username = ko.ovservable(runtime.service('session').getUsername());

            // TODO: can this just be a more generic change in session state?
            runtime.recv('session', 'change', function () {
                isLoggedIn(runtime.service('session').isLoggedIn());
            });

            var menus = {
                main: ko.observableArray(menu.main).filter(function (item) {
                    if (!isLoggedIn() && item.authRequired) {
                        return false;
                    }
                    if (item.allowRoles) {
                        if (!item.allowRoles.some((allowedRole) => {
                            return roles.indexOf(allowedRole) >= 0;
                        })) {
                            return false;
                        }
                    }
                        
                    return true;
                }),
                developer: ko.observableArray(menu.developer).filter(function (item) {
                    if (!isLoggedIn() && item.authRequired) {
                        return false;
                    }
                    if (item.allowRoles) {
                        if (!item.allowRoles.some((allowedRole) => {
                            return roles.indexOf(allowedRole) >= 0;
                        })) {
                            return false;
                        }
                    }
                    return true;
                }),
                help: ko.observableArray(menu.help).filter(function (item) {
                    if (!isLoggedIn() && item.authRequired) {
                        return false;
                    }
                    if (item.allowRoles) {
                        if (!item.allowRoles.some((allowedRole) => {
                            return roles.indexOf(allowedRole) >= 0;
                        })) {
                            return false;
                        }
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
