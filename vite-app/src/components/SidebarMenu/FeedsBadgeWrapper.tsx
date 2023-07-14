import { Component } from 'react';
import { AsyncProcessStatus } from '../../lib/AsyncProcess';
import { ConfigContext } from '../../contexts/ConfigContext';
import { FeedsWrapper, FeedsContext } from '../../contexts/FeedsContext';
import { AuthContext } from '../../contexts/Auth';
import { AuthenticationStatus } from '@kbase/ui-lib';
import { FeedsBadge } from './FeedsBadge';

export class FeedsBadgeWrapper extends Component {
    render() {
        return <ConfigContext.Consumer>
            {(configValue) => { 
                if (configValue.status !== AsyncProcessStatus.SUCCESS) {
                    return null;
                }
                return <AuthContext.Consumer>
                    {(authValue) => {
                         if (authValue.status !== AsyncProcessStatus.SUCCESS) {
                            return null;
                        }
                        if (authValue.value.status !== AuthenticationStatus.AUTHENTICATED) {
                            return null;
                        }
                        return <FeedsWrapper config={configValue.value.config} authInfo={authValue.value.authInfo}>
                            <FeedsContext.Consumer>
                                {(value) => {
                                    return <FeedsBadge feedsState={value} />
                                }}
                            </FeedsContext.Consumer>
                        </FeedsWrapper>;
                    }}
                </AuthContext.Consumer>
            }}
        </ConfigContext.Consumer>
    }
}