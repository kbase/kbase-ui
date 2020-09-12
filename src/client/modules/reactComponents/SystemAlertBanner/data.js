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
    SystemAlertBanner
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
            // this.state = {
            //     alerts: null,
            //     showAlertBanner: false,
            //     error: null
            // };
        }
        run() {
            return this.callback();
        }
    }

    class SystemAlertData extends Component {
        constructor(props) {
            super(props);
            this.newAlertsPoller = new poller.Poller();
            this.state = {
                showAlertBanner: false,
                alerts: null,
                error: null
            };
        }

        setupPolling() {
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

            this.newAlertsPoller.addTask(task);
            this.newAlertsPoller.start();
        }

        componentDidMount() {
            this.setupPolling();

            this.props.runtime.receive('system-alert', 'toggle-banner', () => {
                this.setState({
                    showAlertBanner: !this.state.showAlertBanner
                });
            });
            this.props.runtime.receive('system-alert', 'close-banner', () => {
                this.setState({
                    showAlertBanner: true
                });
            });
            this.props.runtime.receive('system-alert', 'open-banner', () => {
                this.setState({
                    showAlertBanner: false
                });
            });
        }

        getActiveAlerts() {
            return Promise.resolve([
                {
                    type: 'maintenance',
                    title: 'Maintenance sample 1',
                    startAt: new Date(),
                    endAt: new Date(Date.now() + 1000 * 60 * 60),
                    read: false
                },
                {
                    type: 'maintenance',
                    title: 'Maintenance sample 2',
                    startAt: new Date(Date.now() + 1000 * 60 * 60),
                    endAt: new Date(Date.now() + 1000 * 60 * 60 * 2),
                    read: false
                }
            ]);
            // const client = this.props.runtime.service('rpc').newClient({
            //     module: 'UIService'
            // });

            // return client.callFunc('get_active_alerts', [])
            //     .then(([result]) => {
            //         return result;
            //     });
        }

        loadNotifications() {
            return this.getActiveAlerts()
                .then((data) => {
                    this.setState({
                        alerts: data,
                        error: null
                    });
                })
                .catch((err) => {
                    console.error('ERROR', err);
                    this.setState({
                        alerts: null,
                        error: err.message
                    });
                });
        }


        render() {
            if (this.state.showAlertBanner) {
                const props = {
                    runtime: this.props.runtime,
                    alerts: this.state.alerts,
                    hideAlerts: this.state.hideAlerts
                };
                return html`<${SystemAlertBanner} ...${props}/>`;
            }
        }
    }

    return SystemAlertData;
});