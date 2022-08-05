import { Component, ReactElement } from 'react';
import { ORCIDLinkState } from './Controller';
import styles from './View.module.css';
import { Alert, Button } from 'react-bootstrap';
import AuthorsStep from './steps/AuthorsStep';
import CitationsStep from './steps/Citations';
import { Model } from 'apps/ORCIDLink/Model';

const START_URL = 'https://ci.kbase.us/services/orcidlink/start';

export interface Step {
    number: number,
    title: string,
    render: (model: Model) => ReactElement;
}

const STEPS: Array<Step> = [
    {
        number: 1,
        title: "Authors",
        render: (model: Model) => {
            return <AuthorsStep model={model} />
        }
    }, {
        number: 2,
        title: "Citations",
        render: (model: Model) => {
            return <CitationsStep />
        }
    }, {
        number: 3,
        title: "DOE Contracts",
        render: (model: Model) => {
            return <AuthorsStep model={model} />
        }
    }, {
        number: 4,
        title: "Description",
        render: (model: Model) => {
            return <AuthorsStep model={model} />
        }
    }, {
        number: 5,
        title: "Summary and Submission",
        render: (model: Model) => {
            return <AuthorsStep model={model} />
        }
    }, {
        number: 6,
        title: "Report",
        render: (model: Model) => {
            return <AuthorsStep model={model} />
        }
    }, {
        number: 7,
        title: "Primary Author",
        render: (model: Model) => {
            return <AuthorsStep model={model} />
        }
    },
]

export interface ViewProps {
    orcidState: ORCIDLinkState;
    model: Model;
    process?: { [k: string]: string };
}


// export interface StepStateNotReady {
//     ready: false;
// }

// export interface StepStateReady {
//     ready: true;
//     step: number;
// }

// export type StepState =
//     StepStateReady | StepStateNotReady;

interface ViewState {
    currentStep: Step
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
            currentStep: this.getStep(1)
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
    getStep(defaultStep: number): Step {
        const stepNumber = (() => {
            if (this.props.process) {
                return (this.props.process['step'] as unknown) as number;
            }
            return defaultStep;
        })();
        return STEPS[stepNumber - 1];
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


    renderCurrentStep() {
        return <div className={styles['step-content']}>
            <h2>
                {this.state.currentStep.title} <span>
                    ({this.state.currentStep.number} of {STEPS.length})
                </span>
            </h2>

            <div className="well" style={{ padding: '1em', marginBottom: '1em' }}>
                {this.state.currentStep.render(this.props.model)}
            </div>
        </div>
    }

    previousStep() {
        if (this.state.currentStep.number === 1) {
            return;
        }
        this.setState({
            currentStep: STEPS[this.state.currentStep.number - 2]
        });
    }

    nextStep() {
        if (this.state.currentStep.number === STEPS.length) {
            return;
        }
        this.setState({
            currentStep: STEPS[this.state.currentStep.number]
        });
    }

    renderNavigation() {
        return <div className="button-toolbar">
            <Button variant="primary"
                disabled={this.state.currentStep.number === 1}
                onClick={this.previousStep.bind(this)}><span className="fa fa-hand-o-left" /> Prev</Button>

            <span style={{ margin: '0 1em', width: '4em', display: 'inline-block', textAlign: 'center' }}>
                {this.state.currentStep.number} of {STEPS.length}
            </span>

            <Button variant="primary"
                disabled={this.state.currentStep.number === STEPS.length}
                onClick={this.nextStep.bind(this)}>Next <span className="fa fa-hand-o-right" /></Button>
        </div>
    }


    render() {
        return <div className={styles.main}>
            <h2>DOI Form</h2>
            <p>
                <a href="/#orcidlink">Back</a>
            </p>
            <p>
                This is the DOI form with ORCID linking assistance
            </p>

            {this.renderCurrentStep()}

            <div className={styles.nav}>
                {this.renderNavigation()}
            </div>
        </div>;
    }


    // render() {
    //     if (this.props.orcidState.status === ORCIDLinkStatus.LINKED) {
    //         return this.renderLinked(this.props.orcidState.orcidProfile);
    //     }
    //     return this.renderNotYetLinked();
    // }
}