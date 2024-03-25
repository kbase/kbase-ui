import ErrorAlert from 'components/ErrorAlert';
import Well from 'components/Well';
import { Component } from 'react';
import { Table } from 'react-bootstrap';
import { AsyncProcess, AsyncProcessStatus } from '../../../lib/AsyncProcess';
import ConnectionMonitor from '../../../lib/ConnectionMonitor';

export interface ConnectionStatusProps {}

export interface Measure {
  measure: number;
  totalMeasure: number;
}

export interface ConnectionStats {
  lastCheck: number;
  noFile: Measure;
  stats: Array<{
    size: number;
    measure: Measure;
  }>;
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
        return this.ping();
      },
    });
    this.pingCount = 0;
    this.configs = [
      {
        color: 'black',
        size: 0,
      },
      {
        color: 'red',
        size: 1,
      },
      {
        color: 'purple',
        size: 1000,
      },
      {
        color: 'blue',
        size: 10000,
      },
      {
        color: 'orange',
        size: 100000,
      },
      {
        color: 'green',
        size: 1000000,
      },
    ];
    this.state = {
      connectionStats: {
        status: AsyncProcessStatus.NONE,
      },
    };
  }

  async measureElapsed(url: string) {
    const start = Date.now();
    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Accept-Encoding': 'identity;q=0',
        'Cache-Control': 'no-cache, no-transform',
      },
    });
    const content = await response.text();
    return [Date.now() - start, content.length];
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
      // const base = await this.measure(`/__ping__`);
      await this.pause(1000);

      /* Fetch various file sizes */
      const results = [];
      for await (const { size } of this.configs) {
        const path = (() => {
          if (size === 0) {
            return '/data/__perf__/0b.txt';
          }
          if (size >= 1000) {
            return `/data/__perf__/${size / 1000}k.txt`;
          }
          return `/data/__perf__/${size}b.txt`;
        })();

        const [pingElapsed] = await this.measureElapsed(path);
        results.push(pingElapsed);
      }

      const [noFileMeasurement] = await this.measureElapsed('__ping__');

      // const [latency, speed] = results.reduce(([latency, speed], result) => {

      // }, [0, 0]);

      if (this.state.connectionStats.status !== AsyncProcessStatus.SUCCESS) {
        this.setState(
          {
            connectionStats: {
              status: AsyncProcessStatus.SUCCESS,
              value: {
                lastCheck,
                noFile: {
                  measure: noFileMeasurement,
                  totalMeasure: noFileMeasurement,
                },
                stats: results.map((measure, index) => {
                  return {
                    size: this.configs[index].size,
                    measure: {
                      measure,
                      totalMeasure: measure,
                    },
                  };
                }),
              },
            },
          },
          () => {
            this.pingCount++;
          },
        );
      } else {
        const x = this.state.connectionStats.value;
        this.setState(
          {
            connectionStats: {
              status: AsyncProcessStatus.SUCCESS,
              value: {
                lastCheck,
                noFile: {
                  measure: noFileMeasurement,
                  totalMeasure: this.state.connectionStats.value.noFile.totalMeasure + noFileMeasurement,
                },
                stats: results.map((measure, index) => {
                  return {
                    size: this.configs[index].size,
                    measure: {
                      measure,
                      totalMeasure: x.stats[index].measure.totalMeasure + measure,
                    },
                  };
                }),
              },
            },
          },
          () => {
            this.pingCount++;
          },
        );
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
          error: message,
        },
      });
    }
  }

  componentDidMount() {
    this.setState(
      {
        connectionStats: {
          status: AsyncProcessStatus.PENDING,
        },
      },
      () => {
        this.monitor.start();
      },
    );
  }

  componentWillUnmount() {
    this.monitor.stop();
  }

  formatBytesPerSecond(value: number) {
    return `${Intl.NumberFormat('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value)} b/s`;
  }

  renderPing(ping: Measure) {
    // rate is bytes / sec ping
    // const rate =  1000 / (speed.measure / 1000);
    // const averageRate =  (1000 * this.pingCount)  / (speed.totalMeasure / 1000);
    // {speed.measure} ms ---
    // {this.formatBytesPerSecond(rate)} ---
    return (
      <span>
        {Intl.NumberFormat('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(
          ping.totalMeasure / this.pingCount,
        )}{' '}
        ms avg
      </span>
    );
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
      return `${this.niceNumber(size / 1000)}K`;
    } else if (size < 1000000000) {
      return `${this.niceNumber(size / 1000000)}M`;
    } else {
      return `${this.niceNumber(size / 1000000000)}G`;
    }
  }

  renderPing2(_overhead: number, size: number, ping: Measure) {
    if (this.pingCount === 0) {
      return <span>Calculating first time...</span>;
    }
    // rate is bytes / sec ping
    // const rate =  1000 / (speed.measure / 1000);
    // const averageRate =  (1000 * this.pingCount)  / (speed.totalMeasure / 1000);
    // {speed.measure} ms ---
    // {this.formatBytesPerSecond(rate)} ---
    const downloadTime = ping.totalMeasure / this.pingCount;
    // rate is bytes / sec; size is already bytes, downloadTime is ms
    const rate = size / (downloadTime / 1000);
    return (
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <div style={{ flex: '0 0 6rem' }}>
          {Intl.NumberFormat('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(downloadTime)}ms ~
        </div>
        <div style={{ flex: '0 0 6rem' }}>{ping.totalMeasure}ms</div>
        <div>{this.renderSize(rate)}/s</div>
      </div>
    );
  }

  niceNumber(value: number) {
    return Intl.NumberFormat('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value);
  }

  renderSpeed(speed: Measure) {
    // rate is bytes / sec
    // const rate = 1000 / (speed.measure / 1000);
    const averageRate = (1000 * this.pingCount) / (speed.totalMeasure / 1000);
    // {speed.measure} ms ---
    // {this.formatBytesPerSecond(rate)} ---
    return <span>{this.formatBytesPerSecond(averageRate)} avg</span>;
  }

  // renderSize(size: number) {
  //     if (size >= 1000) {
  //         return `${size/1000}k`;
  //     }
  //     return `${size}b`;
  // }

  renderSuccess({ stats, noFile }: ConnectionStats) {
    // const ping = stats[2].measure.totalMeasure / this.pingCount;

    // Overhead is the cost in time of making a round trip.
    const overhead = stats[0].measure.totalMeasure / this.pingCount;

    const rows = stats.map(({ size, measure }, index) => {
      return (
        <tr style={{ margin: '0 1em' }} key={index + 1}>
          <th style={{ color: this.configs[index].color }}>{this.renderSize(size)}</th>
          <td style={{ color: this.configs[index].color }}>{this.renderPing2(overhead, size, measure)}</td>
        </tr>
      );
    });

    return (
      <Table>
        <tbody>
          <tr>
            <th style={{ width: '6rem' }}>Pings</th>
            <td>{this.pingCount}</td>
          </tr>
          <tr>
            <th>Overhead</th>
            <td>{this.pingCount === 0 ? 'Calculating first time...' : `${this.niceNumber(overhead)}ms`}</td>
          </tr>
          <tr style={{ margin: '0 1em' }} key="noFile">
            <th style={{ color: 'aqua' }}>none</th>
            <td style={{ color: 'aqua' }}>
              <div style={{ display: 'flex', flexDirection: 'row' }}>
                <div style={{ flex: '0 0 6rem' }}>
                  {Intl.NumberFormat('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(
                    noFile.measure,
                  )}
                  ms ~
                </div>
                <div style={{ flex: '0 0 6rem' }}>{noFile.totalMeasure}ms</div>
              </div>
            </td>
          </tr>
          {rows}
        </tbody>
        {/* [{this.pingCount}] P {this.niceNumber(ping)}ms: */}
        {/* OH {this.niceNumber(overhead)}ms: */}
        {/* {content} */}
      </Table>
    );
  }

  renderState() {
    switch (this.state.connectionStats.status) {
      case AsyncProcessStatus.NONE:
      case AsyncProcessStatus.PENDING:
        return;
      case AsyncProcessStatus.ERROR:
        return <ErrorAlert message={this.state.connectionStats.error} />;
      case AsyncProcessStatus.SUCCESS:
        return this.renderSuccess(this.state.connectionStats.value);
    }
  }

  render() {
    return (
      <Well variant="secondary">
        <Well.Body>{this.renderState()}</Well.Body>
      </Well>
    );
  }
}
