import { Spin } from 'antd';
import UILink from 'components/UILink2';
import { Component } from 'react';
import { Job, JobContextType } from '../store';
import { JobEvent, JobStateType } from '../types/jobState';
import JobStatusBadge, { jobColor } from './JobStatusBadge';
import NarrativeLink from './NarrativeLink';
import NiceElapsedTime from './NiceElapsedTime';
import NiceRelativeTime from './NiceRelativeTime';

export interface Props {
  job: Job;
}

interface State {}

export default class JobInfo extends Component<Props, State> {
  currentJobState(job: Job): JobEvent {
    return job.eventHistory[job.eventHistory.length - 1];
  }

  lastEvent(job: Job, type: JobStateType): JobEvent {
    for (let i = job.eventHistory.length - 1; i >= 0; i -= 1) {
      const jobEvent = job.eventHistory[i];
      if (jobEvent.type === type) {
        return jobEvent;
      }
    }
    // TODO: a better way of ensuring we have the right sequence of events (as defined in types)
    throw new Error('Matching state not found: ' + type);
  }
  getLastEvent(job: Job, type: Array<JobStateType>): JobEvent {
    for (let i = job.eventHistory.length - 1; i >= 0; i -= 1) {
      const jobEvent = job.eventHistory[i];
      if (type.includes(jobEvent.type)) {
        return jobEvent;
      }
    }
    // TODO: a better way of ensuring we have the right sequence of events (as defined in types)
    throw new Error('Matching state not found: ' + type);
  }
  renderSubmitted() {
    const date = new Date(this.props.job.eventHistory[0].at);
    return <NiceRelativeTime time={new Date(date)} />;
  }
  renderQueuedFor() {
    const job = this.props.job;
    const currentState = this.currentJobState(job);
    switch (
      currentState.type // left off here
    ) {
      case JobStateType.CREATE:
        return <span>-</span>;
      case JobStateType.QUEUE:
        return <NiceElapsedTime from={currentState.at} precision={2} useClock={true} />;
      case JobStateType.RUN:
        return <NiceElapsedTime from={this.lastEvent(job, JobStateType.QUEUE).at} to={currentState.at} precision={2} />;
      case JobStateType.ERROR:
      case JobStateType.TERMINATE:
        // May have stopped in any prior state - create, queue, run
        const lastEvent = this.getLastEvent(job, [JobStateType.CREATE, JobStateType.QUEUE, JobStateType.RUN]);
        switch (lastEvent.type) {
          case JobStateType.CREATE:
            return <span>-</span>;
          case JobStateType.QUEUE:
            return <NiceElapsedTime from={lastEvent.at} to={currentState.at} precision={2} useClock={false} />;
          case JobStateType.RUN:
            return (
              <NiceElapsedTime from={this.lastEvent(job, JobStateType.QUEUE).at} to={lastEvent.at} precision={2} />
            );
          default:
            // hmm, no other states should be here
            // TODO: redesign states so that there are
            // active states (these ones), and inactive.
            return <span>?</span>;
        }
      case JobStateType.COMPLETE:
        return (
          <NiceElapsedTime
            from={this.lastEvent(job, JobStateType.QUEUE).at}
            to={this.lastEvent(job, JobStateType.RUN).at}
            precision={2}
          />
        );
    }
  }
  renderRunFor() {
    const job = this.props.job;
    const currentState = this.currentJobState(job);
    switch (currentState.type) {
      case JobStateType.CREATE:
      case JobStateType.QUEUE:
        return <span>-</span>;
      case JobStateType.RUN:
        return <NiceElapsedTime from={currentState.at} precision={2} useClock={true} />;
      case JobStateType.ERROR:
      case JobStateType.TERMINATE:
        // May have stopped in any prior state - create, queue, run
        const lastEvent = this.getLastEvent(job, [JobStateType.CREATE, JobStateType.QUEUE, JobStateType.RUN]);
        switch (lastEvent.type) {
          case JobStateType.CREATE:
            return <span>-</span>;
          case JobStateType.QUEUE:
            return <span>-</span>;
          case JobStateType.RUN:
            return <NiceElapsedTime from={lastEvent.at} to={currentState.at} precision={2} />;
          default:
            // hmm, no other states should be here
            // TODO: redesign states so that there are
            // active states (these ones), and inactive.
            return <span>?</span>;
        }
      case JobStateType.COMPLETE:
        return <NiceElapsedTime from={this.lastEvent(job, JobStateType.RUN).at} to={currentState.at} precision={2} />;
    }
  }

  renderSpinnerFor(jobEventType: JobStateType) {
    const currentJobState = this.currentJobState(this.props.job);
    if (currentJobState.type === jobEventType) {
      return (
        <span>
          {' '}
          <Spin size="small" style={{ color: jobColor(this.props.job) }} />
        </span>
      );
    }
  }

  renderNarrative() {
    const job = this.props.job;
    switch (job.request.context.type) {
      case JobContextType.NARRATIVE:
        return (
          <NarrativeLink narrativeID={job.request.context.workspace.id}>{job.request.context.title}</NarrativeLink>
        );
      default:
        return 'n/a';
    }
  }

  renderApp() {
    if (this.props.job.request.app === null) {
      return 'n/a';
    }
    return (
      <UILink path={`catalog/apps/${this.props.job.request.app.id}`} type="kbaseui" newWindow={true}>
        {this.props.job.request.app.title}
      </UILink>
    );
  }

  render() {
    return (
      <div className="JobInfo InfoTable">
        <div className="InfoTable-row">
          <div className="InfoTable-labelCol">Job ID</div>
          <div className="InfoTable-dataCol">{this.props.job.id}</div>
        </div>
        <div className="InfoTable-row">
          <div className="InfoTable-labelCol">Status</div>
          <div className="InfoTable-dataCol">
            <JobStatusBadge job={this.props.job} />
          </div>
        </div>
        <div className="InfoTable-row">
          <div className="InfoTable-labelCol">Narrative</div>
          <div className="InfoTable-dataCol">{this.renderNarrative()}</div>
        </div>
        <div className="InfoTable-row">
          <div className="InfoTable-labelCol">App</div>
          <div className="InfoTable-dataCol">{this.renderApp()}</div>
        </div>
        <div className="InfoTable-row">
          <div className="InfoTable-labelCol">Submitted</div>
          <div className="InfoTable-dataCol">{this.renderSubmitted()}</div>
        </div>
        <div className="InfoTable-row">
          <div className="InfoTable-labelCol">Queued For</div>
          <div className="InfoTable-dataCol">
            {this.renderQueuedFor()}
            {this.renderSpinnerFor(JobStateType.QUEUE)}
          </div>
        </div>
        <div className="InfoTable-row">
          <div className="InfoTable-labelCol">Run For</div>
          <div className="InfoTable-dataCol">
            {this.renderRunFor()}
            {this.renderSpinnerFor(JobStateType.RUN)}
          </div>
        </div>
      </div>
    );
  }
}
