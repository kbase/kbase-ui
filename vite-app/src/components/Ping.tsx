import {Component} from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { PingStatKind, PingStats, PingStatsSome, PingStatType } from '../lib/ConnectionStatus';


    function niceElapsedTime(dateObj: string | number | Date, nowDateObj: string | number | Date) {
        const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        let date, now;
        if (typeof dateObj === 'string') {
            date = new Date(dateObj);
        } else if (typeof dateObj === 'number') {
            date = new Date(dateObj);
        } else {
            date = dateObj;
        }
        if (nowDateObj === undefined) {
            now = new Date();
        } else if (typeof nowDateObj === 'string') {
            now = new Date(nowDateObj);
        } else if (typeof nowDateObj === 'number') {
            now = new Date(nowDateObj);
        } else {
            now = nowDateObj;
        }

        const elapsed = Math.round((now.getTime() - date.getTime()) / 1000);
        const elapsedAbs = Math.abs(elapsed);

        // Within the last 7 days...
        if (elapsedAbs < 60 * 60 * 24 * 7) {
            if (elapsedAbs === 0) {
                return 'now';
            }
            let measure, measureAbs, unit;
            if (elapsedAbs < 60) {
                measure = elapsed;
                measureAbs = elapsedAbs;
                unit = 's';
            } else if (elapsedAbs < 60 * 60) {
                measure = Math.round(elapsed / 60);
                measureAbs = Math.round(elapsedAbs / 60);
                unit = 'm';
            } else if (elapsedAbs < 60 * 60 * 24) {
                measure = Math.round(elapsed / 3600);
                measureAbs = Math.round(elapsedAbs / 3600);
                unit = 'h';
            } else if (elapsedAbs < 60 * 60 * 24 * 7) {
                measure = Math.round(elapsed / (3600 * 24));
                measureAbs = Math.round(elapsedAbs / (3600 * 24));
                unit = 'd';
            } else {
                throw new Error('too big'); // TODO: FIX
            }

            // if (measureAbs > 1) {
            //     unit += 's';
            // }

            let prefix = null, suffix = null;
            if (measure < 0) {
                prefix = 'in';
            } else if (measure > 0) {
                suffix = 'ago';
            }

            return (prefix ? prefix + ' ' : '') + measureAbs + unit + (suffix ? ' ' + suffix : '');
        }
        // otherwise show the actual date, with or without the year.
        if (now.getFullYear() === date.getFullYear()) {
            return shortMonths[date.getMonth()] + ' ' + date.getDate();
        }
        return shortMonths[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();
    }

export interface Measure {
    measure: number;
    totalMeasure: number;
}


export interface PingProps {
   pingStats: PingStats
}

interface PingState {
}

export class Ping extends Component<PingProps, PingState> {
    timeout: number | null;
    constructor(props: PingProps) {
        super(props);
        this.timeout = null;
        this.state = {
            pingStats: {
                kind: PingStatKind.NONE
            }
        }
    }

    formatBytesPerSecond(value: number) {
        return `${Intl.NumberFormat('en-US', {minimumFractionDigits: 1, maximumFractionDigits: 1}).format(value)} b/s`;
    }

    renderPending() {
        return <span className="fa fa-circle-o-notch fa-spin fa-fw fa-lg" style={{ color: 'gray' }} />;
    }

    renderOk() {
        return <span className="fa fa-wifi fa-lg" />;
    }

    renderFailed() {
        return <span className="fa-stack fa-lg" style={{opacity: "0.8"}}>
            <span className="fa fa-wifi fa-stack-1x" />
            <span className="fa fa-ban fa-stack-2x text-danger" />
        </span>;
    }

    render() {
        const [icon,  tooltip] = (() => {
            if (this.props.pingStats.kind === PingStatKind.NONE) {
                return [
                    this.renderPending(), 'Starting up connection monitor...'
                ]
            }
            const averagePing = Math.round(this.props.pingStats.successTotalElapsed / this.props.pingStats.successCount);
            const pingInfo = <span>ping: {this.props.pingStats.lastSuccessElapsed}ms /  # {this.props.pingStats.successCount} / {averagePing} avg </span>;
            if (this.props.pingStats.type === PingStatType.SUCCESS) {
                return [
                    this.renderOk(), <div>
                        <div>Connection to KBase OK</div>
                        <div>{pingInfo}</div>
                    </div>
                ];
            }

            const lastConnection = ((pingStats: PingStatsSome) => {
                if (pingStats.lastSuccessAt == null) {
                    return <span>n/a</span>;
                }
                return niceElapsedTime(pingStats.lastSuccessAt, Date.now());
            })(this.props.pingStats);
           
            return [
                this.renderFailed(), <div>
                    <div>Connection to KBase Lost</div>
                    <div style={{color: 'gray'}}>{pingInfo}</div>
                    <div>last connection {lastConnection}</div>
                </div>
            ]
        })();
        return <OverlayTrigger placement='bottom' overlay={
            <Tooltip>{tooltip}</Tooltip>
        }>
            {icon}
        </OverlayTrigger>;
    }
}
