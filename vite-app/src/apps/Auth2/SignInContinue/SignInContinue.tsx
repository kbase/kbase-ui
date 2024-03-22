import ErrorMessage from 'components/ErrorMessage';
import Loading from 'components/Loading';
import { RouteProps } from 'components/Router2';
import { AuthenticationState, AuthenticationStatus } from 'contexts/EuropaContext';
import { AsyncProcess, AsyncProcessStatus } from 'lib/AsyncProcess';
import { NextRequestObject } from 'lib/NextRequest';
import { Auth2, PolicyAgreement as AuthPolicyAgreement, LoginChoice } from 'lib/kb_lib/Auth2';
import { AuthError } from 'lib/kb_lib/Auth2Error';
import { JSONRPC11Exception } from 'lib/kb_lib/comm/JSONRPC11/JSONRPC11';
import UserProfile from 'lib/kb_lib/comm/coreServices/UserProfile';
import { Messenger } from 'lib/messenger';
import { navigate } from 'lib/navigation';
import { Component, ReactNode } from 'react';
import { Button } from 'react-bootstrap';
import { Md5 } from 'ts-md5';
import { Config, IDProvider } from 'types/config';
import { Providers } from '../Providers';
import PolicyAndAgreement, { PendingPolicyAgreement, PolicyAgreement } from './PolicyAndAgreement';
import SignInContinueView from './SignInContinueView';

export type ErrorDetail = Array<string | ErrorDetail>;

export interface AlmostSimpleError {
  title: string;
  message: ReactNode;
}

export interface UIErrorParams {
  code: string;
  message: string;
  detail: ErrorDetail;
  data: any;
}

class UIError extends Error {
  code: string;
  detail: ErrorDetail;
  data: any;
  constructor({ code, message, detail, data }: UIErrorParams) {
    super(message);
    this.code = code;
    this.detail = detail;
    this.data = data;
  }
}

export enum AuthSessionCancellationType {
  USER = 'CancellationType_USER',
  TIMEOUT = 'CancellationType_TIMEOUT',
}

export enum AuthSessionType {
  SIGNUP = 'AuthSession_SIGNUP',
  SIGNIN = 'AuthSession_SIGNIN',
}

export interface StateParam {
  nextrequest?: NextRequestObject;
  origin: string;
}

function getStateParam(choice: LoginChoice): StateParam {
  if (!choice.redirecturl) {
    throw new UIError({
      code: 'parse-error',
      message: 'Redirect url is missing or falsy.',
      // data: null,
      detail: [
        'This is an error using the KBase auth flow.',
        'The choice object should have a property named "redirecturl", but it is either missing or falsy.',
      ],
      data: {
        choice,
      },
    });
  }

  let url;
  try {
    url = new URL(choice.redirecturl);
  } catch (ex) {
    const message = ex instanceof Error ? ex.message : 'Unknown Error';
    console.error(ex, choice.redirecturl);
    throw new UIError({
      code: 'parse-error',
      message: 'Error parsing redirecturl',
      detail: [
        'This is an error parsing the redirecturl in choice.redirecturl',
        `The original error message is: ${message}`,
      ],
      data: {
        choice,
      },
    });
  }

  // we just expect a state param.
  if (!url.searchParams.has('state')) {
    throw new UIError({
      code: 'missing-state',
      message: 'State query parameter missing from choice.redirecturl',
      detail: [
        'This is an error using the KBase auth flow.',
        [
          'The choice object should have a property named "redirecturl" which ',
          'should be a valid url with a query param named "state", which is in JSON format.',
        ],
      ],
      data: {
        choice,
      },
    });
  }

  try {
    return JSON.parse(url.searchParams.get('state')!);
  } catch (ex) {
    console.error('Error parsing state in redirect url', ex);
    const message = ex instanceof Error ? ex.message : 'Unknown Error';
    throw new UIError({
      code: 'parse-error',
      message: 'Error parsing state in redirect url',
      detail: [
        'This is an error parsing the KBase auth flow.',
        [
          'The choice object should have a property named "redirecturl" which ',
          'should be a valid url with a query param named "state", which is in JSON format.',
        ],
        ['The original error message is: ', message],
      ],
      data: {
        choice,
      },
    });
  }
}

export interface SurveyItem {
  question: string;
  response: Record<string, string>;
}

// export interface SignUpInfo {
//     // For account creation
//     username: string;
//     realname: string;
//     email: string;
//     agreements: Array<PolicyAgreement>

//     // For profile
//     organization: string;
//     department: string;
//     hearAbout: SurveyItem
// }

export interface SignUpFormInfo {
  // For account creation
  username: string;
  realname: string;
  email: string;

  // For profile
  organization: string;
  department: string;
  hearAbout: SurveyItem;
  agreement: AuthPolicyAgreement;
}

export interface AccountCreationParams {
  username: string;
  realname: string;
  email: string;
  agreement: AuthPolicyAgreement;
}

export interface ProfileCreationParams {
  username: string;
  realname: string;
  organization: string;
  department: string;
  hearAbout: SurveyItem;
}

export interface LoginContinueProps extends RouteProps {
  // params: SignInParams
  // nextrequest: string,
  authState: AuthenticationState;
  config: Config;
  messenger: Messenger;
  setTitle: (title: string) => void;
}

export type LoginContinueLoginState = AsyncProcess<null, AlmostSimpleError>;

// TODO: finish definiing
interface LoginContinueSuccess {
  nextRequest?: NextRequestObject;
  // TODO: maybe this is typed correctly...
  choice: LoginChoice;
  provider: IDProvider;
  // TODO: type this.
  policyAgreement: PolicyAgreement;
  serverTimeOffset: number;
  loginState: LoginContinueLoginState;
}
type LoginContinueState = AsyncProcess<LoginContinueSuccess, AlmostSimpleError>;

export default class LoginContinue extends Component<LoginContinueProps, LoginContinueState> {
  constructor(props: LoginContinueProps) {
    super(props);

    this.state = {
      status: AsyncProcessStatus.NONE,
    };
  }

  componentDidMount() {
    this.startItUp();
  }

  async doSignIn(agreement?: PendingPolicyAgreement) {
    // Can only sign in if we are in SUCCESS state.
    if (this.state.status !== AsyncProcessStatus.SUCCESS) {
      // OR ??
      return;
    }

    const auth2Client = new Auth2({
      baseUrl: this.props.config.services.Auth2.url,
    });

    const {
      nextRequest,
      choice: {
        login: [{ id: identityId }],
      },
    } = this.state.value;

    try {
      if (this.props.authState.status !== AuthenticationStatus.UNAUTHENTICATED) {
        // TODO: refactor to either:
        // handle authenticated state nicely (e.g. sign out, sign in)
        // only have the signin continue operate under unauthenticated
        // for now, it will work, but not for edge cases.
        throw new Error('Must be unauthenticated to sign in');
      }

      const { token: tokenInfo } = await auth2Client.loginPick({
        identityId,
        linkAll: false,
        agreements: agreement ? [agreement] : [],
      });

      // TODO: replace with direct call of a function provided by the
      // EuropaContext.
      this.props.messenger.send('session', 'loggedin', {
        token: tokenInfo.token,
        expires: tokenInfo.expires,
        nextRequest,
      });
    } catch (ex) {
      console.log('ERROR', ex);
    }
  }

  async doSignInDirect(value: LoginContinueSuccess) {
    const auth2Client = new Auth2({
      baseUrl: this.props.config.services.Auth2.url,
    });

    const {
      nextRequest,
      choice: {
        login: [{ id: identityId }],
      },
    } = value;

    try {
      if (this.props.authState.status !== AuthenticationStatus.UNAUTHENTICATED) {
        // TODO: refactor to either:
        // handle authenticated state nicely (e.g. sign out, sign in)
        // only have the signin continue operate under unauthenticated
        // for now, it will work, but not for edge cases.
        throw new Error('Must be unauthenticated to sign in');
      }

      const { token: tokenInfo } = await auth2Client.loginPick({
        identityId,
        linkAll: false,
        agreements: [],
      });

      // TODO: replace with direct call of a function provided by the
      // EuropaContext.
      this.props.messenger.send('session', 'loggedin', {
        token: tokenInfo.token,
        expires: tokenInfo.expires,
        nextRequest,
      });
    } catch (ex) {
      console.log('ERROR', ex);
    }
  }
  gravatarHash(emailAddress: string) {
    return Md5.hashStr(emailAddress.trim().toLowerCase());
  }

  async createProfile(
    token: string,
    { username, realname, organization, department, hearAbout: { question, response } }: ProfileCreationParams,
  ) {
    const auth2Client = new Auth2({
      baseUrl: this.props.config.services.Auth2.url,
    });
    const accountInfo = await auth2Client.getMe(token);

    const userProfileClient = new UserProfile({
      url: this.props.config.services.UserProfile.url,
      token,
      timeout: this.props.config.ui.constants.clientTimeout,
    });
    const newProfile = {
      user: {
        username,
        realname,
      },
      profile: {
        metadata: {
          createdBy: 'userprofile_ui_service',
          created: new Date().toISOString(),
        },
        // was globus info, no longer used
        preferences: {},
        // when auto-creating a profile, there is nothing to put here yet.
        userdata: {
          organization,
          department,
          avatarOption: 'gravatar',
          gravatarDefault: 'identicon',
        },
        synced: {
          gravatarHash: this.gravatarHash(accountInfo.email),
        },
        surveydata: {
          referralSources: {
            question,
            response,
          },
        },
      },
    };

    try {
      return userProfileClient.set_user_profile({
        profile: newProfile,
      });
    } catch (ex) {
      if (ex instanceof JSONRPC11Exception) {
        // TODO: return fancy error.
        throw new Error(`Profile creation failed: ${ex.error.message}`);
      } else {
        throw ex;
      }
    }
  }

  createAccount(choiceId: string, { username, realname, email, agreement }: AccountCreationParams) {
    const auth2Client = new Auth2({
      baseUrl: this.props.config.services.Auth2.url,
    });
    const params = {
      id: choiceId,
      user: username,
      display: realname,
      email,
      linkall: false,
      policyids: [`${agreement.id}.${agreement.version}`],
    };
    return auth2Client.loginCreate(params);
  }

  // async doSignUp({username, realname, email, agreements}: SignUpFormInfo) {
  //     try {
  //         const {token: tokenInfo} = await this.createAccount({

  //         });

  //         // await this.createProfile(tokenInfo.token, account.realname, profile, survey);

  //         // const nextRequest = this.getNextRequest();
  //         // if (nextRequest) {
  //         //     this.props.runtime.send('app', 'auth-navigate', {nextRequest, tokenInfo});
  //         // } else {
  //         //     this.props.runtime.send('app', 'auth-navigate', {nextRequest: {path: 'dashboard'}, tokenInfo});
  //         // }
  //     } catch (ex) {
  //         console.error(ex);
  //     }
  // }

  // TODO: wow, add more error handling, etc.

  async doSignUp({ username, realname, email, agreement, organization, department, hearAbout }: SignUpFormInfo) {
    if (this.state.status !== AsyncProcessStatus.SUCCESS) {
      // TODO: should be impossible, but runtime.
      throw new Error('Invalid state for signup');
    }
    const choiceId = this.state.value.choice.create[0].id;
    try {
      const createAccountResult = await this.createAccount(choiceId, {
        username,
        realname,
        email,
        agreement,
      });

      const {
        token: { token, expires },
      } = createAccountResult;

      await this.createProfile(token, {
        username,
        realname,
        organization,
        department,
        hearAbout,
      });

      // TODO: this should not be possible here ... move this method and others to
      // the signup continue controller.
      if (this.props.authState.status !== AuthenticationStatus.UNAUTHENTICATED) {
        // TODO: refactor to either:
        // handle authenticated state nicely (e.g. sign out, sign in)
        // only have the signin continue operate under unauthenticated
        // for now, it will work, but not for edge cases.
        throw new Error('Must be unauthenticated to sign in');
      }

      this.props.messenger.send('session', 'loggedin', {
        token,
        expires,
        nextRequest: this.state.value.nextRequest,
      });

      return;

      // this.props.authState.login(token, expires);

      // if (this.state.value.nextRequest) {
      //     try {
      //         // since the plugin is operating inside of the iframe, it needs
      //         // to send the token with the navigation path so the parent
      //         // window can also set the cookie.

      //         // TODO: *****
      //         //       Here is where we change the behavior from a message to kbase-ui
      //         //       to directly executing the auth and navigation!
      //         //
      //         // this.props.runtime.send('app', 'auth-navigate', {
      //         //     nextRequest,
      //         //     tokenInfo: pickResult.token
      //         // });

      //         // TODO: next request can also handle non-hash paths.
      //         // const {hash, params} = this.state.value.nextRequest;
      //         // navigate(hash, {params});
      //         navigate2(this.state.value.nextRequest.path);
      //     } catch (ex) {
      //         console.error('[doSignIn] ERROR parsing next request', this.state.value.nextRequest, ex);
      //         // this.props.runtime.send('app', 'navigate', '');
      //         // TODO: the default path can be external or internal, but
      //         // navigate doesn't handle this logic.

      //         // TODO: wrong!
      //         const defaultPath = this.props.config.ui.defaults.path;
      //         navigate2(defaultPath);
      //     }
      // } else {
      //     const defaultPath = this.props.config.ui.defaults.path;
      //     navigate2(defaultPath);
      // }
    } catch (ex) {
      console.error(ex);
    }
  }

  async checkUsername(username: string): Promise<string | null> {
    const auth2Client = new Auth2({
      baseUrl: this.props.config.services.Auth2.url,
    });
    try {
      const { availablename } = await auth2Client.loginUsernameSuggest(username);
      if (availablename === username) {
        return null;
      }
      return `This username is not available: a suggested available username is ${availablename}`;
    } catch (ex) {
      return 'error looking up username in auth';
    }
  }

  onDone() {
    // TODO: Currently handled by the view, but should be handled here.
  }

  async startItUp() {
    try {
      this.setState({
        status: AsyncProcessStatus.PENDING,
      });

      if (this.props.authState.status === AuthenticationStatus.AUTHENTICATED) {
        // navigate2(this.props.config.ui.defaults.path);
        this.setState({
          status: AsyncProcessStatus.ERROR,
          error: {
            title: 'Invalid State',
            message: 'This view only valid if not logged in.',
          },
        });
        return;
      }

      const providers = new Providers({
        supportedProviders: this.props.config.services.Auth2.supportedProviders,
        providers: this.props.config.services.Auth2.providers,
      }).get();

      const providersMap: Record<string, IDProvider> = providers.reduce<Record<string, IDProvider>>(
        (accum, provider) => {
          accum[provider.id] = provider;
          return accum;
        },
        {},
      );

      this.props.setTitle('KBase');

      const auth2Client = new Auth2({
        baseUrl: this.props.config.services.Auth2.url,
      });

      // Do a root request to synchronize our clocks, as signin continue enforces
      // a time limit (determined by the server)
      const root = await auth2Client.root();

      const serverTimeOffset = new Date().getTime() - root.servertime;

      const choice = await auth2Client.getLoginChoice();

      const stateParams = getStateParam(choice);

      // The "choice" may be of the "create" or "login" subtype.
      // These are only distinguishable by which of these properties is a non-zero
      // length array.
      //
      // TODO: here we seem to use the state parameter rather than the the choice
      // itself...

      // TODO: Remove this logic; signin and signup are really the same thing
      // now, without any redirections.
      // HMM ... I don't think this flow is supported any longer.

      // if (stateParams.origin === 'signup' && this.props.match.params.get('override-source') !== 'signin') {
      //     const params: Record<string, string> = {};
      //     // The next request is pulled out of the state param.
      //     // It needs to be turned back into a JSON string in order to
      //     // pass it as a query param value.

      //     if (stateParams.nextrequest) {
      //         params.nextrequest = JSON.stringify(stateParams.nextrequest);
      //     }

      //     navigate('signup', {params});
      //     return null;
      // }

      // At this point, we have a "login" , not "signup".

      // Prove it!

      // All we care about for policies are which ones the user has not yet agreed
      // to.

      // TODO: disabled; re-enable for policy resolution.

      // Here we "prove" that this is a login choice and if so extract the policyids.
      const policyids = await (async () => {
        if (choice.login && choice.login.length === 1) {
          return choice.login[0].policyids;
        } else if (choice.create && choice.create.length === 1) {
          // just pass empty policy ids, since this user has none yet.
          return [];
        }
        // should never get here.
        throw new Error('Neither login nor signup available for this sign-up account');
      })();

      const policies = new PolicyAndAgreement({
        policyids,
      });

      const policyAgreement = policies.getPolicyAgreement();

      const choiceProvider = providersMap[choice.provider];

      const value: LoginContinueSuccess = {
        nextRequest: stateParams.nextrequest,
        choice,
        provider: choiceProvider,
        policyAgreement,
        serverTimeOffset,
        loginState: {
          status: AsyncProcessStatus.NONE,
        },
      };

      // If current policy is agreed to and auth provider does not require signin
      // confirmation, then just auto-signin.
      // TODO: This does not currently work.
      if (policyAgreement.agreement && !choiceProvider.confirmSignin) {
        await this.doSignInDirect(value);
        return;
      }

      this.setState({
        status: AsyncProcessStatus.SUCCESS,
        value,
      });
    } catch (ex) {
      if (ex instanceof AuthError) {
        console.error('Error starting up sign-in session', ex);
        if (ex.code && ex.code === '10010') {
          const message = (
            <div>
              <p>
                A sign-in session was not found. This may be due to the expiration of the sign-in or sign-up session,
                which is valid for 30 minutes. Or it may be because you have visited this path from your browser
                history.
              </p>
              <p>If you wish to sign-in or sign-up, please {this.renderSignInButton('visit the sign in page')}.</p>
            </div>
          );
          this.setState({
            status: AsyncProcessStatus.ERROR,
            error: {
              title: 'Sign-In Session Expired',
              message,
            },
          });
        } else if (ex.code && ex.code === '10020') {
          const message = (
            <div>
              <p>The sign in session has expired. A sign in session is valid for 30 minutes.</p>
              <p>If you wish to sign-in or sign-up, please {this.renderSignInButton('visit the sign in page')}.</p>
            </div>
          );
          this.setState({
            status: AsyncProcessStatus.ERROR,
            error: {
              title: 'Sign-In Session Expired',
              message,
            },
          });
        } else {
          this.setState({
            status: AsyncProcessStatus.ERROR,
            error: {
              title: 'Error',
              message: ex instanceof Error ? ex.message : 'Unknown Error',
            },
          });
        }
      } else {
        this.setState({
          status: AsyncProcessStatus.ERROR,
          error: {
            title: 'Error',
            message: ex instanceof Error ? ex.message : 'Unknown Error',
          },
        });
      }
    }
  }

  returnToSignIn() {
    navigate('login');
  }

  renderSignInButton(message: string) {
    return (
      <Button variant="outline-primary" onClick={this.returnToSignIn.bind(this)}>
        {message}
      </Button>
    );
  }

  /**
   * Called if the user explicitly cancels their sign in via a user control (e.g. Cancel
   * button), or it times out.
   *
   * @param cancelMessage
   */
  async cancelSignInOrUp(
    cancellationType: AuthSessionCancellationType,
    cancelMessage: string,
    sessionType: AuthSessionType,
  ) {
    // TODO: use the cancel message!

    console.warn('cancellation message ignored', cancelMessage);

    const auth2Client = new Auth2({
      baseUrl: this.props.config.services.Auth2.url,
    });

    const [sessionNoun, sessionLabel] = (() => {
      switch (sessionType) {
        case AuthSessionType.SIGNIN:
          return ['sign in', 'Sign In'];
        case AuthSessionType.SIGNUP:
          return ['sign up', 'Sign Up'];
      }
    })();

    this.props.setTitle(`KBase ${sessionLabel} - Canceled`);

    const message = (() => {
      switch (cancellationType) {
        case AuthSessionCancellationType.USER:
          return (
            <div>
              <p>You have successfully cancelled your {sessionNoun} session.</p>
              <p>If you wish to sign in or sign up, please {this.renderSignInButton('visit the sign in page')}.</p>
            </div>
          );

        case AuthSessionCancellationType.TIMEOUT:
          return (
            <div>
              <p>
                Your {sessionNoun} session has been canceled due to too much time elapsing. A {sessionNoun} session is
                valid for 30 minutes.
              </p>
              <p>If you wish to sign in or sign up, please {this.renderSignInButton('visit the sign in page')}.</p>
            </div>
          );
      }
    })();

    const title = (() => {
      switch (cancellationType) {
        case AuthSessionCancellationType.USER:
          return `${sessionLabel} Session Canceled`;

        case AuthSessionCancellationType.TIMEOUT:
          return `${sessionLabel} Session Expired`;
      }
    })();

    try {
      await auth2Client.loginCancel();
      // TODO: hook up notifications here...
      // this.props.runtime.send('notification', 'notify', {
      //     type: 'error',
      //     id: 'signin',
      //     icon: 'ban',
      //     message: cancelMessage || 'The Sign In session has been canceled',
      //     description: cancelMessage || 'The Sign In session has been canceled',
      //     autodismiss: 10000
      // });

      this.setState({
        status: AsyncProcessStatus.ERROR,
        error: {
          title,
          message,
        },
      });
    } catch (ex) {
      // const errorMessage = (() => {
      //     if (ex instanceof Auth2Error.AuthError) {
      //         console.error(ex);
      //         // TODO: do something
      //     } else {
      //         console.error(ex);
      //     }
      // })();
      console.error('Error canceling auth session', ex);
      // TODO: add notification back here.
      // this.props.runtime.send('notification', 'notify', {
      //     type: 'error',
      //     id: 'signin',
      //     icon: 'ban',
      //     message: cancelMessage || 'The Sign In session has been canceled',
      //     description: cancelMessage || 'The Sign In session has been canceled',
      //     autodismiss: 10000
      // });
      const message = (
        <div>
          <p>An error was encountered canceling your {sessionNoun} session.</p>
          <p>The {sessionNoun} session will be automatically removed from the system after 30 minutes, </p>
          <p>If you wish to sign in or sign up again, please {this.renderSignInButton('visit the sign in page')}.</p>
          <p>The error is: {ex instanceof Error ? ex.message : 'Unknown Error'}</p>
        </div>
      );
      this.setState({
        status: AsyncProcessStatus.ERROR,
        error: {
          title: 'Sign-In Session Expired',
          message,
        },
      });
    }
  }

  cancelSignIn(cancelationType: AuthSessionCancellationType, cancelMessage: string) {
    return this.cancelSignInOrUp(cancelationType, cancelMessage, AuthSessionType.SIGNIN);
  }

  cancelSignUp(cancelationType: AuthSessionCancellationType, cancelMessage: string) {
    return this.cancelSignInOrUp(cancelationType, cancelMessage, AuthSessionType.SIGNUP);
  }

  renderLoading() {
    return <Loading message="Loading..." />;
  }

  renderError(error: AlmostSimpleError) {
    return <ErrorMessage title={error.title} message={error.message} />;
  }

  render() {
    switch (this.state.status) {
      case AsyncProcessStatus.NONE:
      case AsyncProcessStatus.PENDING:
        return this.renderLoading();
      case AsyncProcessStatus.SUCCESS: {
        return (
          <SignInContinueView
            nextRequest={this.state.value.nextRequest}
            choice={this.state.value.choice}
            provider={this.state.value.provider}
            policyAgreement={this.state.value.policyAgreement}
            onDone={this.onDone.bind(this)}
            serverTimeOffset={this.state.value.serverTimeOffset}
            source="signin"
            setTitle={this.props.setTitle}
            cancelSignIn={this.cancelSignIn.bind(this)}
            cancelSignUp={this.cancelSignUp.bind(this)}
            doSignIn={this.doSignIn.bind(this)}
            doSignUp={this.doSignUp.bind(this)}
            checkUsername={this.checkUsername.bind(this)}
          />
        );
      }
      case AsyncProcessStatus.ERROR:
        return this.renderError(this.state.error);
    }
  }
}
