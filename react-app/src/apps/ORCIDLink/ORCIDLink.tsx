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
import InterstitialPage1 from './demos/Interstitial/page1/Controller';
import RequestDOI from './demos/RequestDOI/Controller';
import Error from './Error';
import { ReturnLink } from './Model';
import { JSONObject } from 'lib/json';

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
                        const returnLink = (() => {
                            const returnLinkRaw = props.params.get('return_link');
                            if (!returnLinkRaw) {
                                return;
                            }
                            const {
                                url, label
                            } = (JSON.parse(returnLinkRaw) as unknown) as ReturnLink;
                            return { url, label }

                        })();
                        return <Link
                            {...this.props}
                            auth={authValue.value}
                            returnLink={returnLink}
                            skipPrompt={props.params.get('skip_prompt') === 'true'}
                        />;
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
                        const returnLink = (() => {
                            const returnLinkRaw = props.params.get('return_link');
                            if (!returnLinkRaw) {
                                return;
                            }
                            const {
                                url, label
                            } = (JSON.parse(returnLinkRaw) as unknown) as ReturnLink;
                            return { url, label }

                        })();
                        return <Continue {...this.props} token={token}
                            kbaseAuthToken={authValue.value.authInfo.token}
                            returnLink={returnLink}
                            skipPrompt={props.params.get('skip_prompt') === 'true'}
                        />;
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
            // new Route('orcidlink/demos/interstitial2', { authenticationRequired: true }, (props: RouteProps) => {
            //     return <AuthContext.Consumer>
            //         {(authValue) => {
            //             if (authValue.status !== AsyncProcessStatus.SUCCESS) {
            //                 return null;
            //             }
            //             if (authValue.value.status !== AuthenticationStatus.AUTHENTICATED) {
            //                 return null;
            //             }
            //             const process = (() => {
            //                 const params = props.params;
            //                 if (params.has('process')) {
            //                     return JSON.parse(props.params.get('process')!) as {[k: string]: string}
            //                 }
            //                 return;
            //             })();
            //             return <InterstitialPage2 {...this.props} auth={authValue.value}/>;
            //         }}
            //     </AuthContext.Consumer>

            // }),
            new Route('orcidlink/error', { authenticationRequired: true }, (props: RouteProps) => {
                return <Error />;
            }),
            new Route('orcidlink/help', { authenticationRequired: true }, (props: RouteProps) => {
                return <Help />;
            })
        ]

        return <Router routes={routes} hashPath={this.props.hashPath} />
    }
}
