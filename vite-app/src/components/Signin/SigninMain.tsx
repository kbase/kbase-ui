import { changeHash2 } from 'lib/navigation';
import { Component } from 'react';
import { AuthenticationState, AuthenticationStatus } from '../../contexts/Auth';
import { Config } from '../../types/config';
import Signin from './Signin';

export interface LoginProps {
    authState: AuthenticationState;
    config: Config;
}

interface LoginState { }

export default class Login extends Component<LoginProps, LoginState> {
    constructor(props: LoginProps) {
        super(props);
        this.state = {
            data: {
                isLoginView: false,
                profile: null,
            },
        };
    }

    async doSignout() {
        if (
            this.props.authState.status !== AuthenticationStatus.AUTHENTICATED
        ) {
            return;
        }
        try {
            await this.props.authState.logout();
            changeHash2('auth2/signedout');
        } catch (ex) {
            console.error('YIKES AHOY!', ex);
        }
    }

    render() {
        const props = {
            authState: this.props.authState,
            signout: this.doSignout.bind(this),
            isLoginView: false
        };
        return <Signin {...props} />;
    }
}
