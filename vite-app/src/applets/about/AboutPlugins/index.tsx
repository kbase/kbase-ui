import { Component } from 'react';
import Loading from '../../../components/Loading';
import { ConfigState, ConfigContext } from '../../../contexts/ConfigContext';
import { AsyncProcessStatus } from '../../../lib/AsyncProcess2';
import AboutPlugins from './AboutPlugins';

export interface AboutBuildWrapperProps {
    setTitle: (title: string) => void;
}

interface AboutBuildWrapperState { }

export default class AboutBuildWrapper extends Component<
    AboutBuildWrapperProps,
    AboutBuildWrapperState
> {
    componentDidMount() {
        this.props.setTitle('About kbase-ui Plugins');
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
                        return <AboutPlugins
                                    pluginsInfo={configValue.value.pluginsInfo}
                                />
                }
            }}
        </ConfigContext.Consumer>
    }
}
