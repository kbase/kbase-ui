import ErrorBoundary from 'components/ErrorBoundary';
import { RouteProps, Router } from 'components/Router2';
import { AuthContext, AuthenticationState, AuthenticationStatus } from 'contexts/Auth';
import { AsyncProcessStatus } from 'lib/AsyncProcess';
import { Route } from 'lib/Route';
import WorkspaceClient from 'lib/kb_lib/comm/coreServices/Workspace';
import { Component } from 'react';
import { Button } from 'react-bootstrap';
import { Config } from 'types/config';

import styles from './Demos.module.css';
import InterstitialPage1 from './Interstitial/page1/Controller';
import HomeController from './home/Controller';

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
            new Route('demos', { authenticationRequired: true }, () => {
                // TODO: need to make route support authenticated and unauthenticated invocations
                return <AuthContext.Consumer>
                    {(authValue) => {
                        if (authValue.status !== AsyncProcessStatus.SUCCESS) {
                            return null;
                        }
                        if (authValue.value.status !== AuthenticationStatus.AUTHENTICATED) {
                            return null;
                        }
                        return <HomeController {...this.props} auth={authValue.value} />;
                    }}
                </AuthContext.Consumer>

            }),

            new Route('demos/download', { authenticationRequired: true }, (props: RouteProps) => {
                return <AuthContext.Consumer>
                    {(authValue) => {
                        if (authValue.status !== AsyncProcessStatus.SUCCESS) {
                            return null;
                        }
                        const value = authValue.value;
                        if (value.status !== AuthenticationStatus.AUTHENTICATED) {
                            return null;
                        }
                        const ref = props.params.get('ref');
                        const downloadIt = () => {
                            // get the object.
                            const runner = async () => {
                                const client = new WorkspaceClient({
                                    url: this.props.config.services.Workspace.url,
                                    timeout: 10000,
                                    token: value.authInfo.token
                                });
                                const { data } = await client.get_objects2({ objects: [{ ref }] })
                                const objBlob = new Blob([JSON.stringify(data[0])])
                                const a = document.createElement('a');
                                a.href = window.URL.createObjectURL(objBlob);
                                a.download = data[0].info[1] + ".json";
                                a.click();
                            }

                            runner();
                        }

                        return <p>Would you like to <Button onClick={downloadIt}>Download {ref}?</Button> </p>

                        // download it.
                    }}
                </AuthContext.Consumer>
            }),

            // new Route('demos/prefill-form', { authenticationRequired: true }, () => {
            //     return <AuthContext.Consumer>
            //         {(authValue) => {
            //             if (authValue.status !== AsyncProcessStatus.SUCCESS) {
            //                 return null;
            //             }
            //             if (authValue.value.status !== AuthenticationStatus.AUTHENTICATED) {
            //                 return null;
            //             }
            //             return <PreFillFormController {...this.props} auth={authValue.value} />;
            //         }}
            //     </AuthContext.Consumer>

            // }),
            new Route('demos/interstitial1', { authenticationRequired: true }, (props: RouteProps) => {
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
            })
        ]

        return <div className={styles.main}>
            <ErrorBoundary>
                <Router routes={routes} hashPath={this.props.hashPath} />
            </ErrorBoundary>
        </div>
    }
}
