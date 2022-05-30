import { Component } from 'react';
import Loading from '../../../components/Loading';
import { ConfigState, ConfigContext } from '../../../contexts/ConfigContext';
import { AsyncProcessStatus } from '../../../lib/AsyncProcess2';
import AboutKBaseUI from './AboutKBaseUI';

export interface AboutBuildWrapperProps {
    setTitle: (title: string) => void;
}

interface AboutBuildWrapperState { }

export default class AboutBuildWrapper extends Component<
    AboutBuildWrapperProps,
    AboutBuildWrapperState
> {
    componentDidMount() {
        this.props.setTitle('About the kbase-ui build');
    }
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
                        return <AboutKBaseUI 
                            config={configValue.value.config}
                            gitInfo={configValue.value.gitInfo}
                            buildInfo={configValue.value.buildInfo}
                        />
                }
            }}
        </ConfigContext.Consumer>
    }
}
