define([
    'kb_lib/poller'
], function (
    poller
) {
    'use strict';

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

    class AlertsModel {
        constructor(params) {
            this.runtime = params.runtime;
            this.interval = params.updateInterval;

            this.newAlertsPoller = null;
            this.newAlertsPoller = new poller.Poller();

            this.updateListeners = [];

            // this.vm = {
            //     runtime: this.runtime,
            //     systemStatus: ko.observable(),
            //     error: ko.observable()
            // };
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
                    return {
                        upcomingMaintenanceWindows: data
                    };
                })
                .catch((err) => {
                    console.error('ERROR', err);
                    // this.vm.systemStatus(null);
                    // this.vm.error(err.message);
                    throw err;
                });
        }

        onUpdate(fun) {
            this.updateListeners.push({
                fun: fun
            });
        }

        // Lifecycle API

        start() {
            const job = new LoadNotificationsJob({
                callback: () => {
                    this.loadNotifications()
                        .then((alerts) => {
                            this.updateListeners.forEach((listener) => {
                                try {
                                    listener.fun(alerts, null);
                                } catch (ex) {
                                    console.error('Error running listener: ', ex);
                                    throw new Error('Error running listener: ' + ex.message);
                                }
                            });
                        })
                        .catch((error) => {
                            this.updateListeners.forEach((listener) => {
                                try {
                                    listener(null, error);
                                } catch (ex) {
                                    console.error('Error running listener: ', ex);
                                    // throw new Error('Error running listener: ' + ex.message);
                                }
                            });
                        });
                }
            });

            const task = new poller.Task({
                interval: this.interval,
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

    return {AlertsModel};
});