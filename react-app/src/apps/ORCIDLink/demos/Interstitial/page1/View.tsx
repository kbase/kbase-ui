import { ORCID_URL } from 'apps/ORCIDLink/constants';
import { Component } from 'react';
import { ORCIDLinkState, ORCIDLinkStatus } from './Controller';
import { renderORCIDIcon } from '../../../common';
import styles from './View.module.css';
import { Alert, Button } from 'react-bootstrap';

export interface ViewProps {
    orcidState: ORCIDLinkState
    baseURL: string;
    process?: { [k: string]: string }
}


export interface StepStateNotReady {
    ready: false;
}

export interface StepStateReady {
    ready: true;
    step: number;
}

export type StepState =
    StepStateReady | StepStateNotReady;

interface ViewState {
    stepState: StepState
}

export default class View extends Component<ViewProps, ViewState> {
    constructor(props: ViewProps) {
        super(props);
        // const step = (() => {
        //     if (this.props.process) {
        //         return (this.props.process['step'] as unknown) as number;
        //     }
        //     return;
        // })();
        this.state = {
            stepState: {
                ready: true,
                step: this.getStep(1)
            }
        }
    }
    // componentDidMount() {
    //     if (this.props.orcidState.status === ORCIDLinkStatus.LINKED) {
    //         const step = this.getStep();
    //         if (!step) {
    //             throw new Error('Missing step!');
    //         }
    //         this.setState({
    //             stepState: {
    //                 ready: true,
    //                 step: step!
    //             }
    //         });
    //         return;
    //     }

    //     this.setState({
    //         stepState: {
    //             ready: true,
    //             step: this.getStep(1)!
    //         }
    //     });
    // }
    getStep(defaultStep: number) {
        if (this.props.process) {
            return (this.props.process['step'] as unknown) as number;
        }
        return defaultStep;
    }
    renderStepTitle(step: number, title: string) {
        return <Alert variant="info" style={{ fontWeight: 'bold' }}>
            Step {step}: {title}
        </Alert>
    }
    renderStepDoneTitle(step: number, title: string) {
        return <Alert variant="success">
            Step {step}: {title}
        </Alert>
    }
    renderStepPendingTitle(step: number, title: string) {
        return <Alert variant="secondary">
            Step {step}: {title}
        </Alert>
    }

    renderStep1(stateStep: StepStateReady) {
        if (stateStep.step > 1) {
            return this.renderStepDoneTitle(1, 'Enable ORCID Link - Confirmed')
        }
        if (this.props.orcidState.status === ORCIDLinkStatus.LINKED) {
            const process = JSON.stringify({
                step: 2
            });
            const url = new URL(`${this.props.baseURL}#orcidlink/demos/interstitial1`)
            url.searchParams.set('process', process);
            return <div>
                {this.renderStepTitle(1, 'Enable ORCID Link')}
                <p>
                    Your KBase account is already linked to your ORCID account.
                </p>
                <p>
                    You see, here we detected that the account is linked to ORCID, so we can
                    dispense with linking. We offer the user a simple button to continue
                    on to the next step. We could just as easily just dispense with the first
                    step altogether, and start at the second step.
                </p>
                <p>
                    <Button variant="primary" href={url.toString()}>Continue</Button>
                </p>
            </div>;
        }
        return <div>
            {this.renderStepTitle(1, 'Enable ORCID Link')}
            <p>
                This represents the first step of some KBase user workflow, some process.
            </p>
            <p>
                That process notices that the user does not have an ORCID link and displays a
                link to the ORCID Link page. That link contains instructions for routing back to
                the next step of the workflow.
            </p>
            <p>
                The links below each return to a different step in the process. This demonstrates that we can
                carry any arbitrary information through the linking process in order to be able to
                return to this page, picking up at either step 2 or 3, depending on the how the <code>return_link</code> is crafted.
            </p>
            <p>
                {this.renderLinkingLink(2)}
            </p>
            <p>
                {this.renderLinkingLink(3)}
            </p>
            <p>
                Your browser will be returned here when that linking is completed.
            </p>
            {/* <p>
                {this.renderAutoLinkingLink()}
            </p> */}
        </div>
    }


    renderStep2(stateStep: StepStateReady) {
        if (stateStep.step > 2) {
            return this.renderStepDoneTitle(2, 'Do Something With ORCID account - DONE');
        }
        if (stateStep.step < 2) {
            return this.renderStepPendingTitle(2, 'Do Something With ORCID account');
        }
        if (this.props.orcidState.status !== ORCIDLinkStatus.LINKED) {
            return <div>Error, not really linked!</div>
        }
        const { orcidProfile } = this.props.orcidState;
        return <div>
            {this.renderStepTitle(2, 'Do Something With ORCID account')}
            <p>
                The user's KBase account is linked to their ORCID account.
            </p>
            <p>
                The user is now ready to use functionality requiring access to their ORCID account.
                In the example below, we just display some profile information from their
                ORCID profile.
            </p>
            <div className="well" style={{ marginBottom: '1em', maxWidth: '40em' }}>
                <div className="well-body">
                    <div className="flex-table">
                        <div className="flex-row">
                            <div className={`flex-col ${styles['-col1']}`}>
                                ORCID® Account ID
                            </div>
                            <div className="flex-col -col2">
                                <div className="flex-row" style={{ alignItems: 'center' }}>
                                    <a href={`${ORCID_URL}/${orcidProfile.orcidId}`} target="_blank">
                                        {renderORCIDIcon()}
                                        {orcidProfile.orcidId}
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div className="flex-row">
                            <div className={`flex-col ${styles['-col1']}`}>
                                Name on Account
                            </div>
                            <div className="flex-col">
                                {orcidProfile.firstName} {orcidProfile.lastName}
                            </div>
                        </div>
                        <div className="flex-row">
                            <div className={`flex-col ${styles['-col1']}`}>
                                Bio
                            </div>
                            <div className="flex-col">
                                {orcidProfile.bio}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    }
    renderStep3(stateStep: StepStateReady) {
        if (stateStep.step > 3) {
            return this.renderStepDoneTitle(3, 'Do something else');
        }
        if (stateStep.step < 3) {
            return this.renderStepPendingTitle(3, 'Do something else');
        }
        if (this.props.orcidState.status !== ORCIDLinkStatus.LINKED) {
            return <div>Error, not really linked!</div>
        }
        const { orcidProfile } = this.props.orcidState;
        return <div>
            {this.renderStepTitle(3, 'Do something else')}
            <p>
                The user's KBase account is linked to their ORCID account.
            </p>
            <p>
                This is some 3rd step
            </p>
            <div className="well" style={{ marginBottom: '1em', maxWidth: '40em' }}>
                <div className="well-body">
                    <div className="flex-table">
                        <div className="flex-row">
                            <div className={`flex-col ${styles['-col1']}`}>
                                ORCID® Account ID
                            </div>
                            <div className="flex-col -col2">
                                <div className="flex-row" style={{ alignItems: 'center' }}>
                                    <a href={`${ORCID_URL}/${orcidProfile.orcidId}`} target="_blank">
                                        {renderORCIDIcon()}
                                        {orcidProfile.orcidId}
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div className="flex-row">
                            <div className={`flex-col ${styles['-col1']}`}>
                                Name on Account
                            </div>
                            <div className="flex-col">
                                {orcidProfile.firstName} {orcidProfile.lastName}
                            </div>
                        </div>
                        <div className="flex-row">
                            <div className={`flex-col ${styles['-col1']}`}>
                                Bio
                            </div>
                            <div className="flex-col">
                                {orcidProfile.bio}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    }
    renderLinkingLink(step: number) {
        const linkingURL = new URL(`${this.props.baseURL}/#orcidlink/link`);
        const process = {
            step,
            time: Date.now()
        };
        const returnURL = new URL(`${this.props.baseURL}#orcidlink/demos/interstitial1`);
        returnURL.searchParams.set('process', JSON.stringify(process));
        const returnLink = {
            url: returnURL.toString(),
            label: `Some Process, step ${step}`
        }
        linkingURL.searchParams.set('return_link', JSON.stringify(returnLink));
        return <a href={`${linkingURL.toString()}`}>Click here to link your KBase account to your ORCID account <i>(go to step {step})</i></a>
    }

    // renderAutoLinkingLink() {
    //     const url = new URL('https://ci.kbase.us/#orcidlink');
    //     url.searchParams.set('return_url', 'https://ci.kbase.us#orcidlink/demos/interstitial1');
    //     url.searchParams.set('skip_prompt', 'true')
    //     return <a href={`${url.toString()}`}>Click here to link your KBase to your ORCID account without stopping!</a>
    // }


    render() {
        if (!this.state.stepState.ready) {
            return;
        }
        return <div className={styles.main}>
            <h2>Using linking as an interstitial page</h2>
            <p>
                <Button variant="secondary" href="/#orcidlink"><span className="fa fa-arrow-left" /> Back</Button>
            </p>
            <p>
                This demo simulates a KBase user process which depends up on an ORCID link to utilize the
                user's ORCID profile. It uses an "interstitial", or "in between", page to handle routing through
                the OAuth process which will allow a user to perform the linking.
            </p>
            <p>
                It sends information through the linking process to instruct it to return to a given URL. That
                url contains information required by that destination page to reconstruct whatever process
                was interrupted by the linking.
            </p>
            {this.renderStep1(this.state.stepState)}
            {this.renderStep2(this.state.stepState)}
            {this.renderStep3(this.state.stepState)}
        </div>;
    }


    // render() {
    //     if (this.props.orcidState.status === ORCIDLinkStatus.LINKED) {
    //         return this.renderLinked(this.props.orcidState.orcidProfile);
    //     }
    //     return this.renderNotYetLinked();
    // }
}