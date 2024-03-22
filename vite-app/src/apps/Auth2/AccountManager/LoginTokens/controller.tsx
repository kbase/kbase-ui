import ErrorAlert from "components/ErrorAlert";
import Loading from "components/Loading";
import { $GlobalMessenger, notifySuccess } from "contexts/EuropaContext";
import { AsyncProcess, AsyncProcessStatus } from "lib/AsyncProcess";
import { SimpleError } from 'lib/SimpleError';
import { Auth2, Role, TokenInfoFull } from "lib/kb_lib/Auth2";
import { Component } from "react";
import ActiveTokensView from "./view";

export interface LoginTokensControllerProps {
    token: string;
    roles: Array<Role>
    authURL: string;
    setTitle: (title: string) => void;
}

export interface LoginTokens {
    tokens: Array<TokenInfoFull>;
    current: TokenInfoFull
    serverTimeBias: number;
}

type LoginTokensControllerState = AsyncProcess<LoginTokens, SimpleError>;


export default class LoginTokensController extends Component<LoginTokensControllerProps, LoginTokensControllerState> {
    constructor(props: LoginTokensControllerProps) {
        super(props);
        this.state = {
            status: AsyncProcessStatus.NONE
        }
    }
    componentDidMount() {
        this.props.setTitle('Account Manager - Active Sign-In Sessions');
        this.loadData();
    }

    logout() {
        $GlobalMessenger.send('session', 'logout', null);
    }

    async revokeToken(tokenToRevoke: string) {
        if (this.state.status !== AsyncProcessStatus.SUCCESS) {
            return;
        }
        const auth2 = new Auth2({
            baseUrl: this.props.authURL
        });
        try {
            await auth2.revokeToken(this.props.token, tokenToRevoke);
            const { tokens } = await auth2.getTokens(this.props.token);
            this.setState({
                status: AsyncProcessStatus.SUCCESS,
                value: {
                    ...this.state.value,
                    tokens: tokens.filter((token) => {
                        return token.type === 'Login';
                    }),
                }
            });

            notifySuccess('Login token successfully removed');
        } catch (ex) {
            console.error(ex);
            // TODO: what now? probably send an alert
        }
    }

    async revokeAllTokens() {
        if (this.state.status !== AsyncProcessStatus.SUCCESS) {
            return;
        }
        const auth2 = new Auth2({
            baseUrl: this.props.authURL
        });
        const authToken = this.props.token;
        try {
            const {tokens: currentTokens} = await auth2.getTokens(authToken);

            // All others
            await Promise.all(currentTokens
                .filter(({type}) => {
                    return type=== 'Login';
                })
                .map(({id}) => {
                    return auth2.revokeToken(authToken, id);
                }));

            const {tokens} = await auth2.getTokens(authToken);

            this.setState({
                status: AsyncProcessStatus.SUCCESS,
                value: {
                    ...this.state.value,
                    tokens: tokens.filter((token) => {
                        return token.type === 'Login';
                    })
                }
            });

            notifySuccess('All Login tokens removed');
        } catch (ex) {
            console.error(ex);
            // TODO: what now? probably send an alert
        }
    }

    async revokeAllTokensAndLogout() {
        if (this.state.status !== AsyncProcessStatus.SUCCESS) {
            return;
        }
        await this.revokeAllTokens();

        await this.revokeCurrentTokenAndLogout();
    }

    async revokeCurrentTokenAndLogout() {
        // const authToken = this.props.token
        // const auth2Client = new Auth2({ baseUrl: this.props.authURL })
        try {

            // TODO: compatibility with Europa!
            // If this signs out here, it will leave Europa hanging, as it does not
            // appear to monitor the cookie very frequently.
            // await auth2Client.logout(authToken);
            this.logout();

            // notifySuccess('Successfully removed current Login token');
            
            // navigate('auth2/signedout');
        } catch (ex) {
            console.error(ex);
            // TODO: what now? probably send an alertpruntim e
        }
    }

    async getServerTimeBias() {
        const auth2 = new Auth2({
            baseUrl: this.props.authURL
        });
        const { servertime } = await auth2.root();
        return servertime - Date.now();
    }

    async loadData() {
        this.setState({
            status: AsyncProcessStatus.PENDING
        });
        const auth2 = new Auth2({
            baseUrl: this.props.authURL
        });

        try {
            const { tokens, current } = await auth2.getTokens(this.props.token);

            const serverTimeBias = await this.getServerTimeBias();
            this.setState({
                status: AsyncProcessStatus.SUCCESS,
                value: {
                    tokens: tokens.filter((token) => {
                        return token.type === 'Login';
                    }),
                    current,
                    serverTimeBias
                }
            });
        } catch (ex) {
            console.error(ex);
            this.setState({
                status: AsyncProcessStatus.ERROR,
                error: {
                    message: ex instanceof Error ? ex.message : 'Unknown Error'
                }
            });
        }
    }

    render() {
        switch (this.state.status) {
            case AsyncProcessStatus.NONE:
            case AsyncProcessStatus.PENDING:
                return <Loading message="Loading Login Sessions..." />
            case AsyncProcessStatus.SUCCESS:
                const { tokens, current, serverTimeBias } = this.state.value;
                return <ActiveTokensView
                    tokens={tokens}
                    currentToken={current}
                    serverTimeBias={serverTimeBias}
                    revokeToken={this.revokeToken.bind(this)}
                    revokeAllTokens={this.revokeAllTokens.bind(this)}
                    revokeAllTokensAndLogout={this.revokeAllTokensAndLogout.bind(this)}
                    revokeCurrentTokenAndLogout={this.revokeCurrentTokenAndLogout.bind(this)}
                />
            case AsyncProcessStatus.ERROR:
                return <ErrorAlert message={this.state.error.message} />
        }
    }
}
