import { Component } from 'react';
import { RouteProps, Router } from '../../components/Router2';
import { AuthenticationState } from '../../contexts/Auth';
import { Route } from '../../lib/Route';
import { Config } from '../../types/config';
import Continue from './ContinueController';
import Help from './Help';
import Link from './LinkController';

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
                return <Link {...this.props} />;
            }),
            new Route('orcidlink/continue/:token', { authenticationRequired: true }, (props: RouteProps) => {
                const token = props.params.get('token')!;
                return <Continue {...this.props} token={token} />;
            }),
            new Route('orcidlink/help', { authenticationRequired: true }, (props: RouteProps) => {
                return <Help />;
            })
        ]

        return <Router routes={routes} hashPath={this.props.hashPath} />
    }
}
