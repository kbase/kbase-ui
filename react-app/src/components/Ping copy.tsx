import {Component} from 'react';
import { AsyncProcess, AsyncProcessStatus } from '../lib/AsyncProcess';
// import ConnectionMonitor from '../lib/ConnectionMonitor';
import styles from './Ping.module.css'

const FREQUENCY = 1000;

export interface PingProps {
}

export interface Measure {
    measure: number;
    totalMeasure: number;
}

export enum PingStatType {
    SUCCESS = 'SUCCESS',
    ERROR= 'ERROR'
}

export enum PingStatKind {
    NONE = 'NONE',
    SOME = 'SOME'
}

export interface PingStatsBase {
    kind: PingStatKind;
}

export interface PingStatsNone extends PingStatsBase {
    kind: PingStatKind.NONE
}

export interface PingStatsSome extends PingStatsBase {
    kind: PingStatKind.SOME
    type: PingStatType
    successCount: number;
    successTotalElapsed: number;
    errorCount: number;
    errorTotalElapsed: number;
    lastPingAt: number;
    elapsed: number;
}

export type PingStats = PingStatsNone | PingStatsSome;


// export interface PingStats {
//     type: PingStateType
//     successCount: number;
//     successTotalElapsed: number;
//     errorCount: number;
//     errorTotalElapsed: number;
//     lastPingAt: number;
//     elapsed: number;
// }


// export interface PingStats {
//     lastSuccessfulCheckAt: number;
//     lastErrorCheckAt: number;
//     lastElapsed: number;
//     // stats: Array<{
//     //         size: number,
//     //         measure: Measure
//     // }>
//     // ping: Measure
//     // speed1k: Measure
//     // speed5k: Measure
// }

interface PingState {
   pingStats: PingStats
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

    async measure(url: string) {
        const start = Date.now();
        const response = await fetch(url, {cache: 'no-store', headers: {
            'Accept-Encoding': 'identity;q=0',
            'Cache-Control': 'no-cache, no-transform'
        } });
        console.log(response);
        return Date.now() - start; 
    }

    async pause(time: number) {
        return new Promise((resolve) => {
            window.setTimeout(() => {
                resolve(null);
            }, time);
        });
    }

    async ping() {
        const lastPingAt = Date.now();
        try {
            const elapsed = await this.measure(`/__ping__`);
            this.setState(({ pingStats }) => {
                if (pingStats.kind === PingStatKind.NONE) {
                    return {
                        pingStats: {
                            kind: PingStatKind.SOME,
                            type: PingStatType.SUCCESS,
                            successCount: 1,
                            successTotalElapsed: elapsed,
                            errorCount: 0,
                            errorTotalElapsed: 0,
                            elapsed,
                            lastPingAt
                        }
                    };
                }
                const {
                    successCount, successTotalElapsed,
                    errorCount, errorTotalElapsed
                } = pingStats;
                return {
                    pingStats: {
                        kind: PingStatKind.SOME,
                        type: PingStatType.SUCCESS,
                            successCount: successCount + 1,
                            successTotalElapsed: successTotalElapsed + elapsed,
                            errorCount,
                            errorTotalElapsed,
                            elapsed,
                            lastPingAt
                    }
                };
            });
           
        } catch (ex) {
            const message = (() => {
                if (ex instanceof Error) {
                    return ex.message;
                }
                return 'Unknown Error';
            })();
            const elapsed = Date.now() - lastPingAt;
            this.setState(({ pingStats }) => {
                if (pingStats.kind === PingStatKind.NONE) {
                    return {
                        pingStats: {
                            kind: PingStatKind.SOME,
                            type: PingStatType.ERROR,
                            successCount: 0,
                            successTotalElapsed: 0,
                            errorCount: 1,
                            errorTotalElapsed: elapsed,
                            elapsed,
                            lastPingAt
                        }
                    };
                }
                const {
                    successCount, successTotalElapsed,
                    errorCount, errorTotalElapsed
                } = pingStats;
                return {
                    pingStats: {
                        kind: PingStatKind.SOME,
                        type: PingStatType.ERROR,
                        successCount,
                        successTotalElapsed,
                        errorCount: errorCount + 1,
                        errorTotalElapsed: errorTotalElapsed + elapsed,
                        elapsed,
                        lastPingAt
                    }
                };
            });
        }
    }

    start() {
        this.timeout = window.setTimeout(() => {
            this.ping();
            this.start();
        }, FREQUENCY);
    }

    stop() {
        if (this.timeout) {
            window.clearTimeout(this.timeout);
            this.timeout = null;
        }
    }
    
    componentDidMount() {
        this.start();
    }

    componentWillUnmount() {
        this.stop();
    }

    formatBytesPerSecond(value: number) {
        return `${Intl.NumberFormat('en-US', {minimumFractionDigits: 1, maximumFractionDigits: 1}).format(value)} b/s`;
    }

    render() {
        const [icon, color] = (() => {
            if (this.state.pingStats.kind === PingStatKind.NONE) {
                return [
                    'circle', 'gray'
                ]
            }
            if (this.state.pingStats.type === PingStatType.SUCCESS) {
                return [
                    'thumbs-up', 'green'
                ];
            }
            return [
                'ban', 'red'
            ]
        })();
        return <span className={`fa fa-${icon}`} style={{color}} />
    }
}