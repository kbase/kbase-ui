import { LinkRecord } from 'apps/ORCIDLink/lib/ORCIDLinkClient';
import ErrorAlert from 'components/ErrorAlert';
import Loading from 'components/Loading';
import { AuthenticationStateAuthenticated } from 'contexts/Auth';
import { AsyncProcess, AsyncProcessStatus } from 'lib/AsyncProcess';
import { Component } from 'react';
import { Config } from 'types/config';
import { GetStaticNarrativesResult, Model } from '../Model';
import View from './View';

export interface ControllerProps {
    config: Config;
    auth: AuthenticationStateAuthenticated;
    setTitle: (title: string) => void;
}

export enum LinkStatus {
    NONE = 'NONE',
    LINKED = 'LINKED',
}

export interface DataState {
    staticNarratives: Array<GetStaticNarrativesResult>;
    orcidLink: LinkRecord;
}

interface ControllerState {
    dataState: AsyncProcess<DataState, { message: string }>;
}

export default class Controller extends Component<ControllerProps, ControllerState> {
    model: Model;
    constructor(props: ControllerProps) {
        super(props);

        this.model = new Model({
            config: this.props.config,
            auth: this.props.auth,
        });
        this.state = {
            dataState: {
                status: AsyncProcessStatus.NONE,
            },
        };
    }

    componentDidMount() {
        this.props.setTitle('Narrative Publication Manager');
        this.loadData();
    }

    async loadData() {
        await new Promise((resolve) => {
            this.setState(
                {
                    dataState: {
                        status: AsyncProcessStatus.PENDING,
                    },
                },
                () => {
                    resolve(null);
                }
            );
        });
        try {
            const staticNarratives = await this.model.getStaticNarratives();

            staticNarratives.sort((a, b) => {
                return a.workspaceInfo.metadata['narrative_nice_name'].localeCompare(
                    b.workspaceInfo.metadata['narrative_nice_name']
                );
            });

            const orcidLink = await this.model.getORCIDLink();

            this.setState({
                dataState: {
                    status: AsyncProcessStatus.SUCCESS,
                    value: { staticNarratives, orcidLink },
                },
            });
        } catch (ex) {
            if (ex instanceof Error) {
                this.setState({
                    dataState: {
                        status: AsyncProcessStatus.ERROR,
                        error: {
                            message: ex.message,
                        },
                    },
                });
            } else {
                this.setState({
                    dataState: {
                        status: AsyncProcessStatus.ERROR,
                        error: {
                            message: `Unknown error: ${String(ex)}`,
                        },
                    },
                });
            }
        }
    }

    // Actions

    async deleteWork(putCode: string) {
        await this.model.deleteWork(putCode);
        this.loadData();
    }

    // Renderers

    renderLoading() {
        return <Loading message="Loading Narratives ..." />;
    }

    renderError({ message }: { message: string }) {
        return <ErrorAlert message={message} />;
    }

    renderSuccess(dataState: DataState) {
        return (
            <View
                staticNarratives={dataState.staticNarratives}
                orcidLink={dataState.orcidLink}
                baseURL={this.props.config.deploy.ui.origin}
                deleteWork={this.deleteWork.bind(this)}
            />
        );
    }

    render() {
        switch (this.state.dataState.status) {
            case AsyncProcessStatus.NONE:
            case AsyncProcessStatus.PENDING:
                return this.renderLoading();
            case AsyncProcessStatus.ERROR:
                return this.renderError(this.state.dataState.error);
            case AsyncProcessStatus.SUCCESS:
                return this.renderSuccess(this.state.dataState.value);
        }
    }
}
