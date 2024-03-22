import Well from 'components/Well';
import { NextRequestObject } from 'lib/NextRequest';
import { Component } from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';
import { QuestionCircle } from 'react-bootstrap-icons';
import { IDProvider } from 'types/config';
import SignInButton from './SignInButton';
import './SignInControls.css';
import { SignInMode } from './SignInView';


export interface SignInControlsProps {
    authRequired: boolean;
    nextRequest?: NextRequestObject;
    providers: Array<IDProvider>;
    // assetsPath: string;
    mode: SignInMode;
    chooseSignUp: () => void;
    chooseSignIn: () => void;
    go: (provider: IDProvider) => void;
}

interface SignInControlsState {

}

export default class SignInControls extends Component<SignInControlsProps, SignInControlsState> {
    renderWillRedirect() {
        const nextRequest = this.props.nextRequest;
        if (typeof nextRequest === 'undefined' || nextRequest === null) {
            return;
        }
        const {path: {path}, label} = nextRequest;
        const pathLabel = <span style={{ fontWeight: 'bold' }}
            data-k-b-testhook-field="requested-path">
            {' '}
            {label || path}
        </span>;
       
        return <Well variant="info" className="mb-4 ms-auto me-auto" style={{width: '50rem'}}>
            <Well.Header icon="sign-in">
                Redirect after Sign In
            </Well.Header>
            <Well.Body>
            <p>
                After signing in, your browser will be redirected back to {pathLabel}.
            </p>
            </Well.Body>
        </Well>
        
    }

    renderAuthorizationRequired() {
        const nextRequest = this.props.nextRequest;
        if (typeof nextRequest === 'undefined' || nextRequest === null) {
            return;
        }
        const {path: {path}, label} = nextRequest;
        const pathLabel = <span style={{ fontWeight: 'bold' }}
            data-k-b-testhook-field="requested-path">
            {' '}
            {label || path}
        </span>;
       
        return <Well variant="danger" className="mb-4 ms-auto me-auto" style={{width: '50rem'}}>
            <Well.Header icon="sign-in">
                Sign In Required
            </Well.Header>
            <Well.Body>
            <p>
                Sign In is required to access {pathLabel}.
            </p>
            <p>
                After signing in, your browser will be redirected back to {pathLabel}.
            </p>
            </Well.Body>
        </Well>
        
    }

    renderProviders() {
        const buttons = this.props.providers.map((provider) => {
            return <Col style={{ justifySelf: 'stretch', display: 'flex', flexDirection: 'column' }} key={provider.id}>
                <SignInButton
                    provider={provider}
                    // assetsPath={this.props.assetsPath}
                    doSignIn={() => { this.props.go(provider); }}
                />
            </Col>;
        });
        return <Container fluid>
            <Row gap={1}>
                {buttons}
            </Row>
        </Container>
    }

    renderSignupButton() {
        switch (this.props.mode) {
            case 'signin': 
                return <Button className="btn btn-default -signup-button"
                    onClick={this.props.chooseSignUp.bind(this)}
                >
                    <span className="fa fa-user-plus fa-2x" />
                    <span className="-label">
                        Sign Up
                    </span>
                </Button>
            case 'signup': 
                return <Button className="btn btn-default -signup-button"
                    onClick={this.props.chooseSignIn.bind(this)}
                >
                    <span className="fa fa-sign-in fa-2x" />
                    <span className="-label">
                        Sign In
                    </span>
                </Button>
        }
    }

    renderHelpLink() {
        return <Button variant="info" href="https://www.kbase.us/support" target="_blank" rel="noreferer noopener"
            style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}
        >
            <QuestionCircle style={{ fontSize: '120%', fontWeight: 'bold', marginRight: '0.25rem' }} />{' '} Need Help?
        </Button>
    }

    renderSignInOrUpHeader() {
        return <div className="-header">
            <span className="fa fa-sign-in fa-2x -icon" />
            <span className="-label">
                Sign In 
            </span>
            <span className="-label text-info" style={{margin: '0 0.5rem'}}>
                <i>or</i>
            </span>
            <span className="fa fa-user-plus fa-2x -icon" />
            <span className="-label">
                Sign Up
            </span>
        </div>
    }

    renderPromptx() {
        switch (this.props.mode) {
            case 'signin': 
                return <div className="-col">
                    <div className="-header">
                        <span className="fa fa-user-o fa-2x" />
                        <span className="-label">
                            New to KBase?
                        </span>
                    </div>
                    <div className="-body">
                        <div className="-row" style={{ justifyContent: 'center' }}>
                            {this.renderSignupButton()}
                        </div>
                    </div>
                </div>
            case 'signup': 
                return <div className="-col">
                    <div className="-header">
                        <span className="fa fa-sign-in fa-2x" />
                        <span className="-label">
                            Have a KBase Account?
                        </span>
                    </div>
                    <div className="-body">
                        <div className="-row" style={{ justifyContent: 'center' }}>
                            {this.renderSignupButton()}
                        </div>
                    </div>
                </div>
        }
    }

    renderPrompt() {
        return <div className="-col">
            <p>
                Whether you have a KBase account or not, your next step is to choose an 
                "Identity Provider" on the left. We currently support sign in in with <b>Google</b>, 
                <b>ORCiD</b>, and <b>Globus</b>
            </p>

            <p>
                If you are <b>signing up</b>, you will first sign in with one of the ID Providers, give 
                permission to KBase, then complete the KBase sign up form. After signing up, you 
                may continue to sign in to KBase using the ID Provider you originally selected.
            </p>

            <p>
                If you are <b>signing in</b>, you should choose the ID Provider you originally 
                signed up with, or subsequently linked to your account.
            </p>
        </div>
    }


    renderLoginControls() {
        // TODO: switch to bootstrap grid here.
        return <div className="-row">
            <div className="-col">
                {this.renderSignInOrUpHeader()}
                <div className="-header">
                    <i>with one of our Identity Provider partners</i>
                </div>
                <div className="-body">
                    <div style={{
                        width: '100%',
                        display: 'inline-block'
                    }}>
                        {this.renderProviders()}
                    </div>
                </div>
            </div>
            {this.renderPrompt()}
        </div>
    }

    render() {
        return <div className="SignInControls"
            data-plugin="auth2-client"
            data-k-b-testhook-compliant="login-view"
            data-widget="login">
            {this.props.authRequired ? this.renderAuthorizationRequired() : this.renderWillRedirect()}
            <Well variant="primary" style={{
                width: '50rem',
                margin: '0 auto'
            }}>
                <Well.Body>
                    {this.renderLoginControls()}
                </Well.Body>
                <Well.Footer style={{ justifyContent: 'center' }}>
                    {this.renderHelpLink()}
                </Well.Footer>
            </Well>
        </div>
    }
}
