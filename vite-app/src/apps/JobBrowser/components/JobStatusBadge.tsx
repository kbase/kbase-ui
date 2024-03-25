import { InfoCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import { Tag, Tooltip } from 'antd';
import NiceTimeDuration from 'components/NiceTimeDuration';
import { Component } from 'react';
import { Job } from '../store';
import { JobEvent, JobStateType } from '../types/jobState';
import NiceElapsedTime from './NiceElapsedTime';
import NiceRelativeTime from './NiceRelativeTime';

const STALE_AFTER = 300000;

function currentEvent(job: Job): JobEvent {
    return job.eventHistory[job.eventHistory.length - 1];
}


/**
 * Translates a job status value to a color value acceptable for the color
 * prop for the job status tag.
 *
 * @param status - the status of the job
 */
export function jobColor(job: Job): string {
    switch (currentEvent(job).type) {
        case JobStateType.CREATE:
            return 'purple';
        case JobStateType.QUEUE:
            return 'orange';
        case JobStateType.RUN:
            return 'blue';
        case JobStateType.COMPLETE:
            return 'green';
        case JobStateType.ERROR:
            return 'red';
        case JobStateType.TERMINATE:
            return 'gray';
        default:
            throw new Error('Invalid job status');
    }
}

export interface JobStatusProps {
    job: Job;
    showTiming?: boolean;
}

interface JobStatusState {

}

export default class JobStatusBadge extends Component<JobStatusProps, JobStatusState> {
    renderTag() {
        const label = this.renderJobStatusLabel();
        const color = jobColor(this.props.job);
        return <Tooltip title={this.renderJobStatusTooltip()}>
            <Tag color={color}>{label}</Tag>
        </Tooltip>;
    }
    /**
* Translates a job status value to a label, with optional icon, suitable for
* display as the child of the job status tag.
*
* @param status - the status of the job
*
* @note Since the switch is over an enum, we don't have to worry about the default case
*/
    renderJobStatusLabel() {
        switch (currentEvent(this.props.job).type) {
            case JobStateType.CREATE:
                return 'Created';
            case JobStateType.QUEUE:
                return (
                    <span>
                        <LoadingOutlined /> Queued
                    </span>
                );
            case JobStateType.RUN:
                return (
                    <span>
                        <LoadingOutlined /> Running
                    </span>
                );
            case JobStateType.COMPLETE:
                return 'Completed';
            case JobStateType.ERROR:
                return 'Errored';
            case JobStateType.TERMINATE:
                return 'Canceled';
            default:
                throw new Error('Invalid job status');
        }
    }

    renderJobStatusTooltip() {
        const event = currentEvent(this.props.job);
        switch (event.type) {
            case JobStateType.CREATE:
                // A created job is stale if over 5 minutes old
                const stale = () => {
                    const now = new Date().getTime();
                    const elapsed = now - event.at;
                    if (elapsed > STALE_AFTER) {
                        return <p>
                            This job is considered <b>orphaned</b>, since it was created
                             <NiceElapsedTime from={event.at} to={now} showTooltip /> ago.
                            A job should move into a queue within {<NiceTimeDuration duration={STALE_AFTER} />}.
                        </p>;
                    }
                };
                return (
                    <div>
                        <p>This job has been received by the execution engine, but not yet queued for running.</p>
                        {stale()}
                    </div>
                );
            case JobStateType.QUEUE:
                return (
                    <div>
                        <p>
                            This job has been <b>queued</b> for running
                        </p>
                        <p>
                            You may inspect the job log by clicking the <InfoCircleOutlined /> button in the leftmost column.
                        </p>
                    </div>
                );
            case JobStateType.RUN:
                return (
                    <div>

                        <p>
                            This job is currently <b>running</b>.
                        </p>
                        <p>
                            You may inspect the job log by clicking the <InfoCircleOutlined /> button in the leftmost column.
                        </p>
                    </div>
                );
            case JobStateType.COMPLETE:
                return (
                    <div>
                        <p>
                            This job has <b>completed successfully</b>.
                        </p>
                        <p>
                            You may inspect the job log by clicking the <InfoCircleOutlined /> button in the leftmost column.
                        </p>
                    </div>
                );
            case JobStateType.ERROR:
                return (
                    <div>
                        <p>
                            This job experienced an <b>error</b>.
                        </p>
                        <p>
                            You may inspect the error and job log by clicking the <InfoCircleOutlined /> button in the leftmost column.
                        </p>
                    </div>
                );
            case JobStateType.TERMINATE:
                return (
                    <div>
                        <p>
                            This job has been <b>canceled</b>.
                        </p>
                        <p>
                            You may inspect the job log by clicking the <InfoCircleOutlined /> button in the leftmost column.
                        </p>
                    </div>
                );
            default:
                throw new Error('Invalid job status');
        }
    }

    renderTiming() {
        const job = this.props.job;
        const event = currentEvent(job);
        switch (event.type) {
            case JobStateType.CREATE:
                return <span>-</span>;
            case JobStateType.QUEUE:
            case JobStateType.RUN:
                return <NiceElapsedTime
                    from={event.at}
                    useClock={true} />;
            default:
                return <span>
                    <NiceRelativeTime time={new Date(event.at)} />
                </span>;
        }
    }

    render() {
        const timing = this.props.showTiming ? this.renderTiming() : '';
        return (
            <span>
                {this.renderTag()}
                {timing}
            </span>
        );
    }
}
