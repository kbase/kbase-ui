import { Component } from 'react';
import ErrorAlert from 'components/ErrorAlert';
import Loading from 'components/Loading';
import { AsyncProcess, AsyncProcessStatus } from 'lib/AsyncProcess';
import { Model, ORCIDProfile } from 'apps/ORCIDLink/Model';
import ORCIDLink from './ORCIDLink';

export interface ORCIDLinkControllerProps {
    model: Model;
    stepsState: string;
    onDone: (orcidId: string | null) => void;
}

export interface ORCIDLinkState {
    orcidProfile: ORCIDProfile | null;
}

export type DataState = AsyncProcess<ORCIDLinkState, { message: string }>

interface ORCIDLinkControllerState {
    dataState: DataState
}

export default class ORCIDLinkController extends Component<ORCIDLinkControllerProps, ORCIDLinkControllerState> {
    constructor(props: ORCIDLinkControllerProps) {
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

            // Get first N narratives.
            // N is ...??

            // const narrativeCitations = await this.props.model.getNarrativeCitations(this.props.narrativeObjectRef);
            const orcidProfile = await this.props.model.getProfile();

            this.setState({
                dataState: {
                    status: AsyncProcessStatus.SUCCESS,
                    value: {
                        orcidProfile
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

    createLinkStartURL() {
        const returnURL = new URL(document.location.origin);
        returnURL.hash = '#orcidlink/demos/doi';
        // TODO: add the state info for the narrative setp.
        // const process = {
        //     stepsState: this.props.stepsState
        // }
        returnURL.searchParams.set('process', this.props.stepsState);

        const returnLink = {
            url: returnURL.toString(),
            label: `DOI Request Form`
        }

        const url = new URL(document.location.origin);
        url.hash = '#orcidlink';
        url.searchParams.set('return_link', JSON.stringify(returnLink));
        return url;
    }

    // Renderers

    renderLoading() {
        return <Loading message="Loading your public narratives ..." />;
    }

    renderError({ message }: { message: string }) {
        return <ErrorAlert message={message} />
    }

    renderSuccess(orcidLinkState: ORCIDLinkState) {
        return <ORCIDLink
            orcidProfile={orcidLinkState.orcidProfile}
            onDone={() => {
                this.props.onDone(orcidLinkState.orcidProfile ? orcidLinkState.orcidProfile.orcidId : null);
            }}
            onStartLink={() => {
                const url = this.createLinkStartURL();
                window.open(url.toString(), '_parent');
            }}
        />;
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