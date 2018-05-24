define([
    'knockout',
    'kb_common/html',
    'lib/rpc',
    'kb_lib/poller',
    './components/systemAlertBanner',
    'bootstrap'
], function (
    ko,
    html,
    RPC,
    poller,
    SystemAlertBannerComponent
) {
    'use strict';

    function factory(config) {
        let t = html.tag,
            div = t('div'),
            runtime = config.runtime,
            hostNode, container;

        let newAlertsPoller;

        function getActiveAlerts() {
            let rpc = new RPC({
                runtime: runtime
            });

            return rpc.call('UIService', 'get_active_alerts', [])
                .spread((result) => {
                    return result;
                });
        }

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
                // return runtime.service('data').getJson({
                //     path:'notifications',
                //     file: 'systemStatus'
                // })
                return getActiveAlerts()
                    .then((data) => {
                        let systemStatus = {
                            upcomingMaintenanceWindows: data
                        };
                        vm.systemStatus(systemStatus);
                        vm.error(null);
                    })
                    .catch((err) => {
                        console.error('ERROR', err);
                        vm.systemStatus(null);
                        vm.error(err.message);
                        throw err;
                    });
            }
            // loadNotifications();

            // poll for changes
            // newAlertsPoller = new poller.makePoller({
            //     fun: () => {
            //         loadNotifications();
            //     },
            //     description: 'Load notifications',
            //     interval: 10000
            // });
            
            // newAlertsPoller.start();
            class LoadNotificationsJob extends poller.Job {
                constructor() {
                    super({
                        description: 'Load notifications'
                    });
                }
                run() {
                    return loadNotifications();
                }
            }
            let job = new LoadNotificationsJob();
            // let job = new poller.Job({
            //     run: () => {
            //         return loadNotifications();
            //     },
            //     description: 'Load notifications'
            // });
            let task = new poller.Task({
                interval: 10000,
                runInitially: true 
            });
            task.addJob(job);

            newAlertsPoller = new poller.Poller();
            newAlertsPoller.addTask(task);
            newAlertsPoller.start();

            // function scheduleLoadNotifications() {
            //     timer = window.setTimeout(function () {
            //         loadNotifications();
            //         scheduleLoadNotifications();
            //     }, 10000);
            // }
            // scheduleLoadNotifications();


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
            if (newAlertsPoller) {
                return newAlertsPoller.stop();
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
