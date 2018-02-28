define([
    'bluebird',
    'knockout-plus',
    'kb_common/html',
    './components/sidebarMenu'
], function (
    Promise,
    ko,
    html,
    SidebarMenuComponent
) {
    'use strict'; 
    
    var t = html.tag,
        div = t('div');

    function factory(config) {
        var hostNode, container, runtime = config.runtime;

        function attach(node) {
            hostNode = node;
            container = hostNode;
        }

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

        function viewModel(params) {
            var initiallyLoggedIn = runtime.service('session').isLoggedIn();
            var isLoggedIn = ko.observable(initiallyLoggedIn);
            // var username = ko.ovservable(runtime.service('session').getUsername());

            // A session state change may signal that the session has been logged 
            // out. 
            runtime.recv('session', 'change', function () {
                isLoggedIn(runtime.service('session').isLoggedIn());
            });

            var allowedTags = runtime.config('ui.allow', []);

            var buttons = ko.observableArray();
            var buttonsMap = {};
            var buttonsPathMap = {};

            params.buttons.forEach(function (button) {
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
                buttons.push(viewButton);
                buttonsMap[viewButton.id] = viewButton;
                buttonsPathMap[viewButton.path] = viewButton;
            });

            // weird, the filter doesn't work with elements added via push if the push is 
            // invoked after the filter is attached.
            // TODO: look for a fix, or switch to the Sanderson projections.
            var filteredButtons = buttons.filter(function (item) {
                if (!isLoggedIn() && item.authRequired) {
                    return false;
                }
                if (item.allow) {
                    if (!intersect(item.allow, allowedTags)) {
                        return false;
                    }
                }
                return true;
            });

            function selectButton(route) {
                buttons().forEach(function (button) {
                    button.active(false);
                });
                var path = routeToPath(route);
                var button = buttonsPathMap[path];
                if (!button) {
                    return; 
                }
                button.active(true);
            }

            runtime.recv('route', 'routing', function (route) {
                selectButton(route);
            });

            var isAuthorized = ko.observable(runtime.service('session').isLoggedIn());

            // TODO: rethink this!!!
            runtime.recv('session', 'change', function () {
                isAuthorized(runtime.service('session').isLoggedIn());
            });

            return {
                buttons: filteredButtons,
                selecteButton: selectButton,
                isAuthorized: isAuthorized            
            };
        }

        function start() {

            // new component.
            container.innerHTML = div({
                dataBind: {
                    component: {
                        name: SidebarMenuComponent.quotedName(),
                        params: {
                            buttons: 'buttons',
                            isAuthorized: 'isAuthorized'
                        }
                    }
                }
            });
            var sidebarMenu = runtime.service('menu').getCurrentMenu('sidebar');
            var vm = viewModel({
                buttons: sidebarMenu.main,
            });
            ko.applyBindings(vm, container);
        }

        function stop() {
            return null;
        }

        function detach() {
            // if (hostNode && container) {
            //     hostNode.removeChild(container);
            // }
            if (hostNode) {
                hostNode.innerHTML = '';
            }
        }

        return {
            attach: attach,
            start: start,
            stop: stop,
            detach: detach
        };
    }

    return {
        make: function (config) {
            return factory(config);
        }
    };
});
