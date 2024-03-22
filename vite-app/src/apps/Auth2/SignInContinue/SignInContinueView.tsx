import CountdownClock from "components/CountdownClock";
import { NextRequestObject } from "lib/NextRequest";
import { LoginChoice } from "lib/kb_lib/Auth2";
import { Component } from "react";
import { Alert, Col, Row } from "react-bootstrap";
import { IDProvider } from "types/config";
import { renderProviderLabel } from "../Providers";
import TextSpan from "../TextSpan";
import { PendingPolicyAgreement, PolicyAgreement } from "./PolicyAndAgreement";
import { AuthSessionCancellationType, SignUpFormInfo } from "./SignInContinue";
import SignInContinueForm from "./SignInContinueForm";
import './SignInContinueView.css';
import SignUpContinue from "./SignUpContinue";

// function provisionalUserName(choice: LoginChoice) {
//     if (choice.create.length > 0) {
//         return choice.create![0].provusername;
//     }
//     return choice.login![0].provusernames.join(', ');
// }

export interface SignInContinueViewProps {
    choice: LoginChoice;
    provider: IDProvider;
    source: string;
    serverTimeOffset: number;
    nextRequest?: NextRequestObject;
    //TODO: type this
    policyAgreement: PolicyAgreement;
    setTitle: (title: string) => void;
    onDone: () => void;
    doSignIn: (agreement?: PendingPolicyAgreement) => void;
    doSignUp: (signUpInfo: SignUpFormInfo) => void;
    cancelSignIn: (type: AuthSessionCancellationType, message: string) => void;
    cancelSignUp: (type: AuthSessionCancellationType, message: string) => void;
    checkUsername: (username: string) => Promise<string | null>
}

export default class SignInContinueView extends Component<SignInContinueViewProps> {
    getUIState() {
        const choice = this.props.choice;
        if (choice) {
            return {
                auth: true,
                signin: choice.login.length > 0,
                signup: choice.create.length > 0
            };
        }
        return {
            auth: false, signin: false, signup: false
        };
    }

    renderStep2Inactive() {
        return  <div>Step 2 Inactive</div>
    }

    renderOopsExplanation(provider: IDProvider) {
        if (this.props.source === 'signin') {
            return <div>
                <p>
                    If this browser is already signed in to {provider.label}, a sign-in attempt 
                    from KBase will route you to {provider.label} and back again without any warning.
                </p>
                <p>
                    If this just happened to you, and the account you see above is not 
                    the one you want, you should use the logout link below to log out of 
                    {provider.label}, and then try again.
                </p>
            </div>
        }
        return <div>
            <p>
                If this browser is already signed in to {provider.label}, a sign-in attempt 
                from KBase will route you to {provider.label} and back again without any warning.
            </p>
            <p>
                If this just happened to you, and the account you see above is not 
                the one you want, you should use the link below to log out of {provider.label}, and then try again.
            </p>

        </div>
    }

    renderSignUp() {
        return <SignUpContinue
            choice={this.props.choice}
            provider={this.props.provider}
            setTitle={this.props.setTitle}
            serverTimeOffset={this.props.serverTimeOffset}
            checkUsername={this.props.checkUsername} 
            cancelSignUp={(message: string) => {
                this.props.cancelSignUp(AuthSessionCancellationType.USER, message);
            }}
            onSignUp={this.props.doSignUp}
            nextRequest={this.props.nextRequest}
        />
    }

    renderSignIn() {
        return <SignInContinueForm
            choice={this.props.choice}
            provider={this.props.provider}
            source="signin"
            nextRequest={this.props.nextRequest}
            serverTimeOffset={this.props.serverTimeOffset}
            policyAgreement={this.props.policyAgreement}
            setTitle={this.props.setTitle}
            doSignIn={this.props.doSignIn}
            doCancel={() => {this.props.cancelSignIn(AuthSessionCancellationType.USER, "User canceled sign in")}}
        />
    }

    renderSignupState() {
        const uiState = this.getUIState();
        if (uiState.auth === false) {
            return this.renderStep2Inactive();
        } else if (uiState.signin) {
            return this.renderSignIn();
        } else if (uiState.signup) {
            return this.renderSignUp();
        }
        return <div>
            Invalid state
        </div>
    }

    renderHeader() {
        if (this.props.choice === null) {
            return;
        }

        function providerUserName(choice: LoginChoice): string {
            return choice.create[0].provusername;
        }

        // const progress = ((this.props.choice.expires + this.props.serverTimeOffset) - Date.now())/3000

        return <Row className="py-2">
            <Col md={8}>
                <Alert variant="success" className="mb-0">
                    You are ready to
                    <TextSpan bold>sign in</TextSpan> to
                    KBase account
                    <TextSpan bold>{this.props.choice.login[0].user}</TextSpan>
                    via the linked
                    <TextSpan bold>{renderProviderLabel(this.props.choice.provider)}</TextSpan>
                    account
                    <TextSpan bold last>{providerUserName(this.props.choice)}</TextSpan>
                </Alert>
            </Col>
            <Col md={4}>
                <Alert variant="warning" className="mb-0">
                    You have <b><CountdownClock
                        endAt={this.props.choice.expires + this.props.serverTimeOffset}
                        startAt={Date.now()}
                        onExpired={() => { this.props.cancelSignIn(AuthSessionCancellationType.TIMEOUT, 'Sign In canceled due to timeout'); }}
                    /></b>{' '}to complete Sign In.
                </Alert>
                {/* <ProgressBar striped variant="info" now={progress} label={`${progress}%`} /> */}
            </Col>
        </Row>
    }

    // renderHeader(message: string) {
    //     return <ContinueHeader 
    //         name="Sign In"
    //         choice={this.props.choice}
    //         cancelChoiceSession={() => {
    //             this.props.cancelSignIn(AuthSessionCancellationType.TIMEOUT, 'Your Sign In session has expired');
    //         }}
    //         serverTimeOffset={this.props.serverTimeOffset}
    //     />
    // }

    render() {
        return <div className="SignInContinueView">
            <div className="-body">
                {this.renderSignupState()}
            </div>
        </div>
    }
}
