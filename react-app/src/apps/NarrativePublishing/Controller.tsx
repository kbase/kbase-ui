import { LinkRecord } from 'apps/ORCIDLink/lib/ORCIDLinkClient';
import { ClientError } from 'apps/ORCIDLink/lib/ServiceClient';
import ErrorAlert from 'components/ErrorAlert';
import Loading from 'components/Loading';
import { RouteProps } from 'components/Router2';
import { AuthenticationState, AuthenticationStatus } from 'contexts/Auth';
import { AsyncProcess, AsyncProcessStatus } from 'lib/AsyncProcess';
import { Component } from 'react';
import { Config } from 'types/config';
import { Model } from './Model';
import NarrativePublishing from './NarrativePublishing';
import NotLinked from './NotLinked';

export interface ControllerProps extends RouteProps {
    config: Config;
    authState: AuthenticationState;
    setTitle: (title: string) => void;
}

export enum LinkStatus {
    NOTLINKED = 'NOTLINKED',
    LINKED = 'LINKED',
}

export interface LinkStateBase {
    status: LinkStatus;
}

export interface LinkStateLinked {
    status: LinkStatus.LINKED;
    orcidLink: LinkRecord;
}

export interface LinkStateNotLinked {
    status: LinkStatus.NOTLINKED;
}

export type LinkState = LinkStateLinked | LinkStateNotLinked;

export interface DataState {
    linkState: LinkState;
}

interface ControllerState {
    dataState: AsyncProcess<DataState, { message: string }>;
}

export default class Controller extends Component<ControllerProps, ControllerState> {
    constructor(props: ControllerProps) {
        super(props);

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
        // TODO: refactor routing so that authenticated routes always get
        // an authenticated state.
        if (this.props.authState.status !== AuthenticationStatus.AUTHENTICATED) {
            this.setState({
                dataState: {
                    status: AsyncProcessStatus.ERROR,
                    error: {
                        message: 'Impossible - not authenticated!',
                    },
                },
            });
            return;
        }
        try {
            const model = new Model({
                config: this.props.config,
                auth: this.props.authState,
            });

            const orcidLink = await model.getORCIDLink();

            this.setState({
                dataState: {
                    status: AsyncProcessStatus.SUCCESS,
                    value: {
                        linkState: {
                            status: LinkStatus.LINKED,
                            orcidLink,
                        },
                    },
                },
            });
        } catch (ex) {
            if (ex instanceof ClientError) {
                this.setState({
                    dataState: {
                        status: AsyncProcessStatus.SUCCESS,
                        value: {
                            linkState: {
                                status: LinkStatus.NOTLINKED,
                            },
                        },
                    },
                });
            } else if (ex instanceof Error) {
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

    // Renderers

    renderLoading() {
        return <Loading message="Loading Narrative Manager..." />;
    }

    renderError({ message }: { message: string }) {
        return <ErrorAlert message={message} />;
    }

    renderSuccess(dataState: DataState) {
        switch (dataState.linkState.status) {
            case LinkStatus.LINKED:
                return (
                    <NarrativePublishing
                        {...this.props}
                        orcidLink={dataState.linkState.orcidLink}
                    />
                );
            case LinkStatus.NOTLINKED:
                return <NotLinked />;
        }
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
