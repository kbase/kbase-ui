import { Job, JobID } from 'apps/JobBrowser/store';
import { JobEvent, JobStateType } from 'apps/JobBrowser/types/jobState';
import { serviceJobToUIJob } from 'apps/JobBrowser/utils';
import React from 'react';
import { DynamicServiceConfig } from 'types/config';
import JobBrowserBFFClient from '../../lib/JobBrowserBFFClient';
import { Poll } from '../../lib/Poll';
import { JobLogEntry } from '../JobLog';
import JobDetailComponent from './view';

const POLLING_INTERVAL = 5000;
const POLLING_PROGRESS_STEPS = 100;
const POLLING_WATCH_INTERVAL = 1000;

const LIMIT = 10000;
// TODO: get from somewhere else... 


export type JobLog = Array<JobLogEntry>;

export enum JobLogState {
    NONE = "JobLogState:NONE",
    JOB_CREATED = "JobLogState:JOB_CREATED",
    JOB_QUEUED = "JobLogState:JOB_QUEUED",
    INITIAL_LOADING = "JobLogState:INITIAL_LOADING",
    ACTIVE_LOADED = "JobLogState:ACTIVE_LOADED",
    ACTIVE_LOADING = "JobLogState:ACTIVE_LOADING",
    FINISHED_LOADED = "JobLogState:FINISHED_LOADED",
    ERROR = "JobLogState:ERROR"
}

// TODO: rename this and other things to JobDetailView...
export interface JobLogViewNone {
    status: JobLogState.NONE;
}

export interface JobLogViewCreated {
    status: JobLogState.JOB_CREATED;
    job: Job;
}

export interface JobLogViewQueued {
    status: JobLogState.JOB_QUEUED;
    job: Job;
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

export type JobLogView =
    JobLogViewNone |
    JobLogViewCreated |
    JobLogViewQueued |
    JobLogViewInitialLoading |
    JobLogViewActiveLoaded |
    JobLogViewActiveLoading |
    JobLogViewFinishedLoaded |
    JobLogViewError;

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

export default class JobLogsState extends React.Component<JobLogsStateProps, JobLogsStateState> {
    poller: Poll;
    // isPolling: boolean;
    // pollerTimer?: number;
    constructor(props: JobLogsStateProps) {
        super(props);
        // this.poller = new Poller({
        //     onPoll
        // })


        this.poller = new Poll({
            onPoll: this.runningPollerFunc.bind(this),
            pollInterval: POLLING_INTERVAL,
            progressSteps: POLLING_PROGRESS_STEPS,
            watchInterval: POLLING_WATCH_INTERVAL
        });
        // this.isPolling = false;

        this.state = {
            status: JobLogState.NONE
        };
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
            timeout: this.props.timeout,
        });

        return serviceJobToUIJob(jobs.jobs[0], 'UNKNOWN');
    }

    async getJobLog(offset: number, limit: number): Promise<Array<JobLogEntry>> {
        const jobBrowserBFF = new JobBrowserBFFClient({
            token: this.props.token,
            url: this.props.serviceWizardURL,
            timeout: this.props.timeout,
            version: this.props.jobBrowserBFFConfig.version
        });

        const jobLog = await jobBrowserBFF.get_job_log({
            job_id: this.props.jobID,
            offset, limit, timeout: this.props.timeout,
            admin: this.props.admin
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

    // async updateJobLog() {
    //     const startingLines = this.state.log.length;
    //     const lines = await this.getJobLog(startingLines);
    //     this.setState({
    //         log: {
    //             isLoaded: this.state.log.isLoaded,
    //             lines: this.state.log.lines.concat(lines)
    //         }
    //     })
    // }

    isJobQueued(job: Job): boolean {
        const currentState = job.eventHistory[job.eventHistory.length - 1];
        return (currentState.type === JobStateType.QUEUE || currentState.type === JobStateType.CREATE);
    }

    isJobRunning(job: Job): boolean {
        const currentState = job.eventHistory[job.eventHistory.length - 1];
        return (currentState.type === JobStateType.RUN);
    }

    currentJobState(job: Job): JobEvent {
        return job.eventHistory[job.eventHistory.length - 1];
    }

    /*
    The main job of this polling callback is to update the
    log while the job is running.
    */
    async runningPollerFunc() {
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

        const newLog = await this.getJobLog(offset, LIMIT);


        if (this.isJobQueued(job)) {
            this.poller.onPoll(this.queueingPollFunc.bind(this));
        } else if (this.isJobRunning(job)) {
            this.setState({
                status: JobLogState.ACTIVE_LOADED,
                log: log.concat(newLog),
                job
            });
        } else {
            this.setState({
                status: JobLogState.FINISHED_LOADED,
                log: log.concat(newLog),
                job
            });
            if (this.poller) {
                this.poller.stop();
            }
        }
    };

    /*
    The main job of this method is to serve as a polling 
    callback when the job is queued.
    */
    async queueingPollFunc() {
        try {
            const job = await this.getJob();

            if (this.isJobQueued(job)) {
                // Just keep running this poller func until
                // the job is of the queue and running...
                return;
            } else if (this.isJobRunning(job)) {
                const log = await this.getJobLog(0, LIMIT);
                this.setState({
                    status: JobLogState.ACTIVE_LOADED,
                    log,
                    job
                });
                this.poller.onPoll(this.runningPollerFunc.bind(this));
            } else {
                const log = await this.getJobLog(0, LIMIT);
                switch (this.currentJobState(job).type) {
                    case JobStateType.COMPLETE:
                        this.setState({
                            status: JobLogState.FINISHED_LOADED,
                            log,
                            job
                        });
                        break;
                    case JobStateType.ERROR:
                        this.setState({
                            status: JobLogState.ERROR,
                            // TODO: look more closely, this is all a little weird as we
                            // are using the "JobLogState" for the JobState...
                            error: 'FOO'
                            // log,
                            // job
                        });
                        break;
                    case JobStateType.TERMINATE:
                        this.setState({
                            status: JobLogState.FINISHED_LOADED,
                            log,
                            job
                        });
                        break;
                }
                this.poller.stop();
            }
        } catch (ex) {
            console.error('ERROR', ex);
        }
    };

    async getInitialJobLog() {
        this.setState({
            status: JobLogState.INITIAL_LOADING
        });
        const job = await this.getJob();
        let log;
        switch (this.currentJobState(job).type) {
            case JobStateType.CREATE:
                this.setState({
                    status: JobLogState.JOB_CREATED,
                    job
                });
                this.poller.onPoll(this.queueingPollFunc.bind(this));
                this.poller.start();
                return;
            case JobStateType.QUEUE:
                this.setState({
                    status: JobLogState.JOB_QUEUED,
                    job
                });
                this.poller.onPoll(this.queueingPollFunc.bind(this));
                this.poller.start();
                return;
            case JobStateType.RUN:
                try {
                    log = await this.getJobLog(0, LIMIT);
                    this.setState({
                        status: JobLogState.ACTIVE_LOADED,
                        log,
                        job
                    });
                    this.poller.onPoll(this.runningPollerFunc.bind(this));
                    this.poller.start();
                } catch (ex) {
                    this.setState({
                        status: JobLogState.ERROR,
                        error: ex instanceof Error ? ex.message : 'Unknown Error'
                    });
                }
                return;
            case JobStateType.COMPLETE:
            case JobStateType.ERROR:
            case JobStateType.TERMINATE:
                try {
                    log = await this.getJobLog(0, LIMIT);
                    this.setState({
                        status: JobLogState.FINISHED_LOADED,
                        log,
                        job
                    });
                } catch (ex) {
                    this.setState({
                        status: JobLogState.ERROR,
                        error: ex instanceof Error ? ex.message : 'Unknown Error'
                    });
                }
                return;
        }
    }

    componentDidMount() {
        this.getInitialJobLog();
    }

    componentWillUnmount() {
        this.poller.stop();
    }

    render() {
        return <JobDetailComponent view={this.state} />;
    }
}
