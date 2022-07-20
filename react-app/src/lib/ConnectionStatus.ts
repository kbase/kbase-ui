import * as uuid from 'uuid';

class AsyncLoop {
    running: boolean;
    interval: number;
    callback: () => Promise<void>;
    timeout: number | null;
    constructor(interval: number, callback: () => Promise<void>) {
        this.running = false;
        this.interval = interval;
        this.callback = callback;
        this.timeout = null;
    }

     async start() {
        if (this.running) {
            return;
        }
        this.running = true;
        let loopCount = 0;
        const loop = (async () => {
            if (!this.running) {
                return;
            }
            loopCount++;
            try {
                await this.callback();
            } catch (ex) {
                const message = (() => {
                    if (ex instanceof Error) {
                        return ex.message;
                    }
                    return 'Unknown error';
                })
                console.error('Error in AsyncLoop:', message);
            } 
            if (this.running) {
                this.timeout = window.setTimeout(() => {
                    if (this.running) {
                        loop();
                    }
                }, FREQUENCY);
            }
        });
        
        loop();
    }

    stop() {
        this.running = false;
        if (this.timeout) {
            window.clearTimeout(this.timeout);
            this.timeout = null;
        }
    }
}

const FREQUENCY = 5000;

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
    lastSuccessElapsed: number | null;
    lastSuccessAt: number | null;
    errorCount: number;
    errorTotalElapsed: number;
    lastErrorElapsed: number | null;
    lastAttemptAt: number | null;
}

export type PingStats = PingStatsNone | PingStatsSome;

export interface PingProps {
    onPing: (stats: PingStats) => void;
}

interface ConnectionStatusState {
    pingStats: PingStats;
}

export class ConnectionStatus  {
    state: ConnectionStatusState;
    onPing: (stats: PingStats) => void;
    instanceID: string;
    startID: number;
    asyncLoop: AsyncLoop | null;
    constructor(props: PingProps) {
        this.onPing = props.onPing;
        this.instanceID = uuid.v4();
        this.startID = 0;
        this.state = {
            pingStats: {
                kind: PingStatKind.NONE
            }
        }
        this.asyncLoop = null;
    }

    async measure(url: string) {
        const start = Date.now();
        const response = await fetch(url, {cache: 'no-store', headers: {
            'Accept-Encoding': 'identity;q=0',
            'Cache-Control': 'no-cache, no-transform'
        } });
        return Date.now() - start; 
    }

    async ping() {
        const lastAttemptAt = Date.now();
        try {
            const elapsed = await this.measure(`/__ping__`);
            this.state = (() => {
                if (this.state.pingStats.kind === PingStatKind.NONE) {
                    return {
                        pingStats: {
                            kind: PingStatKind.SOME,
                            type: PingStatType.SUCCESS,
                            successCount: 1,
                            successTotalElapsed: elapsed,
                            lastSuccessElapsed: elapsed,
                            lastSuccessAt: lastAttemptAt,
                            errorCount: 0,
                            errorTotalElapsed: 0,
                            lastErrorElapsed: null,
                            lastAttemptAt
                        }
                    };
                }
                const {
                    successCount, successTotalElapsed,
                    errorCount, errorTotalElapsed
                } = this.state.pingStats;
                return {
                    pingStats: {
                        ...this.state.pingStats,
                        kind: PingStatKind.SOME,
                        type: PingStatType.SUCCESS,
                        successCount: successCount + 1,
                        successTotalElapsed: successTotalElapsed + elapsed,
                        lastSuccessElapsed: elapsed,
                        lastSuccessAt: lastAttemptAt,
                        lastAttemptAt
                    }
                };
            })();
        } catch (ex) {
            const message = (() => {
                if (ex instanceof Error) {
                    return ex.message;
                }
                return 'Unknown Error';
            })();
            const elapsed = Date.now() - lastAttemptAt;
            this.state = (() => {
                if (this.state.pingStats.kind === PingStatKind.NONE) {
                    return {
                        pingStats: {
                            kind: PingStatKind.SOME,
                            type: PingStatType.ERROR,
                            successCount: 0,
                            successTotalElapsed: 0,
                            lastSuccessAt: null,
                            lastSuccessElapsed: null,
                            errorCount: 1,
                            errorTotalElapsed: elapsed,
                            lastErrorElapsed: elapsed,
                            lastAttemptAt
                        }
                    };
                }
                const {
                    successCount, successTotalElapsed,
                    errorCount, errorTotalElapsed
                } = this.state.pingStats;
                return {
                    pingStats: {
                        ...this.state.pingStats,
                        kind: PingStatKind.SOME,
                        type: PingStatType.ERROR,
                        errorCount: errorCount + 1,
                        errorTotalElapsed: errorTotalElapsed + elapsed,
                        lastErrorElapsed: elapsed,
                        lastAttemptAt
                    }
                };
            })();
        }
        this.onPing(this.state.pingStats);
    }

    async start() {
        this.asyncLoop = new AsyncLoop(FREQUENCY, this.ping.bind(this));
        this.asyncLoop.start();
    }

    stop() {
        const oldLoop = this.asyncLoop;
        if (oldLoop !== null) {
            this.asyncLoop = null;
            oldLoop.stop();
        }
    }
}
