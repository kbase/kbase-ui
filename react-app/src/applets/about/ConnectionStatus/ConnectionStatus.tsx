import { sanitize } from 'dompurify';
import {Component} from 'react';
import { AsyncProcess, AsyncProcessStatus } from '../../../lib/AsyncProcess';
import ConnectionMonitor from '../../../lib/ConnectionMonitor';
import styles from './ConnectionStatus.module.css'

export interface ConnectionStatusProps {
}

export interface Measure {
    measure: number;
    totalMeasure: number;
}

export interface ConnectionStats {
    lastCheck: number;
    stats: Array<{
            size: number,
            measure: Measure
    }>
    // ping: Measure
    // speed1k: Measure
    // speed5k: Measure
}

interface ConnectionStatusState {
   connectionStats: AsyncProcess<ConnectionStats, string>;
}

interface Config {
    color: string;
    size: number;
}

export class ConnectionStatus extends Component<ConnectionStatusProps, ConnectionStatusState> {
    monitor: ConnectionMonitor;
    pingCount: number;
    configs: Array<Config>;
    constructor(props: ConnectionStatusProps) {
        super(props);
        this.monitor = new ConnectionMonitor({
            interval: 10000,
            callback: async () => {
                await this.ping();
            }
        });
        this.pingCount = 0;
        this.configs = [{
            color: 'black',
            size: 0
        },{
            color: 'red',
            size: 1
        },{
            color: 'blue',
            size: 10000
        }, {
            color: 'pink',
            size: 100000
        }, {
            color: 'silver',
            size: 1000000
        }]
        this.state = {
            connectionStats: {
                status: AsyncProcessStatus.NONE
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
        try {
            const lastCheck = Date.now();

            /* Fetch base case */
            const base = await this.measure(`/__ping__`);
            console.log('pause');
            await this.pause(1000);

            /* Fetch various file sizes */
            const results = [];
            for (const {size} of this.configs) {
                const path = (() => {
                    if (size == 0) {
                        return '/__ping__';
                    }
                    if (size >= 1000) {
                        return  `/data/__perf__/${size/1000}k.txt`
                    }
                    return `/data/__perf__/${size}b.txt`
                })();
                
                const pingElapsed =  await this.measure(path);
                console.log('pause');
                results.push(pingElapsed);
            }

            // const [latency, speed] = results.reduce(([latency, speed], result) => {
                
            // }, [0, 0]);

            if (this.state.connectionStats.status !== AsyncProcessStatus.SUCCESS) {
                this.setState({
                    connectionStats: {
                        status: AsyncProcessStatus.SUCCESS,
                        value: {
                            lastCheck,
                            stats: results.map((measure, index) => {
                                return {
                                    size: this.configs[index].size,
                                    measure: {
                                        measure, 
                                        totalMeasure: measure
                                    }
                                }
                            })
                        }
                    }
                }, () => {
                    this.pingCount++;
                });
            } else {
                const x = this.state.connectionStats.value;
                this.setState({
                    connectionStats: {
                        status: AsyncProcessStatus.SUCCESS,
                        value: {
                            lastCheck,
                            stats: results.map((measure, index) => {
                                return {
                                    size: this.configs[index].size,
                                    measure: {
                                        measure, 
                                        totalMeasure: x.stats[index].measure.totalMeasure + measure
                                    }
                                }
                            })
                        }
                    }
                }, () => {
                    this.pingCount++;
                });
            }
        } catch (ex) {
            const message = (() => {
                if (ex instanceof Error) {
                    return ex.message;
                }
                return 'Unknown Error';
            })();
            this.setState({
                connectionStats: {
                    status: AsyncProcessStatus.ERROR,
                    error: message
                }
            })
        }
    }
    
    componentDidMount() {
        this.setState({
            connectionStats: {
                status: AsyncProcessStatus.PENDING
            }
        }, () => {
            this.monitor.start();
        });
    }

    componentWillUnmount() {
        this.monitor.stop();
    }

    formatBytesPerSecond(value: number) {
        return `${Intl.NumberFormat('en-US', {minimumFractionDigits: 1, maximumFractionDigits: 1}).format(value)} b/s`;
    }

    renderPing(ping: Measure) {
        // rate is bytes / sec ping
        // const rate =  1000 / (speed.measure / 1000);
        // const averageRate =  (1000 * this.pingCount)  / (speed.totalMeasure / 1000);
        // {speed.measure} ms ---
        // {this.formatBytesPerSecond(rate)} ---
        return <span>
            {Intl.NumberFormat('en-US', {minimumFractionDigits: 1, maximumFractionDigits: 1}).format(ping.totalMeasure / this.pingCount)} ms avg
        </span>
    }

    // renderRate(rate: number) {
    //     return ``
    //     if (rate < 1000) {
    //         return `${this.niceNumber(rate)}b/s`;
    //     } else if (rate < 1000000) {
    //         return `${this.niceNumber(rate/1000)}Kb/s`;
    //     } else if (rate < 1000000000) {
    //         return `${this.niceNumber(rate/1000000)}Mb/s`;
    //     } else {
    //         return `${this.niceNumber(rate/1000000000)}Gb/s`;
    //     }
    // }

    renderSize(size: number) {
        if (size < 1000) {
            return `${this.niceNumber(size)}b`;
        } else if (size < 1000000) {
            return `${this.niceNumber(size/1000)}K`;
        } else if (size < 1000000000) {
            return `${this.niceNumber(size/1000000)}M`;
        } else {
            return `${this.niceNumber(size/1000000000)}G`;
        }
    }

    renderPing2(base: number, size: number, ping: Measure) {
        // rate is bytes / sec ping
        // const rate =  1000 / (speed.measure / 1000);
        // const averageRate =  (1000 * this.pingCount)  / (speed.totalMeasure / 1000);
        // {speed.measure} ms ---
        // {this.formatBytesPerSecond(rate)} ---
        const downloadTime = ping.totalMeasure/this.pingCount - base;
        // rate is bytes / sec; size is already bytes, downloadTime is ms
        const rate = size / (downloadTime/1000);
        return <span>
            {Intl.NumberFormat('en-US', {minimumFractionDigits: 1, maximumFractionDigits: 1}).format(downloadTime)}ms  ~ 
            {this.renderSize(rate)}/s
        </span>
    }

    niceNumber(value: number) {
        return Intl.NumberFormat('en-US', {minimumFractionDigits: 1, maximumFractionDigits: 1}).format(value);
    }

    renderSpeed(speed: Measure) {
        // rate is bytes / sec
        const rate =  1000 / (speed.measure / 1000);
        const averageRate =  (1000 * this.pingCount)  / (speed.totalMeasure / 1000);
        // {speed.measure} ms ---
        // {this.formatBytesPerSecond(rate)} ---
        return <span>
            {this.formatBytesPerSecond(averageRate)} avg   
        </span>
    }

    // renderSize(size: number) {
    //     if (size >= 1000) {
    //         return `${size/1000}k`;
    //     }
    //     return `${size}b`;
    // }

    renderState() {
        switch (this.state.connectionStats.status) {
            case AsyncProcessStatus.NONE:
            case AsyncProcessStatus.PENDING:
                return;
            case AsyncProcessStatus.ERROR:
                return <div>{this.state.connectionStats.error}</div>
            case AsyncProcessStatus.SUCCESS: 
                const stats = this.state.connectionStats.value.stats;
                const ping = stats[0].measure.totalMeasure / this.pingCount;
                const overhead = stats[1].measure.totalMeasure / this.pingCount - ping;

                const content = stats.slice(2).map(({size, measure}, index) => {
                    return <span style={{color: this.configs[index + 1].color, margin: '0 1em'}} key={index + 1}>
                        {this.renderSize(size)} = {this.renderPing2(ping + overhead, size, measure)}
                    </span>;
                });
                return <div>
                    [{this.pingCount}] P {this.niceNumber(ping)}ms: 
                    OH {this.niceNumber(overhead)}ms: 
                    {content}
                </div>
        }
    }

    render() {
        return <div
            className={`well ${styles.main}`}>
            {this.renderState()}
        </div>
    }
}