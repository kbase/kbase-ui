import { Component } from 'react';
import ErrorAlert from 'components/ErrorAlert';
import Loading from 'components/Loading';
import { AsyncProcess, AsyncProcessStatus } from 'lib/AsyncProcess';
import View from './View';
import { Model } from 'apps/ORCIDLink/Model';
import { Config } from 'types/config';
import { AuthenticationStateAuthenticated } from 'contexts/Auth';


export interface ControllerProps {
    config: Config;
    auth: AuthenticationStateAuthenticated;
    setTitle: (title: string) => void;
}

export interface DataState {
    isLinked: boolean
}

interface ControllerState {
    dataState: AsyncProcess<DataState, { message: string }>
}

export default class Controller extends Component<ControllerProps, ControllerState> {
    model: Model;
    constructor(props: ControllerProps) {
        super(props);
        this.model = new Model({
            config: this.props.config,
            auth: this.props.auth
        })
        this.state = {
            dataState: {
                status: AsyncProcessStatus.NONE
            }
        }
    }

    componentDidMount() {
        this.props.setTitle('ORCID® Link - Demos - Using linking as an insterstitial page (page 2)')
        this.loadData();
    }

    // Model interaction

    async loadData() {
        await new Promise((resolve) => {
            this.setState({
                dataState: {
                    status: AsyncProcessStatus.PENDING
                }
            }, () => {
                resolve(null);
            });
        });
        try {
            const isLinked = await this.model.isLinked()
            this.setState({
                dataState: {
                    status: AsyncProcessStatus.SUCCESS,
                    value: {
                        isLinked
                    }
                }
            })
        } catch (ex) {
            if (ex instanceof Error) {
                this.setState({
                    dataState: {
                        status: AsyncProcessStatus.ERROR,
                        error: {
                            message: ex.message
                        }
                    }
                });
            } else {
                this.setState({
                    dataState: {
                        status: AsyncProcessStatus.ERROR,
                        error: {
                            message: `Unknown error: ${String(ex)}`
                        }
                    }
                });
            }
        }
    }

    // Renderers

    renderLoading() {
        return <Loading message="Loading ORCID Interstitial Page ..." />;
    }

    renderError({ message }: { message: string }) {
        return <ErrorAlert message={message} />
    }

    renderSuccess(dataState: DataState) {
        return <View isLinked={dataState.isLinked} />
    }

    render() {
        switch (this.state.dataState.status) {
            case AsyncProcessStatus.NONE:
            case AsyncProcessStatus.PENDING:
                return this.renderLoading();
            case AsyncProcessStatus.ERROR:
                return this.renderError(this.state.dataState.error)
            case AsyncProcessStatus.SUCCESS:
                return this.renderSuccess(this.state.dataState.value);
        }
    }
}