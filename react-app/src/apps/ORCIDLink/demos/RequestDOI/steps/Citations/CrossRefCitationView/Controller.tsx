

import { Model } from 'apps/ORCIDLink/Model';
import ErrorAlert from 'components/ErrorAlert';
import Loading from 'components/Loading';
import { AsyncProcess, AsyncProcessStatus } from 'lib/AsyncProcess';
import { Component } from 'react';
import CrossRefCitationView from './View';
import CrossRefClient, { CrossRefCitation } from '../CrossRefClient';
import DataCiteView from './View';

export interface CrossRefCitationControllerProps {
    doi: string;
}

export interface DataCiteViewState {
    citation: CrossRefCitation;
}

export type AsyncDataState = AsyncProcess<DataCiteViewState, { message: string }>

interface CrossRefCitationControllerState {
    dataState: AsyncDataState
}

export default class CrossRefCitationController extends Component<CrossRefCitationControllerProps, CrossRefCitationControllerState> {
    constructor(props: CrossRefCitationControllerProps) {
        super(props);

        this.state = {
            dataState: {
                status: AsyncProcessStatus.NONE
            }
        }
    }

    componentDidMount() {
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
            const client = new CrossRefClient();
            const citation = await client.getCitation(this.props.doi);

            this.setState({
                dataState: {
                    status: AsyncProcessStatus.SUCCESS,
                    value: {
                        citation
                    }
                }
            });
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
        return <Loading message="Loading citation from CrossRef ..." />;
    }

    renderError({ message }: { message: string }) {
        return <ErrorAlert message={message} />
    }

    renderSuccess({ citation }: DataCiteViewState) {
        return <CrossRefCitationView citation={citation} />
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