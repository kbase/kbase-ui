import { AuthenticationStatus } from '@kbase/ui-lib';
import Empty from 'components/Empty';
import { EuropaContext } from 'contexts/EuropaContext';
import { Component } from 'react';
import ErrorMessage from '../../../../components/ErrorMessage';
import Loading from '../../../../components/Loading';
import { AsyncProcessStatus } from '../../../../lib/AsyncProcess';
import { NarrativeSelectedBy, NavigatorContext } from '../../context/NavigatorContext';
import NarrativeDetails from './NarrativeDetails';

export default class NarrativeDetailsWrapper extends Component {
    render() {
        return (
            <EuropaContext.Consumer>
                {(value) => {
                    if (value === null || value.status !== AsyncProcessStatus.SUCCESS) {
                        return null;
                    }
                    const {authState, config} = value.value;
                    if (
                        authState.status !==
                        AuthenticationStatus.AUTHENTICATED
                    ) {
                        return null;
                    }
                    const { authInfo } = authState;
                    return (
                        <NavigatorContext.Consumer>
                            {(navigatorValue) => {
                                if (navigatorValue === null) {
                                    return null;
                                }
                                if (navigatorValue.userInteractions.narrativeSelectedBy === NarrativeSelectedBy.NONE) {
                                    return <Empty message="No Narrative selected" />
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
            </EuropaContext.Consumer>
        );
    }
}
