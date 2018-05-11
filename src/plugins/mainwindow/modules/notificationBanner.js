define([
    'knockout',
    'kb_common/html',
    './components/systemAlertBanner',
    'bootstrap'
], function (
    ko,
    html,
    SystemAlertBannerComponent
) {
    'use strict';

    function factory(config) {
        var t = html.tag,
            div = t('div'),
            runtime = config.runtime,
            hostNode, container;

        var timer;

        function attach(node) {
            hostNode = node;
            container = hostNode.appendChild(document.createElement('div'));
            container.classList.add('widget-menu');         
        }

        function start() {
            let vm = {
                runtime: runtime,
                systemStatus: ko.observable(),
                error: ko.observable()
            };

            // load any notifications
            function loadNotifications() {
                return runtime.service('data').getJson({
                    path:'notifications',
                    file: 'systemStatus'
                })
                    .then((data) => {
                        vm.systemStatus(data);
                        vm.error(null);
                    })
                    .catch((err) => {
                        console.error('ERROR', err);
                        vm.systemStatus(null);
                        vm.error(err.message);
                    });
            }
            loadNotifications();

            // poll for changes
            function scheduleLoadNotifications() {
                timer = window.setTimeout(function () {
                    loadNotifications();
                    scheduleLoadNotifications();
                }, 10000);
            }
            scheduleLoadNotifications();


            container.innerHTML = div({
                dataBind: {
                    component: {
                        name: SystemAlertBannerComponent.quotedName(),
                        params: {
                            systemStatus: 'systemStatus',
                            error: 'error'
                        }
                    }
                }
            });

            ko.applyBindings(vm, container);
        }

        function stop() {
            if (timer) {
                window.clearTimeout(timer);
            }
        }

        function detach() {
            if (hostNode && container) {
                container.removeChild(hostNode);
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
        make: factory
    };
});
