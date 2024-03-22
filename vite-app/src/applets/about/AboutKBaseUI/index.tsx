import { Component } from 'react';
import Loading from '../../../components/Loading';
import { ConfigContext, ConfigState } from '../../../contexts/ConfigContext';
import { AsyncProcessStatus } from '../../../lib/AsyncProcess2';
import AboutKBaseUI from './AboutKBaseUI';

export interface AboutBuildWrapperProps {
    setTitle: (title: string) => void;
}

export default class AboutBuildWrapper extends Component<
    AboutBuildWrapperProps
> {
    componentDidMount() {
        this.props.setTitle('About the KBase User Interface');
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
                            uiURL={configValue.value.uiURL}
                        />
                }
            }}
        </ConfigContext.Consumer>
    }
}
