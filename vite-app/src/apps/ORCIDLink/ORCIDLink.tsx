import ErrorBoundary from 'components/ErrorBoundary';
import { AsyncProcessStatus } from 'lib/AsyncProcess';
import { Component } from 'react';
import { RouteProps, Router } from '../../components/Router2';
import { AuthContext, AuthenticationState, AuthenticationStatus } from '../../contexts/Auth';
import { Route } from '../../lib/Route';
import { Config } from '../../types/config';
import Error from './Error/Controller';
import Help from './Help';
import Continue from './continue/ContinueController';
import HomeController from './home/HomeController';
import { ReturnInstruction } from './lib/ORCIDLinkClient';
import Link from './link/LinkController';
import ManageController from './manage/controller';
import ViewLinkContext from './manage/viewLink';
import ConfirmRevoke from './revoke/Controller';

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
                        // const returnLink = (() => {
                        //     const returnLinkRaw = props.params.get('return_link');
                        //     if (!returnLinkRaw) {
                        //         return;
                        //     }
                        //     const {
                        //         url, label
                        //     } = (JSON.parse(returnLinkRaw) as unknown) as ReturnLink;
                        //     return { url, label }
                        // })();

                        const returnInstruction = (() => {
                            const raw = props.params.get('return_link');
                            if (!raw) {
                                return;
                            }
                            return JSON.parse(raw) as unknown as ReturnInstruction;
                        })();

                        return <HomeController
                            {...this.props}
                            auth={authValue.value}
                            returnInstruction={returnInstruction}
                            skipPrompt={props.params.get('skip_prompt') === 'true'}
                            uiOptions={props.params.get('ui_options')}
                        />;
                    }}
                </AuthContext.Consumer>

            }),
            /**
             * This route handles requests to link.
             */
            new Route('orcidlink/link', { authenticationRequired: true }, (props: RouteProps) => {
                // TODO: need to make route support authenticated and unauthenticated invocations
                return <AuthContext.Consumer>
                    {(authValue) => {
                        if (authValue.status !== AsyncProcessStatus.SUCCESS) {
                            return null;
                        }
                        if (authValue.value.status !== AuthenticationStatus.AUTHENTICATED) {
                            return null;
                        }
                        // const returnLink = (() => {
                        //     const returnLinkRaw = props.params.get('return_link');
                        //     if (!returnLinkRaw) {
                        //         return;
                        //     }
                        //     const {
                        //         url, label
                        //     } = (JSON.parse(returnLinkRaw) as unknown) as ReturnLink;
                        //     return { url, label }

                        // })();
                        const returnInstruction = (() => {
                            const raw = props.params.get('return_link');
                            if (!raw) {
                                return;
                            }
                            return (JSON.parse(raw) as unknown) as ReturnInstruction;
                        })();
                        return <Link
                            {...this.props}
                            auth={authValue.value}
                            returnInstruction={returnInstruction}
                            skipPrompt={props.params.get('skip_prompt') === 'true'}
                            uiOptions={props.params.get('ui_options')}
                        />;
                    }}
                </AuthContext.Consumer>

            }), /**
             * This route handles requests to link.
             */
            new Route('orcidlink/revoke', { authenticationRequired: true }, () => {
                // TODO: need to make route support authenticated and unauthenticated invocations
                return <AuthContext.Consumer>
                    {(authValue) => {
                        if (authValue.status !== AsyncProcessStatus.SUCCESS) {
                            return null;
                        }
                        if (authValue.value.status !== AuthenticationStatus.AUTHENTICATED) {
                            return null;
                        }

                        return <ConfirmRevoke
                            {...this.props}
                            auth={authValue.value}
                        />;
                    }}
                </AuthContext.Consumer>

            }),
            new Route('orcidlink/continue/:linkingSessionId', { authenticationRequired: true }, (props: RouteProps) => {
                return <AuthContext.Consumer>
                    {(authValue) => {
                        if (authValue.status !== AsyncProcessStatus.SUCCESS) {
                            return null;
                        }
                        if (authValue.value.status !== AuthenticationStatus.AUTHENTICATED) {
                            return null;
                        }
                        const linkingSessionId = props.params.get('linkingSessionId')!;
                        // const returnLink = (() => {
                        //     const returnLinkRaw = props.params.get('return_link');
                        //     if (!returnLinkRaw) {
                        //         return;
                        //     }
                        //     const {
                        //         url, label
                        //     } = (JSON.parse(returnLinkRaw) as unknown) as ReturnLink;
                        //     return { url, label }
                        // })();

                        const returnInstruction = (() => {
                            const raw = props.params.get('return_link');
                            if (!raw) {
                                return;
                            }
                            return (JSON.parse(raw) as unknown) as ReturnInstruction;
                        })();

                        return <Continue {...this.props}
                            linkingSessionId={linkingSessionId}
                            auth={authValue.value}
                            returnInstruction={returnInstruction}
                            skipPrompt={props.params.get('skip_prompt') === 'true'}
                        />;
                        // return <Link {...this.props} auth={authValue.value} />;
                    }}
                </AuthContext.Consumer>

            }),

            new Route('orcidlink/error', { authenticationRequired: true }, (props: RouteProps) => {
                return <AuthContext.Consumer>
                    {(authValue) => {
                        if (authValue.status !== AsyncProcessStatus.SUCCESS) {
                            return null;
                        }
                        if (authValue.value.status !== AuthenticationStatus.AUTHENTICATED) {
                            return null;
                        }
                        return <Error
                            auth={authValue.value}
                            config={this.props.config}
                            errorCode={parseInt(props.hashPath.query.get("code")!, 10)}
                            title={props.hashPath.query.get("title")!}
                            message={props.hashPath.query.get("message")!}
                            setTitle={this.props.setTitle}
                        />;
                    }}
                </AuthContext.Consumer>

            }),
            new Route('orcidlink/help', { authenticationRequired: true }, () => {
                return <Help />;
            }),

            new Route('orcidlink/manage/link/:username', { authenticationRequired: true }, (props: RouteProps) => {
                // TODO: need to make route support authenticated and unauthenticated invocations
                return <AuthContext.Consumer>
                    {(authValue) => {
                        if (authValue.status !== AsyncProcessStatus.SUCCESS) {
                            return null;
                        }
                        if (authValue.value.status !== AuthenticationStatus.AUTHENTICATED) {
                            return null;
                        }

                        return <ViewLinkContext username={props.params.get('username')!} />;
                    }}
                </AuthContext.Consumer>
            }),
            new Route('orcidlink/manage', { authenticationRequired: true }, () => {
                // TODO: need to make route support authenticated and unauthenticated invocations
                return <AuthContext.Consumer>
                    {(authValue) => {
                        if (authValue.status !== AsyncProcessStatus.SUCCESS) {
                            return null;
                        }
                        if (authValue.value.status !== AuthenticationStatus.AUTHENTICATED) {
                            return null;
                        }

                        return <ManageController
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
