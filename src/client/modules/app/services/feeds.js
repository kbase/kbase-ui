define([
    'lib/feeds'
], (
    feeds
) => {

    const MONITORING_INTERVAL = 10000;

    class FeedsService {
        constructor({ params: {runtime} }) {
            this.runtime = runtime;

            // TODO: move to service config.
            this.monitoringInterval = MONITORING_INTERVAL;

            this.monitorRunning = false;
            this.monitoringRunCount = 0;
            this.monitoringErrorCount = 0;

            this.disabled = this.runtime.config('ui.coreServices.disabled', []).includes('Feeds');
        }

        start() {
            this.runtime.db().set('feeds', {
                notifications: null,
                error: null
            });

            if (this.disabled) {
                console.warn('Feeds service disabled; skipping monitoring hooks');
                return;
            }

            // if logged in, populate and start monitoring for feeds notifications
            if (this.runtime.service('session').getAuthToken()) {
                return this.startupFeedsMonitoring();
            }

            // listen for login and out events...
            this.runtime.receive('session', 'loggedin', () => {
                this.startFeedsMonitoring();
            });

            this.runtime.receive('session', 'loggedout', () => {
                this.stopFeedsMonitoring();
            });

            return Promise.resolve();
        }

        stop() {
            return Promise.resolve();
        }

        startFeedsMonitoring() {
            this.monitorRunning = true;
            this.monitoringLoop();
        }

        monitoringLoop() {
            if (this.monitoringTimer) {
                return;
            }

            const monitoringJob = () => {
                const feedsClient = new feeds.FeedsClient({
                    url: this.runtime.config('services.Feeds.url'),
                    token: this.runtime.service('session').getAuthToken()
                });
                return feedsClient.getUnseenNotificationCount()
                    .then(({ unseen: { global, user } }) => {
                        const currentUnseen = global + user;
                        // are notifications different than the last time?
                        const unseenNotificationsCount = this.runtime.db().get('feeds.unseenNotificationsCount');
                        // only way is a deep equality comparison

                        if (unseenNotificationsCount === currentUnseen) {
                            return;
                        }

                        this.runtime.db().set('feeds', {
                            unseenNotificationsCount: currentUnseen,
                            error: null
                        });
                    })
                    .catch((err) => {
                        console.error('ERROR', err.message);
                        this.runtime.db().set('feeds', {
                            error: err.message
                        });
                    });
            };

            const loop = () => {
                this.monitoringTimer = window.setTimeout(() => {
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
                    console.error('Error', err);
                });
        }

        stopFeedsMonitoring() {
            this.monitorRunning = false;
            window.clearTimeout(this.monitoringTimer);
            this.monitoringTimer = null;
        }

        pluginHandler() {
        }
    }

    return { ServiceClass: FeedsService };
});