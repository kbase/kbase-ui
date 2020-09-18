define([
    'kb_lib/observed',
    'kb_lib/html',
    'kb_ts/HttpClient'
], (
    Observed,
    html,
    {HttpClient, GeneralError, TimeoutError, AbortError}
) => {
    const t = html.tag,
        div = t('div'),
        p = t('p');

    function niceDuration(value, options) {
        const minimized = [];
        const units = [{
            unit: 'millisecond',
            short: 'ms',
            single: 'm',
            size: 1000
        }, {
            unit: 'second',
            short: 'sec',
            single: 's',
            size: 60
        }, {
            unit: 'minute',
            short: 'min',
            single: 'm',
            size: 60
        }, {
            unit: 'hour',
            short: 'hr',
            single: 'h',
            size: 24
        }, {
            unit: 'day',
            short: 'day',
            single: 'd',
            size: 30
        }];
        let temp = Math.abs(value);
        const parts = units
            .map((unit) => {
                // Get the remainder of the current value
                // sans unit size of it composing the next
                // measure.
                const unitValue = temp % unit.size;
                // Recompute the measure in terms of the next unit size.
                temp = (temp - unitValue) / unit.size;
                return {
                    name: unit.single,
                    unit: unit.unit,
                    value: unitValue
                };
            }).reverse();

        parts.pop();

        // We skip over large units which have not value until we
        // hit the first unit with value. This effectively trims off
        // zeros from the end.
        // We also can limit the resolution with options.resolution
        let keep = false;
        for (let i = 0; i < parts.length; i += 1) {
            if (!keep) {
                if (parts[i].value > 0) {
                    keep = true;
                    minimized.push(parts[i]);
                }
            } else {
                minimized.push(parts[i]);
                if (options.resolution &&
                    options.resolution === parts[i].unit) {
                    break;
                }
            }
        }

        if (minimized.length === 0) {
            // This means that there is are no time measurements > 1 second.
            return '<1s';
        } else {
            // Skip seconds if we are into the hours...
            // if (minimized.length > 2) {
            //     minimized.pop();
            // }
            return minimized.map((item) => {
                return String(item.value) + item.name;
            })
                .join(' ');
        }
    }

    const INTERVAL_NORMAL = 15000;
    const INTERVAL_DEFAULT = INTERVAL_NORMAL;
    const INTERVAL_DISCONNECT1 = 1000;
    const INTERVAL_DISCONNECT2 = 5000;
    const INTERVAL_DISCONNECT3 = 15000;
    const INTERVAL_OK_AUTODISMISS = 5000;

    const DISCONNECT_TIMEOUT = 60000;
    const DISCONNECT1_TIMEOUT = 300000;

    class ConnectionService {
        constructor({ params: { runtime } }) {
            this.runtime = runtime;
            this.state = new Observed();
            this.lastCheckAt = 0;
            this.lastConnectionAt = 0;
            this.checking = false;
            this.lastStatus = null;
            this.interval = INTERVAL_NORMAL;
            this.intervals = {
                normal: INTERVAL_DEFAULT,
                disconnect1: INTERVAL_DISCONNECT1,
                disconnect2: INTERVAL_DISCONNECT2,
                disconnect3: INTERVAL_DISCONNECT3
            };
        }

        notifyError(message) {
            this.runtime.send('notification', 'notify', {
                type: 'warning',
                id: 'connection',
                icon: 'exclamation-triangle',
                message: message.message,
                description: message.description
            });
        }

        notifyOk(message) {
            this.runtime.send('notification', 'notify', {
                type: 'success',
                id: 'connection',
                icon: 'check',
                message: message.message,
                description: message.description,
                autodismiss: INTERVAL_OK_AUTODISMISS
            });
        }

        start() {
            this.runtime.receive('app', 'heartbeat', () => {
                if (this.checking) {
                    return;
                }
                const now = new Date().getTime();
                if (now - this.lastCheckAt > this.interval) {
                    this.checking = true;
                    const httpClient = new HttpClient();
                    const buster = new Date().getTime();
                    httpClient.request({
                        method: 'GET',
                        url: `${document.location.origin}/ping.txt?b=${buster}`,
                        timeout: 10000
                    })
                        .then(() => {
                            this.lastConnectionAt = new Date().getTime();
                            if (this.lastStatus === 'error') {
                                this.notifyOk({
                                    message: 'Connection Restored (connection to server had been lost)',
                                    description: ''
                                });
                                this.interval = this.intervals.normal;
                            }
                            this.lastStatus = 'ok';
                        })
                        .catch(GeneralError, () => {
                            this.lastStatus = 'error';
                            const currentTime = new Date().getTime();
                            const elapsed = currentTime - this.lastConnectionAt;
                            let resolution;
                            if (elapsed < DISCONNECT_TIMEOUT) {
                                this.interval = this.intervals.disconnect1;
                                resolution = 'second';
                            } else if (elapsed < DISCONNECT1_TIMEOUT) {
                                this.interval = this.intervals.disconnect2;
                                resolution = 'second';
                            } else {
                                this.interval = this.intervals.disconnect3;
                                resolution = 'minute';
                            }
                            let prefix = '';
                            let suffix = '';
                            if (elapsed > 0) {
                                suffix = ' ago';
                            } else {
                                prefix = ' in ';
                            }
                            const elapsedDisplay = prefix + niceDuration(elapsed, { resolution: resolution }) + suffix;
                            this.notifyError({
                                message: 'Error connecting to KBase - last response ' + elapsedDisplay,
                                description: div([
                                    p('There was a problem connecting to KBase services.'),
                                    p('The KBase App may not work reliably until a connection is restored'),
                                    p([
                                        'You may either wait until a connection is restored, in which case ',
                                        'this message will notify you, or close the window and try again later.'
                                    ])
                                ])
                            });
                        })
                        .catch(TimeoutError, () => {
                            this.lastStatus = 'error';
                            this.notifyError({
                                message: 'Timeout connecting to KBase',
                                description: [
                                    p('The attempt to connect KBase services timed out.'),
                                    p('The KBase App may not work reliably until a connection is restored'),
                                    p([
                                        'You may either wait until a connection is restored, in which case ',
                                        'this message will notify you, or close the window and try again later.'
                                    ])
                                ]
                            });
                        })
                        .catch(AbortError, (err) => {
                            this.lastStatus = 'error';
                            this.notifyError({
                                message: 'Connection aborted connecting to KBase: ' + err.message
                            });
                        })
                        .catch((err) => {
                            this.lastStatus = 'error';
                            this.notifyError({
                                message: 'Unknown error connecting to KBase: ' + err.message
                            });
                        })
                        .finally(() => {
                            this.checking = false;
                            this.lastCheckAt = new Date().getTime();
                        });
                }
            });

            // also, monitor the kbase-ui server to ensure we are connected
            return Promise.resolve();
        }

        stop() {
            return Promise.resolve(() => {
                this.state.setItem('userprofile', null);
                return null;
            });
        }

        // Send out notifications when there is a change in connection state.
        // function onChange(fun, errFun) {
        onChange() {
            // state.listen('userprofile', {
            //     onSet: function(value) {
            //         fun(value);
            //     },
            //     onError: function(err) {
            //         console.error('ERROR in user profile service');
            //         console.error(err);
            //         if (errFun) {
            //             errFun(err);
            //         }
            //     }
            // });
        }

        whenChange() {
            // return state.whenItem('userprofile')
        }
    }

    return { ServiceClass: ConnectionService };
});
