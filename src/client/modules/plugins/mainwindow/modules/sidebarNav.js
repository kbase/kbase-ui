define([
    'bluebird',
    'kb_common/html'
], function (
    Promise,
    html
) {
    'use strict'; 
    
    var t = html.tag,
        div = t('div'),
        a = t('a'),
        table = t('table'),
        tr = t('tr'),
        td = t('td');

    function buildNavStripButton(cfg) {
        var icon = 'fa-' + cfg.icon;
        var info;
        if (cfg.info) {
            info = table({
                style: {
                    margin: 0,
                    padding: 0,
                    width: '100%'
                }
            }, cfg.info.map(function (row) {
                return tr({}, [
                    td({
                        style: {
                            width: '50%',
                            textAlign: 'right',
                            paddingRight: '2px'
                        }
                    }, row.value),
                    td({
                        style: {
                            width: '50%',
                            textAlign: 'left',
                            paddingLeft: '2px'
                        }
                    }, row.label)
                ]);
            }));
        }
        var status;
        if (cfg.status) {
            status = div({
                class: '-status-indicator',
            }, String(cfg.status.new));
        }
        return a({
            href: '#' + cfg.path,
            class: '-nav-button',
            id: cfg.id,
            style: {
                width: '75px',
                textAlign: 'center',
                padding: '3px',
                margin: '6px 0',
                display: 'block',
                color: '#000',
                textDecoration: 'none',
                position: 'relative'
            }
        }, [
            div({
                class: 'fa fa-3x ' + icon,
            }),
            div({}, cfg.label),
            info,
            status
        ]);
    }

    function factory(config) {
        var hostNode, container, runtime = config.runtime;

        // TODO: this really needs to be in configuration!
        var buttons = [{
            icon: 'dashboard',
            label: 'Dashboard',
            path: 'dashboard',
            authRequired: true
        }, {
            icon: 'book',
            label: 'Catalog',
            path: 'appcatalog',
            authRequired: false
        }, (function () {
                if (!runtime.allow('alpha')) {
                    return;
                }
                return {
                    icon: 'search',
                    label: 'Search',
                    path: 'search',
                    authRequired: true
                };
            }()), (function () {
                if (!runtime.allow('alpha')) {
                    return;
                }
                return {
                    icon: 'suitcase',
                    label: 'Jobs',
                    path: 'jobbrowser',
                    authRequired: true
                };
            }()), {
            //icon: 'user',
                icon: 'user-circle-o',
                label: 'Account',
                path: 'auth2/account',
                authRequired: true
            }, (function () {
                if (!runtime.allow('alpha')) {
                    return;
                }
                return {
                    icon: 'bullhorn',
                    label: 'Feeds',
                    path: 'feeds',
                    authRequired: true,
                    status: {
                        new: 6
                    }
                // info: [{
                //     label: 'new',
                //     value: '3'
                // }]
                };
            }())].filter(function (item) {
            return item;
        });

        var currentButtons = [];
        var currentPath;

        function buildNavStrip(buttons) {
            var loggedIn = runtime.service('session').isLoggedIn();
            currentButtons = buttons
                .filter(function (button) {
                    if (button.authRequired && !loggedIn) {
                        return false;
                    }
                    return true;
                });
            return div({}, currentButtons
                .map(function (button) {
                    var id = html.genId();
                    button.id = id;
                    return buildNavStripButton(button);
                }));
        }

        function build(buttons) {
            return div({
                class: 'kb-mainWindow-sidebarNav',
                style: {
                    width: '75px'
                }
            }, buildNavStrip(buttons));
        }

        function render() {
            container.innerHTML = build(buttons);
        }

        function attach(node) {
            hostNode = node;
            container = hostNode;
        }

        function selectButton() {
            var path = currentPath;
            currentButtons.forEach(function (button) {
                var buttonNode = document.getElementById(button.id);
                //  var pathPrefix = path.substr(0, button.path.length);
                if (path === button.path) {
                    buttonNode.classList.add('-active');
                } else {
                    buttonNode.classList.remove('-active');
                }
            });
        }

        function setPath(route) {
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
            currentPath = path.join('/');
        }

        function start() {
            return Promise.try(function () {
                render();
                runtime.recv('route', 'routing', function (route) {
                    setPath(route);
                    // TODO: route.route.path contains the parsed route.
                    // we should use it. But the session change event needs
                    // to evaluate the path as
                    selectButton();
                });

                runtime.recv('session', 'change', function () {
                    render();
                    selectButton();
                });
            });
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
