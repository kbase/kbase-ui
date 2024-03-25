import * as React from 'react';
import { Progress, Tooltip, Switch } from 'antd';
import PubSub, { PubSubProxy } from '../lib/PubSub';
import { Poller } from '../lib/Poller';

const MONITORING_INTERVAL = 10000;
const MONITORING_FEEDBACK_STEPS = 100;
const WATCH_INTERVAL = 100;

export interface MonitorProps {
    defaultRunning: boolean;
    pubsub: PubSub;
    onPoll: () => void;
}

export interface MonitorState {
    /** Support for job monitoring */
    isMonitoring: boolean;
    isPollingInitiated: boolean;
    pollingStartedAt: number;
    /** Monitoring progress */
    pollWaitProgress: number;
    isPolling: boolean;
    isOpen: boolean;
}

export default class Monitor extends React.Component<MonitorProps, MonitorState> {
    monitoringTimer: number | null;
    monitoringStatusTimer: number | null;
    pollWatcherTimer: number | null;
    searchListenerID: string | null;
    pubsubProxy: PubSubProxy;

    poller: Poller;

    constructor(props: MonitorProps) {
        super(props);

        this.monitoringTimer = null;
        this.monitoringStatusTimer = null;
        this.pollWatcherTimer = null;
        this.searchListenerID = null;
        this.pubsubProxy = new PubSubProxy(this.props.pubsub);

        this.poller = new Poller({
            onPoll: this.props.onPoll,
            onProgress: this.onProgress.bind(this),
            pubsub: this.props.pubsub,
            pollInterval: MONITORING_INTERVAL,
            progressSteps: MONITORING_FEEDBACK_STEPS,
            watchInterval: WATCH_INTERVAL
        });

        this.state = {
            isMonitoring: false,
            pollWaitProgress: 0,
            isPollingInitiated: false,
            pollingStartedAt: 0,
            isPolling: false,
            isOpen: this.props.defaultRunning
        };
    }

    onProgress(progress: number) {
        this.setState({
            pollWaitProgress: progress
        });
    }

    componentDidMount() {
        this.pubsubProxy.on('searching', ({ is }) => {
            if (is) {
                this.setState({
                    isPolling: true
                });
            } else {
                this.setState({
                    isPolling: false
                });
            }
        });
    }

    componentWillUnmount() {
        this.stopMonitoring();
        this.poller.stop();
        this.pubsubProxy.off();
    }

    componentDidUpdate() {

    }

    startMonitoring() {
        this.setState({
            isMonitoring: true
        });
        this.poller.startPolling();
    }

    stopMonitoring() {
        this.poller.stopPolling();
        this.setState({
            isMonitoring: false
        });
    }

    toggleMonitoring() {
        if (this.state.isMonitoring) {
            this.stopMonitoring();
        } else {
            this.startMonitoring();
        }
    }

    onToggleOpen(isOpen: boolean) {
        this.setState({ isOpen });
        if (isOpen) {
            this.startMonitoring();
        } else {
            this.stopMonitoring();
        }
    }

    render() {
        let monitoringStatus;
        const opener = (
            <Switch
                defaultChecked={this.state.isOpen}
                checkedChildren="stop polling"
                unCheckedChildren="poll"
                onChange={this.onToggleOpen.bind(this)} />
        );

        if (this.state.isMonitoring) {
            if (!this.state.isPolling) {
                monitoringStatus = (
                    <span>
                        {' '}
                        <Progress
                            type="circle"
                            percent={this.state.pollWaitProgress}
                            width={30}
                            strokeWidth={30}
                            showInfo={false} />
                    </span>
                );
            } else {
                monitoringStatus = (
                    <span>
                        {' '}<Progress
                            type="circle"
                            percent={100}
                            width={30}
                            showInfo={false}
                            strokeWidth={30}
                            strokeColor={'orange'} />
                    </span>
                );
            }
        }
        let title;
        if (this.state.isMonitoring) {
            title = `Polling is running, with an interval of ${MONITORING_INTERVAL}ms and ${MONITORING_FEEDBACK_STEPS} update steps.`;
        } else {
            title = 'Polling is currently stopped.';
        }
        let monitor;
        if (this.state.isOpen) {
            monitor = <Tooltip title={title}>
                {monitoringStatus}
            </Tooltip>;
        }
        return (
            <span>
                {opener}
                {' '}
                {monitor}
            </span>
        );
    }
}
