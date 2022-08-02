import { AsyncProcessStatus } from 'lib/AsyncProcess';
import { Component } from 'react';
import { RouteProps, Router } from '../../components/Router2';
import { AuthContext, AuthenticationState, AuthenticationStatus } from '../../contexts/Auth';
import { Route } from '../../lib/Route';
import { Config } from '../../types/config';
import Continue from './ContinueController';
import PreFillFormController from './demos/PreFillForm/PreFillFormController';
import Help from './Help';
import Link from './LinkController';
import PushPublication from './demos/PushPublication/Controller';

export interface ORCIDLinkProps extends RouteProps {
    config: Config;
    authState: AuthenticationState;
    setTitle: (title: string) => void;
}

interface ORCIDLinkState {
}

export default class ORCIDLink extends Component<ORCIDLinkProps, ORCIDLinkState> {
    render() {
        const routes = [
            new Route('orcidlink', { authenticationRequired: true }, (props: RouteProps) => {
                // TODO: need to make route support authenticated and unauthenticated invocations
                return <AuthContext.Consumer>
                    {(authValue) => {
                        if (authValue.status !== AsyncProcessStatus.SUCCESS) {
                            return null;
                        }
                        if (authValue.value.status !== AuthenticationStatus.AUTHENTICATED) {
                            return null;
                        }
                        return <Link {...this.props} auth={authValue.value} />;
                    }}
                </AuthContext.Consumer>

            }),
            new Route('orcidlink/continue/:token', { authenticationRequired: true }, (props: RouteProps) => {
                return <AuthContext.Consumer>
                    {(authValue) => {
                        if (authValue.status !== AsyncProcessStatus.SUCCESS) {
                            return null;
                        }
                        if (authValue.value.status !== AuthenticationStatus.AUTHENTICATED) {
                            return null;
                        }
                        const token = props.params.get('token')!;
                        return <Continue {...this.props} token={token} auth={authValue.value} />;
                        // return <Link {...this.props} auth={authValue.value} />;
                    }}
                </AuthContext.Consumer>

            }),
            new Route('orcidlink/demos/prefill-form', { authenticationRequired: true }, (props: RouteProps) => {
                return <AuthContext.Consumer>
                    {(authValue) => {
                        if (authValue.status !== AsyncProcessStatus.SUCCESS) {
                            return null;
                        }
                        if (authValue.value.status !== AuthenticationStatus.AUTHENTICATED) {
                            return null;
                        }
                        const token = props.params.get('token')!;
                        return <PreFillFormController {...this.props} auth={authValue.value} />;
                        // return <Link {...this.props} auth={authValue.value} />;
                    }}
                </AuthContext.Consumer>

            }),
            new Route('orcidlink/demos/push-publication', { authenticationRequired: true }, (props: RouteProps) => {
                return <AuthContext.Consumer>
                    {(authValue) => {
                        if (authValue.status !== AsyncProcessStatus.SUCCESS) {
                            return null;
                        }
                        if (authValue.value.status !== AuthenticationStatus.AUTHENTICATED) {
                            return null;
                        }
                        const token = props.params.get('token')!;
                        return <PushPublication {...this.props} auth={authValue.value} />;
                        // return <Link {...this.props} auth={authValue.value} />;
                    }}
                </AuthContext.Consumer>

            }),
            new Route('orcidlink/help', { authenticationRequired: true }, (props: RouteProps) => {
                return <Help />;
            })
        ]

        return <Router routes={routes} hashPath={this.props.hashPath} />
    }
}
