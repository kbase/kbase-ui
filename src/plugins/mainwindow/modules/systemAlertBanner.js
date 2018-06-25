define([
    'knockout',
    'kb_common/html',
    'kb_lib/poller',
    './components/systemAlertBanner',
    'bootstrap'
], function (
    ko,
    html,
    poller,
    SystemAlertBannerComponent
) {
    'use strict';

    const t = html.tag,
        div = t('div');

    class LoadNotificationsJob extends poller.Job {
        constructor({callback}) {
            super({
                description: 'Load notifications'
            });
            this.callback = callback;
        }
        run() {
            return this.callback();
        }
    }

    class SystemAlertBanner {
        constructor(params) {
            this.runtime = params.runtime;

            this.hostNode = null;
            this.container = null;
            this.newAlertsPoller = null;
            this.newAlertsPoller = new poller.Poller();

            this.vm = {
                runtime: this.runtime,
                systemStatus: ko.observable(),
                error: ko.observable()
            };
        }

        getActiveAlerts() {
            const client = new this.runtime.service('rpc').makeClient({
                module: 'UIService'
            });

            return client.callFunc('get_active_alerts', [])
                .spread((result) => {
                    return result;
                });
        }

        loadNotifications() {
            return this.getActiveAlerts()
                .then((data) => {
                    const systemStatus = {
                        upcomingMaintenanceWindows: data
                    };
                    this.vm.systemStatus(systemStatus);
                    this.vm.error(null);
                })
                .catch((err) => {
                    console.error('ERROR', err);
                    this.vm.systemStatus(null);
                    this.vm.error(err.message);
                    throw err;
                });
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
                        name: SystemAlertBannerComponent.quotedName(),
                        params: {
                            systemStatus: 'systemStatus',
                            error: 'error'
                        }
                    }
                }
            });

            ko.applyBindings(this.vm, this.container);

            const job = new LoadNotificationsJob({
                callback: () => {
                    this.loadNotifications();
                }
            });

            const task = new poller.Task({
                interval: 10000,
                runInitially: true
            });
            task.addJob(job);

            this.newAlertsPoller.addTask(task);
            this.newAlertsPoller.start();

        }

        stop() {
            if (this.newAlertsPoller) {
                return this.newAlertsPoller.stop();
            }
        }

        detach() {
            if (this.hostNode && this.container) {
                this.container.removeChild(this.hostNode);
            }
        }
    }

    return {Widget: SystemAlertBanner};
});
