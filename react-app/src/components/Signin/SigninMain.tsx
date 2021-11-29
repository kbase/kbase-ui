import { Component } from 'react';
import { changeHash } from '../../apps/Navigator/utils/navigation';
import { AuthenticationState, AuthenticationStatus } from '../../contexts/Auth';
// import { Auth2Session } from '../../lib/kb_lib/Auth2Session';
import { Config } from '../../types/config';
import Signin from './Signin';

export interface LoginProps {
    authState: AuthenticationState;
    config: Config;
}

interface LoginState {}

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
        // const authSession = new Auth2Session({
        //     baseUrl: this.props.config.services.Auth2.url,
        //     cookieName: this.props.config.services.Auth2.cookieName,
        //     extraCookies: this.props.config.services.Auth2.extraCookieNames,
        // });
        // // const authSession = this.runtime.service('session').getClient();
        // await authSession.logout();
        // TODO: do this BETTER!
        // stopgap for now to get something working.
        if (
            this.props.authState.status !== AuthenticationStatus.AUTHENTICATED
        ) {
            return;
        }
        try {
            console.log('HERE');
            await this.props.authState.logout();
            console.log('HERE 2');
            changeHash('auth2/signedout');
            // document.location.hash = '/#login';
        } catch (ex) {
            console.error('YIKES AHOY!', ex);
        }

        // authSession.setSessionCookie(tokenInfo.token, tokenInfo.expires);
        // return authSession.evaluateSession().then(() => {
        //     this.props.messenger.send({
        //         channel: 'app',
        //         message: 'navigate',
        //         payload: nextRequest,
        //     });
        // });
        // this.props.runtime
        //     .service('session')
        //     .logout()
        //     .then(() => {
        //         this.props.runtime.send('app', 'navigate', {
        //             type: 'internal',
        //             path: 'auth2/signedout'
        //         });
        //     })
        //     .catch((err) => {
        //         console.error('ERROR');
        //         console.error(err);
        //         alert('Error signing out (check console for details)');
        //     });
    }

    render() {
        const props = {
            authState: this.props.authState,
            // plugin: this.props.plugin,
            signout: this.doSignout.bind(this),
            isLoginView: false,
        };
        return <Signin {...props} />;
    }
}
