import React from 'react';
import './style.css';

import { Button, Dropdown, Empty, MenuProps, Spin, Table, Tooltip } from 'antd';
// import { ClickParam } from 'antd/lib/menu';
import ButtonGroup from 'antd/lib/button/button-group';
// import Papa from 'papaparse';

import { ArrowDownOutlined, CaretRightOutlined, DownloadOutlined, PauseOutlined } from '@ant-design/icons';
// TODO: replace with ClickParam when fixed upstream
// https://github.com/ant-design/ant-design/issues/25467
import { Job } from 'apps/JobBrowser/store';
import { JobStateType } from 'apps/JobBrowser/types/jobState';
import { JobLogEntry } from '.';

export type DownloadFileType = 'csv' | 'tsv' | 'text' | 'json';

enum PlayState {
    NONE,
    PLAYING,
    PAUSED,
    DISABLED
}

export interface JobLogProps {
    job: Job;
    log: Array<JobLogEntry>;
}

interface JobLogState {
    playState: PlayState;
    isPaused: boolean;
}

export default class JobLogs extends React.Component<JobLogProps, JobLogState> {
    playLogTimer: number;
    bodyRef: React.RefObject<HTMLDivElement>;
    // a hack to detect state change... 
    currentJobEventType: JobStateType | null;

    constructor(params: JobLogProps) {
        super(params);
        this.playLogTimer = 0;
        this.bodyRef = React.createRef();
        this.currentJobEventType = null;
        this.state = {
            playState: PlayState.NONE,
            isPaused: false
        };
    }
    currentEvent(job: Job) {
        return job.eventHistory[job.eventHistory.length - 1];
    }
    componentDidMount() {
        this.currentJobEventType = this.currentEvent(this.props.job).type;

        // if (this.state.playState !== PlayState.PLAYING) {
        //     return;
        // }
        if (this.state.isPaused) {
            return;
        }
        if (!this.isActive()) {
            return;
        }
        this.scrollToBottom();
    }
    componentWillUnmount() {

    }
    scrollToBottom() {
        if (this.bodyRef.current === null) {
            return;
        }
        this.bodyRef.current.scrollTop = this.bodyRef.current.scrollHeight;
    }

    componentDidUpdate() {
        const lastJobEvent = this.currentEvent(this.props.job);
        this.currentJobEventType = lastJobEvent.type;
        // if (this.state.playState !== PlayState.PLAYING) {
        //     return;
        // }
        if (this.state.isPaused) {
            return;
        }
        if (!this.isActive()) {
            if (lastJobEvent.type === JobStateType.RUN &&
                this.currentJobEventType === JobStateType.RUN) {
                return;
            }
        }
        this.scrollToBottom();
    }
    isActive() {
        const currentJobEvent = this.currentEvent(this.props.job);
        return currentJobEvent.type === JobStateType.QUEUE ||
            currentJobEvent.type === JobStateType.RUN;
    }
    renderLastLine() {
        let message;

        if (this.isActive()) {
            message = <span>
                Polling for additional log entries...{' '}
                <Spin size="small" />
            </span>;
        } else {
            message = <div style={{ textAlign: 'center', fontStyle: 'italic' }}>Log complete</div>;
        }
        return (
            <div className="FlexTable-row" key='END' style={{ backgroundColor: 'rgba(200, 200, 200, 0.5)' }} data-end="end">
                <div className="FlexTable-col"></div>
                <div className="FlexTable-col">{message}</div>
            </div>
        );
    }
    formatLogDate(date: Date) {
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        };
        const parts = Intl.DateTimeFormat('en-US', options).formatToParts(date);
        const partsMap: Map<string, string> = parts.reduce((partsMap, { type, value }) => {
            partsMap.set(type, value);
            return partsMap;
        }, new Map());
        return <Tooltip title={Intl.DateTimeFormat('en-US', options).format(date)}>
            <span>{partsMap.get('hour')}:{partsMap.get('minute')}:{partsMap.get('second')}{partsMap.get('dayPeriod')?.toLocaleLowerCase()}</span>
        </Tooltip>;
    }
    renderJobLog() {
        const log = this.props.log;
        if (log.length === 0) {
            return (
                <Empty />
            );
        }
        const hasTimestamp = log[0].loggedAt !== null;
        const rows = log.map((entry) => {
            const rowStyle: React.CSSProperties = {};
            if (entry.isError) {
                rowStyle.color = 'red';
            }
            if (hasTimestamp) {
                return <div className="FlexTable-row" style={rowStyle} key={entry.lineNumber}>
                    <div className="FlexTable-col lineNumber">
                        {entry.lineNumber}
                    </div>
                    <div className="FlexTable-col loggedAt">
                        {entry.loggedAt ? this.formatLogDate(entry.loggedAt) : ''}
                    </div>
                    <div className="FlexTable-col message">
                        {entry.message}
                    </div>
                </div>;
            } else {
                return <div className="FlexTable-row" style={rowStyle} key={entry.lineNumber}>
                    <div className="FlexTable-col lineNumber">
                        {entry.lineNumber}
                    </div>
                    <div className="FlexTable-col message">
                        {entry.message}
                    </div>
                </div>;
            }
        });
        rows.push(
            this.renderLastLine()
        );
        if (hasTimestamp) {
            return (
                <div className="FlexTable" key="log">
                    <div className="FlexTable-header">
                        <div className="FlexTable-row">
                            <div className="FlexTable-col lineNumber">Line #</div>
                            <div className="FlexTable-col loggedAt">At</div>
                            <div className="FlexTable-col message">Log line</div>
                        </div>
                    </div>
                    <div className="FlexTable-body" ref={this.bodyRef}>
                        {rows}
                    </div>
                </div>
            );
        } else {
            return (
                <div className="FlexTable" key="log">
                    <div className="FlexTable-header">
                        <div className="FlexTable-row">
                            <div className="FlexTable-col lineNumber">Line #</div>
                            <div className="FlexTable-col message">Log line</div>
                        </div>
                    </div>
                    <div className="FlexTable-body" ref={this.bodyRef}>
                        {rows}
                    </div>
                </div>
            );
        }
    }

    renderJobLogRow() {

    }
    renderJobLogLines() {
        return (
            <Table
                dataSource={this.props.log}
                size="small"
                // scroll={{ y: 400 }}
                rowKey={(logLine: JobLogEntry) => {
                    return String(logLine.lineNumber);
                }}
                // pagination={{ position: 'top', showSizeChanger: true }}
                pagination={false}
                scroll={{ y: '100%' }}
                rowClassName={(line: JobLogEntry) => {
                    if (line.isError) {
                        return 'JobLog-errorRow';
                    } else {
                        return 'JobLog-normalRow';
                    }
                }}
            >
                <Table.Column
                    title="Row"
                    dataIndex="lineNumber"
                    key="lineNumber"
                    width="8%"
                    render={(lineNumber: number, logLine: JobLogEntry) => {
                        const numberDisplay = new Intl.NumberFormat('en-US', { useGrouping: true }).format(lineNumber);
                        if (logLine.isError) {
                            return <span className="JobLog-errorText">{numberDisplay}</span>;
                        }
                        return numberDisplay;
                    }}
                    sorter={(a: JobLogEntry, b: JobLogEntry) => {
                        return a.lineNumber - b.lineNumber;
                    }}
                />
                <Table.Column
                    title="Log line"
                    dataIndex="line"
                    key="line"
                    width="92%"
                    render={(line: string, logLine: JobLogEntry) => {
                        let row;
                        if (logLine.isError) {
                            row = <span className="JobLog-errorText">{line}</span>;
                        } else {
                            row = <span>{line}</span>;
                        }
                        return <Tooltip title={line}>{row}</Tooltip>;
                    }}
                />
            </Table>
        );
    }

    downloadLog(type: DownloadFileType) {
        function download(filename: string, contentType: string, content: string) {
            const downloadLink = document.createElement('a');
            const downloadContent = new Blob([content]);
            downloadLink.href = URL.createObjectURL(downloadContent);
            downloadLink.download = filename;
            downloadLink.style.visibility = 'none';
            downloadLink.type = contentType;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(downloadLink.href);
        }

        function generateCSV(data: Array<any>, columns: Array<string>) {
            function encodeString(s: string) {
                return `"${s.replace('"', '""')}"`;
            }
            const header = columns.map((column) => {
                return encodeString(column);
            }).join(',');
            const table = data.map((datum) => {
                return columns.map((column) => {
                    const value = datum[column];
                    if (typeof value === 'undefined') {
                        return '';
                    } else if (typeof value === 'string') {
                        return encodeString(value);
                    } else if (typeof value === 'number') {
                        return String(value);
                    } else if (typeof value === 'boolean') {
                        return encodeString(value ? 'true' : 'false');
                    } else if (typeof value === 'object') {
                        if (value instanceof Date) {
                            return encodeString(value.toISOString());
                        } else {
                            throw new Error("Unsupported object " + value.constructor.name);
                        }
                    } else {
                        throw new Error("Unsupported type");
                    }
                }).join(',');
            }).join('\n');
            return header + '\n' + table;
        }

        function generateTSV(data: Array<any>, columns: Array<string>) {
            function encodeString(s: string) {
                const escaped = s
                    .replace('\\', '\\\\')
                    .replace('\t', '\\t')
                    .replace('\n', '\\n')
                    .replace('\r', '\\r');
                return escaped;
            }
            const header = columns.map((column) => {
                return encodeString(column);
            }).join('\t');
            const table = data.map((datum) => {
                return columns.map((column) => {
                    const value = datum[column];
                    if (typeof value === 'undefined') {
                        return '';
                    } else if (typeof value === 'string') {
                        return encodeString(value);
                    } else if (typeof value === 'number') {
                        return String(value);
                    } else if (typeof value === 'boolean') {
                        return encodeString(value ? 'true' : 'false');
                    } else if (typeof value === 'object') {
                        if (value instanceof Date) {
                            return encodeString(value.toISOString());
                        } else {
                            throw new Error("Unsupported object " + value.constructor.name);
                        }
                    } else {
                        throw new Error("Unsupported type");
                    }
                }).join('\t');
            }).join('\n');
            return header + '\n' + table;
        }

        function logToCSV(log: Array<JobLogEntry>): string {
            return generateCSV(log, ["lineNumber", "loggedAt", "message", "isError"]);
        }
        function logToTSV(log: Array<JobLogEntry>): string {
            return generateTSV(log, ["lineNumber", "loggedAt", "message", "isError"]);
        }
        function logToJSON(log: Array<JobLogEntry>): string {
            return JSON.stringify(log, null, 4);
        }
        function logToText(log: Array<JobLogEntry>): string {
            return log.map((entry) => {
                return entry.message;
            }).join('\n');
        }

        let contentType: string;
        let content: string;
        const log = this.props.log;
        switch (type) {
            case 'tsv':
                contentType = 'application/octet-stream';
                content = logToTSV(log);
                break;
            case 'json':
                contentType = 'application/octet-stream';
                content = logToJSON(log);
                break;
            case 'text':
                contentType = 'text/plain';
                content = logToText(log);
                break;
            case 'csv':
                contentType = 'application/octet-stream';
                content = logToCSV(log);
                break;
        }

        download('job-log.' + type, contentType, content);
    }

    onPlayLog() {
        // this.props.updateJobLog();
        this.scrollToBottom();
        this.setState({
            playState: PlayState.PLAYING,
            isPaused: false
        });
    }

    onPauseLog() {
        this.setState({
            playState: PlayState.PAUSED,
            isPaused: true
        });
    }

    renderPlayPauseTooltips() {
        let playTooltip: string;
        let pauseTooltip: string;
        const isPaused = this.state.isPaused;

        switch (this.currentEvent(this.props.job).type) {
            case JobStateType.RUN:
                if (isPaused) {
                    playTooltip = 'Click to automatically scroll to the bottom of the logs when new entries arrive';
                    pauseTooltip = 'Automatic scrolling is already paused';
                } else {
                    playTooltip = 'Automatic scrolling is already active';
                    pauseTooltip = 'Click to pause automatic scrolling to the bottom of the logs when new entries arrive';
                }
                break;
            default:
                playTooltip = 'Log playing only available when the job is running';
                pauseTooltip = 'Log playing only available when the job is running';
                break;

        }
        return [playTooltip, pauseTooltip];
    }

    renderPlayPause() {
        let irrelevant: boolean;

        // Does the job status make log playing irrelevant.
        switch (this.currentEvent(this.props.job).type) {
            case JobStateType.RUN:
                irrelevant = false;
                break;
            default:
                irrelevant = true;
                break;
        }

        const [playTooltip, pauseTooltip] = this.renderPlayPauseTooltips();

        return (
            <ButtonGroup >
                <Tooltip title={playTooltip}>
                    <Button icon={<CaretRightOutlined />} disabled={irrelevant || !this.state.isPaused} onClick={this.onPlayLog.bind(this)} />
                </Tooltip>
                <Tooltip title={pauseTooltip}>
                    <Button icon={<PauseOutlined />} disabled={irrelevant || this.state.isPaused} onClick={this.onPauseLog.bind(this)} />
                </Tooltip>
            </ButtonGroup>
        );
    }


    renderToolbar() {
        const disabled = this.props.log.length === 0;

        const items: MenuProps['items'] = [
            {
                key: 'csv', disabled: disabled, label: 'CSV', onClick: () => this.downloadLog('csv')
            },
            {
                key: 'tsv', disabled: disabled, label: 'TSV', onClick: () => this.downloadLog('tsv')
            },
            {
                key: 'json', disabled: disabled, label: 'JSON', onClick: () => this.downloadLog('json')
            },
            {
                key: 'text', disabled: disabled, label: 'TEXT', onClick: () => this.downloadLog('text')
            },
        ]
        return (
            <div key="toolbar">
                <ButtonGroup >
                    <Dropdown menu={{items}}>
                        <Button 
                            icon={<DownloadOutlined />}
                            onClick={(e) => e.preventDefault()}
                        />
                    </Dropdown>
                </ButtonGroup>
                {' '}
                <Tooltip title="Jump to bottom of log">
                    <Button icon={<ArrowDownOutlined />} onClick={this.scrollToBottom.bind(this)} />
                </Tooltip>
                {' '}
                {this.renderPlayPause()}
            </div>
        );
    }
    render() {
        return <div className="JobLog">
            {this.renderToolbar()}
            {this.renderJobLog()}
        </div>;
    }
}
