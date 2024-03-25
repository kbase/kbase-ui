import { Alert, Spin } from 'antd';
import { Job, JobID } from 'apps/JobBrowser/store';
import { JobEvent, JobStateType } from 'apps/JobBrowser/types/jobState';
import { serviceJobToUIJob } from 'apps/JobBrowser/utils';
import { Component } from 'react';
import { DynamicServiceConfig } from 'types/config';
import JobBrowserBFFClient from '../../lib/JobBrowserBFFClient';
import JobLogComponent from './view';

const POLLING_INTERVAL = 5000;
const JOB_LOG_LIMIT = 1000;

// A simple state wrapper for job logs.

export interface JobLogEntry {
    lineNumber: number;
    loggedAt: Date | null,
    message: string;
    isError: boolean;
}
export enum JobLogState {
    NONE,
    JOB_CREATED,
    JOB_QUEUED,
    INITIAL_LOADING,
    ACTIVE_LOADED,
    ACTIVE_LOADING,
    FINISHED_LOADED,
    ERROR
}

export interface JobLogViewNone {
    status: JobLogState.NONE;
}

export interface JobLogViewCreated {
    status: JobLogState.JOB_CREATED;
}

export interface JobLogViewQueued {
    status: JobLogState.JOB_QUEUED;
}

export interface JobLogViewInitialLoading {
    status: JobLogState.INITIAL_LOADING;
}

export interface JobLogViewActiveLoaded {
    status: JobLogState.ACTIVE_LOADED,
    log: Array<JobLogEntry>;
    job: Job;
}

export interface JobLogViewActiveLoading {
    status: JobLogState.ACTIVE_LOADING,
    log: Array<JobLogEntry>;
    job: Job;
}

export interface JobLogViewFinishedLoaded {
    status: JobLogState.FINISHED_LOADED,
    log: Array<JobLogEntry>;
    job: Job;
}

export interface JobLogViewError {
    status: JobLogState.ERROR,
    error: string;
}

export type JobLogView = JobLogViewNone | JobLogViewCreated | JobLogViewQueued | JobLogViewInitialLoading | JobLogViewActiveLoaded | JobLogViewActiveLoading | JobLogViewFinishedLoaded | JobLogViewError;

export interface JobLogsStateProps {
    jobID: JobID;
    token: string;
    timeout: number;
    njsURL: string;
    serviceWizardURL: string;
    admin: boolean;
    jobBrowserBFFConfig: DynamicServiceConfig;
}

type JobLogsStateState = JobLogView;

export default class JobLogsState extends Component<JobLogsStateProps, JobLogsStateState> {
    pollTimer: number | null;
    stopping: boolean;
    constructor(props: JobLogsStateProps) {
        super(props);
        this.state = {
            status: JobLogState.NONE
        };
        this.pollTimer = null;
        this.stopping = false;
    }

    async getJob(): Promise<Job> {
        const jobBrowserBFF = new JobBrowserBFFClient({
            token: this.props.token,
            url: this.props.serviceWizardURL,
            timeout: this.props.timeout,
            version: this.props.jobBrowserBFFConfig.version
        });

        const jobs = await jobBrowserBFF.get_jobs({
            job_ids: [this.props.jobID],
            // TODO: admin??
            admin: this.props.admin,
            // TODO: from config
            timeout: this.props.timeout
        });

        return serviceJobToUIJob(jobs.jobs[0], 'UNKNOWN');
    }

    async getJobLog(offset: number, limit: number, timeout: number, admin: boolean): Promise<Array<JobLogEntry>> {
        const jobBrowserBFF = new JobBrowserBFFClient({
            token: this.props.token,
            url: this.props.serviceWizardURL,
            timeout: this.props.timeout,
            version: this.props.jobBrowserBFFConfig.version
        });


        const jobLog = await jobBrowserBFF.get_job_log({
            job_id: this.props.jobID,
            offset, limit, timeout, admin
        });

        return jobLog.log.map((entry) => {
            return {
                lineNumber: entry.row,
                message: entry.message,
                isError: entry.level === 'error',
                loggedAt: entry.logged_at ? new Date(entry.logged_at) : null
            };
        });
    }

    currentJobState(job: Job): JobEvent {
        return job.eventHistory[job.eventHistory.length - 1];
    }

    startPolling() {
        const poller = async () => {
            this.pollTimer = null;
            const state = this.state;
            if (state.status !== JobLogState.ACTIVE_LOADED) {
                this.setState({
                    status: JobLogState.ERROR,
                    error: 'Invalid state for polling: ' + state.status
                });
                return;
            }
            const { log } = state;
            this.setState({
                status: JobLogState.ACTIVE_LOADING,
                log
            });
            const job = await this.getJob();
            const offset = log.length;
            // TODO: how to mimic offset at end of log (above, done), and 
            // an indefinite limit? For now, just use 1000.
            const limit = JOB_LOG_LIMIT;
            // TODO: get from somewhere else... 
            const timeout = this.props.timeout;
            // TODO: get from somewhere else...
            const newLog = await this.getJobLog(offset, limit, timeout, this.props.admin);

            switch (this.currentJobState(job).type) {
                case JobStateType.CREATE:
                case JobStateType.QUEUE:
                    // should not occur!

                    this.startQueuedPolling();
                    break;
                case JobStateType.RUN:
                    this.setState({
                        status: JobLogState.ACTIVE_LOADED,
                        log: log.concat(newLog),
                        job
                    });
                    loop();
                    break;
                default:
                    this.setState({
                        status: JobLogState.FINISHED_LOADED,
                        log: log.concat(newLog),
                        job
                    });
            }
        };
        const loop = () => {
            this.pollTimer = window.setTimeout(poller, POLLING_INTERVAL);
        };
        loop();
    }

    startQueuedPolling() {
        // TODO: how to mimic offset at end of log (above, done), and 
        // an indefinite limit? For now, just use 1000.
        const limit = 1000;

        const poller = async () => {
            this.pollTimer = null;
            const job = await this.getJob();
            switch (this.currentJobState(job).type) {
                case JobStateType.CREATE:
                case JobStateType.QUEUE:
                    // still queued, eh?
                    loop();
                    break;
                case JobStateType.RUN:
                    this.startPolling();
                    break;
                default:
                    var log = await this.getJobLog(0, limit, this.props.timeout, this.props.admin);
                    this.setState({
                        status: JobLogState.FINISHED_LOADED,
                        log,
                        job
                    });
            }
        };

        const loop = () => {
            this.pollTimer = window.setTimeout(poller, POLLING_INTERVAL);
        };

        loop();
    }

    async getInitialJobLog() {
        this.setState({
            status: JobLogState.INITIAL_LOADING
        });
        const job = await this.getJob();

        // TODO: how to mimic offset at end of log (above, done), and 
        // an indefinite limit? For now, just use 1000.
        const limit = 1000;


        let log;
        switch (this.currentJobState(job).type) {
            case JobStateType.CREATE:
                // still queued, eh?
                this.setState({
                    status: JobLogState.JOB_CREATED
                });
                this.startQueuedPolling();
                return;
            case JobStateType.QUEUE:
                // still queued, eh?
                this.setState({
                    status: JobLogState.JOB_QUEUED
                });
                this.startQueuedPolling();
                return;
            case JobStateType.RUN:
                log = await this.getJobLog(0, limit, this.props.timeout, this.props.admin);
                this.setState({
                    status: JobLogState.ACTIVE_LOADED,
                    log,
                    job
                });
                return;
            default:
                log = await this.getJobLog(0, limit, this.props.timeout, this.props.admin);
                this.setState({
                    status: JobLogState.FINISHED_LOADED,
                    log,
                    job
                });
                return;
        }
    }

    componentDidMount() {
        this.getInitialJobLog();
    }

    componentWillUnmount() {
        this.stopping = true;
        if (this.pollTimer) {
            window.clearTimeout(this.pollTimer);
        }
    }

    renderLoading() {
        return (
            <div>
                UI is Loading ... <Spin />
            </div>
        );
    }

    renderQueued() {
        return (
            <div>
                Job is Queued ... <Spin />
            </div>
        );
    }

    renderError(view: JobLogViewError) {
        return (
            <Alert type="error" message={view.error} />
        );
    }

    // render() {
    //     return this.renderLoading();
    // }

    render() {
        const state = this.state;
        switch (state.status) {
            case JobLogState.NONE:
            case JobLogState.JOB_QUEUED:
                return this.renderQueued();
            case JobLogState.INITIAL_LOADING:
                return this.renderLoading();
            case JobLogState.ERROR:
                return this.renderError(state);
            case JobLogState.ACTIVE_LOADED:
            case JobLogState.ACTIVE_LOADING:
                return <JobLogComponent job={state.job} log={state.log} />;
            case JobLogState.FINISHED_LOADED:
                return <JobLogComponent job={state.job} log={state.log} />;
        }
    }
}
