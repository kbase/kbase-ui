import CountdownClock from 'components/CountdownClock';
import Well from 'components/Well';
import { NextRequestObject } from 'lib/NextRequest';
import { LoginChoice } from 'lib/kb_lib/Auth2';
import { Component } from 'react';
import { Alert, Button, Col, Row, Stack } from 'react-bootstrap';
import { IDProvider } from 'types/config';
import { renderProviderLabel } from '../Providers';
import TextSpan from '../TextSpan';
import UseAgreements from '../UseAgreements';
import { CurrentTermsAndConditionsPolicy } from './Policy';
import { PendingPolicyAgreement, PolicyAgreement } from './PolicyAndAgreement';
import SignInOops from './SignInOops';

// TODO: what type is choice?
function providerUserName(choice: LoginChoice): string {
  // if ('provusername' in choice.login[0]) {
  //     return choice.login[0].provusername;
  // }
  return choice.login[0].provusernames.join(', ');
}

// TODO: okay, need to resolve next request!

export interface SignInContinueProps {
  source: string;
  choice: LoginChoice;
  provider: IDProvider;
  nextRequest?: NextRequestObject;
  policyAgreement: PolicyAgreement;
  serverTimeOffset: number;
  // doSignInSubmit: () => void;
  setTitle: (title: string) => void;
  doSignIn: (agreement?: PendingPolicyAgreement) => void;
  doCancel: () => void;
}

export enum SignInContinueStatus {
  NEED_POLICY_AGREEMENT = 'NEED_POLICY_AGREEMENT',
  POLICY_AGREED_TO = 'POLICY_AGREED_TO',
  READY = 'READY',
}

export interface SignInContinueBase {
  status: SignInContinueStatus;
}

export interface SignInContinueNeedPolicyAgreement extends SignInContinueBase {
  status: SignInContinueStatus.NEED_POLICY_AGREEMENT;
  policy: CurrentTermsAndConditionsPolicy;
}

export interface SignInContinuePolicyAgreedTo extends SignInContinueBase {
  status: SignInContinueStatus.POLICY_AGREED_TO;
  agreement: PendingPolicyAgreement;
}

export interface SignInContinueReady extends SignInContinueBase {
  status: SignInContinueStatus.READY;
}

export type SignInContinueState =
  | SignInContinueNeedPolicyAgreement
  | SignInContinuePolicyAgreedTo
  | SignInContinueReady;

// interface SignInContinueState {
//     canSignIn: boolean;
//     agreement: PendingPolicyAgreement | null;
// }

export default class SignInContinue extends Component<SignInContinueProps, SignInContinueState> {
  constructor(props: SignInContinueProps) {
    super(props);

    if (props.policyAgreement.agreement) {
      this.state = {
        status: SignInContinueStatus.READY,
      };
    } else {
      this.state = {
        status: SignInContinueStatus.NEED_POLICY_AGREEMENT,
        policy: props.policyAgreement.currentPolicy,
      };
    }
  }

  componentDidMount() {
    this.props.setTitle('Sign In');
  }

  onAgreed(agreedTo: boolean) {
    if (agreedTo) {
      const { id, version } = this.props.policyAgreement.currentPolicy;
      this.setState({
        status: SignInContinueStatus.POLICY_AGREED_TO,
        agreement: { id, version },
      });
    } else {
      this.setState({
        status: SignInContinueStatus.NEED_POLICY_AGREEMENT,
        policy: this.props.policyAgreement.currentPolicy,
      });
    }
  }

  renderNextRequestMessagex() {
    if (!this.props.nextRequest) {
      return;
    }
    const {
      path: { path },
      label,
    } = this.props.nextRequest;
    return (
      <Alert variant="info">
        After signing in, you will returned to the <b>{label || path}</b> page.
      </Alert>
    );
  }

  renderNextRequestMessage() {
    if (!this.props.nextRequest) {
      return;
    }
    const {
      path: { path },
      label,
    } = this.props.nextRequest;
    return (
      <Well variant="secondary" className="mb-4">
        <Well.Header icon="info-circle">Post Sign-in</Well.Header>
        <Well.Body>
          <p>
            After signing in, you will be returned to the <b>{label || path}</b> page.
          </p>
        </Well.Body>
      </Well>
    );
  }

  renderAgreementRequiredMessage() {
    if (this.state.status !== SignInContinueStatus.NEED_POLICY_AGREEMENT) {
      return;
    }
    return (
      <Alert variant="warning">
        Please read and agree to the "KBase Use Agreement" above in order to complete Sign-In to KBase.
      </Alert>
    );
  }

  renderHeader() {
    if (this.props.choice === null) {
      return;
    }

    return (
      <Row>
        <Col md={8}>
          <Alert variant="success">
            Ready to sign into KBase account <b>{this.props.choice.login[0].user}</b>, via the linked{' '}
            <b>{renderProviderLabel(this.props.choice.provider)}</b> account{' '}
            <b>{providerUserName(this.props.choice)}</b>.
          </Alert>
        </Col>
        <Col md={4}>
          <Alert variant="warning">
            <b>
              <CountdownClock
                endAt={this.props.choice.expires + this.props.serverTimeOffset}
                startAt={Date.now()}
                onExpired={this.props.doCancel}
              />
            </b>{' '}
            left to complete sign-in.
          </Alert>
        </Col>
      </Row>
    );
  }

  renderSignInControl() {
    const canSignIn =
      this.state.status === SignInContinueStatus.READY || this.state.status === SignInContinueStatus.POLICY_AGREED_TO;
    // const variant: Variant = canSignIn ? 'primary' : 'secondary';
    return (
      <Well variant="primary" disabled={!canSignIn}>
        <Well.Header icon="sign-in">Sign In to KBase</Well.Header>
        <Well.Body>
          {this.renderAgreementRequiredMessage()}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              this.doSigninSubmit();
            }}
          >
            <Stack gap={2} direction="horizontal">
              <Button type="submit" variant="primary" disabled={!canSignIn}>
                Sign In to KBase account
                <TextSpan style={{ fontWeight: 'bold' }} last={true}>
                  {this.props.choice.login[0].user}
                </TextSpan>
              </Button>
              <Button type="button" variant="danger" onClick={this.props.doCancel}>
                Cancel
              </Button>
            </Stack>
          </form>
        </Well.Body>
      </Well>
    );
  }

  async doSigninSubmit() {
    switch (this.state.status) {
      case SignInContinueStatus.NEED_POLICY_AGREEMENT:
        break;
      case SignInContinueStatus.POLICY_AGREED_TO:
        this.props.doSignIn(this.state.agreement);
        break;
      case SignInContinueStatus.READY:
        this.props.doSignIn();
    }
    return false;
  }

  renderUseAgreement() {
    if (this.state.status === SignInContinueStatus.READY) {
      return;
    }
    return (
      <UseAgreements
        policyToResolve={this.props.policyAgreement.currentPolicy}
        hasPreviousAgreements={this.props.policyAgreement.hasPreviousAgreements}
        onAgreed={this.onAgreed.bind(this)}
      />
    );
  }

  render() {
    return (
      <Stack gap={2} className="ml-2 p-0 overflow-x-hidden SignInContinueForm">
        {this.renderHeader()}

        <SignInOops provider={this.props.provider} source={this.props.source} nextRequest={this.props.nextRequest} />

        <div className="mt-2" />

        {this.renderUseAgreement()}

        {this.renderNextRequestMessage()}

        {this.renderSignInControl()}
      </Stack>
    );
  }
}
