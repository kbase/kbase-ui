import { JobInfo } from "./lib/JobBrowserBFFClient";
import { App, Job, JobContext, JobContextType, TimeRange, TimeRangePresets } from "./store";
import { EpochTime } from "./types/base";
import { JobEventHistory, JobStateType } from "./types/jobState";

function makeJobContext(job: JobInfo): JobContext {
    switch (job.context.type) {
        case 'narrative':
            return {
                type: JobContextType.NARRATIVE,
                title: job.context.narrative.title,
                isTemporary: job.context.narrative.is_temporary,
                workspace: {
                    id: job.context.workspace.id,
                    isAccessible: job.context.workspace.is_accessible,
                    name: job.context.workspace.name,
                    isDeleted: job.context.workspace.is_deleted
                }
            };
        case 'workspace':
            return {
                type: JobContextType.WORKSPACE,
                workspace: {
                    id: job.context.workspace.id,
                    isAccessible: job.context.workspace.is_accessible,
                    name: job.context.workspace.name,
                    isDeleted: job.context.workspace.is_deleted
                }
            };
        case 'export':
            return {
                type: JobContextType.EXPORT,
            };
        case 'unknown':
            return {
                type: JobContextType.UNKNOWN,
            };
    }
}

export function serviceJobToEventHistory(job: JobInfo): JobEventHistory {
    switch (job.state.status) {
        case 'create':
            return [{
                type: JobStateType.CREATE,
                at: job.state.create_at
            }];
        case 'queue':
            return [{
                type: JobStateType.CREATE,
                at: job.state.create_at
            }, {
                type: JobStateType.QUEUE,
                at: job.state.queue_at
            }];
        case 'run':
            return [{
                type: JobStateType.CREATE,
                at: job.state.create_at
            }, {
                type: JobStateType.QUEUE,
                at: job.state.queue_at
            }, {
                type: JobStateType.RUN,
                at: job.state.run_at
            }];
        case 'complete':
            return [{
                type: JobStateType.CREATE,
                at: job.state.create_at
            }, {
                type: JobStateType.QUEUE,
                at: job.state.queue_at
            }, {
                type: JobStateType.RUN,
                at: job.state.run_at
            }, {
                type: JobStateType.COMPLETE,
                at: job.state.finish_at
            }];
        case 'error':
            if (job.state.run_at) {
                return [
                    {
                        type: JobStateType.CREATE,
                        at: job.state.create_at
                    }, {
                        type: JobStateType.QUEUE,
                        at: job.state.queue_at
                    }, {
                        type: JobStateType.RUN,
                        at: job.state.run_at
                    }, {
                        type: JobStateType.ERROR,
                        at: job.state.finish_at,
                        code: job.state.error.code,
                        message: job.state.error.message
                    }
                ];
            }
            if (job.state.queue_at) {
                return [
                    {
                        type: JobStateType.CREATE,
                        at: job.state.create_at
                    }, {
                        type: JobStateType.QUEUE,
                        at: job.state.queue_at
                    }, {
                        type: JobStateType.ERROR,
                        at: job.state.finish_at,
                        code: job.state.error.code,
                        message: job.state.error.message
                    }
                ];
            }

            return [
                {
                    type: JobStateType.CREATE,
                    at: job.state.create_at
                }, {
                    type: JobStateType.QUEUE,
                    at: job.state.queue_at
                }, {
                    type: JobStateType.ERROR,
                    at: job.state.finish_at,
                    code: job.state.error.code,
                    message: job.state.error.message
                }
            ];
        case 'terminate':
            if (job.state.run_at) {
                return [
                    {
                        type: JobStateType.CREATE,
                        at: job.state.create_at
                    }, {
                        type: JobStateType.QUEUE,
                        at: job.state.queue_at
                    }, {
                        type: JobStateType.RUN,
                        at: job.state.run_at
                    }, {
                        type: JobStateType.TERMINATE,
                        at: job.state.finish_at,
                        code: job.state.reason.code
                    }
                ];
            }
            if (job.state.queue_at) {
                return [
                    {
                        type: JobStateType.CREATE,
                        at: job.state.create_at
                    }, {
                        type: JobStateType.QUEUE,
                        at: job.state.queue_at
                    }, {
                        type: JobStateType.TERMINATE,
                        at: job.state.finish_at,
                        code: job.state.reason.code
                    }
                ];
            }

            return [
                {
                    type: JobStateType.CREATE,
                    at: job.state.create_at
                }, {
                    type: JobStateType.QUEUE,
                    at: job.state.queue_at
                }, {
                    type: JobStateType.TERMINATE,
                    at: job.state.finish_at,
                    code: job.state.reason.code
                }
            ];
    }
}

export function serviceJobToUIJob(job: JobInfo, _username: string): Job {
    const context = makeJobContext(job);
    let app: App | null;
    if (job.app) {
        app = {
            id: job.app.id,
            moduleName: job.app.module_name,
            functionName: job.app.function_name,
            title: job.app.title,
            type: job.app.type,
            iconURL: job.app.icon_url
        };
    } else {
        app = null;
    }
    return {
        id: job.job_id,
        request: {
            context,
            owner: {
                username: job.owner.username,
                realname: job.owner.realname
            },
            app,
            clientGroup: job.state.client_group,
        },
        eventHistory: serviceJobToEventHistory(job)
    };
}

export function calcAverage(total: number, count: number) {
    if (total) {
        if (count) {
            return total / count;
        } else {
            return null;
        }
    } else {
        if (count) {
            return 0;
        } else {
            return null;
        }
    }
}

export function calcRate(part: number, whole: number) {
    if (part) {
        if (whole) {
            return part / whole;
        } else {
            return null;
        }
    } else {
        if (whole) {
            return 0;
        } else {
            return null;
        }
    }
}

export function getTimeRange(preset: TimeRangePresets): [EpochTime, EpochTime] {
    const hourInMilliseconds = 1000 * 60 * 60;
    const endDate = new Date().getTime();
    switch (preset) {
        case 'lastHour':
            return [endDate - hourInMilliseconds, endDate];
        case 'last48Hours':
            return [endDate - hourInMilliseconds * 24 * 2, endDate];
        case 'lastWeek':
            return [endDate - hourInMilliseconds * 24 * 7, endDate];
        case 'lastMonth':
            return [endDate - hourInMilliseconds * 24 * 30, endDate];
        case 'lastYear':
            return [endDate - hourInMilliseconds * 24 * 365, endDate];
        case 'allTime':
            return [0, endDate];
    }
}

export function extractTimeRange(timeRange: TimeRange): [EpochTime, EpochTime] {
    switch (timeRange.kind) {
        case 'preset':
            return getTimeRange(timeRange.preset);
        case 'literal':
            return [timeRange.start, timeRange.end];
        default:
            throw new Error('Invalid time range kind value (should be impossible');
    }
}
