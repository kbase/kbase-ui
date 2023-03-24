import { LinkRecord } from 'apps/ORCIDLink/lib/ORCIDLinkClient';
import ErrorBoundary from 'components/ErrorBoundary';
import { RouteProps, Router } from 'components/Router2';
import { AuthContext, AuthenticationState, AuthenticationStatus } from 'contexts/Auth';
import { AsyncProcessStatus } from 'lib/AsyncProcess';
import { Route } from 'lib/Route';
import { Component } from 'react';
import { Config } from 'types/config';
import AddDOI from './AddDOI/Controller';
import AddWork from './AddWork2/Controller';
import Browser from './Browser/Controller';
import EditWork from './EditWork2/Controller';
import ViewWork from './ViewWork/Controller';

export interface ORCIDWorksProps extends RouteProps {
    config: Config;
    authState: AuthenticationState;
    orcidLink: LinkRecord;
    setTitle: (title: string) => void;
}

interface ORCIDWorksState { }

export default class NarrativePublishing extends Component<ORCIDWorksProps, ORCIDWorksState> {
    render() {
        const routes = [
            new Route(
                'narrativepublishing',
                { authenticationRequired: true },
                (props: RouteProps) => {
                    // TODO: need to make route support authenticated and unauthenticated invocations
                    return (
                        <AuthContext.Consumer>
                            {(authValue) => {
                                if (authValue.status !== AsyncProcessStatus.SUCCESS) {
                                    return null;
                                }
                                if (authValue.value.status !== AuthenticationStatus.AUTHENTICATED) {
                                    return null;
                                }
                                return <Browser {...this.props} auth={authValue.value} />;
                            }}
                        </AuthContext.Consumer>
                    );
                }
            ),
            new Route(
                'narrativepublishing/add_doi/:id/:version',
                { authenticationRequired: true },
                (props: RouteProps) => {
                    // TODO: need to make route support authenticated and unauthenticated invocations
                    return (
                        <AuthContext.Consumer>
                            {(authValue) => {
                                if (authValue.status !== AsyncProcessStatus.SUCCESS) {
                                    return null;
                                }
                                if (authValue.value.status !== AuthenticationStatus.AUTHENTICATED) {
                                    return null;
                                }
                                const narrativeId = parseInt(props.params.get('id')!);
                                const narrativeVersion = parseInt(props.params.get('version')!);
                                return (
                                    <AddDOI
                                        {...this.props}
                                        auth={authValue.value}
                                        narrativeId={narrativeId}
                                        narrativeVersion={narrativeVersion}
                                    />
                                );
                            }}
                        </AuthContext.Consumer>
                    );
                }
            ),
            new Route(
                'narrativepublishing/work/:doi',
                { authenticationRequired: true },
                (props: RouteProps) => {
                    // TODO: need to make route support authenticated and unauthenticated invocations
                    return (
                        <AuthContext.Consumer>
                            {(authValue) => {
                                if (authValue.status !== AsyncProcessStatus.SUCCESS) {
                                    return null;
                                }
                                if (authValue.value.status !== AuthenticationStatus.AUTHENTICATED) {
                                    return null;
                                }
                                const doi = decodeURIComponent(props.params.get('doi')!);
                                return (
                                    <ViewWork {...this.props} auth={authValue.value} doi={doi} />
                                );
                            }}
                        </AuthContext.Consumer>
                    );
                }
            ),
            new Route(
                'narrativepublishing/work/new/:workspaceId/:objectVersion',
                { authenticationRequired: true },
                (props: RouteProps) => {
                    // TODO: need to make route support authenticated and unauthenticated invocations
                    return (
                        <AuthContext.Consumer>
                            {(authValue) => {
                                if (authValue.status !== AsyncProcessStatus.SUCCESS) {
                                    return null;
                                }
                                if (authValue.value.status !== AuthenticationStatus.AUTHENTICATED) {
                                    return null;
                                }
                                // const staticNarrativeRef = decodeURIComponent(props.params.get('staticNarrativeRef')!)
                                const workspaceId = parseInt(props.params.get('workspaceId')!);
                                const objectVersion = parseInt(props.params.get('objectVersion')!);
                                return (
                                    <AddWork
                                        {...this.props}
                                        auth={authValue.value}
                                        workspaceId={workspaceId}
                                    // objectVersion={objectVersion}
                                    />
                                );
                            }}
                        </AuthContext.Consumer>
                    );
                }
            ),
            new Route(
                'narrativepublishing/work/edit/:putCode',
                { authenticationRequired: true },
                (props: RouteProps) => {
                    // TODO: need to make route support authenticated and unauthenticated invocations
                    return (
                        <AuthContext.Consumer>
                            {(authValue) => {
                                if (authValue.status !== AsyncProcessStatus.SUCCESS) {
                                    return null;
                                }
                                if (authValue.value.status !== AuthenticationStatus.AUTHENTICATED) {
                                    return null;
                                }
                                // const staticNarrativeRef = decodeURIComponent(props.params.get('staticNarrativeRef')!)
                                const putCode = props.params.get('putCode')!;
                                return (
                                    <EditWork
                                        {...this.props}
                                        auth={authValue.value}
                                        putCode={putCode}
                                    />
                                );

                            }}
                        </AuthContext.Consumer>
                    );
                }
            ),
        ];

        return (
            <div
                style={{
                    flex: '1 1 0',
                    display: 'flex',
                    flexDirection: 'column',
                    overflowY: 'auto',
                    margin: '0 1em',
                }}
            >
                <ErrorBoundary>
                    <Router routes={routes} hashPath={this.props.hashPath} />
                </ErrorBoundary>
            </div>
        );
    }
}
