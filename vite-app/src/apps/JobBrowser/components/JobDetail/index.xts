import { Dispatch, Action } from 'redux';
import { connect } from 'react-redux';
import JobLogState from './state';
import { StoreState } from '../../redux/store';
import { DynamicServiceConfig } from '@kbase/ui-components/lib/redux/integration/store';

export interface OwnProps {
}

interface StateProps {
    token: string;
    njsURL: string;
    serviceWizardURL: string;
    jobBrowserBFFConfig: DynamicServiceConfig;
}

interface DispatchProps { }

function mapStateToProps(state: StoreState, props: OwnProps): StateProps {
    const {
        auth: { userAuthorization },
        app: {
            config: {
                services: {
                    NarrativeJobService: { url: njsURL },
                    ServiceWizard: { url: serviceWizardURL }
                },
                dynamicServices: {
                    JobBrowserBFF: jobBrowserBFFConfig
                }
            }
        }
    } = state;

    let token;
    if (!userAuthorization) {
        throw new Error('Invalid state: token required');
    } else {
        token = userAuthorization.token;
    }

    return { token, njsURL, serviceWizardURL, jobBrowserBFFConfig };
}

function mapDispatchToProps(dispatch: Dispatch<Action>, ownProps: OwnProps): DispatchProps {
    return {};
}

export default connect<StateProps, DispatchProps, OwnProps, StoreState>(
    mapStateToProps,
    mapDispatchToProps
)(JobLogState);
