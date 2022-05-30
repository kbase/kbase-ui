import { Component } from 'react';
import Loading from '../../../components/Loading';
import { ConfigState, ConfigContext } from '../../../contexts/ConfigContext';
import { AsyncProcessStatus } from '../../../lib/AsyncProcess2';
import { BuildInfo, GitInfo } from '../../../types/info';
import AboutBuild from './AboutBuild';

export interface AboutBuildWrapperProps {
    setTitle: (title: string) => void;
}

interface AboutBuildWrapperState { }

export default class AboutBuildWrapper extends Component<
    AboutBuildWrapperProps,
    AboutBuildWrapperState
> {
    render() {
        return <ConfigContext.Consumer>
            {(configValue: ConfigState) => {
                switch (configValue.status) {
                    case AsyncProcessStatus.NONE:
                    case AsyncProcessStatus.PENDING:
                        return (
                            <Loading
                                message="Loading Config..."
                                size="large"
                                type="block"
                            />
                        );
                    case AsyncProcessStatus.ERROR:
                        return <div>Error! {configValue.error}</div>;
                    case AsyncProcessStatus.SUCCESS:
                        this.props.setTitle('About the kbase-ui build');
                        return <AboutBuild 
                                    buildInfo={configValue.value.buildInfo}
                                    gitInfo={configValue.value.gitInfo}
                                />
                }
            }}
        </ConfigContext.Consumer>
    }
}
