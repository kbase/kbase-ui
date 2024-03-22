import React from 'react';

import { Alert, Spin } from 'antd';
import AutoFlexTabs from 'components/Tabs/AutoFlexTabs';
import JobInfo from '../JobInfo';
import JobLog from '../JobLog/view';
import JobStatusBadge from '../JobStatusBadge';
import { JobLogState, JobLogView, JobLogViewError } from './index';
import './style.css';

interface JobLogGateProps {
    view: JobLogView;
}

interface JobLogGateState {
}

class JobLogGate extends React.Component<JobLogGateProps, JobLogGateState> {
    renderLoading() {
        return (
            <div className="FullyCenteredBox">
                <span>Loading ... <Spin /></span>
            </div>
        );
    }

    renderNone() {
        return (
            <div className="FullyCenteredBox">
                <span>None ... <Spin /></span>
            </div>
        );
    }

    renderCreated() {
        return (
            <div className="FullyCenteredBox">
                <span>
                    The job has been <i>created</i>, but not yet <i>queued</i> or <i>running</i>. The log will be displayed when the job starts running ... <Spin />
                </span>
            </div >
        );
    }

    renderQueued() {
        return (
            <div className="FullyCenteredBox">
                <span>
                    The job is <i>queued</i>. The log will be displayed when the job starts running ... <Spin />
                </span>
            </div >
        );
    }

    renderError(view: JobLogViewError) {
        return (
            <Alert type="error" message={view.error} />
        );
    }

    render() {
        switch (this.props.view.status) {
            case JobLogState.NONE:
                return this.renderNone();
            case JobLogState.JOB_CREATED:
                return this.renderCreated();
            case JobLogState.JOB_QUEUED:
                return this.renderQueued();
            case JobLogState.INITIAL_LOADING:
                return this.renderLoading();
            case JobLogState.ERROR:
                return this.renderError(this.props.view);
            case JobLogState.ACTIVE_LOADED:
            case JobLogState.ACTIVE_LOADING:
                return <JobLog job={this.props.view.job} log={this.props.view.log} />;
            case JobLogState.FINISHED_LOADED:
                return <JobLog job={this.props.view.job} log={this.props.view.log} />;
        }
    }
}

interface JobInfoGateProps {
    view: JobLogView;
}

interface JobInfoGateState {
}

class JobInfoGate extends React.Component<JobInfoGateProps, JobInfoGateState> {
    renderLoading() {
        return (
            <div className="FullyCenteredBox">
                <span>Loading Job Info... <Spin /></span>
            </div>
        );
    }

    renderError(view: JobLogViewError) {
        return (
            <Alert type="error" message={view.error} />
        );
    }
    render() {
        switch (this.props.view.status) {
            case JobLogState.NONE:
                return this.renderLoading();
            case JobLogState.JOB_CREATED:
                return <JobInfo job={this.props.view.job} />;
            case JobLogState.JOB_QUEUED:
                return <JobInfo job={this.props.view.job} />;
            case JobLogState.INITIAL_LOADING:
                return this.renderLoading();
            case JobLogState.ERROR:
                return this.renderError(this.props.view);
            case JobLogState.ACTIVE_LOADED:
            case JobLogState.ACTIVE_LOADING:
                return <JobInfo job={this.props.view.job} />;
            case JobLogState.FINISHED_LOADED:
                return <JobInfo job={this.props.view.job} />;
        }
    }
}

export interface JobDetailProps {
    view: JobLogView;
}

interface JobDetailState {
}

export default class JobDetail extends React.Component<JobDetailProps, JobDetailState> {
    renderStatus() {
        switch (this.props.view.status) {
            case JobLogState.NONE:
            case JobLogState.INITIAL_LOADING:
                return <Spin size="small" />;
            case JobLogState.ERROR:
                return <Alert type="error" message={this.props.view.error} />;
            default:
                return <JobStatusBadge job={this.props.view.job} showTiming={true} />;
        }
    }
    renderMiniDetails() {
        return <div style={{ flex: '0 0 auto' }}>
            {this.renderStatus()}
        </div>;

    }
    selectTab(selectedTab: string) {
        this.setState({
            selectedTab
        });
    }

    render() {
        const tabs = [{
            tab: 'log',
            title: 'Log',
            renderBody: () => {
                return <JobLogGate view={this.props.view} />;
            }
        },
        {
            tab: 'detail',
            title: 'Detail',
            renderBody: () => {
                return <JobInfoGate view={this.props.view} />;
            }
        }];
        return (
            <React.Fragment>
                {this.renderMiniDetails()}
                <AutoFlexTabs tabs={tabs} />
            </React.Fragment>
        );
    }
}