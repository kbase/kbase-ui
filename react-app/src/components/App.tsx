import {Component} from 'react';
import AuthWrapper, {AuthContext, AuthState} from '../contexts/Auth';
import ConfigWrapper, {ConfigContext, ConfigState,} from '../contexts/ConfigContext';
import RuntimeWrapper, {RuntimeContext} from '../contexts/RuntimeContext';
import {AsyncProcess, AsyncProcessStatus} from '../lib/AsyncProcess';
import {Config} from '../types/config';
import Loading from './Loading';
import MainWindow from './MainWindow/view';

export type AppLoadState = AsyncProcess<Config>;

export interface AppProps {
}

interface AppState {
}

export default class App extends Component<AppProps, AppState> {
    render() {
        return (
            <ConfigWrapper>
                <ConfigContext.Consumer>
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
                                return <div>Error! {configValue.message}</div>;
                            case AsyncProcessStatus.SUCCESS:
                                return (
                                    <AuthWrapper
                                        config={configValue.value.config}
                                    >
                                        <AuthContext.Consumer>
                                            {(value: AuthState) => {
                                                switch (value.status) {
                                                    case AsyncProcessStatus.NONE:
                                                    case AsyncProcessStatus.PENDING:
                                                        return (
                                                            <Loading
                                                                message="Loading Auth..."
                                                                size="large"
                                                                type="block"
                                                            />
                                                        );
                                                    case AsyncProcessStatus.ERROR:
                                                        return (
                                                            <div>
                                                                Error!{' '}
                                                                {value.message}
                                                            </div>
                                                        );
                                                    case AsyncProcessStatus.SUCCESS:
                                                        return (
                                                            <RuntimeWrapper
                                                                authState={
                                                                    value.value
                                                                }
                                                                config={
                                                                    configValue
                                                                        .value
                                                                        .config
                                                                }
                                                            >
                                                                <RuntimeContext.Consumer>
                                                                    {(value) => {
                                                                        if (value === null) {
                                                                            return;
                                                                        }
                                                                        return <MainWindow
                                                                            authState={value.authState}
                                                                            config={value.config}
                                                                            setTitle={value.setTitle}
                                                                        />
                                                                    }}
                                                                </RuntimeContext.Consumer>

                                                            </RuntimeWrapper>
                                                        );
                                                }
                                            }}
                                        </AuthContext.Consumer>
                                    </AuthWrapper>
                                );
                        }
                    }}
                </ConfigContext.Consumer>
            </ConfigWrapper>
        );
    }
}
