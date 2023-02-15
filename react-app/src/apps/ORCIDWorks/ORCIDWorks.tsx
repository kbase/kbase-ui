import ErrorBoundary from 'components/ErrorBoundary';
import { RouteProps, Router } from 'components/Router2';
import { AuthContext, AuthenticationState, AuthenticationStatus } from 'contexts/Auth';
import { AsyncProcessStatus } from 'lib/AsyncProcess';
import { Route } from 'lib/Route';
import { Component } from 'react';
import { Config } from 'types/config';
import Controller from './Controller';

export interface ORCIDWorksProps extends RouteProps {
    config: Config;
    authState: AuthenticationState;
    setTitle: (title: string) => void;
}

interface ORCIDWorksState {
}

export default class ORCIDLink extends Component<ORCIDWorksProps, ORCIDWorksState> {
    render() {
        const routes = [
            new Route('orcidworks', { authenticationRequired: true }, (props: RouteProps) => {
                // TODO: need to make route support authenticated and unauthenticated invocations
                return <AuthContext.Consumer>
                    {(authValue) => {
                        if (authValue.status !== AsyncProcessStatus.SUCCESS) {
                            return null;
                        }
                        if (authValue.value.status !== AuthenticationStatus.AUTHENTICATED) {
                            return null;
                        }
                        return <Controller
                            {...this.props}
                            auth={authValue.value}
                        />;
                    }}
                </AuthContext.Consumer>

            }),
            
        ]

        return <div style={{ flex: '1 1 0', display: 'flex', flexDirection: 'column', overflowY: 'auto', margin: '0 1em' }}>
            <ErrorBoundary>
                <Router routes={routes} hashPath={this.props.hashPath} />
            </ErrorBoundary>
        </div>
    }
}
