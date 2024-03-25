import CountdownClock from "components/CountdownClock";
import Well from "components/Well";
import { NextRequestObject } from "lib/NextRequest";
import { LoginChoice } from "lib/kb_lib/Auth2";
import { Component } from "react";
import { Alert, Col, Container, Row } from 'react-bootstrap';
import { IDProvider } from "types/config";
import TextSpan from "../TextSpan";
import { SignUpFormInfo } from "./SignInContinue";
import SignInOops from "./SignInOops";
import SignUpForm from "./SignUpForm";

/**
 * Now we use ant design forms. Don't reinvent the wheel (yet again!)
 */

export interface OptionItem {
    value: string
    label: string
}
export interface SignUpContinueProps {
    choice: LoginChoice;
    serverTimeOffset: number;
    provider: IDProvider;
    checkUsername: (username: string) => Promise<string | null>
    cancelSignUp: (message: string) => void;
    onSignUp: (signUpInfo: SignUpFormInfo) => void;
    setTitle: (title: string) => void;
    nextRequest?: NextRequestObject;
}

export default class SignUpContinue extends Component<SignUpContinueProps> {
    componentDidMount() {
        this.props.setTitle('Sign Up for KBase')
    }

    renderNextRequestMessage() {
        if (!this.props.nextRequest) {
            return;
        }
        const {path: {path}, label} = this.props.nextRequest;
        return <Well variant="info">
            <Well.Header icon="info-circle">
                Post Sign-in
            </Well.Header>
            <Well.Body>
                <p>
                    After signing in, you will be returned to the <b>{label || path}</b> page.
                </p>
            </Well.Body>
        </Well>
    }

    renderHeader() {
        if (this.props.choice === null) {
            return;
        }

        // function providerUserName(choice: LoginChoice): string {
        //     return choice.create[0].provusername;
        // }

        return <Row className="py-2">
            <Col md={8}>
                <Alert variant="success" className="mb-0">
                    {/* You are ready to
                    <TextSpan bold>sign up</TextSpan>
                    for a KBase account via the linked
                    <TextSpan bold>{renderProviderLabel(this.props.choice.provider)}</TextSpan>
                    account
                    <TextSpan bold last>{providerUserName(this.props.choice)}</TextSpan> */}
                    Hi, it looks like this is your first time using KBase with your
                    <TextSpan bold>{this.props.choice.provider}</TextSpan>
                    account
                    <TextSpan bold last>{this.props.choice.create![0].provusername}</TextSpan>.
                    <br/>
                    You may sign up for a free KBase account below., after which you may sign in 
                    using this Globus account.
                </Alert>
            </Col>
            <Col md={4}>
                <Alert variant="warning" className="mb-0">
                    You have <b><CountdownClock
                        endAt={this.props.choice.expires + this.props.serverTimeOffset}
                        startAt={Date.now()}
                        onExpired={() => { this.props.cancelSignUp('Signup canceled due to timeout'); }}
                    /></b>{' '}to complete sign-up.
                </Alert>
                {/* <ProgressBar striped variant="info" now={progress} label={`${progress}%`} /> */}
            </Col>
        </Row>
    }

    render() {
        return <Container fluid>

            {this.renderHeader()}

            <Row className="py-2">
                <SignInOops
                    provider={this.props.provider}
                    source="signup"
                    nextRequest={this.props.nextRequest} />
            </Row>

            <Row className="py-2">
                <Col>
                    {this.renderNextRequestMessage()}
                </Col>
            </Row>

            {/* <Row className="py-2">
                <Col>
                    <Well variant="info">
                        <Well.Header>
                            Sign Up for KBase
                        </Well.Header>
                        <Well.Body>
                            <p>
                                Hi, it looks like this is your first time using KBase with your
                                <TextSpan bold>{this.props.choice.provider}</TextSpan>
                                account
                                <TextSpan bold last>{this.props.choice.create![0].provusername}</TextSpan>.
                            </p>

                            <p>
                                You may sign up for a free KBase account below.
                            </p>
                        </Well.Body>
                    </Well>
                </Col>
            </Row> */}

            <Row className="py-2">
                <Col>
                <Well variant="primary">
                    <Well.Header>
                        Sign Up for KBase
                    </Well.Header>
                    <Well.Body>
                        <SignUpForm
                            choice={this.props.choice}
                            serverTimeOffset={this.props.serverTimeOffset}
                            checkUsername={this.props.checkUsername}
                            cancelSignUp={(message: string) => {
                                this.props.cancelSignUp(message);
                            }}
                            onSignUp={this.props.onSignUp}
                        />
                    </Well.Body>
                </Well>
                </Col>
            </Row>
        </Container>
    }
}
