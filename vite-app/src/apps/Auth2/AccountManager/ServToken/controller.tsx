import ErrorAlert from "components/ErrorAlert";
import Loading from "components/Loading";
import { notifySuccess } from "contexts/EuropaContext";
import { AsyncProcess, AsyncProcessStatus } from "lib/AsyncProcess";
import { SimpleError } from 'lib/SimpleError';
import { Auth2, Role, TokenInfoFull } from "lib/kb_lib/Auth2";
import { Component } from "react";
import ActiveTokensView from "./view";

export interface ServTokensControllerProps {
    token: string;
    roles: Array<Role>
    authURL: string;
    setTitle: (title: string) => void;
}

export interface ServTokens {
    tokens: Array<TokenInfoFull>;
    newToken: TokenInfoFull | null;
    serverTimeBias: number;
}

type ServTokensControllerState = AsyncProcess<ServTokens, SimpleError>;


export default class ServTokensController extends Component<ServTokensControllerProps, ServTokensControllerState> {
    constructor(props: ServTokensControllerProps) {
        super(props);
        this.state = {
            status: AsyncProcessStatus.NONE
        }
    }
    componentDidMount() {
        this.props.setTitle('Account Manager - Service Tokens');
        this.loadData();
    }

    async revokeToken(tokenToRevoke: string, name: string) {
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
                        return token.type === 'Service';
                    }),
                }
            });

            notifySuccess(`Service token "${name}" as been revoked`);
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
                    return type=== 'Service';
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
                        return token.type === 'Service';
                    })
                }
            });

            notifySuccess(`All service tokens have been revoked`);
        } catch (ex) {
            console.error(ex);
            // TODO: what now? probably send an alert
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
            const { tokens } = await auth2.getTokens(this.props.token);

            const serverTimeBias = await this.getServerTimeBias();
            this.setState({
                status: AsyncProcessStatus.SUCCESS,
                value: {
                    tokens: tokens.filter((token) => {
                        return token.type === 'Service';
                    }),
                    newToken: null,
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

    async createServiceToken(name: string) {
        const state = this.state;
        if (state.status !== AsyncProcessStatus.SUCCESS) {
            return;
        }

        const auth2 = new Auth2({
            baseUrl: this.props.authURL
        });
        const authToken = this.props.token
        try {
            const newToken = await auth2.createToken(authToken, {
                name,
                type: 'service'
            });

            this.setState({
                ...state,
                value: {
                    ...state.value,
                    newToken,
                    tokens: state.value.tokens.concat([newToken])
                }
            });

            notifySuccess(`New service token named "${name}" has been created`);
        } catch (ex) {
            console.error(ex);
            // what to do - notification?
        }
    }

    clearNewToken() {
        if (this.state.status !== AsyncProcessStatus.SUCCESS) {
            return;
        }
        this.setState({
            ...this.state,
            value: {
                ...this.state.value,
                newToken: null
            }
        });
    }

    render() {
        switch (this.state.status) {
            case AsyncProcessStatus.NONE:
            case AsyncProcessStatus.PENDING:
                return <Loading message="Loading..." />
            case AsyncProcessStatus.SUCCESS:
                const { tokens, newToken, serverTimeBias } = this.state.value;
                return <ActiveTokensView
                    tokens={tokens}
                    newToken={newToken}
                    serverTimeBias={serverTimeBias}
                    revokeToken={this.revokeToken.bind(this)}
                    revokeAllTokens={this.revokeAllTokens.bind(this)}
                    createServiceToken={this.createServiceToken.bind(this)}
                    clearNewToken={this.clearNewToken.bind(this)}
                />
            case AsyncProcessStatus.ERROR:
                return <ErrorAlert message={this.state.error.message} />
        }
    }
}
