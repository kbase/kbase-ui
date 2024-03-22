import ErrorAlert from "components/ErrorAlert";
import Loading from "components/Loading";
import { AuthenticationStateAuthenticated, notifySuccess } from "contexts/EuropaContext";
import { AsyncProcess, AsyncProcessStatus } from "lib/AsyncProcess";
import { Auth2, LinkChoice } from "lib/kb_lib/Auth2";
import { AuthError } from "lib/kb_lib/Auth2Error";
import { navigate } from "lib/navigation";
import { Component } from "react";
import { Button } from "react-bootstrap";
import { Config } from "types/config";
import { AlmostSimpleError } from "../SignInContinue/SignInContinue";
import TextSpan from "../TextSpan";
import LinkContinueView from "./view";


export interface LinkContinueControllerProps {
    authState: AuthenticationStateAuthenticated;
    config: Config;
    setTitle: (title: string) => void;
}

export interface LinkController {
    linkChoice: LinkChoice;
    serverTimeOffset: number;
}

type LinkContinueControllerState = AsyncProcess<LinkController, AlmostSimpleError>;

export default class LinkContinueController extends Component<LinkContinueControllerProps, LinkContinueControllerState> {
    constructor(props: LinkContinueControllerProps) {
        super(props);
        this.state = {
            status: AsyncProcessStatus.NONE
        };
    }
    componentDidMount() {
        this.start();
    }

    async cancelLink(message: string) {
        const auth2Client = new Auth2({
            baseUrl: this.props.config.services.Auth2.url
        });
        try {
            await auth2Client.linkCancel();
            notifySuccess(message, 3000);
            this.returnToLinkingTab();
        } catch (ex) {
            console.error(ex);
            // if (ex instanceof AuthError) {
            //     if (ex.code === '10010') {
            //         // simply continue
            //     } else {
            //         throw ex;
            //     }
            // }
        }
    }

    returnToLinkingTab() {
        navigate('account', {
            params: {
                tab: 'links'
            }
        });
    }

    async linkIdentity() {
        if (this.state.status !== AsyncProcessStatus.SUCCESS) {
            return;
        }
        const authToken = this.props.authState.authInfo.token
        const auth2 = new Auth2({
            baseUrl: this.props.config.services.Auth2.url
        });

        try {
            await auth2.linkPick(authToken, this.state.value.linkChoice.id);
            // this.props.runtime.notifySuccess('Successfully linked identity', 3000);
            navigate('account', {
                params: {
                    tab: 'links'
                }
            });
        } catch (ex) {
            console.error(ex);
            // this.props.runtime.notifyError(
            //     `Error linking: ${ex.message}`
            // );
        }
    }

    renderCancelAndReturnButton() {
        return <Button variant="outline-primary"
            onClick={() => { this.cancelLink('Canceling linking session') }}>
            cancel this session and return to the linking tab
        </Button>
    }

    renderReturnButton() {
        return <Button
            variant="default"
            onClick={() => { this.returnToLinkingTab(); }}>
            return to the linking tab
        </Button>
    }

    async start() {
        try {
            this.setState({
                status: AsyncProcessStatus.PENDING
            });

            this.props.setTitle('Link a Provider');

            const authToken = this.props.authState.authInfo.token
            const auth2Client = new Auth2({
                baseUrl: this.props.config.services.Auth2.url
            });

            const root = await auth2Client.root();

            const serverTimeOffset = new Date().getTime() - root.servertime;

            const linkChoice = await auth2Client.getLinkChoice(authToken);
            const { canlink, linkeduser, provider, provusername } = linkChoice;

            const currentUsername = this.props.authState.authInfo.account.user;

            if (!canlink) {
                if (linkeduser === currentUsername) {
                    const message = <div>
                        <p>
                            Sorry, you have already linked your current KBase account
                            <TextSpan bold={true}>{currentUsername}</TextSpan>
                            to this
                            <TextSpan bold={true}>{provider}</TextSpan>
                            sign-in account
                            <TextSpan bold={true}>{provusername}</TextSpan>
                        </p>
                        <p>
                            A sign-in account may only be linked once to any KBase account.
                        </p>
                        <p>
                            You may {this.renderCancelAndReturnButton()} 
                            and start again, this time choosing a different sign-in account to link to.
                        </p>
                    </div>
                    this.setState({
                        status: AsyncProcessStatus.ERROR,
                        error: {
                            title: 'Sign-in account already linked',
                            message
                        }
                    });
                    return;
                }
                const message = <div>
                    <p>
                        Sorry, you have already linked this
                        <TextSpan bold>{provider}</TextSpan>
                        sign-in account
                        <TextSpan bold>{provusername}</TextSpan>
                        to the KBase account
                        <TextSpan bold>{linkeduser}</TextSpan>
                    </p>
                    <p>
                        A sign-in account may only be linked once to any KBase account.
                    </p>
                    <p>
                        You may {this.renderCancelAndReturnButton()} and start again, this time choosing a different sign-in account to link to.
                    </p>
                </div>
                this.setState({
                    status: AsyncProcessStatus.ERROR,
                    error: {
                        title: 'Sign-in account already linked',
                        message
                    }
                });
                return;
            }

            this.setState({
                status: AsyncProcessStatus.SUCCESS,
                value: {
                    linkChoice,
                    serverTimeOffset
                }
            });
        } catch (ex) {
            console.error(ex);
            if (ex instanceof AuthError) {
                if (ex.code === '10010') {
                    const message = <div>
                        <p>A linking session was not found. This may be due to the expiration of the linking session,
                            which is valid for 10 minutes. Or it may be because you have visited this path from your browser history.</p>
                        <p>You may {this.renderReturnButton()} and try to link again.</p>
                    </div>;
                    this.setState({
                        status: AsyncProcessStatus.ERROR,
                        error: {
                            title: 'Link Session Expired or Missing',
                            message
                        }
                    });
                } else if (ex.code === '10020') {
                    const message = <div>
                        <p>The linking session has expired. A linking session is valid for 30 minutes.</p>
                        <p><Button variant="primary" onClick={() => {navigate('account', {params: {tab: 'links'}});}}>Return to the linking page</Button></p>
                    </div>
                    this.setState({
                        status: AsyncProcessStatus.ERROR,
                        error: {
                            title: 'Linking Session Expired',
                            message
                        }
                    });
                } else {
                    const message = <div>
                        <p>The linking session has experienced an error ({ex.code})</p>
                    </div>
                    this.setState({
                        status: AsyncProcessStatus.ERROR,
                        error: {
                            title: 'Linking Session Error',
                            message
                        }
                    });
                }
            } else {
                this.setState({
                    status: AsyncProcessStatus.ERROR,
                    error: {
                        title: 'Error',
                        message: ex instanceof Error ? ex.message : 'Unknown Error'
                    }
                });
            }
        }
    }

    render() {
        switch (this.state.status) {
            case AsyncProcessStatus.NONE:
            case AsyncProcessStatus.PENDING:
                return <Loading message="Loading..." />
            case AsyncProcessStatus.SUCCESS: {
                const {
                    linkChoice,
                    serverTimeOffset
                } = this.state.value;
                return <LinkContinueView
                    serverTimeOffset={serverTimeOffset}
                    linkChoice={linkChoice}
                    cancelLink={this.cancelLink.bind(this)}
                    linkIdentity={this.linkIdentity.bind(this)}
                />
            }
            // case AsyncProcessStatus.ERROR:
            //     return html`
            //         <${Alert} variant="warning" title=${this.state.title} showIcon=${true} showTitle=${true} message=${this.state.message} />
            //     `;
            case AsyncProcessStatus.ERROR:
                return <ErrorAlert title={this.state.error.title}>
                    {this.state.error.message}
                </ErrorAlert>
        }
    }
}
