import { Model } from "apps/ORCIDLink/lib/Model";
import ErrorMessage from "components/ErrorMessage";
import Loading from "components/Loading";
import { AuthenticationStateAuthenticated } from "contexts/EuropaContext";
import { AsyncProcess, AsyncProcessStatus } from "lib/AsyncProcess";
import { SimpleError } from 'lib/SimpleError';
import { InfoResult } from "lib/kb_lib/comm/coreServices/ORCIDLInk";
import { Component } from "react";
import { Config } from "types/config";
import ServiceInfoView from "./view";

export interface ServiceInfoControllerProps {
    auth: AuthenticationStateAuthenticated;
    config: Config;
}

interface ServiceInfoState {
    serviceInfo: InfoResult
}

type ServiceInfoStateProcess = AsyncProcess<ServiceInfoState, SimpleError>

interface ServiceInfoControllerState {
    process: ServiceInfoStateProcess
}

export default class ServiceInfoController extends Component<ServiceInfoControllerProps, ServiceInfoControllerState> {
    constructor(props: ServiceInfoControllerProps) {
        super(props);
        this.state = {
            process: {
                status: AsyncProcessStatus.NONE
            }
        }
    }
    async componentDidMount() {
        this.setState({
            process: {
                status: AsyncProcessStatus.NONE
            }
        })

        try {
            const model = new Model({ config: this.props.config, auth: this.props.auth });
            const serviceInfo = await model.getInfo();
            this.setState({
                process: {
                    status: AsyncProcessStatus.SUCCESS,
                    value: {
                        serviceInfo
                    }
                }
            })
        } catch (ex) {
            if (ex instanceof Error) {
                this.setState({
                    process: {
                        status: AsyncProcessStatus.ERROR,
                        error: {
                            message: ex.message
                        }
                    }
                })
            } else {
                this.setState({
                    process: {
                        status: AsyncProcessStatus.ERROR,
                        error: {
                            message: 'Unknown error'
                        }
                    }
                })
            }
        }
    }

    renderLoading() {
        return <Loading message="Loading service info..." />
    }

    renderError(error: SimpleError) {
        return <ErrorMessage message={error.message} />
    }

    renderSuccess(value: ServiceInfoState) {
        return <ServiceInfoView serviceInfo={value.serviceInfo} />
    }

    render() {
        const process = this.state.process;
        switch (process.status) {
            case AsyncProcessStatus.NONE:
            case AsyncProcessStatus.PENDING:
                return this.renderLoading();
            case AsyncProcessStatus.ERROR:
                return this.renderError(process.error);
            case AsyncProcessStatus.SUCCESS:
                return this.renderSuccess(process.value);
        }
    }
}