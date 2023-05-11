import ErrorAlert from "components/ErrorAlert";
import Loading from "components/Loading";
import { AuthenticationStateAuthenticated } from "contexts/Auth";
import { AsyncProcess, AsyncProcessStatus } from "lib/AsyncProcess";
import { Component } from "react";
import { Config } from "types/config";
import { LinkingSessionComplete, Model } from "../lib/Model";
import { ReturnInstruction } from "../lib/ORCIDLinkClient";
import Continue from "./Continue";

export interface ContinueControllerProps {
    linkingSessionId: string;
    auth: AuthenticationStateAuthenticated;
    config: Config;
    returnInstruction?: ReturnInstruction;
    skipPrompt?: boolean;
    setTitle: (title: string) => void;
}

export interface ContinueState {
    token: string;
    linkingSession: LinkingSessionComplete
}

interface ContinueControllerState {
    continueState: AsyncProcess<LinkingSessionComplete, { message: string }>
}

export default class ContinueController extends Component<ContinueControllerProps, ContinueControllerState> {
    constructor(props: ContinueControllerProps) {
        super(props);
        this.state = {
            continueState: {
                status: AsyncProcessStatus.NONE
            }
        };
    }

    componentDidMount() {
        this.props.setTitle('ORCID® Link - Confirm Link');
        if (this.props.skipPrompt) {
            this.confirmLink();
        } else {
            this.fetchData();
        }
    }

    async fetchData() {
        const model = new Model({ config: this.props.config, auth: this.props.auth });
        await new Promise((resolve) => {
            this.setState({
                continueState: {
                    status: AsyncProcessStatus.PENDING
                }
            }, () => {
                resolve(null);
            });
        });

        try {

            const linkingSession = await model.fetchLinkingSession(this.props.linkingSessionId);
            if (linkingSession.kind !== 'complete') {
                this.setState({
                    continueState: {
                        status: AsyncProcessStatus.ERROR,
                        error: {
                            message: `Incorrect linking session state, expected "complete", have "${linkingSession.kind}"`
                        }
                    }
                })
            } else {
                this.setState({
                    continueState: {
                        status: AsyncProcessStatus.SUCCESS,
                        value: linkingSession
                    }
                });
            }
        } catch (ex) {
            console.error('ERROR', ex);
            if (ex instanceof Error) {
                this.setState({
                    continueState: {
                        status: AsyncProcessStatus.ERROR,
                        error: {
                            message: ex.message
                        }
                    }
                });
            } else {
                this.setState({
                    continueState: {
                        status: AsyncProcessStatus.ERROR,
                        error: {
                            message: `Unknown error: ${String(ex)}`
                        }
                    }
                });
            }
        }
    }

    renderLoading() {
        return <Loading message="Loading ORCID Link..." />;
    }

    renderError({ message }: { message: string }) {
        return <ErrorAlert message={message} />
    }

    async confirmLink() {
        const model = new Model({ config: this.props.config, auth: this.props.auth });
        await model.confirmLink(this.props.linkingSessionId);
        // const response = await fetch(`${FINISH_LINK_URL}/${this.props.token}`, {
        //     headers: {
        //         authorization: this.props.kbaseAuthToken
        //     }
        // })
        // if (response.status !== 200) {
        //     throw new Error(`Unexpected response: ${response.status}`);
        // }

        // const result = JSON.parse(await response.text());
        // TODO: handle error.

        const returnInstruction = this.props.returnInstruction;

        if (typeof returnInstruction !== 'undefined') {
            switch (returnInstruction.type) {
                case 'link':
                    window.open(returnInstruction.url, '_parent');
                    return;
                case 'window':
                    window.opener.postMessage({ id: returnInstruction.id }, window.location.origin);
            }

        } else {
            window.open('https://ci.kbase.us/#orcidlink', '_parent');
        }
    }

    async cancelLink() {
        const model = new Model({ config: this.props.config, auth: this.props.auth });
        await model.cancelLink(this.props.linkingSessionId);
        // const response = await fetch(`${CANCEL_LINK_URL}/${this.props.token}`, {
        //     headers: {
        //         authorization: this.props.kbaseAuthToken
        //     }
        // })
        // if (response.status !== 200) {
        //     throw new Error(`Unexpected response: ${response.status}`);
        // }

        // const result = JSON.parse(await response.text());

        // TODO: handle error.
        window.open('https://ci.kbase.us/#orcidlink', '_parent');
    }

    renderSuccess(linkingSession: LinkingSessionComplete) {
        return <Continue
            linkingSession={linkingSession}
            returnInstruction={this.props.returnInstruction}
            confirmLink={this.confirmLink.bind(this)}
            cancelLink={this.cancelLink.bind(this)}
        />;
    }

    render() {
        switch (this.state.continueState.status) {
            case AsyncProcessStatus.NONE:
            case AsyncProcessStatus.PENDING:
                return this.renderLoading();
            case AsyncProcessStatus.ERROR:
                return this.renderError(this.state.continueState.error)
            case AsyncProcessStatus.SUCCESS:
                return this.renderSuccess(this.state.continueState.value);
        }
    }
}
