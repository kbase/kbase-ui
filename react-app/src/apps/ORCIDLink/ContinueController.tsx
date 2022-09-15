import ErrorAlert from "components/ErrorAlert";
import Loading from "components/Loading";
import { AuthenticationStateAuthenticated } from "contexts/Auth";
import { AsyncProcess, AsyncProcessStatus } from "lib/AsyncProcess";
import { Component } from "react";
import { Config } from "types/config";
import Continue from "./Continue";
import { Model, ReturnLink, TempLinkRecord } from "./Model";

export interface ContinueControllerProps {
    token: string;
    auth: AuthenticationStateAuthenticated;
    config: Config;
    returnLink?: ReturnLink;
    skipPrompt?: boolean;
    setTitle: (title: string) => void;
}

export interface ContinueState {
    token: string;
    tempLinkRecord: TempLinkRecord
}

interface ContinueControllerState {
    continueState: AsyncProcess<TempLinkRecord, { message: string }>
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

            const tempLinkRecord = await model.fetchTempLink(this.props.token);
            this.setState({
                continueState: {
                    status: AsyncProcessStatus.SUCCESS,
                    value: tempLinkRecord as TempLinkRecord
                }
            });
        } catch (ex) {
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
        return <Loading />;
    }

    renderError({ message }: { message: string }) {
        return <ErrorAlert message={message} />
    }

    async confirmLink() {
        const model = new Model({ config: this.props.config, auth: this.props.auth });
        await model.confirmLink(this.props.token);
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

        if (this.props.returnLink) {
            window.open(this.props.returnLink.url, '_parent');
        } else {
            window.open('https://ci.kbase.us/#orcidlink', '_parent');
        }
    }

    async cancelLink() {
        const model = new Model({ config: this.props.config, auth: this.props.auth });
        await model.cancelLink(this.props.token);
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

    renderSuccess(tempLinkRecord: TempLinkRecord) {
        return <Continue
            tempLinkRecord={tempLinkRecord}
            returnLink={this.props.returnLink}
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
