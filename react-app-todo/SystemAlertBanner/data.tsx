// define([
//     'preact',
//     'htm',
//     'kb_lib/poller',
//     './view',
//     'css!./style.css'
// ], (
//     preact,
//     htm,
//     poller,
//     SystemAlertBanner
// ) => {
import { Component } from 'react';
import Poller, { Job, Task } from '../../lib/poller';
import SystemAlertBanner from './view';

//     const {h, Component } = preact;
//     const html = htm.bind(h);

const POLL_INTERVAL = 10000;

export default class LoadNotificationsJob extends Job {
    callback: () => void;
    constructor({ callback }: { callback: () => void }) {
        super({
            description: 'Load notifications',
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

export interface Alert {}

export interface SystemAlertsDataProps {}

interface SystemAlertsDataState {
    showAlertBanner: boolean;
    alerts: Array<Alert>;
    error: string | null;
    hideAlerts: boolean;
}

export class SystemAlertData extends Component<
    SystemAlertsDataProps,
    SystemAlertsDataState
> {
    newAlertsPoller: Poller;
    constructor(props: SystemAlertsDataProps) {
        super(props);
        this.newAlertsPoller = this.setupPolling();
        this.state = {
            showAlertBanner: false,
            hideAlerts: true,
            alerts: [],
            error: null,
        };
    }

    setupPolling() {
        const job = new LoadNotificationsJob({
            callback: () => {
                this.loadNotifications();
            },
        });

        const task = new Task({
            interval: POLL_INTERVAL,
            runInitially: true,
        });
        task.addJob(job);

        return new Poller({ task });
    }

    componentDidMount() {
        this.newAlertsPoller.start();

        // TODO: the system alert should be a ui service, probably is,
        // hook it up here...

        // this.props.runtime.receive('system-alert', 'toggle-banner', () => {
        //     this.setState({
        //         showAlertBanner: !this.state.showAlertBanner,
        //     });
        // });
        // this.props.runtime.receive('system-alert', 'close-banner', () => {
        //     this.setState({
        //         showAlertBanner: true,
        //     });
        // });
        // this.props.runtime.receive('system-alert', 'open-banner', () => {
        //     this.setState({
        //         showAlertBanner: false,
        //     });
        // });
    }

    getActiveAlerts() {
        return Promise.resolve([
            {
                type: 'maintenance',
                title: 'Maintenance sample 1',
                startAt: new Date(),
                endAt: new Date(Date.now() + 1000 * 60 * 60),
                read: false,
            },
            {
                type: 'maintenance',
                title: 'Maintenance sample 2',
                startAt: new Date(Date.now() + 1000 * 60 * 60),
                endAt: new Date(Date.now() + 1000 * 60 * 60 * 2),
                read: false,
            },
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
                    error: null,
                });
            })
            .catch((err) => {
                console.error('ERROR', err);
                this.setState({
                    alerts: [],
                    error: err.message,
                });
            });
    }

    render() {
        if (this.state.showAlertBanner) {
            const props = {
                // runtime: this.props.runtime,
                alerts: this.state.alerts,
                hideAlerts: this.state.hideAlerts,
            };
            return <SystemAlertBanner {...props} />;
        }
    }
}
