import { Alert, Spin } from 'antd';
import JobBrowserBFFClient from 'apps/JobBrowser/lib/JobBrowserBFFClient';
import ErrorAlert from 'components/ErrorAlert';
import { RouteProps } from 'components/Router2';
import { AuthenticationStateAuthenticated } from 'contexts/EuropaContext';
import { AsyncProcess, AsyncProcessStatus } from 'lib/AsyncProcess';
import { SimpleError } from 'lib/SimpleError';
import * as React from 'react';
import { Config } from 'types/config';
import Main from './view';

export interface JobBrowserState  {
    isAdmin: boolean;
}

export interface LoaderProps  extends RouteProps{
    config: Config;
    authState: AuthenticationStateAuthenticated;
    setTitle: (title: string) => void;
}

type LoaderState = AsyncProcess<JobBrowserState, SimpleError>;

export default class Loader extends React.Component<LoaderProps, LoaderState> {
    constructor(props: LoaderProps) {
        super(props);
        this.state = {
            status: AsyncProcessStatus.NONE
        };
    }

    componentDidMount() {
        this.props.setTitle('Job Browser');
        this.initialize();
    }

    async initialize() {
        const jobBrowserBFF = new JobBrowserBFFClient({
            token: this.props.authState.authInfo.token,
            url: this.props.config.services.ServiceWizard.url,
            timeout: this.props.config.ui.constants.clientTimeout,
            version: this.props.config.dynamicServices.JobBrowserBFF.version
        });

        this.setState({
            status: AsyncProcessStatus.PENDING
        });

        try {
            const { is_admin } = await jobBrowserBFF.is_admin();
            this.setState({
                status: AsyncProcessStatus.SUCCESS,
                value: {
                    isAdmin: is_admin
                }
            })

        } catch (ex) {
            this.setState({
                status: AsyncProcessStatus.ERROR,
                error: {
                    message: ex instanceof Error ? ex.message : 'Unknown Error'
                }
            })
        }
    }

    renderLoading() {
        const message = (
            <div>
                Loading Job Browser ... <Spin />
            </div>
        );
        return (
            <Alert
                type="info"
                message={message}
                style={{
                    width: '20em',
                    padding: '20px',
                    margin: '20px auto'
                }}
            />
        );
    }

    renderError({message}: SimpleError) {
       return <ErrorAlert message={message} />
    }

    renderSuccess({isAdmin}: JobBrowserState) {
        return <Main
            config={this.props.config}
            authState={this.props.authState}
            isAdmin={isAdmin}
            setTitle={this.props.setTitle}
            tab={this.props.match.params.get('tab')}
        />
    }

    render() {
        switch (this.state.status) {
            case AsyncProcessStatus.NONE:
                return this.renderLoading();
            case AsyncProcessStatus.PENDING:
                return this.renderLoading();
            case AsyncProcessStatus.ERROR:
                return this.renderError(this.state.error);
            case AsyncProcessStatus.SUCCESS:
                return this.renderSuccess(this.state.value);
        }
    }
}
