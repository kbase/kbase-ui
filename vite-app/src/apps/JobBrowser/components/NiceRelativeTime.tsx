import * as React from 'react';

import { Tooltip } from 'antd';
import { niceRelativeTime } from '../lib/time';

export interface NiceRelativeTimeProps {
    time: Date;
    showTooltip?: boolean;
    tooltipPrefix?: string;
    absoluteAfter?: number;
}

interface NiceRelativeTimeState {
    now: Date;
}

// dynamic intervals, based on the range of elapsed time
// TODO: using intervals we should actually set the interval to
// trigger based on the datetime to display.
const intervals = [
    // below 1 minute, every 1/2 sec
    [60 * 1000, 500],
    // between 1 minute and 1 hour, every 30 seconds
    [60 * 60 * 1000, 30 * 1000],
    // between 1 hour and 1 day, every 30 minutes
    [60 * 60 * 24 * 1000, 60 * 1000 * 30],
    // over 1 day, once per day
    [Infinity, 60 * 60 * 24 * 1000]
];

export default class NiceRelativeTime extends React.Component<NiceRelativeTimeProps, NiceRelativeTimeState> {
    nowTimer: number | null;
    interval: number;
    constructor(props: NiceRelativeTimeProps) {
        super(props);

        this.nowTimer = null;

        this.state = {
            now: new Date()
        };

        this.interval = this.calcInterval();
    }

    calcInterval(): number {
        const elapsed = this.state.now.getTime() - this.props.time.getTime();
        for (const [upto, interval] of intervals) {
            if (elapsed < upto) {
                return interval;
            }
        }
        console.error('hmm again', elapsed, intervals);
        throw new Error('did not find interval');
    }

    handleInterval() {
        const now = new Date();
        this.setState({ now }, () => {
            const interval = this.calcInterval();
            if (this.interval !== interval) {
                this.interval = interval;
                this.startIntervalTimer();
            }
        });
    }

    startIntervalTimer() {
        if (this.nowTimer) {
            window.clearInterval(this.nowTimer);
        }
        this.nowTimer = window.setInterval(() => {
            this.handleInterval();
        }, this.interval);
    }

    componentDidMount() {
        this.startIntervalTimer();
    }

    componentWillUnmount() {
        if (this.nowTimer) {
            window.clearInterval(this.nowTimer);
        }
    }

    render() {
        if (this.props.showTooltip === false) {
            return <span>{niceRelativeTime(this.props.time, { absoluteAfter: 30, now: this.state.now })}</span>;
        }

        const fullDate = (
            <span>
                {Intl.DateTimeFormat('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                    timeZoneName: 'short'
                }).format(this.props.time)}
            </span>
        );
        let tooltip;
        if (this.props.tooltipPrefix) {
            tooltip = (
                <span>
                    {this.props.tooltipPrefix}
                    {fullDate}
                </span>
            );
        } else {
            tooltip = fullDate;
        }
        return (
            <Tooltip placement="bottomRight" title={tooltip}>
                <span data-k-b-testhook-element="label">
                    {niceRelativeTime(this.props.time, { absoluteAfter: this.props.absoluteAfter || 30, now: this.state.now })}
                </span>
            </Tooltip>
        );
    }
}
