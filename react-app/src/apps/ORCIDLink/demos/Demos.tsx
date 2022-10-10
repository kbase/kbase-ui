import { RouteProps, Router } from 'components/Router2';
import { AuthContext, AuthenticationState, AuthenticationStatus } from 'contexts/Auth';
import { AsyncProcessStatus } from 'lib/AsyncProcess';
import { JSONObject } from 'lib/json';
import { Route } from 'lib/Route';
import { Component } from 'react';
import { Config } from 'types/config';
import styles from './Demos.module.css';
import HomeController from './home/Controller';
import InterstitialPage1 from './Interstitial/page1/Controller';
import PreFillFormController from './PreFillForm/PreFillFormController';
import PushWork from './PushWork/Controller';
import RequestDOI from './RequestDOI/Controller';
import RequestDOIEditor from './RequestDOI/editor/EditorController';

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
            new Route('orcidlink/demos', { authenticationRequired: true }, (props: RouteProps) => {
                // TODO: need to make route support authenticated and unauthenticated invocations
                return <AuthContext.Consumer>
                    {(authValue) => {
                        if (authValue.status !== AsyncProcessStatus.SUCCESS) {
                            return null;
                        }
                        if (authValue.value.status !== AuthenticationStatus.AUTHENTICATED) {
                            return null;
                        }
                        const token = props.params.get('token')!;
                        return <HomeController {...this.props} auth={authValue.value} />;
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
            new Route('orcidlink/demos/push-work', { authenticationRequired: true }, (props: RouteProps) => {
                return <AuthContext.Consumer>
                    {(authValue) => {
                        if (authValue.status !== AsyncProcessStatus.SUCCESS) {
                            return null;
                        }
                        if (authValue.value.status !== AuthenticationStatus.AUTHENTICATED) {
                            return null;
                        }
                        const token = props.params.get('token')!;
                        return <PushWork {...this.props} auth={authValue.value} />;
                        // return <Link {...this.props} auth={authValue.value} />;
                    }}
                </AuthContext.Consumer>

            }),
            new Route('orcidlink/demos/interstitial1', { authenticationRequired: true }, (props: RouteProps) => {
                return <AuthContext.Consumer>
                    {(authValue) => {
                        if (authValue.status !== AsyncProcessStatus.SUCCESS) {
                            return null;
                        }
                        if (authValue.value.status !== AuthenticationStatus.AUTHENTICATED) {
                            return null;
                        }
                        const process = (() => {
                            const params = props.params;
                            if (params.has('process')) {
                                return JSON.parse(props.params.get('process')!) as { [k: string]: string }
                            }
                            return;
                        })();
                        return <InterstitialPage1 {...this.props} auth={authValue.value} process={process} />;
                    }}
                </AuthContext.Consumer>

            }),
            new Route('orcidlink/demos/doi', { authenticationRequired: true }, (props: RouteProps) => {
                return <AuthContext.Consumer>
                    {(authValue) => {
                        if (authValue.status !== AsyncProcessStatus.SUCCESS) {
                            return null;
                        }
                        if (authValue.value.status !== AuthenticationStatus.AUTHENTICATED) {
                            return null;
                        }
                        const process = (() => {
                            const params = props.params;
                            if (params.has('process')) {
                                return JSON.parse(props.params.get('process')!) as JSONObject
                            }
                            return;
                        })();

                        const formId = (() => {
                            const params = props.params;
                            if (params.has('formId')) {
                                return props.params.get('formId')!;
                            }
                            return;
                        })();
                        return <RequestDOI {...this.props} auth={authValue.value} process={process} formId={formId} />;
                    }}
                </AuthContext.Consumer>

            }),
            new Route('orcidlink/demos/doi/:formId', { authenticationRequired: true }, (props: RouteProps) => {
                return <AuthContext.Consumer>
                    {(authValue) => {
                        if (authValue.status !== AsyncProcessStatus.SUCCESS) {
                            return null;
                        }
                        if (authValue.value.status !== AuthenticationStatus.AUTHENTICATED) {
                            return null;
                        }
                        const process = (() => {
                            const params = props.params;
                            if (params.has('process')) {
                                return JSON.parse(props.params.get('process')!) as JSONObject
                            }
                            return;
                        })();

                        const formId = (() => {
                            const params = props.params;
                            if (params.has('formId')) {
                                return props.params.get('formId')!;
                            }
                            return;
                        })();
                        return <RequestDOIEditor {...this.props} auth={authValue.value} process={process} formId={formId!} />;
                    }}
                </AuthContext.Consumer>

            })
        ]

        return <div className={styles.main}>
            <Router routes={routes} hashPath={this.props.hashPath} />
        </div>
    }
}
