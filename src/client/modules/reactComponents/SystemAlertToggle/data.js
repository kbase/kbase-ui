define([
    'preact',
    'htm',
    'kb_lib/poller',
    './view',
    'css!./style.css'
], (
    preact,
    htm,
    poller,
    SystemAlertToggle
) => {
    'use strict';

    const {h, Component } = preact;
    const html = htm.bind(h);

    const POLL_INTERVAL = 10000;

    class LoadNotificationsJob extends poller.Job {
        constructor({callback}) {
            super({
                description: 'Load notifications'
            });
            this.callback = callback;
            this.state = {
                alerts: null,
                hideAlerts: true,
                error: null
            };
        }
        run() {
            return this.callback();
        }
    }

    class SystemAlertData extends Component {
        constructor(props) {
            super(props);
            this.state = {
                alerts: null,
                hideAlerts: false,
                error: null
            };
        }

        componentDidMount() {
            const job = new LoadNotificationsJob({
                callback: () => {
                    this.loadNotifications();
                }
            });

            const task = new poller.Task({
                interval: POLL_INTERVAL,
                runInitially: true
            });
            task.addJob(job);

            this.newAlertsPoller = new poller.Poller();
            this.newAlertsPoller.addTask(task);
            this.newAlertsPoller.start();
        }

        getActiveAlerts() {
            return Promise.resolve([
                {
                    type: 'maintenance',
                    startAt: new Date(),
                    endAt: new Date(Date.now() + 1000 * 60 * 60)
                },
                {
                    type: 'maintenance',
                    startAt: new Date(Date.now() + 1000 * 60 * 60),
                    endAt: new Date(Date.now() + 1000 * 60 * 60 * 2)
                }
            ]);
            // const client = this.props.runtime.service('rpc').makeClient({
            //     module: 'UIService'
            // });

            // return client.callFunc('get_active_alerts', [])
            //     .spread((result) => {
            //         return result;
            //     });
        }

        calcSummary(alerts) {
            const now = Date.now();
            return alerts.reduce((acc, alert) => {
                if ((alert.startAt.getTime() <= now) &&
                        ((alert.endAt === null || alert.endAt.getTime() >= now))) {
                    acc.present += 1;
                } else if (alert.startAt.getTime() > now) {
                    acc.future += 1;
                }
                return acc;
            }, {
                present: 0,
                future: 0
            });
        }

        loadNotifications() {
            return this.getActiveAlerts()
                .then((data) => {
                    const summary = this.calcSummary(data);
                    this.setState({
                        alerts: data,
                        summary,
                        error: null
                    });
                })
                .catch((err) => {
                    console.error('ERROR', err);
                    this.setState({
                        alerts: null,
                        summary: null,
                        error: err.message
                    });
                });
        }


        render() {
            const props = {
                runtime: this.props.runtime,
                alerts: this.state.alerts,
                summary: this.state.summary,
                hideAlerts: this.state.hideAlerts
            };
            return html`<${SystemAlertToggle} ...${props}/>`;
        }
    }

    return SystemAlertData;
});