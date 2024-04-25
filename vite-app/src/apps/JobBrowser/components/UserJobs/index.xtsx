import { Dispatch, Action } from 'redux';
import { connect } from 'react-redux';
import Data from './data';

import {
    StoreState
} from '../../redux/store';
import { DynamicServiceConfig } from '@kbase/ui-components/lib/redux/integration/store';

export interface OwnProps {
}

interface StateProps {
    token: string;
    username: string;
    serviceWizardURL: string;
    narrativeMethodStoreURL: string;
    jobBrowserBFFConfig: DynamicServiceConfig;
}

interface DispatchProps {
}

function mapStateToProps(state: StoreState, props: OwnProps): StateProps {
    const {
        auth: { userAuthorization },
        app: {
            config: {
                services: {
                    ServiceWizard: { url: serviceWizardURL },
                    NarrativeMethodStore: { url: narrativeMethodStoreURL }
                },
                dynamicServices: {
                    JobBrowserBFF: jobBrowserBFFConfig
                }
            }
        }
    } = state;

    if (!userAuthorization) {
        throw new Error('Not authorized!');
    }

    const { token, username } = userAuthorization;

    return {
        token, username,
        serviceWizardURL,
        narrativeMethodStoreURL,
        jobBrowserBFFConfig
    };
}

function mapDispatchToProps(dispatch: Dispatch<Action>, ownProps: OwnProps): DispatchProps {
    return {};
}

export default connect<StateProps, DispatchProps, OwnProps, StoreState>(
    mapStateToProps,
    mapDispatchToProps
)(Data);
