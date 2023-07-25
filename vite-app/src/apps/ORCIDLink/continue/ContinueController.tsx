import Loading from "components/Loading";
import { AuthenticationStateAuthenticated } from "contexts/Auth";
import { AsyncProcess, AsyncProcessStatus } from "lib/AsyncProcess";
import { Component } from "react";
import { Config } from "types/config";
import { LinkingSessionComplete, Model } from "../lib/Model";
import { LinkRecord, ReturnInstruction } from "../lib/ORCIDLinkClient";
import { ClientError } from "../lib/ServiceClient";
import Continue from "./Continue";
import ErrorView from "./Error";

export interface ContinueControllerProps {
    linkingSessionId: string;
    auth: AuthenticationStateAuthenticated;
    config: Config;
    returnInstruction?: ReturnInstruction;
    skipPrompt?: boolean;
    setTitle: (title: string) => void;
}

// export interface ContinueState {
//     token: string;
//     linkingSession: LinkingSessionComplete
// }

export interface ErrorBase {
    message: string;
    type: ErrorType
}

export enum ErrorType {
    ALREADY_LINKED = "ALREADY LINKED",
    FETCH_LINK_SESSION_ERROR = "FETCH LINK SESSION ERROR"
}

export interface AlreadyLinkedError extends ErrorBase {
    type: ErrorType.ALREADY_LINKED,
    link: LinkRecord
}

export interface FetchLinkSessionError extends ErrorBase {
    type: ErrorType.FETCH_LINK_SESSION_ERROR
}

export type ContinueLinkingError =
    AlreadyLinkedError |
    FetchLinkSessionError;

export type ContinueLinkingState = AsyncProcess<LinkingSessionComplete, ContinueLinkingError>;

export type CreateLinkState = AsyncProcess<true, { message: string }>;

interface ContinueControllerState {
    continueState: ContinueLinkingState
    createLinkState: CreateLinkState
    showInProfile: boolean;
}

export default class ContinueController extends Component<ContinueControllerProps, ContinueControllerState> {
    constructor(props: ContinueControllerProps) {
        super(props);
        this.state = {
            continueState: {
                status: AsyncProcessStatus.NONE
            },
            createLinkState: {
                status: AsyncProcessStatus.NONE
            },
            showInProfile: true
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
            const link = await model.getLink();
            if (link) {
                this.setState({
                    continueState: {
                        status: AsyncProcessStatus.ERROR,
                        error: {
                            type: ErrorType.ALREADY_LINKED,
                            message: 'Already linked; each user may have a single ORCID Link',
                            link
                        }
                    }
                });
                return;
            }
        } catch (ex) {
            if (ex instanceof ClientError) {
                if (ex.responseCode === 404) {
                    // Strangely enough, this is the happy path!
                } else {
                    this.setState({
                        continueState: {
                            status: AsyncProcessStatus.ERROR,
                            error: {
                                type: ErrorType.FETCH_LINK_SESSION_ERROR,
                                message: ex.message
                            }
                        }
                    });
                    return;
                }
            } else if (ex instanceof Error) {
                this.setState({
                    continueState: {
                        status: AsyncProcessStatus.ERROR,
                        error: {
                            type: ErrorType.FETCH_LINK_SESSION_ERROR,
                            message: ex.message
                        }
                    }
                });
                return
            } else {
                this.setState({
                    continueState: {
                        status: AsyncProcessStatus.ERROR,
                        error: {
                            type: ErrorType.FETCH_LINK_SESSION_ERROR,
                            message: `Unknown error: ${String(ex)}`
                        }
                    }
                });
                return;
            }
        }

        try {
            // if (linkingSession.kind !== 'complete') {
            //     this.setState({
            //         continueState: {
            //             status: AsyncProcessStatus.ERROR,
            //             error: {
            //                 message: `Incorrect linking session state, expected "complete", have "${linkingSession.kind}"`
            //             }
            //         }
            //     })
            // } else {
            //     this.setState({
            //         continueState: {
            //             status: AsyncProcessStatus.SUCCESS,
            //             value: linkingSession
            //         }
            //     });
            // }

            const linkingSession = await model.fetchLinkingSession(this.props.linkingSessionId);

            this.setState({
                continueState: {
                    status: AsyncProcessStatus.SUCCESS,
                    value: linkingSession
                }
            });
        } catch (ex) {
            console.error('ERROR', ex);
            if (ex instanceof Error) {
                this.setState({
                    continueState: {
                        status: AsyncProcessStatus.ERROR,
                        error: {
                            type: ErrorType.FETCH_LINK_SESSION_ERROR,
                            message: ex.message
                        }
                    }
                });
            } else {
                this.setState({
                    continueState: {
                        status: AsyncProcessStatus.ERROR,
                        error: {
                            type: ErrorType.FETCH_LINK_SESSION_ERROR,
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

    renderError(error: ContinueLinkingError) {
        return <ErrorView
            error={error}
            returnInstruction={this.props.returnInstruction}
            cancelLink={this.cancelLink.bind(this)}
        />;
    }

    setShowInProfile(show: boolean) {
        this.setState({
            showInProfile: show
        });
    }

    async confirmLink() {
        this.setState({
            createLinkState: {
                status: AsyncProcessStatus.PENDING
            }
        })
        try {
            const model = new Model({ config: this.props.config, auth: this.props.auth });

            await model.confirmLink(this.props.linkingSessionId);

            await model.setShowORCIDIdPreference(this.state.showInProfile);

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
                    case 'window': {
                        const { id, origin } = returnInstruction
                        window.opener.postMessage({ id }, origin);
                    }
                }

            } else {
                window.open('https://ci.kbase.us/#orcidlink', '_parent');
            }
            this.setState({
                createLinkState: {
                    status: AsyncProcessStatus.SUCCESS, value: true
                }
            })
        } catch (ex) {

            console.error('ERROR IS', ex);
            if (ex instanceof Error) {
                this.setState({
                    createLinkState: {
                        status: AsyncProcessStatus.ERROR,
                        error: {
                            message: ex.message
                        }
                    }
                });
            } else {
                this.setState({
                    createLinkState: {
                        status: AsyncProcessStatus.ERROR,
                        error: {
                            message: `Unknown error: ${String(ex)}`
                        }
                    }
                });
            }
        }
    }

    async cancelLink() {
        const model = new Model({ config: this.props.config, auth: this.props.auth });
        try {
            await model.cancelLink(this.props.linkingSessionId);
        } catch (ex) {
            // Ignore the error, it probably means that we are on this page inadvertently
            // or after some harmless error that prevented redirect.
            const message = (() => {
                if (ex instanceof Error) {
                    return ex.message;
                }
                return "Unknown error";
            })
            console.warn(`Linking session could not be canceled: ${message}`)
        }

        // TODO: handle error.
        window.open('/#orcidlink', '_parent');
    }

    renderSuccess(linkingSession: LinkingSessionComplete) {
        return <Continue
            linkingSession={linkingSession}
            returnInstruction={this.props.returnInstruction}
            createLinkState={this.state.createLinkState}
            confirmLink={this.confirmLink.bind(this)}
            cancelLink={this.cancelLink.bind(this)}
            showInProfile={this.state.showInProfile}
            setShowInProfile={this.setShowInProfile.bind(this)}
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
