/* global Promise*/
define([
    'kb_common/html'
], function (
    html
) {
    var t = html.tag,
        div = t('div'),
        a = t('a'),
        span = t('span');

    function buildNavStripButton(cfg) {
        var icon = 'fa-' + cfg.icon;
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
                textDecoration: 'none'
            }
        }, [
            div({
                class: 'fa fa-3x ' + icon
            }),
            div({}, cfg.label)
        ]);
    }



    function factory(config) {
        var hostNode, container, runtime = config.runtime;

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
        }, {
            icon: 'database',
            label: 'Import',
            path: 'bulk-ui',
            authRequired: true
        }, {
            //icon: 'user',
            icon: 'gear',
            label: 'Settings',
            path: 'auth2/account',
            authRequired: true
        }];

        function buildNavStrip(buttons) {
            var loggedIn = runtime.service('session').isLoggedIn();
            return div({}, buttons
                .filter(function (button) {
                    if (button.authRequired && !loggedIn) {
                        return false;
                    }
                    return true;
                })
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
            container = hostNode.appendChild(document.createElement('div'));
        }

        function start(params) {
            return Promise.try(function () {
                render();

                window.addEventListener('hashchange', function () {
                    var hash = window.location.hash;
                    if (!hash || hash.length === 0) {
                        return;
                    }
                    var path = hash.substr(1);
                    buttons.forEach(function (button) {
                        var buttonNode = document.getElementById(button.id);
                        var pathPrefix = path.substr(0, button.path.length);
                        if (pathPrefix === button.path) {
                            buttonNode.classList.add('-active');
                        } else {
                            buttonNode.classList.remove('-active');
                        }

                    });
                });

                runtime.recv('session', 'change', function (message) {
                    render();
                    // console.log('changed', message);
                });
            });
        }

        function stop() {
            return null;
        }

        function detach() {
            if (hostNode && container) {
                hostNode.removeChild(container);
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