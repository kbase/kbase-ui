import { Model } from 'apps/ORCIDLink/Model';
import { ORCIDProfile } from 'apps/ORCIDLink/ORCIDLinkClient';
import ErrorAlert from 'components/ErrorAlert';
import Loading from 'components/Loading';
import { AsyncProcess, AsyncProcessStatus } from 'lib/AsyncProcess';
import { Component } from 'react';
import ORCIDLink from './ORCIDLink';

export interface ORCIDLinkControllerProps {
    model: Model;
    stepsState: string;
    formId: string;
    setTitle: (title: string) => void;
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
        this.props.setTitle('ORCID® Link  - Demos - DOI Form - Step 2: ORCID Link');
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

            const orcidProfile = await (async () => {
                if (await this.props.model.isLinked()) {

                    // const narrativeCitations = await this.props.model.getNarrativeCitations(this.props.narrativeObjectRef);
                    return this.props.model.getProfile();
                }
                return null;
            })();

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
        returnURL.hash = `#orcidlink/demos/doi/${this.props.formId}`;
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
        url.hash = '#orcidlink/link';
        url.searchParams.set('return_link', JSON.stringify(returnLink));
        return url;
    }

    // renderLinkingLink(step: number) {
    //     const linkingURL = new URL(`${this.props.baseURL}/#orcidlink/link`);
    //     const process = {
    //         step,
    //         time: Date.now()
    //     };
    //     const returnURL = new URL(`${this.props.baseURL}#orcidlink/demos/interstitial1`);
    //     returnURL.searchParams.set('process', JSON.stringify(process));
    //     const returnLink = {
    //         url: returnURL.toString(),
    //         label: `Some Process, step ${step}`
    //     }
    //     linkingURL.searchParams.set('return_link', JSON.stringify(returnLink));
    //     return <a href={`${linkingURL.toString()}`}>Click here to link your KBase account to your ORCID account <i>(go to step {step})</i></a>
    // }

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