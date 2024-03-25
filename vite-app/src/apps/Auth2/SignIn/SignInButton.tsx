import { Component } from 'react';
import { Button } from 'react-bootstrap';
import { IDProvider } from 'types/config';
import globusButtonLogo from '../resources/providers/globus/logo.png';
import googleButtonLogo from '../resources/providers/google/logo.png';
import orcidButtonLogo from '../resources/providers/orcid/logo.png';

import './SignInButton.css';

export interface SignInButtonProps {
    provider: IDProvider;
    doSignIn: () => void;
}

interface SignInButtonState {
    loading: boolean;
    imageState: string;
}

export default class SignInButton extends Component<SignInButtonProps, SignInButtonState> {
    constructor(props: SignInButtonProps) {
        super(props);
        this.state = {
            loading: false,
            imageState: 'normal'
        };
    }

    renderSpinner() {
        if (this.state.loading) {
            return <div className="-loading">
                <span className="fa fa-spinner fa-pulse fa-3x" />
            </div>
        }
    }

    doSignIn() {
        this.setState({
            loading: true,
            imageState: 'disabled'
        }, () => {
            this.props.doSignIn();
        });
    }

    providerLogoSrc() {
        switch (this.props.provider.id) {
            case 'Google':
                return googleButtonLogo;
            case 'Globus':
                return globusButtonLogo;
            case 'OrcID':
                return orcidButtonLogo;
            default:
                return null;
        }
    }

    renderProviderButtonLogo() {
        const logoSrc = this.providerLogoSrc();
        if (logoSrc) {
            return <img src={logoSrc} alt={this.props.provider.label} />
        } else {
            return <span>{this.props.provider.label}</span>
        }
    }

    render() {
        const buttonLabel = `Sign In button for the ${this.props.provider.label} identity provider`;
        return <Button title={buttonLabel}
            role="button"
            style={{ flex: '1 1 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            variant="outline-primary"
            disabled={this.state.loading}
            onClick={this.doSignIn.bind(this)}>
            <div style={{ flex: '1 1 0' }}>
                {this.renderProviderButtonLogo()}
            </div>
            <div style={{ flex: '0 0 auto' }}>
                {this.props.provider.label}
            </div>
        </Button>
    }
}
