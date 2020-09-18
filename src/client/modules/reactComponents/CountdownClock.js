define([
    'preact',
    'htm'
], (
    preact,
    htm
) => {

    const {h, Component } = preact;
    const html = htm.bind(h);

    const CLOCK_INTERVAL = 250;

    function niceRelativeTimeRange({now, startAt, endAt}) {
        let startDate;
        if (startAt === null || startAt === undefined) {
            startDate = null;
        } else {
            startDate =new Date(startAt);
        }

        let endDate;
        if (endAt === null || endAt === undefined) {
            endDate = null;
        } else {
            endDate = new Date(endAt);
        }

        const nowTime = now || new Date.now();
        let date;
        let prefix, suffix;
        if (startDate === null) {
            if (endDate === null) {
                return 'happening now, perpetual';
            } else if (endDate.getTime() < nowTime) {
                prefix = 'ended';
                suffix = 'ago';
                date = endDate;
            } else {
                prefix = 'happening now, ending in ';
                date = endDate;
            }
        } else {
            if (startDate.getTime() > nowTime) {
                prefix = 'in';
                date = startDate;
            } else if (endDate === null) {
                return 'happening now, indefinite end';
            } else if (endDate.getTime() < nowTime) {
                prefix = 'ended';
                suffix = 'ago';
                date = endDate;
            } else {
                prefix = 'happening now, ending in ';
                date = endDate;
            }
        }

        const elapsed = Math.round((nowTime - date.getTime()) / 1000);
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
            remaining = elapsedAbs - (measureAbs * 60);
            if (remaining > 0) {
                measures.push([remaining, 'second']);
            }
        } else if (elapsedAbs < 60 * 60 * 24) {
            measureAbs = Math.floor(elapsedAbs / 3600);
            const remainingSeconds = elapsedAbs - (measureAbs * 3600);
            const remainingMinutes = Math.round(remainingSeconds/60);
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
            const remainingSeconds = elapsedAbs - (measureAbs * 3600 * 24);
            const remainingHours = Math.round(remainingSeconds/3600);
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
            (prefix ? prefix + ' ' : ''),
            measures.map(([measure, unit]) => {
                if (measure !== 1) {
                    unit += 's';
                }
                return [measure, unit].join(' ');
            }).join(', '),
            (suffix ? ' ' + suffix : '')
        ].join('');
    }

    class CountdownClock extends Component {
        constructor(props) {
            super(props);

            this.state = {
                now: Date.now()
            };

        }

        componentDidMount() {
            this.timer = window.setInterval(() => {
                this.setState({
                    now: Date.now()
                });
            }, CLOCK_INTERVAL);
        }



        renderNiceRelativeRange({now, startAt, endAt}) {
            return niceRelativeTimeRange({startAt, endAt, now});
        }

        render() {
            const {startAt, endAt} = this.props;
            const {now} = this.state;
            return html`
                ${this.renderNiceRelativeRange({
        now, startAt, endAt
    })}
            `;
        }
    }

    return CountdownClock;
});