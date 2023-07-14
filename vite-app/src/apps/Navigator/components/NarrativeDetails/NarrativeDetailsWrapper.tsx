import { AuthenticationStatus } from '@kbase/ui-lib';
import { Component } from 'react';
import NarrativeDetails from './NarrativeDetails';
import ErrorMessage from '../../../../components/ErrorMessage';
import Loading from '../../../../components/Loading';
import { RuntimeContext } from '../../../../contexts/RuntimeContext';
import { AsyncProcessStatus } from '../../../../lib/AsyncProcess';
import { NavigatorContext } from '../../context/NavigatorContext';

export default class NarrativeDetailsWrapper extends Component {
    render() {
        return (
            <RuntimeContext.Consumer>
                {(value) => {
                    if (value === null) {
                        return null;
                    }
                    if (
                        value.authState.status !==
                        AuthenticationStatus.AUTHENTICATED
                    ) {
                        return null;
                    }
                    const {
                        authState: { authInfo },
                        config,
                    } = value;
                    return (
                        <NavigatorContext.Consumer>
                            {(navigatorValue) => {
                                if (navigatorValue === null) {
                                    return null;
                                }
                                switch (
                                    navigatorValue.selectedNarrative.status
                                ) {
                                    case AsyncProcessStatus.NONE:
                                    case AsyncProcessStatus.PENDING:
                                        return (
                                            <Loading message="Loading Narrative..." />
                                        );
                                    case AsyncProcessStatus.SUCCESS:
                                        return (
                                            <NarrativeDetails
                                                authInfo={authInfo}
                                                config={config}
                                                updateSearch={() => {}}
                                                narrativeDoc={
                                                    navigatorValue
                                                        .selectedNarrative.value
                                                        .narrativeDoc
                                                }
                                                view={
                                                    navigatorValue
                                                        .selectedNarrative
                                                        .initialValue.view ||
                                                    'preview'
                                                }
                                            />
                                        );
                                    case AsyncProcessStatus.ERROR:
                                        return (
                                            <ErrorMessage
                                                message={
                                                    navigatorValue
                                                        .selectedNarrative.error
                                                }
                                            />
                                        );
                                }
                            }}
                        </NavigatorContext.Consumer>
                    );
                }}
            </RuntimeContext.Consumer>
        );
    }
}
