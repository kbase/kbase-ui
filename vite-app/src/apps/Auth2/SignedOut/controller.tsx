
import ErrorAlert from 'components/ErrorAlert';
import Loading from 'components/Loading';
import { AuthenticationState, AuthenticationStatus } from 'contexts/EuropaContext';
import { AsyncProcess, AsyncProcessStatus } from 'lib/AsyncProcess';
import { SimpleError } from 'lib/SimpleError';
import { Component } from 'react';
import { Config, IDProvider } from 'types/config';
import { Providers } from '../Providers';
import SignedOutView from './view';

export interface SignedOutControllerProps {
    authState: AuthenticationState;
    config: Config;
    setTitle: (title: string) => void;
}

export interface SignedOutControllerSuccess {
    providers: Array<IDProvider>;
}

type SignedOutControllerState = AsyncProcess<SignedOutControllerSuccess, SimpleError>

export default class SignedOutController extends Component<SignedOutControllerProps, SignedOutControllerState> {
    constructor(props: SignedOutControllerProps) {
        super(props);
        this.state = {
            status: AsyncProcessStatus.NONE
        };
    }
    
    componentDidMount() {
        this.start();
    }

    componentDidUpdate(prevProps: SignedOutControllerProps) {
        if (prevProps.authState.status !== this.props.authState.status) {
            this.start();
        }
    }

    async start() {
        try {
            this.setState({
                status: AsyncProcessStatus.PENDING
            });

            if (this.props.authState.status !== AuthenticationStatus.UNAUTHENTICATED) {
                this.setState({
                    status: AsyncProcessStatus.ERROR,
                    error: {
                        message: 'Unfortunately, it appears that kbase-ui is not actually logged out' 
                    }
                });
                return;
            }

            this.props.setTitle('Signed Out');

            const providers = new Providers({
                supportedProviders: this.props.config.services.Auth2.supportedProviders,
                providers: this.props.config.services.Auth2.providers
            }).get();

            this.setState({
                status: AsyncProcessStatus.SUCCESS,
                value: {
                    providers
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
                return <Loading message="Loading..." />
            case AsyncProcessStatus.SUCCESS: {
                return <SignedOutView providers={this.state.value.providers} />
            }
            case AsyncProcessStatus.ERROR:
                return <ErrorAlert message={this.state.error.message} />
        }
    }
}