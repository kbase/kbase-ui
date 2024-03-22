import EuropaWrapper, { EuropaContext, EuropaState } from 'contexts/EuropaContext';
import { Component } from 'react';
import ConfigWrapper, { ConfigContext, ConfigState } from '../contexts/ConfigContext';
import { AsyncProcessStatus } from '../lib/AsyncProcess';
import ErrorAlert from './ErrorAlert';
import ErrorMessage from './ErrorMessage';
import MainWindow from './MainWindow/view';

/**
 * Main entry point (other than the simple `main.tsx` for the kbase-ui web app.)
 * 
 * The primary app design is a set of nested contexts, each depending up on the success
 * of the prior one. The order is:
 * - ConfigContext
 * - EuropaContext
 * 
 * Each context has a "Wrapper" which is responsible for managing the initialization of
 * the Context. That is, they do some work, and then populate the context via its Provider.
 */
export default class App extends Component {
    render() {
        return (
            <ConfigWrapper>
                <ConfigContext.Consumer>
                    {(configValue: ConfigState) => {
                        switch (configValue.status) {
                            case AsyncProcessStatus.NONE:
                            case AsyncProcessStatus.PENDING:
                                return;
                            case AsyncProcessStatus.ERROR:
                                return <ErrorMessage message={configValue.error} />;
                            case AsyncProcessStatus.SUCCESS:
                                // New! Europa wrapper, which will succeed when it is
                                // fully initialized wrt Europa
                                return (
                                    <EuropaWrapper config={configValue.value.config}>
                                        <EuropaContext.Consumer>
                                            {(value: EuropaState) => {
                                                switch (value.status) {
                                                    case AsyncProcessStatus.NONE:
                                                    case AsyncProcessStatus.PENDING:
                                                        return;
                                                    case AsyncProcessStatus.ERROR:
                                                        return <ErrorAlert message={value.error.message} />;
                                                    case AsyncProcessStatus.SUCCESS:
                                                        return (
                                                            <MainWindow
                                                                authState={
                                                                    value.value.authState
                                                                }
                                                                config={
                                                                    configValue.value.config
                                                                }
                                                                setTitle={
                                                                    value.value.setTitle
                                                                }
                                                                isHosted={value.value.isHosted}
                                                            />
                                                        );
                                                }
                                            }}
                                        </EuropaContext.Consumer>
                                    </EuropaWrapper>
                                );
                        }
                    }}
                </ConfigContext.Consumer>
            </ConfigWrapper>
        );
    }
}
