import { Component } from 'react';
import ErrorAlert from '../../components/ErrorAlert';
import Loading from '../../components/Loading';
import MessageAlert from '../../components/AlertMessage';
import { AuthenticationStateAuthenticated } from '../../contexts/Auth';
import { AsyncProcess, AsyncProcessStatus } from '../../lib/AsyncProcess';
import { Config } from '../../types/config';

export interface DevelopmentLogoutProps {
    config: Config;
    authState: AuthenticationStateAuthenticated;
}

interface DevelopmentLogoutState {
    logoutState: AsyncProcess<null, string>;
}

export default class DevelopmentLogout extends Component<
    DevelopmentLogoutProps,
    DevelopmentLogoutState
> {
    constructor(props: DevelopmentLogoutProps) {
        super(props);
        this.state = {
            logoutState: {
                status: AsyncProcessStatus.NONE,
            },
        };
    }

    async doLogout(authState: AuthenticationStateAuthenticated) {
        this.setState({
            logoutState: {
                status: AsyncProcessStatus.PENDING,
            },
        });
        try {
            await authState.logout();
            this.setState({
                logoutState: {
                    status: AsyncProcessStatus.SUCCESS,
                    value: null,
                },
            });
        } catch (ex) {
            this.setState({
                logoutState: {
                    status: AsyncProcessStatus.ERROR,
                    error: ex instanceof Error ? ex.message : 'Unknown error',
                },
            });
        }
    }

    renderLogoutForm() {
        return (
            <form className="form">
                <p>Please use the button below to log out of KBase:</p>
                <div className="form-group">
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => this.doLogout(this.props.authState)}
                    >
                        Logout
                    </button>
                </div>
            </form>
        );
    }

    renderLoginStatus() {
        const logoutState = this.state.logoutState;
        switch (logoutState.status) {
            case AsyncProcessStatus.NONE:
                return (
                    <div style={{ marginTop: '10px' }}>
                        <MessageAlert message="Ready to logout" type="info" />
                    </div>
                );
            case AsyncProcessStatus.PENDING:
                return (
                    <Loading
                        message="Logging out..."
                        size="normal"
                        type="block"
                    />
                );
            case AsyncProcessStatus.ERROR:
                return <ErrorAlert message={logoutState.error} />;
            case AsyncProcessStatus.SUCCESS:
                return (
                    <div>
                        <MessageAlert
                            message="Successfully logged out"
                            type="success"
                        />
                    </div>
                );
        }
    }

    render() {
        return (
            <div>
                {this.renderLogoutForm()}
                {this.renderLoginStatus()}
            </div>
        );
    }
}
