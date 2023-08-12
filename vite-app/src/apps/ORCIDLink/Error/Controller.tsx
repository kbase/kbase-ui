import ErrorMessage from "components/ErrorMessage";
import Loading from "components/Loading";
import { SimpleError } from "components/MainWindow";
import { AuthenticationStateAuthenticated } from "contexts/Auth";
import { AsyncProcess, AsyncProcessStatus } from "lib/AsyncProcess";
import { JSONValue } from "lib/json";
import { Component } from "react";
import { Config } from "types/config";
import { Model } from "../lib/Model";
import { ErrorInfo } from "../lib/ORCIDLinkClient";
import ErrorView from "./View";

export interface ErrorControllerProps {
    config: Config;
    auth: AuthenticationStateAuthenticated;
    errorCode: number;
    title: string;
    message: string;
    setTitle: (title: string) => void;
    info?: JSONValue
}

interface ErrorControllerState {
    errorInfoState: AsyncProcess<{ errorInfo: ErrorInfo }, SimpleError>
}

export default class ErrorController extends Component<ErrorControllerProps, ErrorControllerState> {
    constructor(props: ErrorControllerProps) {
        super(props);
        this.state = {
            errorInfoState: {
                status: AsyncProcessStatus.NONE
            }
        }
    }

    componentDidMount() {
        this.loadErrorInfo();
    }

    async loadErrorInfo() {
        this.setState({
            errorInfoState: {
                status: AsyncProcessStatus.PENDING
            }
        });

        try {
            const model = new Model({ config: this.props.config, auth: this.props.auth })
            const errorInfo = await model.getErrorInfo(this.props.errorCode);
            this.setState({
                errorInfoState: {
                    status: AsyncProcessStatus.SUCCESS,
                    value: {
                        errorInfo
                    }
                }
            })
        } catch (ex) {
            const message = (() => {
                if (ex instanceof Error) {
                    return ex.message;
                }
                return 'Unknown error';
            })();
            this.setState({
                errorInfoState: {
                    status: AsyncProcessStatus.ERROR,
                    error: {
                        message
                    }
                }
            })
        }
    }

    render() {
        switch (this.state.errorInfoState.status) {
            case AsyncProcessStatus.NONE:
            case AsyncProcessStatus.PENDING:
                return <Loading message="Loading error info..." />
            case AsyncProcessStatus.ERROR:
                return <ErrorMessage message={this.state.errorInfoState.error.message} />
            case AsyncProcessStatus.SUCCESS:
                return <ErrorView
                    {...this.props}
                    errorInfo={this.state.errorInfoState.value.errorInfo}
                />

        }
    }
}