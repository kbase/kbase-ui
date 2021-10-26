import { Component } from 'react';
import ErrorAlert from '../../components/ErrorAlert';
import Loading from '../../components/Loading';
import MessageAlert from '../../components/MessageAlert';
import { AuthenticationStateUnauthenticated } from '../../contexts/Auth';
import { AsyncProcess, AsyncProcessStatus } from '../../lib/AsyncProcess';
import { Auth2 } from '../../lib/kb_lib/Auth2';
import { Config } from '../../types/config';
import DevelopmentLoginForm from './DevelopmentLoginForm';

export interface DevelopmentLoginProps {
    config: Config;
    authState: AuthenticationStateUnauthenticated;
}

interface DevelopmentLoginState {
    loginState: AsyncProcess<{
        token: string;
        username: string;
        realname: string;
    }>;
}

export default class DevelopmentLogin extends Component<
    DevelopmentLoginProps,
    DevelopmentLoginState
> {
    constructor(props: DevelopmentLoginProps) {
        super(props);
        this.state = {
            loginState: {
                status: AsyncProcessStatus.NONE,
            },
        };
    }
    renderLoading() {
        return (
            <Loading
                message="Loading Auth State..."
                size="large"
                type="block"
            />
        );
    }

    async doSetToken(token: string) {
        console.log('hmm', token);
        // check token;
        const auth = new Auth2({
            baseUrl: this.props.config.services.Auth2.url,
        });
        try {
            const tokenInfo = await auth.getTokenInfo(token);
            const meInfo = await auth.getMe(token);
            this.setState({
                loginState: {
                    status: AsyncProcessStatus.SUCCESS,
                    value: {
                        token,
                        username: meInfo.user,
                        realname: meInfo.display,
                    },
                },
            });
        } catch (ex) {
            this.setState({
                loginState: {
                    status: AsyncProcessStatus.ERROR,
                    message: ex instanceof Error ? ex.message : 'Unknown error',
                },
            });
        }
    }

    setToken(token: string) {
        this.props.authState.login(token);
    }

    renderLoginStatus() {
        const loginState = this.state.loginState;
        switch (loginState.status) {
            case AsyncProcessStatus.NONE:
                return (
                    <MessageAlert message="Login is available" type="info" />
                );
            case AsyncProcessStatus.PENDING:
                return (
                    <Loading
                        message="Checking token..."
                        size="normal"
                        type="block"
                    />
                );
            case AsyncProcessStatus.ERROR:
                return <ErrorAlert message={loginState.message} />;
            case AsyncProcessStatus.SUCCESS:
                return (
                    <div>
                        <MessageAlert
                            message={`Valid token for "${loginState.value.realname}" (${loginState.value.username})`}
                            type="success"
                        />
                        <div style={{ textAlign: 'center' }}>
                            <button
                                className="btn btn-primary"
                                onClick={() =>
                                    this.setToken(loginState.value.token)
                                }
                            >
                                Set Token in Browser
                            </button>
                        </div>
                    </div>
                );
        }
    }

    render() {
        return (
            <div>
                <DevelopmentLoginForm onLogin={this.doSetToken.bind(this)} />
                <div style={{marginTop: '10px'}}>
                {this.renderLoginStatus()}
                </div>
            </div>
        );
    }
}
