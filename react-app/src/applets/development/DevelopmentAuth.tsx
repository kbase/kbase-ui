import { Component } from 'react';
import Loading from '../../components/Loading';
import {
    AuthenticationState,
    AuthenticationStateAuthenticated,
    AuthenticationStateUnauthenticated,
    AuthenticationStatus,
} from '../../contexts/Auth';
import { Config } from '../../types/config';
import DevelopmentLogin from './DevelopmentLogin';
import DevelopmentLogout from './DevelopmentLogout';

export interface DevelopmentAuthProps {
    config: Config;
    authState: AuthenticationState;
}

interface DevelopmentAuthState {}

export default class DevelopmentAuth extends Component<
    DevelopmentAuthProps,
    DevelopmentAuthState
> {
    renderLoading() {
        return (
            <Loading
                message="Loading Auth State..."
                size="large"
                type="block"
            />
        );
    }

    renderUnauthenticated(authState: AuthenticationStateUnauthenticated) {
        return (
            <DevelopmentLogin
                authState={authState}
                config={this.props.config}
            />
        );
    }

    renderAuthenticated(authState: AuthenticationStateAuthenticated) {
        return (
            <DevelopmentLogout
                config={this.props.config}
                authState={authState}
            />
        );
    }
    renderState() {
        switch (this.props.authState.status) {
            case AuthenticationStatus.NONE:
                return this.renderLoading();
            case AuthenticationStatus.UNAUTHENTICATED:
                return this.renderUnauthenticated(this.props.authState);
            case AuthenticationStatus.AUTHENTICATED:
                return this.renderAuthenticated(this.props.authState);
        }
    }

    render() {
        return (
            <div>
                <h1
                    style={{
                        backgroundColor: 'black',
                        color: 'yellow',
                        textAlign: 'center',
                    }}
                >
                    DEVELOPMENT MODE
                </h1>
                <div
                    style={{
                        width: '40em',
                        margin: '2em auto',
                        border: '1px solid silver',
                        padding: '8px',
                        borderRadius: '8px',
                    }}
                >
                    {this.renderState()}
                </div>
            </div>
        );
    }
}
