import { Component } from 'react';

const CLOCK_INTERVAL = 250;

export type TimePart = 'day' | 'hour' | 'minute' | 'second';
export type DisplaySize = 'normal' | 'compact' | 'small';

export const timeParts: { [timePart: string]: { normal: string, compact: string, small: string } } = {
    day: {
        normal: 'day',
        compact: 'day',
        small: 'd'
    },
    hour: {
        normal: 'hour',
        compact: 'hr',
        small: 'h'
    },
    minute: {
        normal: 'minute',
        compact: 'min',
        small: 'm'
    },
    second: {
        normal: 'second',
        compact: 'sec',
        small: 's'
    },
}



function niceRelativeTimeRange({
    at,
    now,
    size
}: {
    at: number;
    now: number;
    size: DisplaySize;
}) {

    let prefix;
    let suffix;
    if (at < now) {
        suffix = 'ago';
        prefix = '';
    } else {
        prefix = 'in'
        suffix = '';
    }

    // Elapsed time in seconds.
    const elapsed = Math.round((now - at) / 1000);
    const elapsedAbs = Math.abs(elapsed);
    let measureAbs;

    const measures = [];
    let remaining;

    if (elapsedAbs === 0) {
        return 'now';
    } else if (elapsedAbs < 60) {
        measures.push([elapsedAbs, 'second']);
    } else if (elapsedAbs < 60 * 60) {
        measureAbs = Math.floor(elapsedAbs / 60);
        measures.push([measureAbs, 'minute']);
        remaining = elapsedAbs - measureAbs * 60;
        if (remaining > 0) {
            measures.push([remaining, 'second']);
        }
    } else if (elapsedAbs < 60 * 60 * 24) {
        measureAbs = Math.floor(elapsedAbs / 3600);
        const remainingSeconds = elapsedAbs - measureAbs * 3600;
        const remainingMinutes = Math.round(remainingSeconds / 60);
        if (remainingMinutes === 60) {
            // if we round up to 24 hours, just considering this another
            // day and don't show hours.
            measureAbs += 1;
            measures.push([measureAbs, 'hour']);
        } else {
            // otherwise, do show the hours
            measures.push([measureAbs, 'hour']);
            if (remainingMinutes > 0) {
                // unless it rounds down to no hours.
                measures.push([remainingMinutes, 'minute']);
            }
        }
    } else if (elapsedAbs < 60 * 60 * 24 * 7) {
        measureAbs = Math.floor(elapsedAbs / (3600 * 24));
        const remainingSeconds = elapsedAbs - measureAbs * 3600 * 24;
        const remainingHours = Math.round(remainingSeconds / 3600);
        if (remainingHours === 24) {
            // if we round up to 24 hours, just considering this another
            // day and don't show hours.
            measureAbs += 1;
            measures.push([measureAbs, 'day']);
        } else {
            // otherwise, do show the hours
            measures.push([measureAbs, 'day']);
            if (remainingHours > 0) {
                // unless it rounds down to no hours.
                measures.push([remainingHours, 'hour']);
            }
        }
    } else {
        measureAbs = Math.floor(elapsedAbs / (3600 * 24));
        measures.push([measureAbs, 'day']);
    }

    return [
        prefix ? prefix + ' ' : '',
        measures
            .map(([measure, unit]) => {
                let unitForSize = timeParts[unit][size]
                if (measure !== 1) {
                    unitForSize += 's';
                }
                return [measure, unitForSize].join(' ');
            })
            .join(', '),
        suffix ? ' ' + suffix : '',
    ].join('');
}

export interface RelativeTimeClockProps {
    at: number;
    now: number;
    size?: DisplaySize;
}

interface RelativeTimeClockState {
    now: number;
}

export default class RelativeTimeClock extends Component<
    RelativeTimeClockProps,
    RelativeTimeClockState
> {
    timer: number | null = null;
    size: DisplaySize;
    timeOffset: number;

    constructor(props: RelativeTimeClockProps) {
        super(props);

        this.size = props.size || 'normal';

        this.timeOffset = props.now - Date.now();

        this.state = {
            now: Date.now() + this.timeOffset
        };
    }

    componentDidMount() {
        this.timer = window.setInterval(() => {
            this.setState({
                now: Date.now() + this.timeOffset
            });
        }, CLOCK_INTERVAL);
    }

    componentWillUnmount() {
        if (this.timer) {
            window.clearInterval(this.timer);
        }
    }

    render() {
        const { at } = this.props;
        const { now } = this.state;
        let className = '';
        if (at < now) {
            className += 'text-danger'
        }
        return <span className={className}>{niceRelativeTimeRange({ at, now, size: this.size })}</span>;
    }
}
