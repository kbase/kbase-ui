define([
    'lib/feeds',
    'kb_lib/lang'
], (
    feeds,
    lang
) => {
    'use strict';

    class FeedsService {
        constructor({ config, params }) {
            this.runtime = params.runtime;

            this.monitoringInterval = 10000;
            this.monitorRunning = false;
            this.monitoringRunCount = 0;
            this.monitoringErrorCount = 0;
        }

        start() {
            // if logged in, populate and start monitoring for feeds notifications
            if (this.runtime.service('session').getAuthToken()) {
                return this.startupFeedsMonitoring();
            } else {
                console.warn('session not authorized, not ');
            }

            // console.log('HERE', this.runtime.service('session').getAuthToken());

            // listen for login and out events...
            this.runtime.receive('session', 'loggedin', () => {
                console.log('logged in, starting notifications listener...');
                this.startFeedsMonitoring();
            });

            this.runtime.receive('session', 'loggedout', () => {
                console.log('logged out, stopping notifications listener...');
                this.stopFeedsMonitoring();
            });

            this.runtime.db().set('feeds', {
                notifications: null,
                error: null
            });

            // just for kicks, this certainly doesn't live here!
            // this.runtime.db().subscribe({
            //     path: 'feeds'
            // }, (feeds) => {
            //     console.log('notifications change detected...', feeds);
            // });

        }

        stop() {
            return;
        }

        startFeedsMonitoring() {
            this.monitorRunning = true;
            this.monitoringLoop();
            // this.feedsClient = new feeds.FeedsClient({
            //     url: this.runtime.config('services.Feeds.url'),
            //     token: this.runtime.service('session').getAuthToken()
            // });

            // return this.feedsClient.getNotifications()
            //     .then((notifications) => {
            //         console.log('got notifications!', notifications);
            //         // this.monitoringTimer = window.setTimeout
            //     });

        }

        monitoringLoop() {
            if (this.monitoringTimer) {
                return;
            }

            const monitoringJob = () => {
                // const start = new Date().getTime();
                const feedsClient = new feeds.FeedsClient({
                    url: this.runtime.config('services.Feeds.url'),
                    token: this.runtime.service('session').getAuthToken()
                });
                return feedsClient.getNotifications()
                    .then((notifications) => {
                        // console.log('check notifications', new Date().getTime() - start, notifications);

                        // are notifications different than the last time?
                        const currentNotifications = this.runtime.db().get('feeds.notifications');
                        // only way is a deep equality comparison

                        if (lang.isEqual(currentNotifications, notifications)) {
                            return;
                        }

                        // console.log('setting notifications', currentNotifications, notifications);
                        this.runtime.db().set('feeds', {
                            notifications: notifications,
                            error: null
                        });

                        return notifications;
                    })
                    .catch((err) => {
                        // console.error('ERROR', err.message);
                        this.runtime.db().set('feeds', {
                            error: err.message
                        });
                    });
            };

            const loop = () => {
                this.monitoringTimer = window.setTimeout(() => {
                    // console.log('feeds monitoring job loop', this.monitoringRunCount, this.monitoringErrorCount);
                    monitoringJob()
                        .then(() => {
                            this.monitoringRunCount += 1;
                            if (this.monitorRunning) {
                                loop();
                            }
                        })
                        .catch((err) => {
                            this.monitoringErrorCount += 1;
                            console.error('ERROR', err);
                        });
                }, this.monitoringInterval);
            };

            monitoringJob()
                .then(() => {
                    loop();
                })
                .catch((err) => {
                    console.error('Errer');
                });
        }

        stopFeedsMonitoring() {
            this.monitorRunning = true;
            window.clearTimeout(this.monitoringTimer);
            this.monitoringTimer = null;
        }

        pluginHandler(widgetsConfig, pluginConfig) {

        }

        // PUBLIC api

    }

    return { ServiceClass: FeedsService };
});