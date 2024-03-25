import { SignIn } from 'apps/Auth2/SignIn/SignIn';
import ErrorBoundary from 'components/ErrorBoundary';
import { Component } from 'react';
import { RouteProps, Router } from '../../components/Router2';
import { AuthenticationStateAuthenticated } from '../../contexts/EuropaContext';
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
    authState: AuthenticationStateAuthenticated;
    setTitle: (title: string) => void;
}

interface ORCIDLinkState {
}

export default class ORCIDLink extends Component<ORCIDLinkProps, ORCIDLinkState> {
    render() {
        const routes = [
            new Route('orcidlink', { authenticationRequired: true }, (props: RouteProps) => {
                const returnInstruction = (() => {
                    const raw = props.match.params.get('return_link');
                    if (!raw) {
                        return;
                    }
                    return JSON.parse(raw) as unknown as ReturnInstruction;
                })();

                return <HomeController
                    {...this.props}
                    auth={this.props.authState}
                    returnInstruction={returnInstruction}
                    skipPrompt={props.match.params.get('skip_prompt') === 'true'}
                    uiOptions={props.match.params.get('ui_options')}
                />;
            }),
            /**
             * This route handles requests to link.
             */
            new Route('orcidlink/link', { authenticationRequired: true }, (props: RouteProps) => {
                const returnInstruction = (() => {
                    const raw = props.match.params.get('return_link');
                    if (!raw) {
                        return;
                    }
                    return (JSON.parse(raw) as unknown) as ReturnInstruction;
                })();
                return <Link
                    {...this.props}
                    auth={this.props.authState}
                    returnInstruction={returnInstruction}
                    skipPrompt={props.match.params.get('skip_prompt') === 'true'}
                    uiOptions={props.match.params.get('ui_options')}
                />;
            }), 
            /**
             * This route handles requests to link.
             */
            new Route('orcidlink/revoke', { authenticationRequired: true }, () => {
                // TODO: need to make route support authenticated and unauthenticated invocations

                return <ConfirmRevoke
                    {...this.props}
                    auth={this.props.authState}
                />;
            }),
            new Route('orcidlink/continue/:linkingSessionId', { authenticationRequired: true }, (props: RouteProps) => {
                const linkingSessionId = props.match.params.get('linkingSessionId')!;
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
                    const raw = props.match.params.get('return_link');
                    if (!raw) {
                        return;
                    }
                    return (JSON.parse(raw) as unknown) as ReturnInstruction;
                })();

                return <Continue {...this.props}
                    linkingSessionId={linkingSessionId}
                    auth={this.props.authState}
                    returnInstruction={returnInstruction}
                    skipPrompt={props.match.params.get('skip_prompt') === 'true'}
                />;
                // return <Link {...this.props} auth={authValue.value} />;
            }),

            new Route('orcidlink/error', { authenticationRequired: true }, (props: RouteProps) => {
                return <Error
                    auth={this.props.authState}
                        config={this.props.config}
                        errorCode={parseInt(props.hashPath.params!["code"]!, 10)}
                        title={props.hashPath.params!["title"]!}
                        message={props.hashPath.params!["message"]!}
                        setTitle={this.props.setTitle}
                    />;
            }),
            new Route('orcidlink/help', { authenticationRequired: true }, () => {
                return <Help />;
            }),

            new Route('orcidlink/manage/link/:username', { authenticationRequired: true }, (props: RouteProps) => {
                return <ViewLinkContext username={props.match.params.get('username')!} />;
            }),
            new Route('orcidlink/manage', { authenticationRequired: true }, () => {
                return <ManageController
                    {...this.props}
                    auth={this.props.authState}
                />;
            }),
        ]

        const authRoute = new Route(
            '^login|signin|signup$', 
            {authenticationRequired: false}, 
            (props: RouteProps) => {
                return <SignIn 
                    {...props} 
                    key={props.hashPath.hash} 
                    source="authorization"
                    config={this.props.config}
                    authState={this.props.authState}
                    setTitle={this.props.setTitle}
                />
            }
        )

        return <div style={{ flex: '1 1 0', display: 'flex', flexDirection: 'column', overflowY: 'auto', margin: '0 1em' }}>
            <ErrorBoundary>
                <Router routes={routes} hashPath={this.props.hashPath} authRoute={authRoute}/>
            </ErrorBoundary>
        </div>
    }
}
